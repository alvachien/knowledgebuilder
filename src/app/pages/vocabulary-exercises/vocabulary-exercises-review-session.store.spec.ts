import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import type { ReviewQueueItem, UserLearningRating, WordDictionaryEntry } from '../../interfaces';
import { AudioService, LearningRatingService, WordDictionaryService } from '../../services';

import { VocabularyReviewSessionStore } from './vocabulary-exercises-review-session.store';

describe('VocabularyReviewSessionStore', () => {
  let store: VocabularyReviewSessionStore;
  let mockAudioService: {
    speakWord: ReturnType<typeof vi.fn>;
    playSound: ReturnType<typeof vi.fn>;
    playAuthenticatedOneShot: ReturnType<typeof vi.fn>;
    stopWordOneShot: ReturnType<typeof vi.fn>;
    cancelSpeech: ReturnType<typeof vi.fn>;
    speakSequence: ReturnType<typeof vi.fn>;
  };
  let mockRatingService: {
    getRatings: ReturnType<typeof vi.fn>;
    upsertRating: ReturnType<typeof vi.fn>;
  };
  let mockDictionaryService: {
    getWord: ReturnType<typeof vi.fn>;
  };

  const word = (enword: string, cnword = '测试', itemId?: number): ReviewQueueItem => ({
    enword,
    cnword,
    rating: 0,
    itemId,
  });

  /** Let queued microtasks (speech promise chains) settle. */
  async function flushTasks(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 0));
  }

  beforeEach(() => {
    mockAudioService = {
      // The default fake plays the recorded word to completion right away:
      // it fires the onEnd callback and resolves true, mirroring a Howl
      // whose 'end' arrives as soon as playback starts.
      playAuthenticatedOneShot: vi.fn(
        (_src: string, _format: string, onEnd?: () => void) => {
          onEnd?.();
          return Promise.resolve(true);
        }
      ),
      speakWord: vi.fn().mockResolvedValue(undefined),
      playSound: vi.fn(),
      stopWordOneShot: vi.fn(),
      cancelSpeech: vi.fn(),
      speakSequence: vi.fn().mockResolvedValue(undefined),
    };
    mockRatingService = {
      getRatings: vi.fn().mockReturnValue(of([])),
      upsertRating: vi.fn().mockReturnValue(of({} as UserLearningRating)),
    };
    // Default: every word is a miss (null entry) unless a test overrides it.
    mockDictionaryService = {
      getWord: vi.fn().mockReturnValue(of(null)),
    };

    TestBed.configureTestingModule({
      providers: [
        VocabularyReviewSessionStore,
        { provide: AudioService, useValue: mockAudioService },
        { provide: LearningRatingService, useValue: mockRatingService },
        { provide: WordDictionaryService, useValue: mockDictionaryService },
      ],
    });
    store = TestBed.inject(VocabularyReviewSessionStore);
  });

  describe('start', () => {
    it('returns false and stays reset for an empty queue', () => {
      expect(store.start([], false, 1)).toBe(false);

      expect(store.queue()).toEqual([]);
      expect(store.cursor()).toBe(0);
      expect(store.progress()).toBe(0);
      expect(mockAudioService.playAuthenticatedOneShot).not.toHaveBeenCalled();
      expect(mockAudioService.speakWord).not.toHaveBeenCalled();
      expect(mockRatingService.getRatings).not.toHaveBeenCalled();
    });

    it('builds the queue, resets the cursor and speaks the first word', () => {
      expect(store.start([word('hello'), word('world')], false, 0)).toBe(true);

      expect(store.queue().length).toBe(2);
      expect(store.cursor()).toBe(0);
      expect(store.progress()).toBe(50);
      expect(mockAudioService.playAuthenticatedOneShot).toHaveBeenCalledWith(
        `${environment.apiUrl}/api/WordAudio?word=hello`,
        'mp3',
        expect.any(Function)
      );
      // Recorded audio resolved successfully: no TTS fallback.
      expect(mockAudioService.speakWord).not.toHaveBeenCalled();
    });

    it('does not speak when voice is disabled', () => {
      store.start([word('hello')], true, 0);

      expect(mockAudioService.playAuthenticatedOneShot).not.toHaveBeenCalled();
      expect(mockAudioService.speakWord).not.toHaveBeenCalled();
    });

    it('pre-populates ratings from the API into the queue', () => {
      const ratings: UserLearningRating[] = [
        { contentId: 1, itemId: 10, rating: 4 },
        { contentId: 1, itemId: 20, rating: 2 },
      ];
      mockRatingService.getRatings.mockReturnValue(of(ratings));

      store.start([word('hello', '你好', 10), word('world', '世界', 20), word('test', '测试', 30)], false, 1);

      expect(mockRatingService.getRatings).toHaveBeenCalledWith(1);
      expect(store.queue().find(q => q.itemId === 10)?.rating).toBe(4);
      expect(store.queue().find(q => q.itemId === 20)?.rating).toBe(2);
      // No rating exists for item 30: stays at 0.
      expect(store.queue().find(q => q.itemId === 30)?.rating).toBe(0);
    });

    it('does not load ratings when contentId is 0', () => {
      store.start([word('hello', '你好', 10)], false, 0);

      expect(mockRatingService.getRatings).not.toHaveBeenCalled();
    });
  });

  describe('ratings preload vs in-session ratings (M5)', () => {
    it('a late preload must not overwrite a rating the user already changed', () => {
      const preload$ = new Subject<UserLearningRating[]>();
      mockRatingService.getRatings.mockReturnValue(preload$.asObservable());
      mockRatingService.upsertRating.mockReturnValue(
        of({ contentId: 1, itemId: 10, rating: 5 })
      );
      store.start([word('hello', '你好', 10)], true, 1);

      // The user rates the word before the (slow) preload response lands and
      // the save is confirmed right away.
      store.rateCurrent(5);

      preload$.next([{ contentId: 1, itemId: 10, rating: 2 }]);

      expect(store.currentItem().rating).toBe(5);
      expect(store.quit().get(10)).toBe(5);
    });

    it('a late preload still populates items the user has not rated', () => {
      const preload$ = new Subject<UserLearningRating[]>();
      mockRatingService.getRatings.mockReturnValue(preload$.asObservable());
      mockRatingService.upsertRating.mockReturnValue(
        of({ contentId: 1, itemId: 10, rating: 5 })
      );
      store.start([word('hello', '你好', 10), word('world', '世界', 20)], true, 1);

      store.rateCurrent(5); // rates item 10 (cursor starts at 0)

      preload$.next([
        { contentId: 1, itemId: 10, rating: 2 },
        { contentId: 1, itemId: 20, rating: 4 },
      ]);

      expect(store.queue().find(q => q.itemId === 10)?.rating).toBe(5);
      expect(store.queue().find(q => q.itemId === 20)?.rating).toBe(4);
    });
  });

  describe('navigation', () => {
    beforeEach(() => {
      store.start([word('hello'), word('world'), word('test')], true, 0);
    });

    it('moves to the previous word and updates progress', () => {
      store.next();
      expect(store.cursor()).toBe(1);
      expect(store.progress()).toBe(67);

      store.previous();
      expect(store.cursor()).toBe(0);
      expect(store.progress()).toBe(33);
    });

    it('does not move before the first word', () => {
      store.previous();

      expect(store.cursor()).toBe(0);
    });

    it('does not move past the last word', () => {
      store.next();
      store.next();
      store.next();

      expect(store.cursor()).toBe(2);
      expect(store.isNextDisabled()).toBe(true);
    });

    it('exposes the disable computeds', () => {
      expect(store.isPreviousDisabled()).toBe(true);
      expect(store.isNextDisabled()).toBe(false);

      store.next();

      expect(store.isPreviousDisabled()).toBe(false);
    });

    it('speaks the word on navigation when voice is enabled', () => {
      store.start([word('hello'), word('world')], false, 0);
      mockAudioService.playAuthenticatedOneShot.mockClear();

      store.next();

      expect(mockAudioService.playAuthenticatedOneShot).toHaveBeenCalledWith(
        `${environment.apiUrl}/api/WordAudio?word=world`,
        'mp3',
        expect.any(Function)
      );
      expect(mockAudioService.speakWord).not.toHaveBeenCalled();
    });
  });

  describe('pronunciation (MP3-first with TTS fallback)', () => {
    it('falls back to TTS when the word has no recorded audio', async () => {
      mockAudioService.playAuthenticatedOneShot.mockResolvedValue(false);

      store.start([word('xyzzy')], false, 0);
      await flushTasks();

      expect(mockAudioService.speakWord).toHaveBeenCalledWith('xyzzy');
    });

    it('does not use TTS when recorded audio plays', async () => {
      mockAudioService.playAuthenticatedOneShot.mockResolvedValue(true);

      store.start([word('hello')], false, 0);
      await flushTasks();

      expect(mockAudioService.speakWord).not.toHaveBeenCalled();
    });

    it('ignores a late miss for a word the cursor has already left', async () => {
      let releaseLate!: (ok: boolean) => void;
      mockAudioService.playAuthenticatedOneShot
        .mockImplementationOnce(
          () =>
            new Promise<boolean>(resolve => {
              releaseLate = resolve;
            })
        )
        .mockResolvedValue(true);

      store.start([word('hello'), word('world')], false, 0);
      store.next(); // 'hello' is superseded by 'world's own fetch

      releaseLate(false); // 'hello' turns out to have no audio - too late
      await flushTasks();

      expect(mockAudioService.speakWord).not.toHaveBeenCalled();
    });

    it('drops the fallback once the session is quit/reset', async () => {
      let releaseLate!: (ok: boolean) => void;
      mockAudioService.playAuthenticatedOneShot.mockImplementationOnce(
        () =>
          new Promise<boolean>(resolve => {
            releaseLate = resolve;
          })
      );

      store.start([word('hello')], false, 0);
      store.quit();

      releaseLate(false);
      await flushTasks();

      expect(mockAudioService.speakWord).not.toHaveBeenCalled();
    });
  });

  describe('word reference (definitions & examples)', () => {
    const entry = (word: string): WordDictionaryEntry => ({
      word,
      definitions: [{ partOfSpeech: 'n.', meaning: 'a meaning' }],
      examples: [{ source: 'A sentence.', translation: '一个句子。' }],
    });

    it('loads the entry for the first word when the session starts', () => {
      mockDictionaryService.getWord.mockReturnValue(of(entry('hello')));

      store.start([word('hello'), word('world')], false, 0);

      expect(mockDictionaryService.getWord).toHaveBeenCalledWith('hello');
      expect(store.wordReference()?.word).toBe('hello');
    });

    it('clears the visible entry and fetches again on cursor moves', () => {
      mockDictionaryService.getWord.mockReturnValue(of(entry('hello')));
      store.start([word('hello'), word('world')], false, 0);
      expect(store.wordReference()).not.toBeNull();

      const pending = new Subject<WordDictionaryEntry | null>();
      mockDictionaryService.getWord.mockReturnValue(pending.asObservable());
      store.next();

      expect(mockDictionaryService.getWord).toHaveBeenLastCalledWith('world');
      // Loading state: the previous word's entry is gone while 'world' is in flight.
      expect(store.wordReference()).toBeNull();
    });

    it('drops a stale response after the cursor moved on', () => {
      const hello$ = new Subject<WordDictionaryEntry | null>();
      mockDictionaryService.getWord.mockReturnValueOnce(hello$.asObservable());
      store.start([word('hello'), word('world')], false, 0);

      mockDictionaryService.getWord.mockReturnValue(of(entry('world')));
      store.next();
      // A late response for the earlier word must not overwrite the current entry.
      hello$.next(entry('hello'));

      expect(store.wordReference()?.word).toBe('world');
    });

    it('drops an in-flight response when the cursor lands on a blank word', () => {
      const hello$ = new Subject<WordDictionaryEntry | null>();
      mockDictionaryService.getWord.mockReturnValueOnce(hello$.asObservable());
      store.start([word('hello'), word('   ')], false, 0);

      store.next();
      // The blank-word move must invalidate the in-flight 'hello' fetch (the
      // generation bumps before the blank guard), or the stale entry would
      // repaint under the blank headline.
      hello$.next(entry('hello'));

      expect(store.wordReference()).toBeNull();
    });

    it('does not fetch for a blank word', () => {
      store.start([word('   ')], false, 0);

      expect(mockDictionaryService.getWord).not.toHaveBeenCalled();
      expect(store.wordReference()).toBeNull();
    });

    it('cancels in-flight loads when the session is dropped', () => {
      const pending = new Subject<WordDictionaryEntry | null>();
      mockDictionaryService.getWord.mockReturnValue(pending.asObservable());
      store.start([word('hello')], false, 0);

      store.quit();

      expect(() => pending.next(entry('hello'))).not.toThrow();
      expect(store.wordReference()).toBeNull();
    });
  });

  describe('rateCurrent', () => {
    beforeEach(() => {
      store.start([word('hello', '你好', 10)], true, 1);
    });

    it('sets the current rating and saves it via upsertRating', () => {
      const saved: UserLearningRating = { contentId: 1, itemId: 10, rating: 3 };
      mockRatingService.upsertRating.mockReturnValue(of(saved));

      store.rateCurrent(3);

      expect(store.currentItem().rating).toBe(3);
      expect(mockRatingService.upsertRating).toHaveBeenCalledWith(1, 10, 3);
    });

    it('does not increase the rating above 5 (ArrowUp at 5)', () => {
      store.rateCurrent(5);
      mockRatingService.upsertRating.mockClear();

      store.rateCurrent(6);

      expect(store.currentItem().rating).toBe(5);
      expect(mockRatingService.upsertRating).not.toHaveBeenCalled();
    });

    it('does not decrease the rating below 1 (ArrowDown at 1)', () => {
      store.rateCurrent(1);
      mockRatingService.upsertRating.mockClear();

      store.rateCurrent(0);

      expect(store.currentItem().rating).toBe(1);
      expect(mockRatingService.upsertRating).not.toHaveBeenCalled();
    });

    it('does not save when contentId is 0', () => {
      store.start([word('hello', '你好', 10)], true, 0);

      store.rateCurrent(3);

      expect(mockRatingService.upsertRating).not.toHaveBeenCalled();
    });

    it('does not save when itemId is undefined', () => {
      store.start([word('hello', '你好', undefined)], true, 1);

      store.rateCurrent(3);

      expect(mockRatingService.upsertRating).not.toHaveBeenCalled();
    });

    it('rolls the queue slot back to the confirmed rating when the save fails', () => {
      mockRatingService.upsertRating.mockReturnValue(throwError(() => new Error('boom')));

      store.rateCurrent(4);

      expect(store.currentItem().rating).toBe(0);
    });

    it('rolls the queue slot back to the previous confirmed rating when the save fails', () => {
      mockRatingService.upsertRating.mockReturnValueOnce(of({ contentId: 1, itemId: 10, rating: 2 }));
      store.rateCurrent(2);

      mockRatingService.upsertRating.mockReturnValueOnce(throwError(() => new Error('boom')));
      store.rateCurrent(4);

      expect(store.currentItem().rating).toBe(2);
    });

    it('drops stale save responses: a newer rating already in flight wins', () => {
      // First rating is confirmed as 2.
      mockRatingService.upsertRating.mockReturnValueOnce(of({ contentId: 1, itemId: 10, rating: 2 }));
      store.rateCurrent(2);

      // Then the user changes to 4, but the server response (simulated late)
      // still reports 2: the queue already shows 4, so the stale response must
      // be ignored and the confirmed rating stays 2 until the newer save lands.
      mockRatingService.upsertRating.mockReturnValueOnce(of({ contentId: 1, itemId: 10, rating: 2 }));
      store.rateCurrent(4);

      const confirmed = store.quit();
      expect(confirmed.get(10)).toBe(2);
    });
  });

  describe('setRatingFromToggle', () => {
    beforeEach(() => {
      store.start([word('hello', '你好', 10)], true, 1);
    });

    it('applies a valid toggle selection', () => {
      const event = { value: 4 } as any;

      store.setRatingFromToggle(event);

      expect(store.currentItem().rating).toBe(4);
      expect(mockRatingService.upsertRating).toHaveBeenCalledWith(1, 10, 4);
    });

    it('restores the group value and does not save on deselect', () => {
      store.rateCurrent(4);
      mockRatingService.upsertRating.mockClear();
      const group = { value: undefined as unknown };
      const event = { value: undefined, source: { value: 4, buttonToggleGroup: group } } as any;

      store.setRatingFromToggle(event);

      expect(mockRatingService.upsertRating).not.toHaveBeenCalled();
      expect(group.value).toBe(4);
      expect(store.currentItem().rating).toBe(4);
    });
  });

  describe('auto mode', () => {
    afterEach(() => {
      store['stopAutoPlay']?.();
      vi.useRealTimers();
    });

    it('defaults to stopped with 5 seconds, no randomizing, no reading', () => {
      expect(store.autoPlayState()).toBe('stopped');
      expect(store.isAutoMode()).toBe(false);
      expect(store.readingSentenceIndex()).toBe(-1);
      expect(store.autoModeSeconds()).toBe(5);
      expect(store.autoPlayRandomize()).toBe(false);
      expect(store.autoPlaySentences()).toBe(0);
    });

    it('does not enable when the queue is empty', () => {
      store.toggleAutoPlay();

      expect(store.isAutoMode()).toBe(false);
    });

    it('cycles stopped -> playing -> paused -> playing, and stops back to stopped', async () => {
      vi.useFakeTimers();
      store.start([word('a'), word('b'), word('c')], true, 0);

      store.toggleAutoPlay(); // stopped -> playing
      expect(store.autoPlayState()).toBe('playing');
      expect(store.isAutoMode()).toBe(true);
      expect(vi.getTimerCount()).toBe(1);

      store.toggleAutoPlay(); // playing -> paused
      expect(store.autoPlayState()).toBe('paused');
      expect(store.isAutoMode()).toBe(false);
      expect(vi.getTimerCount()).toBe(0); // the live tick is gone
      expect(mockAudioService.stopWordOneShot).toHaveBeenCalled();
      expect(mockAudioService.cancelSpeech).toHaveBeenCalled();

      // A paused cycle advances nothing, ever.
      await vi.advanceTimersByTimeAsync(30000);
      expect(store.cursor()).toBe(0);

      store.toggleAutoPlay(); // paused -> playing (resume on the same word)
      expect(store.autoPlayState()).toBe('playing');
      expect(store.cursor()).toBe(0);
      expect(vi.getTimerCount()).toBe(1);

      store.stopAutoPlay(); // -> stopped, word under the cursor is kept
      expect(store.autoPlayState()).toBe('stopped');
      expect(vi.getTimerCount()).toBe(0);
      expect(store.cursor()).toBe(0);
    });

    it('auto-advances to the next word every N seconds', async () => {
      vi.useFakeTimers();
      store.start([word('a'), word('b'), word('c')], true, 0);

      store.toggleAutoPlay();

      expect(store.isAutoMode()).toBe(true);
      expect(store.cursor()).toBe(0);

      await vi.advanceTimersByTimeAsync(5000);
      expect(store.cursor()).toBe(1);

      await vi.advanceTimersByTimeAsync(5000);
      expect(store.cursor()).toBe(2);
    });

    it('starts the interval only after the current word audio is over', async () => {
      vi.useFakeTimers();
      store.start([word('a'), word('b')], false, 0);
      // The auto-play presentation of 'a' gets a recorded sound whose onEnd
      // arrives late: the 5s interval is the gap BETWEEN items, so it must
      // not even start while the word is still speaking - and once the
      // pronunciation ends, a full 5s of silence must pass before 'b'.
      let endSound!: () => void;
      mockAudioService.playAuthenticatedOneShot.mockImplementation(
        (_src: string, _format: string, onEnd: () => void) =>
          new Promise<boolean>(resolve => {
            endSound = () => {
              onEnd();
              resolve(true);
            };
          })
      );

      store.toggleAutoPlay();
      await vi.advanceTimersByTimeAsync(5000);
      expect(store.cursor()).toBe(0); // still speaking: the gap has not started

      endSound();
      await vi.advanceTimersByTimeAsync(4000);
      expect(store.cursor()).toBe(0); // audio over, but the gap is not full yet

      await vi.advanceTimersByTimeAsync(1000);
      expect(store.cursor()).toBe(1); // 'b' starts a full 5s after the audio ended
    });

    it('restarts from the first word regardless of the current cursor', async () => {
      vi.useFakeTimers();
      store.start([word('a'), word('b'), word('c'), word('d')], true, 0);
      store.next();
      store.next(); // cursor at 2, mid-queue

      store.toggleAutoPlay();

      // Always jumps to the first word, even though the cursor was mid-queue.
      expect(store.isAutoMode()).toBe(true);
      expect(store.cursor()).toBe(0);
      expect(store.progress()).toBe(25);

      // Auto-advances from the first word through the queue.
      await vi.advanceTimersByTimeAsync(5000);
      expect(store.cursor()).toBe(1);
      await vi.advanceTimersByTimeAsync(5000);
      expect(store.cursor()).toBe(2);
      await vi.advanceTimersByTimeAsync(5000);
      expect(store.cursor()).toBe(3);
      expect(store.isAutoMode()).toBe(true);

      // Reaches the last word and self-stops on the next tick.
      await vi.advanceTimersByTimeAsync(5000);
      expect(store.isAutoMode()).toBe(false);
      expect(store.cursor()).toBe(3);

      // No further advances after auto mode stopped.
      await vi.advanceTimersByTimeAsync(5000);
      expect(store.cursor()).toBe(3);
    });

    it('falls back to 5 seconds when autoModeSeconds is invalid', async () => {
      vi.useFakeTimers();
      store.start([word('a'), word('b')], true, 0);
      store.autoModeSeconds.set(0);

      store.toggleAutoPlay();
      expect(store.isAutoMode()).toBe(true);

      // 0 would fire immediately if used literally; the fallback to 5s means
      // no advance until 5s elapse.
      await vi.advanceTimersByTimeAsync(1000);
      expect(store.cursor()).toBe(0);

      await vi.advanceTimersByTimeAsync(4000);
      expect(store.cursor()).toBe(1);
    });

    it('setAutoModeSeconds updates the interval used by a later start', async () => {
      vi.useFakeTimers();
      store.start([word('a'), word('b'), word('c')], true, 0);
      store.setAutoModeSeconds(3);

      store.toggleAutoPlay();
      await vi.advanceTimersByTimeAsync(3000);
      expect(store.cursor()).toBe(1);
    });

    it('setAutoModeSeconds re-arms the live tick immediately', async () => {
      vi.useFakeTimers();
      store.start([word('a'), word('b'), word('c'), word('d')], true, 0);
      store.toggleAutoPlay(); // 5s armed

      // Change the interval mid-item: the live tick is replaced, so the
      // current item gets exactly the new interval counted from the change.
      await vi.advanceTimersByTimeAsync(3000);
      store.setAutoModeSeconds(3);
      await vi.advanceTimersByTimeAsync(2000);
      expect(store.cursor()).toBe(0);
      await vi.advanceTimersByTimeAsync(1000);
      expect(store.cursor()).toBe(1);
      expect(store.isAutoMode()).toBe(true);

      // The new cadence sticks.
      await vi.advanceTimersByTimeAsync(3000);
      expect(store.cursor()).toBe(2);
    });

    it('setAutoModeSeconds ignores invalid values', () => {
      store.setAutoModeSeconds(0);
      expect(store.autoModeSeconds()).toBe(5);
      store.setAutoModeSeconds(2.5);
      expect(store.autoModeSeconds()).toBe(5);
      store.setAutoModeSeconds(-1);
      expect(store.autoModeSeconds()).toBe(5);
    });

    it('speaks the first word when auto mode starts (voice enabled)', () => {
      store.start([word('hello'), word('world')], false, 0);
      mockAudioService.playAuthenticatedOneShot.mockClear();

      store.toggleAutoPlay();

      expect(mockAudioService.playAuthenticatedOneShot).toHaveBeenCalledWith(
        `${environment.apiUrl}/api/WordAudio?word=hello`,
        'mp3',
        expect.any(Function)
      );
      expect(mockAudioService.speakWord).not.toHaveBeenCalled();
    });

    it('stops the word audio and speech queue when auto mode is cancelled', () => {
      store.start([word('a'), word('b')], false, 0);
      store.toggleAutoPlay();
      mockAudioService.stopWordOneShot.mockClear();
      mockAudioService.cancelSpeech.mockClear();

      store.quit();

      expect(mockAudioService.stopWordOneShot).toHaveBeenCalled();
      expect(mockAudioService.cancelSpeech).toHaveBeenCalled();
    });
  });

  describe('applyAutoPlaySettings', () => {
    it('applies interval, randomize and clamps the sentence count to 0-10', () => {
      store.applyAutoPlaySettings({ intervalSeconds: 8, randomizeWords: true, sentencesToRead: 4 });
      expect(store.autoModeSeconds()).toBe(8);
      expect(store.autoPlayRandomize()).toBe(true);
      expect(store.autoPlaySentences()).toBe(4);

      store.applyAutoPlaySettings({ intervalSeconds: 7, randomizeWords: false, sentencesToRead: 99 });
      expect(store.autoPlayRandomize()).toBe(false);
      expect(store.autoPlaySentences()).toBe(10);

      store.applyAutoPlaySettings({ intervalSeconds: 6, randomizeWords: false, sentencesToRead: -3 });
      expect(store.autoPlaySentences()).toBe(0);
    });

    it('ignores an invalid interval but still applies the other fields', () => {
      store.applyAutoPlaySettings({ intervalSeconds: 5, randomizeWords: false, sentencesToRead: 0 });

      store.applyAutoPlaySettings({ intervalSeconds: 2.5, randomizeWords: true, sentencesToRead: 3 });

      expect(store.autoModeSeconds()).toBe(5);
      expect(store.autoPlayRandomize()).toBe(true);
      expect(store.autoPlaySentences()).toBe(3);
    });
  });

  describe('auto play walk order (randomize never touches the queue)', () => {
    afterEach(() => {
      store['stopAutoPlay']?.();
      vi.useRealTimers();
    });

    it('walks a shuffled order visiting every word exactly once, queue untouched', async () => {
      vi.useFakeTimers();
      const items = Array.from({ length: 6 }, (_, i) => word(`w${i}`, '测试', i + 1));
      store.start(items.slice(), true, 0);
      store.applyAutoPlaySettings({ intervalSeconds: 1, randomizeWords: true, sentencesToRead: 0 });

      store.toggleAutoPlay();
      const visited = [store.cursor()];
      for (let i = 0; i < items.length - 1; i++) {
        await vi.advanceTimersByTimeAsync(1000);
        visited.push(store.cursor());
      }
      await vi.advanceTimersByTimeAsync(1000); // the last item's tick self-stops

      // Every word is visited exactly once, and the queue itself kept the
      // input order - manual browsing and the ratings map are untouched.
      expect(new Set(visited)).toEqual(new Set([0, 1, 2, 3, 4, 5]));
      expect(store.queue().map(q => q.enword)).toEqual(items.map(q => q.enword));
      expect(store.autoPlayState()).toBe('stopped');
    });

    it('a completed randomized walk reads 100% and stays there after self-stop', async () => {
      vi.useFakeTimers();
      store.start(Array.from({ length: 5 }, (_, i) => word(`w${i}`, '测试', i + 1)), true, 0);
      store.applyAutoPlaySettings({ intervalSeconds: 1, randomizeWords: true, sentencesToRead: 0 });

      store.toggleAutoPlay();
      // Walk all 5 items: 4 advances after the first presentation.
      for (let i = 0; i < 4; i++) {
        await vi.advanceTimersByTimeAsync(1000);
      }

      // Progress counts the WALK, not the shuffled queue index of the last
      // word (the bug: stopping at, say, queue slot 2 of 5 showed ~40%).
      expect(store.currentPosition()).toBe(5);
      expect(store.progress()).toBe(100);

      await vi.advanceTimersByTimeAsync(1000); // the final tick self-stops
      expect(store.autoPlayState()).toBe('stopped');
      expect(store.progress()).toBe(100); // and stays full, not collapsing
    });

    it('visits the words in plain order when randomize is off', async () => {
      vi.useFakeTimers();
      store.start([word('a', '测试', 1), word('b', '测试', 2), word('c', '测试', 3)], true, 0);
      store.applyAutoPlaySettings({ intervalSeconds: 1, randomizeWords: false, sentencesToRead: 0 });

      store.toggleAutoPlay();
      expect(store.cursor()).toBe(0);
      await vi.advanceTimersByTimeAsync(1000);
      expect(store.cursor()).toBe(1);
      await vi.advanceTimersByTimeAsync(1000);
      expect(store.cursor()).toBe(2);
      await vi.advanceTimersByTimeAsync(1000);
      expect(store.autoPlayState()).toBe('stopped');
    });

    it('re-anchors the walk at the current word when resuming after manual browsing', async () => {
      vi.useFakeTimers();
      store.start([word('a'), word('b'), word('c')], false, 0);
      store.applyAutoPlaySettings({ intervalSeconds: 5, randomizeWords: false, sentencesToRead: 0 });
      store.toggleAutoPlay(); // playing on 'a'
      store.toggleAutoPlay(); // paused
      store.next(); // manual browse while paused -> 'b'
      mockAudioService.playAuthenticatedOneShot.mockClear();

      store.toggleAutoPlay(); // resume continues from the word on screen

      expect(store.autoPlayState()).toBe('playing');
      expect(mockAudioService.playAuthenticatedOneShot).toHaveBeenCalledWith(
        `${environment.apiUrl}/api/WordAudio?word=b`,
        'mp3',
        expect.any(Function)
      );
      await vi.advanceTimersByTimeAsync(5000);
      expect(store.cursor()).toBe(2); // 'c' next, not back to 'a'
    });
  });

  describe('example sentence reading (auto play only)', () => {
    const entry = (wordText: string, examples: string[]): WordDictionaryEntry => ({
      word: wordText,
      definitions: [{ partOfSpeech: 'n.', meaning: 'meaning' }],
      examples: examples.map(s => ({ source: s, translation: `译：${s}` })),
    });

    afterEach(() => {
      store['stopAutoPlay']?.();
      vi.useRealTimers();
    });

    it('reads the first N sentences after the word during auto play', async () => {
      mockDictionaryService.getWord.mockReturnValue(
        of(entry('hello', ['One.', 'Two.', 'Three.', 'Four.']))
      );
      store.start([word('hello'), word('world')], false, 0);
      store.applyAutoPlaySettings({ intervalSeconds: 30, randomizeWords: false, sentencesToRead: 2 });

      store.toggleAutoPlay();
      await flushTasks();

      expect(mockAudioService.speakSequence).toHaveBeenCalledWith(['One.', 'Two.'], expect.any(Function));
    });

    it('does not read when auto play is off (manual browsing)', async () => {
      mockDictionaryService.getWord.mockReturnValue(of(entry('hello', ['One.', 'Two.'])));
      store.start([word('hello'), word('world')], false, 0);
      store.applyAutoPlaySettings({ intervalSeconds: 5, randomizeWords: false, sentencesToRead: 2 });

      store.next();
      await flushTasks();

      expect(mockAudioService.speakSequence).not.toHaveBeenCalled();
    });

    it('does not read with a count of 0 or when voice is disabled', async () => {
      mockDictionaryService.getWord.mockReturnValue(of(entry('hello', ['One.'])));
      store.start([word('hello'), word('world')], false, 0);
      store.applyAutoPlaySettings({ intervalSeconds: 5, randomizeWords: false, sentencesToRead: 0 });
      store.toggleAutoPlay();
      await flushTasks();

      store.quit();
      store.start([word('hello'), word('world')], true, 0);
      store.applyAutoPlaySettings({ intervalSeconds: 5, randomizeWords: false, sentencesToRead: 3 });
      store.toggleAutoPlay();
      await flushTasks();

      expect(mockAudioService.speakSequence).not.toHaveBeenCalled();
    });

    it('does not read when the word has no dictionary entry', async () => {
      mockDictionaryService.getWord.mockReturnValue(of(null));
      store.start([word('hello')], false, 0);
      store.applyAutoPlaySettings({ intervalSeconds: 5, randomizeWords: false, sentencesToRead: 2 });

      store.toggleAutoPlay();
      await flushTasks();

      expect(mockAudioService.speakSequence).not.toHaveBeenCalled();
    });

    it('counts the interval only after the sentence reading is over', async () => {
      vi.useFakeTimers();
      let finishReading!: () => void;
      mockAudioService.speakSequence.mockImplementation(
        () =>
          new Promise<void>(resolve => {
            finishReading = resolve;
          })
      );
      mockDictionaryService.getWord.mockReturnValue(of(entry('hello', ['Long sentence.'])));
      store.start([word('hello'), word('world')], false, 0);
      store.applyAutoPlaySettings({ intervalSeconds: 2, randomizeWords: false, sentencesToRead: 1 });

      store.toggleAutoPlay();
      await vi.advanceTimersByTimeAsync(0); // let the word audio + ref fetch settle

      // The sentence is still being read: the item is not over, so no part
      // of the 2s gap has been counted yet - a slow reading stretches the
      // per-item cycle instead of eating the pause.
      await vi.advanceTimersByTimeAsync(2000);
      expect(store.cursor()).toBe(0);

      finishReading();
      await vi.advanceTimersByTimeAsync(1000);
      expect(store.cursor()).toBe(0); // reading over, gap only half counted

      await vi.advanceTimersByTimeAsync(1000);
      expect(store.cursor()).toBe(1); // 'world' starts a full 2s after the reading
      vi.useRealTimers();
    });

    it('exposes the index of the sentence being read, resetting when done', async () => {
      let emitIndex!: (i: number) => void;
      let finishReading!: () => void;
      mockAudioService.speakSequence.mockImplementation(
        (_texts: string[], onIndex?: (i: number) => void) => {
          emitIndex = onIndex!;
          return new Promise<void>(resolve => {
            finishReading = resolve;
          });
        }
      );
      mockDictionaryService.getWord.mockReturnValue(of(entry('hello', ['One.', 'Two.'])));
      store.start([word('hello'), word('world')], false, 0);
      store.applyAutoPlaySettings({ intervalSeconds: 30, randomizeWords: false, sentencesToRead: 2 });

      store.toggleAutoPlay();
      await flushTasks(); // chain reaches speakSequence

      emitIndex(1); // the service announces the second sentence right before speaking it
      expect(store.readingSentenceIndex()).toBe(1);

      finishReading();
      await flushTasks();
      expect(store.readingSentenceIndex()).toBe(-1);
    });

    it('pause silences the reading and clears the highlight', async () => {
      let emitIndex!: (i: number) => void;
      mockAudioService.speakSequence.mockImplementation(
        (_texts: string[], onIndex?: (i: number) => void) => {
          emitIndex = onIndex!;
          return new Promise<void>(() => {
            /* never settles until superseded - the store guard owns the reset */
          });
        }
      );
      mockDictionaryService.getWord.mockReturnValue(of(entry('hello', ['One.', 'Two.'])));
      store.start([word('hello'), word('world')], false, 0);
      store.applyAutoPlaySettings({ intervalSeconds: 30, randomizeWords: false, sentencesToRead: 2 });

      store.toggleAutoPlay();
      await flushTasks();
      emitIndex(0);
      expect(store.readingSentenceIndex()).toBe(0);

      store.toggleAutoPlay(); // pause
      expect(store.readingSentenceIndex()).toBe(-1);
      expect(store.isPaused()).toBe(true);
    });
  });

  describe('re-read', () => {
    const entry = (wordText: string, examples: string[]): WordDictionaryEntry => ({
      word: wordText,
      definitions: [{ partOfSpeech: 'n.', meaning: 'meaning' }],
      examples: examples.map(s => ({ source: s, translation: `译：${s}` })),
    });

    afterEach(() => {
      store['stopAutoPlay']?.();
    });

    it('replays the word and its sentences while stopped', async () => {
      mockDictionaryService.getWord.mockReturnValue(of(entry('hello', ['One.', 'Two.'])));
      store.start([word('hello'), word('world')], false, 0);
      store.applyAutoPlaySettings({ intervalSeconds: 5, randomizeWords: false, sentencesToRead: 2 });
      await flushTasks(); // let the start presentation settle

      mockAudioService.playAuthenticatedOneShot.mockClear();
      mockAudioService.speakSequence.mockClear();

      store.reReadCurrent();
      await flushTasks();

      expect(mockAudioService.playAuthenticatedOneShot).toHaveBeenCalledWith(
        `${environment.apiUrl}/api/WordAudio?word=hello`,
        'mp3',
        expect.any(Function)
      );
      expect(mockAudioService.speakSequence).toHaveBeenCalledWith(
        ['One.', 'Two.'],
        expect.any(Function)
      );
      // The queue position is untouched.
      expect(store.cursor()).toBe(0);
    });

    it('is ignored while auto play is running', () => {
      store.start([word('a'), word('b')], false, 0);
      store.toggleAutoPlay();
      mockAudioService.playAuthenticatedOneShot.mockClear();

      store.reReadCurrent();

      expect(mockAudioService.playAuthenticatedOneShot).not.toHaveBeenCalled();
    });

    it('replays the word (without sentences) when reading is off', async () => {
      mockDictionaryService.getWord.mockReturnValue(of(entry('hello', ['One.'])));
      store.start([word('hello')], false, 0);
      await flushTasks();

      mockAudioService.speakSequence.mockClear();
      store.reReadCurrent();
      await flushTasks();

      expect(mockAudioService.speakSequence).not.toHaveBeenCalled();
      expect(mockAudioService.playAuthenticatedOneShot).toHaveBeenCalled();
    });

    it('works while paused, replaying the current item', async () => {
      mockDictionaryService.getWord.mockReturnValue(of(entry('hello', ['One.', 'Two.'])));
      store.start([word('hello'), word('world')], false, 0);
      store.applyAutoPlaySettings({ intervalSeconds: 30, randomizeWords: false, sentencesToRead: 2 });
      store.toggleAutoPlay(); // playing
      await flushTasks();
      store.toggleAutoPlay(); // paused
      mockAudioService.speakSequence.mockClear();

      store.reReadCurrent();
      await flushTasks();

      expect(store.autoPlayState()).toBe('paused');
      expect(mockAudioService.speakSequence).toHaveBeenCalled();
    });
  });

  describe('quit', () => {
    // isolate:false — never leave fake timers installed at file end: the fake
    // clock leaks into later spec files in the same worker and hangs them.
    afterEach(() => vi.useRealTimers());

    it('returns the confirmed ratings and resets the session', () => {
      store.start([word('hello', '你好', 10)], true, 1);
      mockRatingService.upsertRating.mockReturnValue(of({ contentId: 1, itemId: 10, rating: 4 }));
      store.rateCurrent(4);

      const confirmed = store.quit();

      expect(confirmed.get(10)).toBe(4);
      expect(store.queue()).toEqual([]);
      expect(store.cursor()).toBe(0);
      expect(store.progress()).toBe(0);
      expect(store.isAutoMode()).toBe(false);
    });

    it('includes preloaded ratings (unchanged words keep their stored rating)', () => {
      mockRatingService.getRatings.mockReturnValue(
        of([{ contentId: 1, itemId: 10, rating: 3 }])
      );
      store.start([word('hello', '你好', 10)], true, 1);

      const confirmed = store.quit();

      expect(confirmed.get(10)).toBe(3);
    });

    it('stops the auto timer so no tick can fire after the reset', () => {
      vi.useFakeTimers();
      store.start([word('a'), word('b')], true, 0);
      store.toggleAutoPlay();
      expect(store.isAutoMode()).toBe(true);

      store.quit();

      expect(store.isAutoMode()).toBe(false);
      // Timer cleared: advancing time must not throw or change state.
      vi.advanceTimersByTime(10000);
      expect(store.cursor()).toBe(0);
    });
  });

  describe('reset', () => {
    it('clears every piece of session state', () => {
      store.start([word('hello', '你好', 10)], false, 1);
      store.rateCurrent(3);

      store.reset();

      expect(store.queue()).toEqual([]);
      expect(store.cursor()).toBe(0);
      expect(store.isAutoMode()).toBe(false);
      expect(store.currentItem()).toEqual({
        enword: '',
        cnword: '',
        rating: 0,
      });
    });

    it('cancels an in-flight ratings load: a late response must not leak into the next session', () => {
      const late$ = new Subject<UserLearningRating[]>();
      mockRatingService.getRatings.mockReturnValueOnce(late$.asObservable());
      store.start([word('hello', '你好', 10)], true, 1);

      store.reset();
      // New session over another file; item ids are per-file indices, so
      // itemId 10 collides - the stale response must not pre-populate it.
      mockRatingService.getRatings.mockReturnValueOnce(of([]));
      store.start([word('world', '世界', 10)], true, 2);

      late$.next([{ contentId: 1, itemId: 10, rating: 4 }]);

      expect(store.queue().find(q => q.itemId === 10)?.rating).toBe(0);
    });

    it('unsubscribes in-flight rating saves so late confirmations cannot write anywhere', () => {
      const save$ = new Subject<UserLearningRating>();
      mockRatingService.upsertRating.mockReturnValueOnce(save$.asObservable());
      store.start([word('hello', '你好', 10)], true, 1);
      store.rateCurrent(4);

      store.reset();

      expect(save$.observed).toBe(false);
    });
  });

  describe('destruction', () => {
    afterEach(() => vi.useRealTimers());

    it('stops the auto timer when the store is destroyed (leaving the page mid-auto-mode)', () => {
      vi.useFakeTimers();
      store.start([word('a'), word('b')], true, 0);
      store.toggleAutoPlay();
      expect(store.isAutoMode()).toBe(true);

      // Destroying the page's injector (navigating away) must tear down the
      // auto-play timer - otherwise it keeps advancing and speaking words.
      TestBed.resetTestingModule();

      expect(store.isAutoMode()).toBe(false);
      vi.advanceTimersByTime(10000);
      expect(store.cursor()).toBe(0);
    });

    it('cancels in-flight rating saves on destroy (L8)', () => {
      // Navigating away mid-save: the destroy callback must unsubscribe the
      // pending upsert (mirroring reset/quit), or a late confirmation could
      // write into a store whose session is gone.
      const save$ = new Subject<UserLearningRating>();
      mockRatingService.upsertRating.mockReturnValueOnce(save$.asObservable());
      store.start([word('hello', '你好', 10)], true, 1);
      store.rateCurrent(4);
      expect(save$.observed).toBe(true);

      TestBed.resetTestingModule();

      expect(save$.observed).toBe(false);
    });

    it('cancels an in-flight ratings load on destroy so a late response cannot leak (L8)', () => {
      const late$ = new Subject<UserLearningRating[]>();
      mockRatingService.getRatings.mockReturnValueOnce(late$.asObservable());
      store.start([word('hello', '你好', 10)], true, 1);
      expect(late$.observed).toBe(true);

      TestBed.resetTestingModule();

      expect(late$.observed).toBe(false);
      // A late preload after destroy must not pre-populate the (dead) session.
      late$.next([{ contentId: 1, itemId: 10, rating: 5 }]);
      expect(store.queue().find(q => q.itemId === 10)?.rating ?? 0).toBe(0);
    });
  });
});
