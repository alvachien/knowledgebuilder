import { TestBed } from '@angular/core/testing';

import type { VocabularySpellingQueue } from '../../interfaces';
import { AudioService } from '../../services';

import { VocabularySpellingSessionStore } from './vocabulary-exercises-spelling-session.store';

describe('VocabularySpellingSessionStore', () => {
  let store: VocabularySpellingSessionStore;
  let mockAudioService: {
    speakWord: ReturnType<typeof vi.fn>;
    playSound: ReturnType<typeof vi.fn>;
  };

  const word = (enword: string, cnword = '测试'): VocabularySpellingQueue => ({
    enword,
    cnword,
    completed: false,
  });

  beforeEach(() => {
    mockAudioService = {
      speakWord: vi.fn(),
      playSound: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        VocabularySpellingSessionStore,
        { provide: AudioService, useValue: mockAudioService },
      ],
    });
    store = TestBed.inject(VocabularySpellingSessionStore);
  });

  describe('start', () => {
    it('returns false and stays reset for an empty queue', () => {
      expect(store.start([], false)).toBe(false);
      expect(store.queue().length).toBe(0);
      expect(store.isComplete()).toBe(false);
      expect(mockAudioService.playSound).not.toHaveBeenCalled();
    });

    it('builds queue, results and letters, and speaks the first word', () => {
      expect(store.start([word('test')], false)).toBe(true);

      expect(store.queue().length).toBe(1);
      expect(store.results()).toEqual([{ enword: 'test', correct: true }]);
      expect(store.letters().map(l => l.letter)).toEqual(['t', 'e', 's', 't']);
      expect(store.letters().every(l => !l.visible)).toBe(true);
      expect(store.queueIndex()).toBe(0);
      expect(mockAudioService.speakWord).toHaveBeenCalledWith('test');
    });

    it('does not speak when voice is disabled', () => {
      store.start([word('test')], true);
      expect(mockAudioService.speakWord).not.toHaveBeenCalled();
    });
  });

  describe('handleKey', () => {
    beforeEach(() => {
      store.start([word('test')], true);
    });

    it('reveals the letter and plays the default sound on a correct key', () => {
      store.handleKey('t');

      expect(store.letters()[0].visible).toBe(true);
      expect(mockAudioService.playSound).toHaveBeenCalledWith('Default.wav');
    });

    it('marks the word incorrect and plays beep on a wrong key', () => {
      store.handleKey('x');

      expect(store.results()[0].correct).toBe(false);
      expect(mockAudioService.playSound).toHaveBeenCalledWith('beep.wav');
    });

    it('hides the previous letter on Backspace', () => {
      store.handleKey('t');
      store.handleKey('e');
      store.handleKey('Backspace');

      expect(store.letters()[1].visible).toBe(false);
      expect(store.letters()[0].visible).toBe(true);
    });

    it('does not go below the first letter on Backspace', () => {
      store.handleKey('Backspace');

      expect(store.letters()[0].visible).toBe(false);
      // A following correct key still types the first letter.
      store.handleKey('t');
      expect(store.letters()[0].visible).toBe(true);
    });

    it('advances to the next word when the last letter is typed', () => {
      store.start([word('ab'), word('cd')], true);
      store.handleKey('a');
      store.handleKey('b');

      expect(store.queueIndex()).toBe(1);
      expect(store.queue()[0].completed).toBe(true);
      expect(store.letters().map(l => l.letter)).toEqual(['c', 'd']);
    });

    it('completes the session after the last word', () => {
      store.handleKey('t');
      store.handleKey('e');
      store.handleKey('s');
      store.handleKey('t');

      expect(store.isComplete()).toBe(true);
      expect(store.letters()).toEqual([]);
      expect(mockAudioService.playSound).toHaveBeenCalledWith('correct.wav');
    });
  });

  describe('hint', () => {
    it('reveals the current letter and marks the word incorrect', () => {
      store.start([word('test')], true);

      store.hint();

      expect(store.letters()[0].visible).toBe(true);
      expect(store.results()[0].correct).toBe(false);
    });

    it('advances to the next word when the last letter is revealed', () => {
      store.start([word('ab'), word('cd')], true);
      store.hint();
      store.hint();

      expect(store.queueIndex()).toBe(1);
    });
  });

  describe('nextWord', () => {
    it('marks the current word incorrect and moves on', () => {
      store.start([word('ab'), word('cd')], true);

      store.nextWord();

      expect(store.results()[0].correct).toBe(false);
      expect(store.queueIndex()).toBe(1);
    });

    it('completes the session when giving up the last word', () => {
      store.start([word('ab')], true);

      store.nextWord();

      expect(store.isComplete()).toBe(true);
      expect(store.incorrectCount()).toBe(1);
    });

    it('does not flip the last (correct) result to incorrect after completion (L6)', () => {
      // Type the single word correctly, then give up (a stray click in the gap
      // before the mode switch destroys the screen): the tally must not flip.
      store.start([word('ab')], true);
      store.handleKey('a');
      store.handleKey('b');
      expect(store.isComplete()).toBe(true);
      expect(store.correctCount()).toBe(1);

      store.nextWord();

      expect(store.correctCount()).toBe(1);
      expect(store.incorrectCount()).toBe(0);
    });
  });

  describe('derived state', () => {
    it('progress is measured against the spelling queue', () => {
      store.start([word('a'), word('b'), word('c'), word('d')], true);
      expect(store.progress()).toBe(0);

      store.nextWord();
      expect(store.progress()).toBe(25);
    });

    it('progress reaches 100% on completion and is rounded (L7)', () => {
      store.start([word('ab'), word('cd'), word('ef')], true);
      expect(store.progress()).toBe(0);

      // Give up the first two words (2/3 completed -> 67% rounded).
      store.nextWord();
      store.nextWord();
      expect(store.progress()).toBe(67);

      // Typing the last word completes the session -> 100%.
      store.handleKey('e');
      store.handleKey('f');
      expect(store.isComplete()).toBe(true);
      expect(store.progress()).toBe(100);
    });

    it('a single-word session shows 0% while typing and 100% on completion (L7)', () => {
      store.start([word('ab')], true);
      expect(store.progress()).toBe(0);

      store.handleKey('a');
      expect(store.progress()).toBe(0);

      store.handleKey('b');
      expect(store.isComplete()).toBe(true);
      expect(store.progress()).toBe(100);
    });

    it('wordExplain returns the cnword of the current queue item', () => {
      store.start([word('test', '测试'), word('hello', '你好')], true);
      expect(store.wordExplain()).toBe('测试');

      store.nextWord();
      expect(store.wordExplain()).toBe('你好');
    });

    it('wordExplain is empty out of bounds', () => {
      expect(store.wordExplain()).toBe('');
    });

    it('currentResultCorrect tracks the current word result (L9)', () => {
      store.start([word('ab'), word('cd')], true);
      expect(store.currentResultCorrect()).toBe(true);

      // A wrong key marks the current word incorrect.
      store.handleKey('x');
      expect(store.currentResultCorrect()).toBe(false);

      // Giving up moves to the next word, whose result is still correct.
      store.nextWord();
      expect(store.currentResultCorrect()).toBe(true);
    });

    it('counts correct and incorrect results', () => {
      store.start([word('ab'), word('cd')], true);
      store.handleKey('x'); // word 1 wrong
      store.nextWord();
      store.handleKey('c');
      store.handleKey('d'); // word 2 completes the session

      expect(store.isComplete()).toBe(true);
      expect(store.correctCount()).toBe(1);
      expect(store.incorrectCount()).toBe(1);
    });
  });

  describe('reset', () => {
    it('clears every piece of session state', () => {
      store.start([word('test')], true);
      store.handleKey('t');

      store.reset();

      expect(store.queue()).toEqual([]);
      expect(store.results()).toEqual([]);
      expect(store.letters()).toEqual([]);
      expect(store.queueIndex()).toBe(-1);
      expect(store.isComplete()).toBe(false);
    });
  });
});
