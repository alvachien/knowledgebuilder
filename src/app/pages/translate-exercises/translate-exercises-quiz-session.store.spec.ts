import { TestBed } from '@angular/core/testing';

import type { SentenceQuizQuestion } from '../../interfaces';
import { AudioService } from '../../services';

import { TranslateQuizSessionStore } from './translate-exercises-quiz-session.store';

describe('TranslateQuizSessionStore', () => {
  let store: TranslateQuizSessionStore;
  let mockAudioService: { playSound: ReturnType<typeof vi.fn> };

  const question = (prompt: string, options: string[], answerIndex: number): SentenceQuizQuestion => ({
    ensent: 'EN ' + prompt,
    cnsent: 'CN ' + prompt,
    prompt,
    options,
    answerIndex,
  });

  beforeEach(() => {
    mockAudioService = { playSound: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        TranslateQuizSessionStore,
        { provide: AudioService, useValue: mockAudioService },
      ],
    });
    store = TestBed.inject(TranslateQuizSessionStore);
  });

  describe('start', () => {
    it('returns false and stays reset for an empty queue', () => {
      expect(store.start([])).toBe(false);

      expect(store.questions()).toEqual([]);
      expect(store.progress()).toBe(100);
    });

    it('builds the question queue and resets all per-question state', () => {
      const questions = [
        question('q1', ['a', 'b', 'c', 'd'], 0),
        question('q2', ['a', 'b', 'c', 'd'], 1),
      ];

      expect(store.start(questions)).toBe(true);

      expect(store.questions().length).toBe(2);
      expect(store.currentIndex()).toBe(0);
      expect(store.selectedIndex()).toBe(-1);
      expect(store.isAnswered()).toBe(false);
      expect(store.results().length).toBe(2);
      expect(store.results().every(r => r.correct)).toBe(true);
      expect(store.progress()).toBe(0);
      expect(store.currentQuestion()?.prompt).toBe('q1');
    });
  });

  describe('answer', () => {
    beforeEach(() => {
      store.start([
        question('q1', ['a', 'b', 'c', 'd'], 2),
      ]);
    });

    it('records a correct pick', () => {
      store.answer(2);

      expect(store.selectedIndex()).toBe(2);
      expect(store.isCorrect()).toBe(true);
      expect(store.results()[0].correct).toBe(true);
      expect(mockAudioService.playSound).toHaveBeenCalledWith('correct.wav');
    });

    it('records a wrong pick', () => {
      store.answer(0);

      expect(store.isCorrect()).toBe(false);
      expect(store.results()[0].correct).toBe(false);
      expect(mockAudioService.playSound).toHaveBeenCalledWith('beep.wav');
    });

    it('ignores re-answers', () => {
      store.answer(2);
      store.answer(0);

      expect(store.selectedIndex()).toBe(2);
      expect(mockAudioService.playSound).toHaveBeenCalledTimes(1);
    });

    it('ignores out-of-range picks', () => {
      store.answer(9);

      expect(store.isAnswered()).toBe(false);
    });
  });

  describe('navigation', () => {
    beforeEach(() => {
      store.start([
        question('q1', ['a', 'b'], 0),
        question('q2', ['a', 'b'], 1),
      ]);
    });

    it('next requires an answer first', () => {
      store.next();

      expect(store.currentIndex()).toBe(0);
    });

    it('next moves through the queue once answered', () => {
      store.answer(0);
      store.next();

      expect(store.currentIndex()).toBe(1);
      expect(store.progress()).toBe(50);
    });

    it('answering the last question completes the session', () => {
      store.answer(0);
      store.next();
      store.answer(1);
      store.next();

      expect(store.isComplete()).toBe(true);
      expect(store.currentIndex()).toBe(-1);
      expect(store.progress()).toBe(100);
    });

    it('previous moves back to review an answered question', () => {
      store.answer(0);
      store.next();
      store.previous();

      expect(store.currentIndex()).toBe(0);
      expect(store.isPreviousDisabled()).toBe(true);
      // The pick is preserved on the answered question.
      expect(store.selectedIndex()).toBe(0);
    });

    it('previous is a no-op on the first question', () => {
      store.previous();

      expect(store.currentIndex()).toBe(0);
    });
  });

  describe('handleKey', () => {
    beforeEach(() => {
      store.start([
        question('q1', ['a', 'b', 'c'], 1),
      ]);
    });

    it.each(['1', '2', '3', '4', 'a', 'b', 'c', 'd'])('maps option key %s', key => {
      const keys = ['1', '2', '3', '4', 'a', 'b', 'c', 'd'];
      const optionIndex = keys.indexOf(key) % 4;
      // The question has 3 options; out-of-range picks are ignored.
      const expected = optionIndex < 3 ? optionIndex : -1;

      store.handleKey(key);

      expect(store.selectedIndex()).toBe(expected);
    });

    it('is case-insensitive for letter keys', () => {
      store.handleKey('B');

      expect(store.selectedIndex()).toBe(1);
    });

    it('advances with Enter after answering', () => {
      store.answer(1);
      store.handleKey('Enter');

      expect(store.isComplete()).toBe(true);
    });

    it('does not advance with Enter before answering', () => {
      store.handleKey('Enter');

      expect(store.isComplete()).toBe(false);
      expect(store.currentIndex()).toBe(0);
    });

    it('advances with ArrowRight after answering', () => {
      store.start([
        question('q1', ['a', 'b'], 0),
        question('q2', ['a', 'b'], 1),
      ]);
      store.answer(0);
      store.handleKey('ArrowRight');

      expect(store.currentIndex()).toBe(1);
    });

    it('moves back with ArrowLeft', () => {
      store.start([
        question('q1', ['a', 'b'], 0),
        question('q2', ['a', 'b'], 1),
      ]);
      store.answer(0);
      store.handleKey('ArrowRight');
      store.handleKey('ArrowLeft');

      expect(store.currentIndex()).toBe(0);
    });

    it('ignores unrelated keys', () => {
      store.handleKey('x');

      expect(store.isAnswered()).toBe(false);
    });
  });

  describe('reset', () => {
    it('clears every piece of session state', () => {
      store.start([question('q1', ['a', 'b'], 0)]);
      store.answer(0);

      store.reset();

      expect(store.questions()).toEqual([]);
      expect(store.results()).toEqual([]);
      expect(store.currentIndex()).toBe(-1);
      expect(store.isComplete()).toBe(false);
    });
  });

  describe('correctness counts', () => {
    it('tracks correct and incorrect counts', () => {
      store.start([
        question('q1', ['a', 'b'], 0),
        question('q2', ['a', 'b'], 0),
        question('q3', ['a', 'b'], 0),
      ]);
      store.answer(0);
      store.next();
      store.answer(1);
      store.next();
      store.answer(0);
      store.next();

      expect(store.correctCount()).toBe(2);
      expect(store.incorrectCount()).toBe(1);
    });
  });
});
