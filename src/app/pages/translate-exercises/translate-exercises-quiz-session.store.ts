import { Injectable, computed, inject, signal } from '@angular/core';

import type { SentenceQuizQuestion, SentenceQuizQueueResult } from '../../interfaces';
import { AudioService } from '../../services';

/**
 * State and behavior of one sentence quiz session: the generated
 * single-choice question queue, the cursor, the picked option of the current
 * question, the per-question results, and the answer sounds. Provided on the
 * page container so the quiz and result screens share one instance; the
 * container only decides the screen (`mode`) - everything quiz-related lives
 * here. Mirrors the vocabulary quiz session store.
 */
// eslint-disable-next-line @angular-eslint/use-injectable-provided-in -- intentionally NOT root-provided: the page container provides it so the quiz/result screens share one instance scoped to the page
@Injectable()
export class TranslateQuizSessionStore {
  private static readonly OPTION_KEYS = ['1', '2', '3', '4', 'a', 'b', 'c', 'd'];

  private readonly audiosrv = inject(AudioService);

  readonly questions = signal<SentenceQuizQuestion[]>([]);
  readonly currentIndex = signal(-1);
  // Per-question picked option index (-1 until that question is answered).
  // Answers are final - no re-answering - so the pick is kept per question and
  // `selectedIndex` derives from it: navigating back to an answered question
  // still shows its pick (and the correct/wrong highlight), not a blank slate.
  private readonly picks = signal<number[]>([]);
  /** Index into the current question's options that the user picked; -1 until answered. */
  readonly selectedIndex = computed(() => {
    const idx = this.currentIndex();
    const picks = this.picks();
    return idx >= 0 && idx < picks.length ? picks[idx] : -1;
  });
  readonly results = signal<SentenceQuizQueueResult[]>([]);
  /** Set when the last question is answered; the container switches to the result screen. */
  readonly isComplete = signal(false);
  // Count of questions answered so far (answers are final). Drives progress so
  // a session reaches 100% on the last answer and a single-question session
  // does not read 0% throughout.
  private readonly answeredCount = signal(0);

  /** Progress in percent, measured against the question queue. */
  readonly progress = computed(() => {
    const len = this.questions().length;
    return len === 0 ? 100 : Math.round((this.answeredCount() * 100) / len);
  });

  /** The question under the cursor (null when the queue is empty). */
  readonly currentQuestion = computed(() => {
    const idx = this.currentIndex();
    const questions = this.questions();
    return idx >= 0 && idx < questions.length ? questions[idx] : null;
  });

  /** Whether the current question has been answered (and can be advanced). */
  readonly isAnswered = computed(() => this.selectedIndex() >= 0);

  /** Whether there is no previous question to go back to. */
  readonly isPreviousDisabled = computed(() => this.currentIndex() <= 0);

  /** Whether the user's pick on the current question was correct (false until answered). */
  readonly isCorrect = computed(() => {
    if (!this.isAnswered()) {
      return false;
    }
    const question = this.currentQuestion();
    return question ? this.selectedIndex() === question.answerIndex : false;
  });

  readonly correctCount = computed(() => this.results().filter(r => r.correct).length);
  readonly incorrectCount = computed(() => this.results().filter(r => !r.correct).length);

  /**
   * Start a new session over `questions`. Returns false (and stays reset) when
   * there is nothing to ask, so the caller can keep showing the list.
   */
  start(questions: SentenceQuizQuestion[]): boolean {
    this.reset();
    if (questions.length === 0) {
      return false;
    }

    this.questions.set(questions);
    this.picks.set(questions.map(() => -1));
    this.results.set(questions.map(q => ({ ensent: q.ensent, cnsent: q.cnsent, correct: true })));
    this.currentIndex.set(0);
    this.answeredCount.set(0);
    return true;
  }

  /** Drop every piece of session state (quit mid-session / leave the result screen). */
  reset(): void {
    this.questions.set([]);
    this.results.set([]);
    this.picks.set([]);
    this.currentIndex.set(-1);
    this.isComplete.set(false);
    this.answeredCount.set(0);
  }

  /**
   * Lock in the user's pick for the current question. Out-of-range picks and
   * re-answers are ignored; the per-question result is recorded and the
   * matching sound plays.
   */
  answer(index: number): void {
    const question = this.currentQuestion();
    if (!question || this.isAnswered() || index < 0 || index >= question.options.length) {
      return;
    }

    const correct = index === question.answerIndex;
    const qi = this.currentIndex();
    this.picks.update(p => p.map((v, i) => (i === qi ? index : v)));
    this.results.update(rs => rs.map((r, i) => (i === qi ? { ...r, correct } : r)));
    this.answeredCount.update(c => c + 1);
    void this.audiosrv.playSound(correct ? 'correct.wav' : 'beep.wav');
  }

  /** Move to the next question; answering the last one completes the session. */
  next(): void {
    if (!this.isAnswered()) {
      return;
    }

    const nextIndex = this.currentIndex() + 1;
    if (nextIndex < this.questions().length) {
      this.currentIndex.set(nextIndex);
    } else {
      // Session over: leave no live answer state behind.
      this.isComplete.set(true);
      this.currentIndex.set(-1);
      void this.audiosrv.playSound('correct.wav');
    }
  }

  /** Move back to the previous question to review an already-answered one. */
  previous(): void {
    if (this.currentIndex() > 0) {
      this.currentIndex.set(this.currentIndex() - 1);
    }
  }

  /**
   * Handle one keystroke: 1-4 / A-D pick the matching option, Enter or the
   * right arrow advances to the next (already answered) question.
   */
  handleKey(key: string): void {
    if (key === 'Enter' || key === 'ArrowRight') {
      this.next();
      return;
    }

    if (key === 'ArrowLeft') {
      this.previous();
      return;
    }

    const idx = TranslateQuizSessionStore.OPTION_KEYS.indexOf(key.toLowerCase());
    if (idx === -1) {
      return;
    }
    const optionIndex = idx % 4;
    const question = this.currentQuestion();
    if (question && optionIndex < question.options.length) {
      this.answer(optionIndex);
    }
  }
}
