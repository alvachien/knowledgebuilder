import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import type { MatButtonToggleChange } from '@angular/material/button-toggle';
import { FisherYatesShuffle } from 'actslib';
import type { Subscription } from 'rxjs';

import { environment } from '../../../environments/environment';
import type {
  ReviewQueueItem,
  UserLearningRating,
  VocabularyAutoPlayOption,
  WordDictionaryEntry,
} from '../../interfaces';
import { AudioService, LearningRatingService, WordDictionaryService } from '../../services';

/** Auto Play lifecycle state: idle, advancing on the interval, or frozen. */
export type VocabularyReviewAutoPlayState = 'stopped' | 'playing' | 'paused';

/**
 * State and behavior of one vocabulary review session: the word queue, the
 * cursor, progress, per-word ratings (with their load/save lifecycle) and the
 * Auto Play state machine (stopped/playing/paused, with TTS reading of
 * example sentences). Provided on the page container so the review screen and
 * the container share one instance; the container only prepares the queue and
 * decides the screen (`mode`) - everything study-related lives here.
 *
 * Behavior was moved verbatim out of VocabularyExercisesComponent
 * (onReviewCore's session half / onStudyPreviousWord / onStudyNextWord /
 * onEnableAutoMode / onQuitReview / onRatingChanged / the study branch of
 * handleKeyboardEvent), with two deliberate changes: state is signal-based (no
 * manual change-detection nudges), and starting an empty queue is a no-op that
 * leaves the caller on the list (mirror of the typing store).
 */
// eslint-disable-next-line @angular-eslint/use-injectable-provided-in -- intentionally NOT root-provided: the page container provides it so the review screen and the container share one instance scoped to the page
@Injectable()
export class VocabularyReviewSessionStore {
  private static readonly EMPTY_ITEM: ReviewQueueItem = {
    enword: '',
    cnword: '',
    rating: 0,
  };

  // Upper bound on how long the auto-play scheduler waits for a word's
  // speech (pronunciation + read example sentences) before the interval to
  // the next item starts counting. A hung speechSynthesis must never wedge
  // the queue.
  private static readonly AUTO_SPEECH_GUARD_MS = 60_000;

  private readonly audiosrv = inject(AudioService);
  private readonly ratingService = inject(LearningRatingService);
  private readonly dictionaryService = inject(WordDictionaryService);
  private readonly destroyRef = inject(DestroyRef);

  readonly queue = signal<ReviewQueueItem[]>([]);
  readonly cursor = signal(0);
  // Auto Play is a three-state machine, `stopped` by default (manual
  // browsing): `playing` auto-advances every interval (prev/next disabled,
  // the machine self-stops at the last word), `paused` freezes the cycle on
  // the current word with all speech silenced. `isAutoMode` stays the
  // "playing" test the template and keyboard guards use.
  readonly autoPlayState = signal<VocabularyReviewAutoPlayState>('stopped');
  readonly isAutoMode = computed(() => this.autoPlayState() === 'playing');
  readonly isPaused = computed(() => this.autoPlayState() === 'paused');
  // Auto Play settings, edited through the toolbar's settings dialog: seconds
  // between ticks, whether the queue is shuffled when auto play starts, and
  // how many example sentences are read aloud (TTS) after each word (0 = off).
  readonly autoModeSeconds = signal(5);
  // Visit the items in a shuffled walk order when auto play starts. Only
  // the auto-play traversal is randomized - the queue keeps its order, so
  // manual browsing is untouched.
  readonly autoPlayRandomize = signal(false);
  readonly autoPlaySentences = signal(0);
  // Index (in `wordReference().examples`) of the sentence currently being
  // read aloud; -1 while nothing is read. The screen highlights that row and
  // scrolls it into view.
  readonly readingSentenceIndex = signal(-1);

  /**
   * 1-based position shown next to the progress bar (0 = empty queue).
   * Once an auto-play walk exists, the position is the word's place IN THE
   * WALK, not its queue index: a randomized run that finished every item
   * then reads `len / len` (100%), instead of stopping at whatever queue
   * slot the shuffled last item happened to occupy. Before/without a walk
   * the two are identical (identity order).
   */
  readonly currentPosition = computed(() => {
    const len = this.queue().length;
    if (len === 0) {
      return 0;
    }
    if (this.autoOrder.length === len) {
      const step = this.autoOrder.indexOf(this.cursor());
      if (step >= 0) {
        return step + 1;
      }
    }
    return this.cursor() + 1;
  });

  /** Progress in percent, measured against the study queue (not the whole file). */
  readonly progress = computed(() => {
    const len = this.queue().length;
    return len === 0 ? 0 : Math.round((this.currentPosition() / len) * 100);
  });

  readonly isPreviousDisabled = computed(() => this.cursor() <= 0);
  readonly isNextDisabled = computed(() => this.cursor() >= this.queue().length - 1);

  /** The word under the cursor (a stable empty item when the queue is empty). */
  readonly currentItem = computed(
    () => this.queue()[this.cursor()] ?? VocabularyReviewSessionStore.EMPTY_ITEM
  );

  /**
   * Dictionary entry (Chinese definitions + bilingual example sentences) for
   * the word under the cursor; null while loading, on a miss, or after the
   * session is dropped. The screen renders it below the cnword headline,
   * gated by the same hideExplain input that governs the gloss itself.
   */
  readonly wordReference = signal<WordDictionaryEntry | null>(null);

  private disableVoice = false;
  // Backend ContentId of the studied file; 0 disables every rating call.
  private contentId = 0;
  // Confirmed (server-acknowledged) ratings of this session; synced back into
  // the list view on quit.
  private ratingMap = new Map<number, UserLearningRating>();
  // Auto Play scheduler. `autoCycleToken` invalidates any pending advance so
  // an old cycle's timer/speech continuation never runs after quit or a new
  // start; `autoAdvanceTimeout` counts the interval once the item is silent,
  // `autoSpeechGuardTimeout` caps how long the cycle waits for the current
  // word's speech; `currentSpeechDone` resolves when the word under the
  // cursor has finished its audio (pronunciation + any read example
  // sentences), so the interval is only started after it - never over it.
  private autoCycleToken = 0;
  private autoAdvanceTimeout?: ReturnType<typeof setTimeout>;
  private autoSpeechGuardTimeout?: ReturnType<typeof setTimeout>;
  private currentSpeechDone: Promise<void> = Promise.resolve();
  // Auto Play's traversal: `autoOrder` holds queue indices (0..n-1, shuffled
  // when the settings dialog says so) and `autoStep` is the position in that
  // walk. The queue itself is NEVER re-ordered - randomizing only affects
  // the order auto play visits items in; manual browsing, progress and the
  // ratings sync-back all keep working on the untouched queue order.
  private autoOrder: number[] = [];
  private autoStep = 0;
  // In-flight rating loads/saves; cancelled in reset() so a late response can
  // never write into the next session (item ids are per-file indices, so the
  // same id in another file would be corrupted).
  private ratingSubscriptions: Subscription[] = [];
  // Items the user rated during this session. A (possibly slow) preload
  // response must not overwrite them: it would revert the visible rating and
  // make the already-confirmed save look stale to saveRating's guard.
  private userRatedItemIds = new Set<number>();
  // Guards the async MP3->TTS fallback in speakCurrent: a slow 404 for an
  // earlier word (or one fetched before reset/destroy) must not trigger TTS.
  private speakGeneration = 0;
  // Same discipline for the per-word dictionary fetch in loadCurrentReference:
  // a slow response for an earlier word must never display over the current one.
  private refGeneration = 0;
  // In-flight dictionary loads; cancelled in reset() like the rating subs, so
  // a response landing after the session ended cannot write into the next one.
  private refSubscriptions: Subscription[] = [];

  constructor() {
    // The store lives as long as the page container. If the user navigates
    // away mid-auto-mode, the timer must die with it - otherwise the interval
    // keeps advancing words and speaking them after the page is gone. In-flight
    // rating loads/saves are cancelled too, mirroring reset()/quit(), so a
    // late response cannot write into a store whose session is gone (L8).
    this.destroyRef.onDestroy(() => {
      this.stopAutoPlay();
      this.speakGeneration++;
      this.refGeneration++;
      for (const sub of this.ratingSubscriptions) {
        sub.unsubscribe();
      }
      this.ratingSubscriptions = [];
      for (const sub of this.refSubscriptions) {
        sub.unsubscribe();
      }
      this.refSubscriptions = [];
    });
  }

  /**
   * Start a new session over `items`. Returns false (and stays reset) when
   * there is nothing to study, so the caller can keep showing the list.
   * Existing ratings for `contentId` are preloaded into the queue items.
   */
  start(items: ReviewQueueItem[], disableVoice: boolean, contentId: number): boolean {
    this.reset();
    if (items.length === 0) {
      return false;
    }

    this.disableVoice = disableVoice;
    this.contentId = contentId;
    this.queue.set(items);
    this.cursor.set(0);
    this.presentCurrentWord();

    if (this.contentId > 0) {
      this.ratingSubscriptions.push(
        this.ratingService.getRatings(this.contentId).subscribe({
          next: ratings => {
            for (const r of ratings) {
              // Items the user already rated in this session are left
              // alone: their queue slot and confirmed save must win over the
              // (possibly stale) server snapshot.
              if (r.itemId !== undefined && !this.userRatedItemIds.has(r.itemId)) {
                this.ratingMap.set(r.itemId, r);
              }
            }
            // Pre-populate ratings in the queue. Items are replaced with copies
            // (not mutated in place) so OnPush consumers see new references.
            this.queue.update(q =>
              q.map(sq =>
                sq.itemId !== undefined &&
                !this.userRatedItemIds.has(sq.itemId) &&
                this.ratingMap.has(sq.itemId)
                  ? { ...sq, rating: this.ratingMap.get(sq.itemId)!.rating }
                  : sq
              )
            );
          },
          error: err => console.error('Failed to load ratings', err),
        })
      );
    }
    return true;
  }

  /** Drop every piece of session state (quit mid-session / back to the list). */
  reset(): void {
    this.stopAutoPlay();
    // A word-audio fetch still in flight must not TTS-fallback now that the
    // session (and its queue) is gone.
    this.speakGeneration++;
    // Same for an in-flight dictionary load: drop it and the visible entry.
    this.refGeneration++;
    for (const sub of this.refSubscriptions) {
      sub.unsubscribe();
    }
    this.refSubscriptions = [];
    this.wordReference.set(null);
    // Cancel in-flight rating loads/saves: a response that lands after the
    // session ended would write into the next session's state.
    for (const sub of this.ratingSubscriptions) {
      sub.unsubscribe();
    }
    this.ratingSubscriptions = [];
    this.queue.set([]);
    this.cursor.set(0);
    // Drop the walk: until the next start the position/progress computeds
    // fall back to the plain queue index.
    this.autoOrder = [];
    this.autoStep = 0;
    this.ratingMap = new Map();
    this.userRatedItemIds.clear();
    this.contentId = 0;
    this.disableVoice = false;
  }

  previous(): void {
    if (this.cursor() > 0) {
      this.cursor.update(c => c - 1);
      this.presentCurrentWord();
    }
  }

  next(): void {
    if (this.cursor() < this.queue().length - 1) {
      this.cursor.update(c => c + 1);
      this.presentCurrentWord();
    }
  }

  /**
   * The toolbar Play/Pause button, cycling the three-state machine:
   * stopped -> start the walk at its first item (walk order shuffled when
   * the settings dialog says so - the queue itself is never re-ordered);
   * playing -> pause (freeze on the current word, silence all speech,
   * prev/next become available again); paused -> resume (continue the walk
   * from the word on screen, re-presented so the item plays fully, then
   * advance on a fresh interval). No-op on an empty queue.
   */
  toggleAutoPlay(): void {
    switch (this.autoPlayState()) {
      case 'playing':
        this.pauseAutoPlay();
        break;
      case 'paused':
        this.resumeAutoPlay();
        break;
      default:
        this.startAutoPlay();
    }
  }

  private startAutoPlay(): void {
    if (this.autoPlayState() !== 'stopped' || this.queue().length === 0) {
      return;
    }
    // Build the walk: identity order, or a shuffled index permutation when
    // randomizing - the queue itself stays as it is.
    const indices = Array.from({ length: this.queue().length }, (_, i) => i);
    this.autoOrder = this.autoPlayRandomize() ? FisherYatesShuffle(indices) : indices;
    this.autoStep = 0;
    this.cursor.set(this.autoOrder[0]);
    // The state flips BEFORE presenting so the first word's speech chain
    // knows to read its example sentences.
    this.autoPlayState.set('playing');
    const token = ++this.autoCycleToken;
    this.presentCurrentWord();
    this.scheduleAutoAdvance(token);
  }

  private pauseAutoPlay(): void {
    // Invalidate this cycle's tick/race continuations so nothing fires while
    // paused or resolves late against the resumed state.
    this.autoCycleToken++;
    this.clearAutoTimers();
    this.autoPlayState.set('paused');
    this.stopCurrentSpeech();
  }

  private resumeAutoPlay(): void {
    if (this.autoPlayState() !== 'paused' || this.queue().length === 0) {
      return;
    }
    // prev/next are available while paused: re-anchor the walk at whatever
    // word is on screen so resuming continues from there, not from where
    // the pause happened to land in the order.
    const step = this.autoOrder.indexOf(this.cursor());
    if (step >= 0) {
      this.autoStep = step;
    }
    this.autoPlayState.set('playing');
    const token = ++this.autoCycleToken;
    // Re-present the current word (audio + sentences) so the item is heard
    // whole before the next advance, and the interval starts fresh.
    this.presentCurrentWord();
    this.scheduleAutoAdvance(token);
  }

  /**
   * End the auto-play cycle and fall back to manual browsing on the current
   * word; the next play restarts from the first word. Also the cleanup path
   * for quit/reset/page-destroy, so a cycle can never keep advancing or
   * speaking after its session is gone.
   */
  stopAutoPlay(): void {
    this.autoCycleToken++;
    this.clearAutoTimers();
    this.autoPlayState.set('stopped');
    this.stopCurrentSpeech();
  }

  /**
   * Set the auto-advance interval (the settings dialog's seconds-per-word
   * field). Invalid values are ignored. While a cycle plays the live tick is
   * re-armed with the FULL new interval, so the change applies to the
   * current item immediately - opening the dialog mid-run means the pace is
   * wrong NOW. The token bump invalidates the superseded tick and any
   * in-flight speech-wait continuation, so nothing advances twice.
   */
  setAutoModeSeconds(seconds: number): void {
    if (!Number.isInteger(seconds) || seconds < 1) {
      return;
    }
    this.autoModeSeconds.set(seconds);
    if (this.isAutoMode()) {
      this.autoCycleToken++;
      this.clearAutoTimers();
      this.scheduleAutoAdvance(this.autoCycleToken);
    }
  }

  /**
   * Apply the Auto Play settings dialog result. The interval keeps
   * setAutoModeSeconds' validation (an invalid value is ignored) and its
   * live effect: a running tick is re-armed, so the item on screen is
   * re-timed at once. The sentence count is clamped to 0-10 (the
   * /api/WordDictionary server-side cap) and applies from the next item on
   * - a sentence already being read cannot be un-read. Randomizing takes
   * effect on the next auto-play start.
   */
  applyAutoPlaySettings(option: VocabularyAutoPlayOption): void {
    this.setAutoModeSeconds(option.intervalSeconds);
    this.autoPlayRandomize.set(option.randomizeWords === true);
    const count = Number.isFinite(option.sentencesToRead)
      ? Math.floor(option.sentencesToRead)
      : 0;
    this.autoPlaySentences.set(Math.max(0, Math.min(10, count)));
  }

  /**
   * Set the current word's rating to `value` (1-5) and persist it. Out-of-range
   * values are ignored, which is what clamps ArrowUp at 5 / ArrowDown at 1.
   */
  rateCurrent(value: number): void {
    const idx = this.cursor();
    const queue = this.queue();
    if (idx < 0 || idx >= queue.length) {
      return;
    }
    if (!Number.isInteger(value) || value < 1 || value > 5) {
      return;
    }
    // Remember the user touched this item so a late preload cannot revert it.
    const itemId = queue[idx].itemId;
    if (itemId !== undefined) {
      this.userRatedItemIds.add(itemId);
    }
    this.queue.update(q => q.map((sq, i) => (i === idx ? { ...sq, rating: value } : sq)));
    this.saveRating(this.queue()[idx]);
  }

  /**
   * Rating change coming from the toggle group. Clicking the active toggle
   * deselects it (value becomes undefined); there is no "clear rating"
   * operation, so the group is restored to the item's rating instead.
   */
  setRatingFromToggle(event: MatButtonToggleChange): void {
    if (event.value === undefined || event.value === null || event.value < 1) {
      event.source.buttonToggleGroup.value = this.currentItem().rating;
      return;
    }
    this.rateCurrent(event.value);
  }

  /**
   * Stop the auto-advance timer, reset the session, and return the confirmed
   * ratings captured during it, keyed by itemId - the caller merges them into
   * the list view's rating map. Only confirmed saves are returned; failed or
   * still in-flight upserts must not leak into the list.
   */
  quit(): Map<number, number> {
    this.stopAutoPlay();
    const confirmed = new Map<number, number>();
    for (const [itemId, saved] of this.ratingMap) {
      if (saved.rating >= 1) {
        confirmed.set(itemId, saved.rating);
      }
    }
    this.reset();
    return confirmed;
  }

  /**
   * Arm one auto-play cycle for `token`. The interval is the SILENT GAP
   * between two items: the cycle first waits for the current item's speech
   * (recorded pronunciation, plus read example sentences in reading mode) to
   * finish - bounded by AUTO_SPEECH_GUARD_MS so a hung speechSynthesis can
   * never wedge the queue - and only then counts the full interval before
   * advancing. A long reading stretches the per-item cycle instead of eating
   * the pause, so the next word always starts one full interval after the
   * last sound of the current item. At the last word auto mode self-stops so
   * the manual controls return.
   */
  private scheduleAutoAdvance(token: number): void {
    // Fall back to the default if the value was cleared or set to 0.
    const seconds = this.autoModeSeconds() > 0 ? this.autoModeSeconds() : 5;
    // Drop any previously armed tick (e.g. a setAutoModeSeconds re-arm) so
    // exactly one interval timer is live per cycle; two live timers would
    // advance the cursor twice. A re-arm while the old speech wait is still
    // pending is safe: its continuation fails the token check below and
    // returns without arming anything.
    this.clearAdvanceTimer();
    // Speech wait, bounded by the guard. The handle lives both locally (each
    // continuation always clears its own timer, never a successor's) and in
    // the field, so pause/quit paths can drop a pending wait.
    let guardTimer: ReturnType<typeof setTimeout> | undefined;
    const guard = new Promise<void>(resolve => {
      guardTimer = setTimeout(resolve, VocabularyReviewSessionStore.AUTO_SPEECH_GUARD_MS);
      this.autoSpeechGuardTimeout = guardTimer;
    });
    void Promise.race([this.currentSpeechDone.catch(() => undefined), guard]).then(() => {
      if (guardTimer !== undefined) {
        clearTimeout(guardTimer);
        if (this.autoSpeechGuardTimeout === guardTimer) {
          this.autoSpeechGuardTimeout = undefined;
        }
      }
      if (token !== this.autoCycleToken || !this.isAutoMode()) {
        return;
      }
      // The item is silent now: count the FULL interval as the gap to the
      // next one, re-checking when it elapses - a pause, quit or settings
      // re-arm during the gap invalidates this advance.
      this.autoAdvanceTimeout = setTimeout(() => {
        this.autoAdvanceTimeout = undefined;
        if (token !== this.autoCycleToken || !this.isAutoMode()) {
          return;
        }
        if (this.autoStep < this.autoOrder.length - 1) {
          this.autoStep++;
          this.cursor.set(this.autoOrder[this.autoStep]);
          this.presentCurrentWord();
          this.scheduleAutoAdvance(token);
        } else {
          this.stopAutoPlay();
        }
      }, seconds * 1000);
    });
  }

  private clearAdvanceTimer(): void {
    if (this.autoAdvanceTimeout !== undefined) {
      clearTimeout(this.autoAdvanceTimeout);
      this.autoAdvanceTimeout = undefined;
    }
  }

  private clearAutoTimers(): void {
    this.clearAdvanceTimer();
    if (this.autoSpeechGuardTimeout !== undefined) {
      clearTimeout(this.autoSpeechGuardTimeout);
      this.autoSpeechGuardTimeout = undefined;
    }
  }

  private stopCurrentSpeech(): void {
    this.readingSentenceIndex.set(-1);
    // Anything still audible belongs to the stopped/paused cycle: the
    // recorded word MP3 and the Web Speech queue (TTS word + read sentences).
    this.audiosrv.stopWordOneShot();
    this.audiosrv.cancelSpeech();
  }

  /**
   * Pronounce the current word; the returned promise settles when the word's
   * pronunciation is over (recorded MP3 end, TTS utterance end, or
   * immediately while voice is disabled) so callers can chain after it.
   * Recorded pronunciation first (GET /api/WordAudio?word=...); Web Speech
   * API only as the fallback for words without audio (e.g. 404) - the TTS
   * path keeps vocabulary local to the browser. The generation guard keeps
   * a slow miss for an earlier word from speaking over the current one; a
   * superseded sound is released through the one-shot's onEnd callback.
   */
  private speakCurrent(): Promise<void> {
    if (this.disableVoice) {
      return Promise.resolve();
    }
    const item = this.queue()[this.cursor()];
    if (!item) {
      return Promise.resolve();
    }
    const generation = ++this.speakGeneration;
    const word = item.enword;
    return new Promise<void>(resolve => {
      let settled = false;
      const done = (): void => {
        if (!settled) {
          settled = true;
          resolve();
        }
      };
      this.audiosrv
        .playAuthenticatedOneShot(
          `${environment.apiUrl}/api/WordAudio?word=${encodeURIComponent(word)}`,
          'mp3',
          done
        )
        .then(ok => {
          if (ok) {
            // onEnd (done) settles the promise when playback is over.
            return;
          }
          if (generation !== this.speakGeneration) {
            done();
            return;
          }
          // No recorded audio: the TTS utterance's end is the completion
          // signal, so example sentences queue behind the word itself.
          void this.audiosrv.speakWord(word).then(done, done);
        })
        .catch(err => {
          console.error('Word audio playback failed', err);
          done();
        });
    });
  }

  /**
   * The side-effects that belong to every cursor change: pronounce the new
   * word and load its dictionary entry - and during auto play, read this
   * word's example sentences right after the pronunciation. One home for "the
   * word changed", so a future effect is added once, not at four call sites.
   * The chained promise is what the auto-play scheduler waits on before
   * advancing.
   */
  private presentCurrentWord(): void {
    // Sentences still queued for the previous word must not overlap this
    // word's audio, and the old reading highlight is already meaningless.
    this.audiosrv.cancelSpeech();
    this.readingSentenceIndex.set(-1);
    const wordDone = this.speakCurrent();
    const refPromise = this.loadCurrentReference();
    const speakGeneration = this.speakGeneration;
    const refGeneration = this.refGeneration;
    // Sentence reading is an auto-play behavior (its setting lives in the
    // Auto Play dialog); manual browsing stays word-only.
    const readSentences =
      this.isAutoMode() && !this.disableVoice && this.autoPlaySentences() > 0;
    this.currentSpeechDone = readSentences
      ? wordDone
          .then(() => refPromise)
          .then(entry => this.readExampleSentences(entry, speakGeneration, refGeneration))
      : wordDone;
  }

  /**
   * Read up to autoPlaySentences() example sentences aloud (Web Speech API).
   * The generation guards keep a stale chain - a word the cursor already
   * left, or a session that stopped - from queuing speech. Each sentence's
   * index is announced through `readingSentenceIndex` right before it is
   * spoken (the screen highlights that table row and scrolls it into view),
   * and the index resets when the reading ends. `requireAutoPlay` keeps the
   * auto-cycle gate; the re-read button passes false so a paused or stopped
   * session can still replay the item's sentences.
   */
  private readExampleSentences(
    entry: WordDictionaryEntry | null,
    speakGeneration: number,
    refGeneration: number,
    requireAutoPlay = true
  ): Promise<void> {
    const count = this.autoPlaySentences();
    if (
      !entry ||
      count <= 0 ||
      this.disableVoice ||
      (requireAutoPlay && !this.isAutoMode()) ||
      speakGeneration !== this.speakGeneration ||
      refGeneration !== this.refGeneration
    ) {
      return Promise.resolve();
    }
    const fresh = (): boolean =>
      speakGeneration === this.speakGeneration && refGeneration === this.refGeneration;
    const texts = entry.examples.slice(0, count).map(example => example.source);
    return this.audiosrv
      .speakSequence(texts, index => {
        if (fresh()) {
          this.readingSentenceIndex.set(index);
        }
      })
      .then(() => {
        if (fresh()) {
          this.readingSentenceIndex.set(-1);
        }
      });
  }

  /**
   * The replay button: pronounce the current word again and read its example
   * sentences from the already-loaded dictionary entry, without touching the
   * queue position or the cycle state. Ignored while playing (there the tick
   * owns the audio chain; the button is disabled in that state).
   */
  reReadCurrent(): void {
    if (this.autoPlayState() === 'playing' || this.queue()[this.cursor()] === undefined) {
      return;
    }
    this.audiosrv.cancelSpeech();
    this.readingSentenceIndex.set(-1);
    const wordDone = this.speakCurrent();
    const entry = this.wordReference();
    const speakGeneration = this.speakGeneration;
    const refGeneration = this.refGeneration;
    this.currentSpeechDone =
      entry && !this.disableVoice && this.autoPlaySentences() > 0
        ? wordDone.then(() =>
            this.readExampleSentences(entry, speakGeneration, refGeneration, false)
          )
        : wordDone;
  }

  /**
   * Load the dictionary entry (definitions + examples) for the word under the
   * cursor and hand it to the caller (null on a miss or once superseded, so a
   * stale response can never feed the sentence reading). Fired at every
   * cursor change, alongside speakCurrent. The generation is bumped
   * (invalidating any in-flight response) and the visible entry cleared
   * BEFORE the blank-word guard, so a slow response for the previous word can
   * never repaint the cleared card; the guard then keeps blank words from
   * hitting the network. Unconditional even when the screen hides
   * explanations - the service cache makes re-shows free.
   */
  private loadCurrentReference(): Promise<WordDictionaryEntry | null> {
    const generation = ++this.refGeneration;
    const item = this.queue()[this.cursor()];
    this.wordReference.set(null);
    if (!item || item.enword.trim().length === 0) {
      return Promise.resolve(null);
    }
    return new Promise<WordDictionaryEntry | null>(resolve => {
      this.refSubscriptions.push(
        this.dictionaryService.getWord(item.enword).subscribe({
          next: entry => {
            if (generation === this.refGeneration) {
              this.wordReference.set(entry);
              resolve(entry);
            } else {
              // Stale: settle the chain without ever feeding it the old entry.
              resolve(null);
            }
          },
          // getWord maps HTTP failures to null in theory; settle anyway so a
          // dictionary error can never stall the speech chain.
          error: () => resolve(null),
        })
      );
    });
  }

  private saveRating(item: ReviewQueueItem): void {
    if (this.contentId <= 0 || item.itemId === undefined || item.rating < 1) {
      return;
    }

    const requested = item.rating;
    this.ratingSubscriptions.push(
      this.ratingService.upsertRating(this.contentId, item.itemId, item.rating).subscribe({
        next: saved => {
          // Drop stale responses: if the queue slot already shows a different
          // rating, a newer request is in flight and will set the final value.
          const current = this.queue().find(sq => sq.itemId === item.itemId);
          if (current && current.rating !== saved.rating) {
            return;
          }
          this.ratingMap.set(item.itemId!, saved);
        },
        error: err => {
          console.error('Failed to save rating', err);
          // Roll the queue slot back to the last confirmed rating so the view
          // does not keep showing a value the server never saved.
          const idx = this.queue().findIndex(sq => sq.itemId === item.itemId);
          if (idx >= 0 && this.queue()[idx].rating === requested) {
            const confirmed = this.ratingMap.get(item.itemId!)?.rating ?? 0;
            this.queue.update(q =>
              q.map((sq, i) => (i === idx ? { ...sq, rating: confirmed } : sq))
            );
          }
        },
      })
    );
  }
}
