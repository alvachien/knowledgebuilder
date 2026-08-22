import { Injectable, computed, inject, signal } from '@angular/core';

import type {
  VocabularySpellingQueue,
  VocabularySpellingQueueResult,
  VocabularySpellingLetter,
} from '../../interfaces';
import { AudioService } from '../../services';

/**
 * State and behavior of one vocabulary spelling session: the word queue, the
 * per-letter reveal state of the current word, the per-word results, and the
 * sound/voice side effects. Provided on the page container so the typing and
 * result screens share one instance; the container only decides the screen
 * (`mode`) — everything typing-related lives here.
 *
 * Behavior was moved verbatim out of VocabularyExercisesComponent
 * (onSpellingStart / handleKeyboardEvent typing branch / onNeedHint /
 * onNextWord / setWordQueueIndex / onQuitSpelling), with two deliberate changes:
 * state is signal-based (no manual change-detection nudges), and starting an
 * empty queue is a no-op instead of falling through to the result screen.
 */
// eslint-disable-next-line @angular-eslint/use-injectable-provided-in -- intentionally NOT root-provided: the page container provides it so the typing/result screens share one instance scoped to the page
@Injectable()
export class VocabularySpellingSessionStore {
  private readonly audiosrv = inject(AudioService);

  readonly queue = signal<VocabularySpellingQueue[]>([]);
  readonly queueIndex = signal(-1);
  readonly letters = signal<VocabularySpellingLetter[]>([]);
  private readonly letterIndex = signal(0);
  readonly results = signal<VocabularySpellingQueueResult[]>([]);
  /** Set when the last word is completed; the container switches to the result screen. */
  readonly isComplete = signal(false);

  private disableVoice = false;

  /** Progress in percent, measured against the typing queue (not the whole
   *  file). Counts completed words (not the cursor) so a session reaches 100%
   *  on completion and a single-word session does not read 0% throughout (L7). */
  readonly progress = computed(() => {
    const queue = this.queue();
    if (queue.length === 0) {
      return 100;
    }
    const completed = queue.filter(q => q.completed).length;
    return Math.round((completed * 100) / queue.length);
  });

  /** Explanation (Chinese gloss) of the current word. */
  readonly wordExplain = computed(() => {
    const idx = this.queueIndex();
    const queue = this.queue();
    return idx >= 0 && idx < queue.length ? queue[idx].cnword : '';
  });

  readonly correctCount = computed(() => this.results().filter(r => r.correct).length);
  readonly incorrectCount = computed(() => this.results().filter(r => !r.correct).length);

  /**
   * Whether the current word's result is still correct (true before any wrong
   * key / hint / give-up marks it incorrect). Drives the live a11y status so a
   * wrong keypress is announced beyond the beep sound alone (L9).
   */
  readonly currentResultCorrect = computed(() => {
    const idx = this.queueIndex();
    const results = this.results();
    return idx >= 0 && idx < results.length ? results[idx].correct : true;
  });

  /**
   * Start a new session over `items`. Returns false (and stays reset) when
   * there is nothing to type, so the caller can keep showing the list.
   */
  start(items: VocabularySpellingQueue[], disableVoice: boolean): boolean {
    this.reset();
    if (items.length === 0) {
      return false;
    }

    this.disableVoice = disableVoice;
    this.queue.set(items);
    this.results.set(items.map(val => ({ enword: val.enword, correct: true })));
    this.goToQueueIndex(0);
    return true;
  }

  /** Drop every piece of session state (quit mid-session / leave the result screen). */
  reset(): void {
    this.queue.set([]);
    this.results.set([]);
    this.letters.set([]);
    this.queueIndex.set(-1);
    this.letterIndex.set(0);
    this.isComplete.set(false);
    this.disableVoice = false;
  }

  /**
   * Handle one keystroke. Any key that is neither Backspace nor the expected
   * letter counts as a typing error (mirrors the original keyup handler,
   * including its treatment of modifier keys).
   */
  handleKey(key: string): void {
    const letters = this.letters();
    const idx = this.letterIndex();
    if (idx < 0 || idx >= letters.length) {
      return;
    }

    if (key === 'Backspace') {
      const prev = Math.max(0, idx - 1);
      this.letters.update(ls => ls.map((l, i) => (i === prev ? { ...l, visible: false } : l)));
      this.letterIndex.set(prev);
      return;
    }

    if (key === letters[idx].letter) {
      this.letters.update(ls => ls.map((l, i) => (i === idx ? { ...l, visible: true } : l)));
      this.audiosrv.playSound('Default.wav');
      this.letterIndex.set(idx + 1);
      if (idx + 1 === letters.length) {
        this.goToQueueIndex(this.queueIndex() + 1);
      }
    } else {
      this.markCurrentIncorrect();
      this.audiosrv.playSound('beep.wav');
    }
  }

  /** Reveal the current letter as a hint; the word no longer counts as correct. */
  hint(): void {
    const idx = this.letterIndex();
    if (idx < 0 || idx >= this.letters().length) {
      return;
    }
    this.markCurrentIncorrect();
    this.letters.update(ls => ls.map((l, i) => (i === idx ? { ...l, visible: true } : l)));
    this.letterIndex.set(idx + 1);
    if (idx + 1 === this.letters().length) {
      this.goToQueueIndex(this.queueIndex() + 1);
    }
  }

  /** Give up the current word and move to the next one. */
  nextWord(): void {
    // After completion the cursor stays at the last word (the container's mode
    // switch destroys the screen a tick later); a stray give-up click in that
    // gap must not flip the last (correct) result to incorrect and corrupt
    // the tally (L6).
    if (this.isComplete() || this.queueIndex() === -1) {
      return;
    }
    this.markCurrentIncorrect();
    this.goToQueueIndex(this.queueIndex() + 1);
  }

  private markCurrentIncorrect(): void {
    const qi = this.queueIndex();
    this.results.update(rs => rs.map((r, i) => (i === qi ? { ...r, correct: false } : r)));
  }

  private goToQueueIndex(idx: number): void {
    const queue = this.queue();
    if (idx >= 0 && idx < queue.length) {
      this.markPreviousCompleted();
      this.queueIndex.set(idx);
      if (!this.disableVoice) {
        // Web Speech API in the browser: no vocabulary leaks to a third-party server.
        this.audiosrv.speakWord(queue[idx].enword);
      }
      this.letters.set(
        queue[idx].enword.split('').map((letter, index) => ({ idx: index, visible: false, letter }))
      );
      this.letterIndex.set(0);
    } else if (idx === queue.length) {
      this.markPreviousCompleted();
      if (this.queue().every(item => item.completed)) {
        // Session over: leave no live letter state behind.
        this.isComplete.set(true);
        this.letters.set([]);
        this.letterIndex.set(-1);
      }
      this.audiosrv.playSound('correct.wav');
    }
  }

  private markPreviousCompleted(): void {
    const prev = this.queueIndex();
    if (prev !== -1) {
      this.queue.update(q => q.map((item, i) => (i === prev ? { ...item, completed: true } : item)));
    }
  }
}
