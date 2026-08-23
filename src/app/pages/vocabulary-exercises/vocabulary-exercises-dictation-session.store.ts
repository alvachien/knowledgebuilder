import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';

import type { VocabularySpellingQueue } from '../../interfaces';
import { AudioService } from '../../services';

/**
 * Milliseconds between the start of one dictated word and the start of the
 * next. The first word is spoken immediately on `start()`; each subsequent
 * word is spoken when this interval elapses.
 */
const DICTATION_INTERVAL_MS = 5000;

/**
 * State and behavior of one vocabulary dictation session: the word queue, the
 * cursor, progress, and the auto-play timer that speaks each word in turn on a
 * fixed interval. Provided on the page container so the dictation and result
 * screens share one instance; the container only decides the screen (`mode`).
 *
 * Dictation mirrors the spelling session's shape (queue + cursor + isComplete +
 * progress) but, per spec, has no typing, no per-letter state, and no
 * hide-audio/hide-description toggle: it just plays the queue aloud and, on
 * completion, hands the word list to the result screen for checking.
 */
// eslint-disable-next-line @angular-eslint/use-injectable-provided-in -- intentionally NOT root-provided: the page container provides it so the dictation/result screens share one instance scoped to the page
@Injectable()
export class VocabularyDictationSessionStore {
  private readonly audiosrv = inject(AudioService);
  private readonly destroyRef = inject(DestroyRef);

  readonly queue = signal<VocabularySpellingQueue[]>([]);
  readonly queueIndex = signal(-1);
  /** Set when the last word has been spoken; the container switches to the result screen. */
  readonly isComplete = signal(false);

  private timerId: ReturnType<typeof setTimeout> | null = null;

  /**
   * Progress in percent, measured against the dictation queue (not the whole
   * file). Counts words already spoken past (completed) so a session reaches
   * 100% on completion and a single-word session does not read 0% throughout
   * (mirrors the spelling store's L7 behavior).
   */
  readonly progress = computed(() => {
    const queue = this.queue();
    if (queue.length === 0) {
      return 100;
    }
    const completed = queue.filter(q => q.completed).length;
    return Math.round((completed * 100) / queue.length);
  });

  /** 1-based position of the word currently being dictated (0 before start). */
  readonly currentWordNumber = computed(() => {
    const idx = this.queueIndex();
    return idx >= 0 ? idx + 1 : 0;
  });

  constructor() {
    // The store lives as long as the page container. If the user navigates
    // away mid-dictation, the timer must die with it - otherwise the interval
    // keeps advancing words and speaking them after the page is gone (mirrors
    // the review store's auto-mode cleanup, L8).
    this.destroyRef.onDestroy(() => this.cleanup());
  }

  /**
   * Start a new session over `items`. Speaks the first word immediately, then
   * advances every `DICTATION_INTERVAL_MS`. Returns false (and stays reset)
   * when there is nothing to dictate, so the caller can keep showing the list.
   */
  start(items: VocabularySpellingQueue[]): boolean {
    this.reset();
    if (items.length === 0) {
      return false;
    }

    this.queue.set(items);
    this.queueIndex.set(0);
    this.speakCurrent();
    this.scheduleNext();
    return true;
  }

  /** Drop every piece of session state (quit mid-session / leave the result screen). */
  reset(): void {
    this.cleanup();
    this.queue.set([]);
    this.queueIndex.set(-1);
    this.isComplete.set(false);
  }

  private advance(): void {
    // Mark the word just spoken as completed so progress reflects dictated
    // words, then move to the next one.
    const idx = this.queueIndex();
    this.queue.update(q => q.map((item, i) => (i === idx ? { ...item, completed: true } : item)));

    const next = idx + 1;
    if (next < this.queue().length) {
      this.queueIndex.set(next);
      this.speakCurrent();
      this.scheduleNext();
    } else {
      // Session over: leave no live timer behind.
      this.isComplete.set(true);
      this.clearTimer();
      this.audiosrv.playSound('correct.wav');
    }
  }

  private speakCurrent(): void {
    const item = this.queue()[this.queueIndex()];
    if (item) {
      // Web Speech API in the browser: no vocabulary leaks to a third-party server.
      this.audiosrv.speakWord(item.enword);
    }
  }

  private scheduleNext(): void {
    this.clearTimer();
    this.timerId = setTimeout(() => this.advance(), DICTATION_INTERVAL_MS);
  }

  private clearTimer(): void {
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  /** Clear the pending tick and stop any in-flight speech (quit / destroy). */
  private cleanup(): void {
    this.clearTimer();
    // Stop any utterance still playing so quitting mid-word does not keep
    // talking after the screen (or the page) is gone.
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }
}
