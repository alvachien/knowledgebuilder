import { TestBed } from '@angular/core/testing';

import type { VocabularySpellingQueue } from '../../interfaces';
import { AudioService } from '../../services';

import { VocabularyDictationSessionStore } from './vocabulary-exercises-dictation-session.store';

describe('VocabularyDictationSessionStore', () => {
  let store: VocabularyDictationSessionStore;
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
    vi.useFakeTimers();
    mockAudioService = {
      speakWord: vi.fn(),
      playSound: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        VocabularyDictationSessionStore,
        { provide: AudioService, useValue: mockAudioService },
      ],
    });
    store = TestBed.inject(VocabularyDictationSessionStore);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('start', () => {
    it('returns false and stays reset for an empty queue', () => {
      expect(store.start([])).toBe(false);
      expect(store.queue().length).toBe(0);
      expect(store.isComplete()).toBe(false);
      expect(mockAudioService.speakWord).not.toHaveBeenCalled();
    });

    it('builds the queue, speaks the first word immediately, and does not complete', () => {
      expect(store.start([word('hello'), word('world')])).toBe(true);

      expect(store.queue().length).toBe(2);
      expect(store.queueIndex()).toBe(0);
      expect(store.currentWordNumber()).toBe(1);
      expect(store.isComplete()).toBe(false);
      expect(mockAudioService.speakWord).toHaveBeenCalledWith('hello');
      expect(mockAudioService.speakWord).not.toHaveBeenCalledWith('world');
    });
  });

  describe('auto-advance', () => {
    it('advances to the next word and speaks it after the interval', () => {
      store.start([word('hello'), word('world')]);
      expect(mockAudioService.speakWord).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(5000);

      expect(store.queueIndex()).toBe(1);
      expect(store.currentWordNumber()).toBe(2);
      expect(store.queue()[0].completed).toBe(true);
      expect(mockAudioService.speakWord).toHaveBeenCalledWith('world');
    });

    it('completes the session and plays the success sound after the last word', () => {
      store.start([word('ab'), word('cd')]);

      vi.advanceTimersByTime(5000); // -> word 1
      expect(store.isComplete()).toBe(false);

      vi.advanceTimersByTime(5000); // -> past last word
      expect(store.isComplete()).toBe(true);
      expect(store.queue().every(q => q.completed)).toBe(true);
      expect(mockAudioService.playSound).toHaveBeenCalledWith('correct.wav');
    });

    it('does not fire any further ticks after completion', () => {
      store.start([word('ab')]);

      vi.advanceTimersByTime(5000);
      expect(store.isComplete()).toBe(true);
      const callsAfterCompletion = mockAudioService.speakWord.mock.calls.length;

      vi.advanceTimersByTime(20000);
      expect(mockAudioService.speakWord.mock.calls.length).toBe(callsAfterCompletion);
    });
  });

  describe('derived state', () => {
    it('progress is 0% during the first word and 100% on completion', () => {
      store.start([word('ab'), word('cd'), word('ef')]);
      expect(store.progress()).toBe(0);

      vi.advanceTimersByTime(5000); // word 0 completed
      expect(store.progress()).toBe(33);

      vi.advanceTimersByTime(5000); // word 1 completed
      expect(store.progress()).toBe(67);

      vi.advanceTimersByTime(5000); // complete
      expect(store.progress()).toBe(100);
    });

    it('a single-word session shows 0% while dictating and 100% on completion', () => {
      store.start([word('ab')]);
      expect(store.progress()).toBe(0);

      vi.advanceTimersByTime(5000);
      expect(store.isComplete()).toBe(true);
      expect(store.progress()).toBe(100);
    });
  });

  describe('reset', () => {
    it('clears every piece of session state', () => {
      store.start([word('hello'), word('world')]);
      vi.advanceTimersByTime(5000);

      store.reset();

      expect(store.queue()).toEqual([]);
      expect(store.queueIndex()).toBe(-1);
      expect(store.isComplete()).toBe(false);
      expect(store.currentWordNumber()).toBe(0);
    });

    it('cancels the pending tick so no advance fires after reset', () => {
      store.start([word('hello'), word('world')]);
      store.reset();

      const callsBefore = mockAudioService.speakWord.mock.calls.length;
      vi.advanceTimersByTime(20000);
      expect(mockAudioService.speakWord.mock.calls.length).toBe(callsBefore);
      expect(store.isComplete()).toBe(false);
    });
  });
});
