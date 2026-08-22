import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';

import type { ReviewQueueItem, UserLearningRating } from '../../interfaces';
import { AudioService, LearningRatingService } from '../../services';

import { VocabularyReviewSessionStore } from './vocabulary-exercises-review-session.store';

describe('VocabularyReviewSessionStore', () => {
  let store: VocabularyReviewSessionStore;
  let mockAudioService: {
    speakWord: ReturnType<typeof vi.fn>;
    playSound: ReturnType<typeof vi.fn>;
  };
  let mockRatingService: {
    getRatings: ReturnType<typeof vi.fn>;
    upsertRating: ReturnType<typeof vi.fn>;
  };

  const word = (enword: string, cnword = '测试', itemId?: number): ReviewQueueItem => ({
    enword,
    cnword,
    rating: 0,
    itemId,
  });

  beforeEach(() => {
    mockAudioService = {
      speakWord: vi.fn(),
      playSound: vi.fn(),
    };
    mockRatingService = {
      getRatings: vi.fn().mockReturnValue(of([])),
      upsertRating: vi.fn().mockReturnValue(of({} as UserLearningRating)),
    };

    TestBed.configureTestingModule({
      providers: [
        VocabularyReviewSessionStore,
        { provide: AudioService, useValue: mockAudioService },
        { provide: LearningRatingService, useValue: mockRatingService },
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
      expect(mockAudioService.speakWord).not.toHaveBeenCalled();
      expect(mockRatingService.getRatings).not.toHaveBeenCalled();
    });

    it('builds the queue, resets the cursor and speaks the first word', () => {
      expect(store.start([word('hello'), word('world')], false, 0)).toBe(true);

      expect(store.queue().length).toBe(2);
      expect(store.cursor()).toBe(0);
      expect(store.progress()).toBe(50);
      expect(mockAudioService.speakWord).toHaveBeenCalledWith('hello');
    });

    it('does not speak when voice is disabled', () => {
      store.start([word('hello')], true, 0);

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
      mockAudioService.speakWord.mockClear();

      store.next();

      expect(mockAudioService.speakWord).toHaveBeenCalledWith('world');
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
      store['stopAutoMode']?.();
      vi.useRealTimers();
    });

    it('defaults to 5 seconds and inactive', () => {
      expect(store.autoModeSeconds()).toBe(5);
      expect(store.isAutoMode()).toBe(false);
    });

    it('does not enable when the queue is empty', () => {
      store.enableAutoMode();

      expect(store.isAutoMode()).toBe(false);
    });

    it('does not double-start when already running', () => {
      vi.useFakeTimers();
      store.start([word('a'), word('b')], true, 0);

      store.enableAutoMode();
      const firstTick = vi.getTimerCount();

      store.enableAutoMode();

      expect(store.isAutoMode()).toBe(true);
      expect(vi.getTimerCount()).toBe(firstTick);
    });

    it('auto-advances to the next word every N seconds', () => {
      vi.useFakeTimers();
      store.start([word('a'), word('b'), word('c')], true, 0);

      store.enableAutoMode();

      expect(store.isAutoMode()).toBe(true);
      expect(store.cursor()).toBe(0);

      vi.advanceTimersByTime(5000);
      expect(store.cursor()).toBe(1);

      vi.advanceTimersByTime(5000);
      expect(store.cursor()).toBe(2);
    });

    it('restarts from the first word regardless of the current cursor', () => {
      vi.useFakeTimers();
      store.start([word('a'), word('b'), word('c'), word('d')], true, 0);
      store.next();
      store.next(); // cursor at 2, mid-queue

      store.enableAutoMode();

      // Always jumps to the first word, even though the cursor was mid-queue.
      expect(store.isAutoMode()).toBe(true);
      expect(store.cursor()).toBe(0);
      expect(store.progress()).toBe(25);

      // Auto-advances from the first word through the queue.
      vi.advanceTimersByTime(5000);
      expect(store.cursor()).toBe(1);
      vi.advanceTimersByTime(5000);
      expect(store.cursor()).toBe(2);
      vi.advanceTimersByTime(5000);
      expect(store.cursor()).toBe(3);
      expect(store.isAutoMode()).toBe(true);

      // Reaches the last word and self-stops on the next tick.
      vi.advanceTimersByTime(5000);
      expect(store.isAutoMode()).toBe(false);
      expect(store.cursor()).toBe(3);

      // No further advances after auto mode stopped.
      vi.advanceTimersByTime(5000);
      expect(store.cursor()).toBe(3);
    });

    it('falls back to 5 seconds when autoModeSeconds is invalid', () => {
      vi.useFakeTimers();
      store.start([word('a'), word('b')], true, 0);
      store.autoModeSeconds.set(0);

      store.enableAutoMode();
      expect(store.isAutoMode()).toBe(true);

      // 0 would fire immediately if used literally; the fallback to 5s means
      // no advance until 5s elapse.
      vi.advanceTimersByTime(1000);
      expect(store.cursor()).toBe(0);

      vi.advanceTimersByTime(4000);
      expect(store.cursor()).toBe(1);
    });

    it('setAutoModeSeconds updates the interval used by a later start', () => {
      vi.useFakeTimers();
      store.start([word('a'), word('b'), word('c')], true, 0);
      store.setAutoModeSeconds(3);

      store.enableAutoMode();
      vi.advanceTimersByTime(3000);
      expect(store.cursor()).toBe(1);
    });

    it('setAutoModeSeconds swaps a running timer without restarting the session', () => {
      vi.useFakeTimers();
      store.start([word('a'), word('b'), word('c'), word('d')], true, 0);
      store.enableAutoMode();
      vi.advanceTimersByTime(5000);
      expect(store.cursor()).toBe(1);

      store.setAutoModeSeconds(3);
      // Old 5s timer is gone: only the new 3s cadence fires.
      vi.advanceTimersByTime(2000);
      expect(store.cursor()).toBe(1);
      vi.advanceTimersByTime(1000);
      expect(store.cursor()).toBe(2);
      expect(store.isAutoMode()).toBe(true);
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
      mockAudioService.speakWord.mockClear();

      store.enableAutoMode();

      expect(mockAudioService.speakWord).toHaveBeenCalledWith('hello');
    });
  });

  describe('quit', () => {
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
        of([{ contentId: 1, itemId: 10, rating: 3 } as UserLearningRating])
      );
      store.start([word('hello', '你好', 10)], true, 1);

      const confirmed = store.quit();

      expect(confirmed.get(10)).toBe(3);
    });

    it('stops the auto timer so no tick can fire after the reset', () => {
      vi.useFakeTimers();
      afterEach(() => vi.useRealTimers());
      store.start([word('a'), word('b')], true, 0);
      store.enableAutoMode();
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
    it('stops the auto timer when the store is destroyed (leaving the page mid-auto-mode)', () => {
      vi.useFakeTimers();
      afterEach(() => vi.useRealTimers());
      store.start([word('a'), word('b')], true, 0);
      store.enableAutoMode();
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
