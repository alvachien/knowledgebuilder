import { TestBed } from '@angular/core/testing';

import type { VocabularyQuizQuestion } from '../../interfaces';
import { AudioService } from '../../services';

import { VocabularyQuizSessionStore } from './vocabulary-exercises-quiz-session.store';

describe('VocabularyQuizSessionStore', () => {
  let store: VocabularyQuizSessionStore;
  let mockAudioService: {
    speakWord: ReturnType<typeof vi.fn>;
    playSound: ReturnType<typeof vi.fn>;
  };

  const question = (over: Partial<VocabularyQuizQuestion> = {}): VocabularyQuizQuestion => ({
    enword: 'apple',
    cnword: '苹果',
    direction: 'en2cn',
    prompt: 'apple',
    options: ['苹果', '香蕉', '樱桃', '枣'],
    answerIndex: 0,
    ...over,
  });

  beforeEach(() => {
    mockAudioService = {
      speakWord: vi.fn(),
      playSound: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        VocabularyQuizSessionStore,
        { provide: AudioService, useValue: mockAudioService },
      ],
    });
    store = TestBed.inject(VocabularyQuizSessionStore);
  });

  describe('start', () => {
    it('returns false and stays reset for an empty queue', () => {
      expect(store.start([])).toBe(false);
      expect(store.questions().length).toBe(0);
      expect(store.isComplete()).toBe(false);
      expect(mockAudioService.playSound).not.toHaveBeenCalled();
    });

    it('builds the question queue and results, starting at the first question', () => {
      expect(store.start([question(), question({ enword: 'banana', cnword: '香蕉' })])).toBe(true);

      expect(store.questions().length).toBe(2);
      expect(store.currentIndex()).toBe(0);
      expect(store.currentQuestion()?.enword).toBe('apple');
      expect(store.selectedIndex()).toBe(-1);
      expect(store.results()).toEqual([
        { enword: 'apple', cnword: '苹果', correct: true },
        { enword: 'banana', cnword: '香蕉', correct: true },
      ]);
    });
  });

  describe('answer', () => {
    beforeEach(() => {
      store.start([question()]);
    });

    it('records a correct pick and plays the correct sound', () => {
      store.answer(0);

      expect(store.selectedIndex()).toBe(0);
      expect(store.results()[0].correct).toBe(true);
      expect(mockAudioService.playSound).toHaveBeenCalledWith('correct.wav');
    });

    it('records a wrong pick and plays the beep sound', () => {
      store.answer(2);

      expect(store.selectedIndex()).toBe(2);
      expect(store.results()[0].correct).toBe(false);
      expect(mockAudioService.playSound).toHaveBeenCalledWith('beep.wav');
    });

    it('ignores out-of-range picks and re-answers', () => {
      store.answer(0);
      store.answer(2);
      store.answer(9);
      store.answer(-1);

      expect(store.selectedIndex()).toBe(0);
      expect(store.results()[0].correct).toBe(true);
      expect(mockAudioService.playSound).toHaveBeenCalledTimes(1);
    });
  });

  describe('next', () => {
    it('is a no-op until the current question is answered', () => {
      store.start([question(), question({ enword: 'banana' })]);
      store.next();

      expect(store.currentIndex()).toBe(0);
    });

    it('advances to the next question and clears the pick', () => {
      store.start([question(), question({ enword: 'banana', cnword: '香蕉' })]);
      store.answer(1);
      store.next();

      expect(store.currentIndex()).toBe(1);
      expect(store.selectedIndex()).toBe(-1);
      expect(store.isComplete()).toBe(false);
    });

    it('completes the session after the last question is answered', () => {
      store.start([question()]);
      store.answer(0);
      store.next();

      expect(store.isComplete()).toBe(true);
      expect(store.currentIndex()).toBe(-1);
      expect(store.selectedIndex()).toBe(-1);
      expect(mockAudioService.playSound).toHaveBeenCalledWith('correct.wav');
    });
  });

  describe('handleKey', () => {
    beforeEach(() => {
      store.start([question()]);
    });

    it('answers via number keys 1-4', () => {
      store.handleKey('2');

      expect(store.selectedIndex()).toBe(1);
      expect(store.results()[0].correct).toBe(false);
    });

    it('answers via letter keys A-D (case-insensitive)', () => {
      store.handleKey('A');

      expect(store.selectedIndex()).toBe(0);
      expect(store.results()[0].correct).toBe(true);
    });

    it('ignores keys beyond the option count and unknown keys', () => {
      store.start([question({ options: ['苹果', '香蕉'], answerIndex: 0 })]);
      store.handleKey('3');
      store.handleKey('e');
      store.handleKey('x');

      expect(store.selectedIndex()).toBe(-1);
    });

    it('advances with Enter or ArrowRight once answered', () => {
      store.start([question(), question({ enword: 'banana' })]);
      store.answer(0);
      store.handleKey('Enter');

      expect(store.currentIndex()).toBe(1);
      store.answer(0);
      store.handleKey('ArrowRight');

      expect(store.isComplete()).toBe(true);
    });
  });

  describe('reset', () => {
    it('drops every piece of session state', () => {
      store.start([question()]);
      store.answer(0);

      store.reset();

      expect(store.questions()).toEqual([]);
      expect(store.results()).toEqual([]);
      expect(store.currentIndex()).toBe(-1);
      expect(store.selectedIndex()).toBe(-1);
      expect(store.isComplete()).toBe(false);
    });
  });

  describe('post-completion no-ops', () => {
    // Reach the completed state once: answer the single question, then advance
    // past it (which fires the completion branch). Everything after must be a
    // no-op — no extra sound, no tally change, no cursor drift.
    beforeEach(() => {
      store.start([question()]);
      store.answer(0);
      store.next();
      expect(store.isComplete()).toBe(true);
    });

    it('answer is a no-op after completion', () => {
      const playsBefore = mockAudioService.playSound.mock.calls.length;

      store.answer(0);

      expect(store.results().length).toBe(1);
      expect(store.correctCount()).toBe(1);
      expect(store.currentIndex()).toBe(-1);
      expect(mockAudioService.playSound.mock.calls.length).toBe(playsBefore);
    });

    it('next is a no-op after completion (no second completion sound)', () => {
      const playsBefore = mockAudioService.playSound.mock.calls.length;

      store.next();

      expect(store.isComplete()).toBe(true);
      expect(store.currentIndex()).toBe(-1);
      expect(mockAudioService.playSound.mock.calls.length).toBe(playsBefore);
    });

    it('handleKey is a no-op after completion (number keys, Enter, ArrowRight)', () => {
      const playsBefore = mockAudioService.playSound.mock.calls.length;

      store.handleKey('1');
      store.handleKey('Enter');
      store.handleKey('ArrowRight');

      expect(store.results().length).toBe(1);
      expect(store.correctCount()).toBe(1);
      expect(store.isComplete()).toBe(true);
      expect(store.currentIndex()).toBe(-1);
      expect(mockAudioService.playSound.mock.calls.length).toBe(playsBefore);
    });
  });

  describe('progress (L7)', () => {
    it('starts at 0% and rises as questions are answered', () => {
      store.start([question(), question({ enword: 'banana' }), question({ enword: 'cherry' })]);
      expect(store.progress()).toBe(0);

      store.answer(0);
      expect(store.progress()).toBe(33);

      store.next();
      store.answer(1);
      expect(store.progress()).toBe(67);
    });

    it('reaches 100% when the last question is answered', () => {
      store.start([question(), question({ enword: 'banana' })]);
      store.answer(0);
      expect(store.progress()).toBe(50);

      store.next();
      store.answer(0);
      expect(store.progress()).toBe(100);
    });

    it('a single-question session shows 0% then 100% on answer (L7)', () => {
      store.start([question()]);
      expect(store.progress()).toBe(0);

      store.answer(0);
      expect(store.progress()).toBe(100);
    });
  });

  describe('isCorrect (L9)', () => {
    it('is false until the question is answered', () => {
      store.start([question()]);
      expect(store.isAnswered()).toBe(false);
      expect(store.isCorrect()).toBe(false);
    });

    it('is true after a correct pick and false after a wrong pick', () => {
      store.start([question(), question({ enword: 'banana', cnword: '香蕉', answerIndex: 1 })]);

      store.answer(0);
      expect(store.isCorrect()).toBe(true);

      store.next();
      store.answer(0); // wrong: correct index is 1
      expect(store.isCorrect()).toBe(false);
    });
  });
});