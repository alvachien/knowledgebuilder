import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import type { MatButtonToggleChange } from '@angular/material/button-toggle';
import { interval, type Subscription } from 'rxjs';

import type { SentenceReviewQueueItem, UserLearningRating } from '../../interfaces';
import { AIService, AudioService, LearningRatingService } from '../../services';

/**
 * State and behavior of one sentence review session: the sentence queue, the
 * cursor, progress, per-sentence ratings (with their load/save lifecycle) and
 * the auto-play timer. Provided on the page container so the review screen and
 * the container share one instance; the container only prepares the queue and
 * decides the screen (`mode`) - everything review-related lives here.
 *
 * Mirrors VocabularyReviewSessionStore; pronunciation differs: sentences have
 * no recorded word audio, so voice always goes through the AI TTS endpoint.
 */
// eslint-disable-next-line @angular-eslint/use-injectable-provided-in -- intentionally NOT root-provided: the page container provides it so the review screen and the container share one instance scoped to the page
@Injectable()
export class TranslateReviewSessionStore {
  private static readonly EMPTY_ITEM: SentenceReviewQueueItem = {
    ensent: '',
    cnsent: '',
    rating: 0,
  };

  private readonly audiosrv = inject(AudioService);
  private readonly aiutil = inject(AIService);
  private readonly ratingService = inject(LearningRatingService);
  private readonly destroyRef = inject(DestroyRef);

  readonly queue = signal<SentenceReviewQueueItem[]>([]);
  readonly cursor = signal(0);
  // Auto mode: auto-advance to the next sentence every N seconds. While
  // active, only the cancel/quit button is enabled; prev/next are disabled.
  // Auto mode self-stops on reaching the last sentence.
  readonly isAutoMode = signal(false);
  // Seconds between auto-advance ticks; the review toolbar edits this.
  readonly autoModeSeconds = signal(5);

  /** Progress in percent, measured against the review queue (not the whole file). */
  readonly progress = computed(() => {
    const len = this.queue().length;
    return len === 0 ? 0 : Math.round(((this.cursor() + 1) / len) * 100);
  });

  readonly isPreviousDisabled = computed(() => this.cursor() <= 0);
  readonly isNextDisabled = computed(() => this.cursor() >= this.queue().length - 1);

  /** The sentence under the cursor (a stable empty item when the queue is empty). */
  readonly currentItem = computed(
    () => this.queue()[this.cursor()] ?? TranslateReviewSessionStore.EMPTY_ITEM
  );

  private disableVoice = false;
  // Backend ContentId of the studied file; 0 disables every rating call.
  private contentId = 0;
  // Confirmed (server-acknowledged) ratings of this session; synced back into
  // the list view on quit.
  private ratingMap = new Map<number, UserLearningRating>();
  private autoModeSubscription?: Subscription;
  // In-flight rating loads/saves; cancelled in reset() so a late response can
  // never write into the next session (item ids are per-file, so the same id
  // in another file would be corrupted).
  private ratingSubscriptions: Subscription[] = [];
  // Sentences the user rated during this session. A (possibly slow) preload
  // response must not overwrite them: it would revert the visible rating and
  // make the already-confirmed save look stale to saveRating's guard.
  private userRatedItemIds = new Set<number>();
  // Guards the async TTS playback: a slow response for an earlier sentence
  // (or one fetched before reset/destroy) must not play over the current one.
  private speakGeneration = 0;

  constructor() {
    // The store lives as long as the page container. If the user navigates
    // away mid-auto-mode, the timer must die with it - otherwise the interval
    // keeps advancing sentences and speaking them after the page is gone.
    // In-flight rating loads/saves are cancelled too, mirroring reset()/quit().
    this.destroyRef.onDestroy(() => {
      this.stopAutoMode();
      this.speakGeneration++;
      for (const sub of this.ratingSubscriptions) {
        sub.unsubscribe();
      }
      this.ratingSubscriptions = [];
    });
  }

  /**
   * Start a new session over `items`. Returns false (and stays reset) when
   * there is nothing to review, so the caller can keep showing the list.
   * Existing ratings for `contentId` are preloaded into the queue items.
   */
  start(items: SentenceReviewQueueItem[], disableVoice: boolean, contentId: number): boolean {
    this.reset();
    if (items.length === 0) {
      return false;
    }

    this.disableVoice = disableVoice;
    this.contentId = contentId;
    this.queue.set(items);
    this.cursor.set(0);
    this.speakCurrent();

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
    this.stopAutoMode();
    // A TTS request still in flight must not play now that the session (and
    // its queue) is gone.
    this.speakGeneration++;
    // Cancel in-flight rating loads/saves: a response that lands after the
    // session ended would write into the next session's state.
    for (const sub of this.ratingSubscriptions) {
      sub.unsubscribe();
    }
    this.ratingSubscriptions = [];
    this.queue.set([]);
    this.cursor.set(0);
    this.ratingMap = new Map();
    this.userRatedItemIds.clear();
    this.contentId = 0;
    this.disableVoice = false;
  }

  previous(): void {
    if (this.cursor() > 0) {
      this.cursor.update(c => c - 1);
      this.speakCurrent();
    }
  }

  next(): void {
    if (this.cursor() < this.queue().length - 1) {
      this.cursor.update(c => c + 1);
      this.speakCurrent();
    }
  }

  /**
   * Always (re)start auto-play from the first sentence, regardless of the
   * current cursor, so the behavior is consistent whether on the last sentence
   * or mid-queue. No-op when already running or when there is nothing to study.
   */
  enableAutoMode(): void {
    if (this.isAutoMode() || this.queue().length === 0) {
      return;
    }
    this.cursor.set(0);
    this.speakCurrent();
    // Fall back to the default if the value was cleared or set to 0.
    const seconds = this.autoModeSeconds() > 0 ? this.autoModeSeconds() : 5;
    this.isAutoMode.set(true);
    this.autoModeSubscription = interval(seconds * 1000).subscribe(() => this.autoAdvance());
  }

  /**
   * Set the auto-advance interval (toolbar's seconds-per-sentence control).
   * Invalid values are ignored. A running timer is swapped immediately, so the
   * new interval applies without restarting the session.
   */
  setAutoModeSeconds(seconds: number): void {
    if (!Number.isInteger(seconds) || seconds < 1) {
      return;
    }
    this.autoModeSeconds.set(seconds);
    if (this.isAutoMode()) {
      this.autoModeSubscription?.unsubscribe();
      this.autoModeSubscription = interval(seconds * 1000).subscribe(() => this.autoAdvance());
    }
  }

  /**
   * Set the current sentence's rating to `value` (1-5) and persist it.
   * Out-of-range values are ignored, which is what clamps ArrowUp at 5 /
   * ArrowDown at 1.
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
    this.stopAutoMode();
    const confirmed = new Map<number, number>();
    for (const [itemId, saved] of this.ratingMap) {
      if (saved.rating >= 1) {
        confirmed.set(itemId, saved.rating);
      }
    }
    this.reset();
    return confirmed;
  }

  private autoAdvance(): void {
    if (this.cursor() < this.queue().length - 1) {
      this.next();
    } else {
      // Reached the last sentence - stop auto mode so the manual controls
      // return.
      this.stopAutoMode();
    }
  }

  private stopAutoMode(): void {
    this.autoModeSubscription?.unsubscribe();
    this.autoModeSubscription = undefined;
    this.isAutoMode.set(false);
  }

  private speakCurrent(): void {
    if (this.disableVoice) {
      return;
    }
    const item = this.queue()[this.cursor()];
    if (!item) {
      return;
    }
    // Sentences have no recorded word audio, so pronunciation always goes
    // through the AI TTS endpoint (same path as the list's play button). The
    // generation guard keeps a slow response for an earlier sentence from
    // speaking over the current one.
    const generation = ++this.speakGeneration;
    const sent = item.ensent;
    this.aiutil
      .getTTS(sent)
      .subscribe({
        next: (data: any) => {
          if (generation !== this.speakGeneration) {
            return;
          }
          void this.audiosrv.playSound(data.audioFileUrl as string, false);
        },
        error: err => console.error('TTS playback failed', err),
      });
  }

  private saveRating(item: SentenceReviewQueueItem): void {
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
