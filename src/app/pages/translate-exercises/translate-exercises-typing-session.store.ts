import { Injectable, computed, signal } from '@angular/core';

import type { SentenceTypingResult, TranslateQueue } from '../../interfaces';
import { TranslateDirectionEnum, normalizeSentenceAnswer } from '../../interfaces';

/**
 * State and behavior of one typing (translation) session: the sentence queue,
 * the cursor, the live input of the current sentence, per-sentence results
 * graded via normalizeSentenceAnswer, and the time cost. Provided on the page
 * container so the typing and result screens share one instance; the container
 * only decides the screen (`mode`) — everything typing-related lives here.
 *
 * Replaces the old TranslateExercisesComponent onStart/onSubmitToNext/
 * setQueueIndex trio: grading was added (the old result screen never compared
 * answers) and an empty queue is a no-op instead of falling through to the
 * result screen.
 */
// eslint-disable-next-line @angular-eslint/use-injectable-provided-in -- intentionally NOT root-provided: the page container provides it so the typing/result screens share one instance scoped to the page
@Injectable()
export class TranslateTypingSessionStore {
  readonly queue = signal<TranslateQueue[]>([]);
  readonly queueIndex = signal(-1);
  readonly inputted = signal('');
  readonly results = signal<SentenceTypingResult[]>([]);
  /** Set when the last sentence is submitted; the container switches to the result screen. */
  readonly isComplete = signal(false);
  readonly timeCostSeconds = signal(0);

  private direction: TranslateDirectionEnum = TranslateDirectionEnum.EnglishToChinese;
  private startTime = new Date();

  /** Prompt text of the current sentence: EN (en2cn input) or CN. */
  readonly currentPrompt = computed(() => {
    const idx = this.queueIndex();
    const queue = this.queue();
    if (idx < 0 || idx >= queue.length) {
      return '';
    }
    return this.direction === TranslateDirectionEnum.EnglishToChinese
      ? queue[idx].ensent
      : queue[idx].cnsent;
  });

  /** Progress in percent, measured against the typing queue (not the whole file). */
  readonly progress = computed(() => {
    const queue = this.queue();
    if (queue.length === 0) {
      return 100;
    }
    const completed = queue.filter(q => q.completed).length;
    return Math.round((completed * 100) / queue.length);
  });

  readonly correctCount = computed(() => this.results().filter(r => r.correct).length);
  readonly incorrectCount = computed(() => this.results().filter(r => !r.correct).length);

  /**
   * Start a new session over `items`. Returns false (and stays reset) when
   * there is nothing to type, so the caller can keep showing the list.
   */
  start(items: TranslateQueue[], direction: TranslateDirectionEnum): boolean {
    this.reset();
    if (items.length === 0) {
      return false;
    }

    this.direction = direction;
    this.queue.set(items.map(item => ({ ...item, completed: false })));
    this.results.set([]);
    this.queueIndex.set(0);
    this.inputted.set('');
    this.startTime = new Date();
    return true;
  }

  /** Drop every piece of session state (quit mid-session / leave the result screen). */
  reset(): void {
    this.queue.set([]);
    this.queueIndex.set(-1);
    this.inputted.set('');
    this.results.set([]);
    this.isComplete.set(false);
    this.timeCostSeconds.set(0);
    this.direction = TranslateDirectionEnum.EnglishToChinese;
  }

  setInput(value: string): void {
    this.inputted.set(value);
  }

  /**
   * Grade the current input against the expected translation (both normalized
   * via normalizeSentenceAnswer), record the result and advance. Completing
   * the last sentence stops the clock and flags the session complete.
   */
  submitAndNext(): void {
    const idx = this.queueIndex();
    const queue = this.queue();
    if (idx < 0 || idx >= queue.length || this.isComplete()) {
      return;
    }

    const item = queue[idx];
    const input = this.inputted();
    const target =
      this.direction === TranslateDirectionEnum.EnglishToChinese ? item.cnsent : item.ensent;
    const correct = normalizeSentenceAnswer(input) === normalizeSentenceAnswer(target);

    this.results.update(rs => [
      ...rs,
      { ensent: item.ensent, cnsent: item.cnsent, inputted: input, correct },
    ]);
    this.queue.update(q => q.map((v, i) => (i === idx ? { ...v, completed: true } : v)));
    this.inputted.set('');

    const next = idx + 1;
    if (next < queue.length) {
      this.queueIndex.set(next);
    } else {
      this.timeCostSeconds.set(Math.round((new Date().getTime() - this.startTime.getTime()) / 1000));
      this.isComplete.set(true);
    }
  }
}
