import { provideHttpClient, withXhr } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { NgZone } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { environment } from '../../environments/environment';

import { AudioService } from './audio-service.service';
import { HOWL_FACTORY } from './howl-factory';
import { HOWLER_GLOBAL } from './howler.token';

describe('AudioService', () => {
  let service: AudioService;
  let httpTestingController: HttpTestingController;
  let howlerVolumeSpy: ReturnType<typeof vi.fn>;
  // Last config object handed to the HOWL_FACTORY mock; lets tests drive the
  // one-shot's onload/onend/onloaderror callbacks by hand.
  let lastHowlConfig: Record<string, ((...args: unknown[]) => void) | undefined> | undefined;

  // Setup proper Howl mock class
  function MockHowl(this: any, config: any) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    self.config = config;
    self.isPlaying = false;
    self.isPaused = false;
    self.isStopped = false;
    self.loaded = false;

    self.play = vi.fn(() => {
      self.isPlaying = true;
      self.isPaused = false;
      if (config.onplay) {
        config.onplay(1);
      }
      return 1;
    });

    self.pause = vi.fn(() => {
      self.isPlaying = false;
      self.isPaused = true;
      if (config.onpause) {
        config.onpause();
      }
    });

    self.stop = vi.fn(() => {
      self.isPlaying = false;
      self.isPaused = false;
      self.isStopped = true;
      if (config.onstop) {
        config.onstop();
      }
    });

    self.seek = vi.fn((position?: number, _id?: number) => {
      if (position !== undefined && position !== null) {
        if (config.onseek) {
          config.onseek();
        }
        return position;
      }
      return 0;
    });

    self.volume = vi.fn((vol?: number) => {
      if (typeof vol !== 'undefined' && vol !== null) {
        return self;
      }
      return config?.volume ?? 1;
    });

    self.duration = vi.fn().mockReturnValue(100);
    self.state = vi.fn().mockReturnValue('loaded');
    // Pending onload timer (scheduled below); cleared on unload() so a
    // superseded/destroyed Howl can't fire onload into the next test and
    // call .next() on already-completed subjects (which throws and wedges
    // the runner under CI load). The mock reaches AudioService through
    // HOWL_FACTORY below — window.Howl would NOT (the real howler class is
    // what the root-provided factory constructs).
    self._onloadTimer = undefined as ReturnType<typeof setTimeout> | undefined;
    self.unload = vi.fn(() => {
      if (self._onloadTimer !== undefined) {
        clearTimeout(self._onloadTimer);
        self._onloadTimer = undefined;
      }
    });

    self.load = vi.fn(() => {
      self.loaded = true;
      if (config.onload) {
        config.onload();
      }
    });

    self.once = vi.fn((event: string, callback: () => void) => {
      if (event === 'load' && self.loaded) {
        setTimeout(() => callback(), 0);
      } else if (event === 'load') {
        const originalLoad = config.onload;
        config.onload = (...args: any[]) => {
          if (originalLoad) {
            originalLoad(...args);
          }
          setTimeout(() => callback(), 0);
        };
      }
      return self;
    });

    self.on = vi.fn((_event: string) => {
      return self;
    });

    self._onloadTimer = setTimeout(() => {
      self._onloadTimer = undefined;
      self.loaded = true;
      if (config.onload) {
        config.onload();
      }
    }, 1);

    return self;
  }

  beforeEach(() => {
    howlerVolumeSpy = vi.fn();

    TestBed.configureTestingModule({
      providers: [
        AudioService,
        { provide: NgZone, useValue: new NgZone({ enableLongStackTrace: false }) },
        {
          provide: HOWL_FACTORY,
          useValue: (config: Record<string, ((...args: unknown[]) => void) | undefined>) => {
            lastHowlConfig = config;
            return new (MockHowl as any)(config);
          },
        },
        { provide: HOWLER_GLOBAL, useValue: { volume: howlerVolumeSpy } },
        provideHttpClient(withXhr()),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(AudioService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    if (service) {
      service.ngOnDestroy();
    }
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(service['stateSubject'].value).toBe('idle');
    expect(service['positionSubject'].value).toBe(0);
    expect(service['durationSubject'].value).toBe(0);
    expect(service['volumeSubject'].value).toBe(1);
  });

  it('should set current audio file path when loaded', () => {
    void service.load('test.mp3');
    expect(service.currentAudioFile).toBe('test.mp3');
  });

  it('should handle play without audio loaded gracefully', () => {
    expect(() => service.play()).toThrowError('No audio loaded. Call load(src) first.');
  });

  it('should not throw when pause is called without audio loaded', () => {
    expect(() => service.pause()).not.toThrow();
  });

  it('should not throw when stop is called without audio loaded', () => {
    expect(() => service.stop()).not.toThrow();
  });

  it('should not throw when seek is called without audio loaded', () => {
    expect(() => service.seek(10)).not.toThrow();
  });

  it('should update volume correctly', () => {
    void service.load('test.mp3');
    service.setVolume(0.5);
    expect(service['volumeSubject'].value).toBe(0.5);
  });

  it('should clamp volume to 0-1 range', () => {
    void service.load('test.mp3');
    service.setVolume(1.5);
    expect(service['volumeSubject'].value).toBe(1);
    service.setVolume(-0.5);
    expect(service['volumeSubject'].value).toBe(0);
  });

  it('should toggle state correctly when no audio is loaded', () => {
    expect(() => service.toggle()).not.toThrow();
  });

  // Both tests below are deliberately synchronous: Subject completion is a
  // synchronous notification, and the mocked Howl reports 'loaded' immediately,
  // so awaiting wall-clock timers here only added CI flake (the awaits used to
  // stall until the 5s test timeout under load).
  it('should complete all subjects on destroy', () => {
    let stateCompleted = false;
    let positionCompleted = false;
    let durationCompleted = false;
    let volumeCompleted = false;

    service.state$.subscribe({ complete: () => (stateCompleted = true) });
    service.position$.subscribe({ complete: () => (positionCompleted = true) });
    service.duration$.subscribe({ complete: () => (durationCompleted = true) });
    service.volume$.subscribe({ complete: () => (volumeCompleted = true) });

    service.ngOnDestroy();

    expect(stateCompleted).toBe(true);
    expect(positionCompleted).toBe(true);
    expect(durationCompleted).toBe(true);
    expect(volumeCompleted).toBe(true);
  });

  it('should handle load and play cycle', () => {
    void service.load('test.mp3');
    expect(service.currentAudioFile).toBe('test.mp3');
    expect(() => service.play()).not.toThrow();
  });

  it('should stop ticker properly', () => {
    Object.defineProperty(service, 'rafId', { value: 123, writable: true });
    const cancelSpy = vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});

    (service as any).stopTicker();

    expect(cancelSpy).toHaveBeenCalledWith(123);
    expect(service['rafId']).toBeUndefined();
  });

  describe('speakWord', () => {
    let originalSpeechSynthesis: SpeechSynthesis | undefined;
    let originalCtor: unknown;
    let getVoicesMock: ReturnType<typeof vi.fn>;
    let speakMock: ReturnType<typeof vi.fn>;
    let cancelMock: ReturnType<typeof vi.fn>;
    let voicesChangedHandler: (() => void) | null;

    beforeEach(() => {
      originalSpeechSynthesis = window.speechSynthesis;
      originalCtor = (window as unknown as { SpeechSynthesisUtterance?: unknown })
        .SpeechSynthesisUtterance;
      voicesChangedHandler = null;
      getVoicesMock = vi.fn(() => []);
      speakMock = vi.fn();
      cancelMock = vi.fn();

      Object.defineProperty(window, 'speechSynthesis', {
        configurable: true,
        value: {
          getVoices: getVoicesMock,
          speak: speakMock,
          cancel: cancelMock,
          set onvoiceschanged(fn: (() => void) | null) {
            voicesChangedHandler = fn;
          },
          get onvoiceschanged(): (() => void) | null {
            return voicesChangedHandler;
          },
        },
      });

      // jsdom does not ship SpeechSynthesisUtterance; provide a minimal stub.
      (window as unknown as { SpeechSynthesisUtterance: unknown }).SpeechSynthesisUtterance =
        class {
          text: string;
          lang = '';
          rate = 1;
          voice?: SpeechSynthesisVoice;
          onerror?: (e: { error: string }) => void;
          constructor(text: string) {
            this.text = text;
          }
        };

      // Fresh per-instance voice cache/listener state for each test.
      service['cachedVoices'] = [];
      service['voicesListenerAttached'] = false;
    });

    afterEach(() => {
      Object.defineProperty(window, 'speechSynthesis', {
        configurable: true,
        value: originalSpeechSynthesis,
      });
      (window as unknown as { SpeechSynthesisUtterance: unknown }).SpeechSynthesisUtterance =
        originalCtor;
    });

    it('should not throw and should not speak when speechSynthesis is unavailable', () => {
      Object.defineProperty(window, 'speechSynthesis', {
        configurable: true,
        value: undefined,
      });

      expect(() => service.speakWord('hello')).not.toThrow();
      expect(speakMock).not.toHaveBeenCalled();
    });

    it('should speak the word with an en-US utterance at rate 0.9', () => {
      void service.speakWord('hello');

      expect(cancelMock).toHaveBeenCalled();
      expect(speakMock).toHaveBeenCalledTimes(1);
      const utterance = speakMock.mock.calls[0][0] as SpeechSynthesisUtterance;
      expect(utterance.text).toBe('hello');
      expect(utterance.lang).toBe('en-US');
      expect(utterance.rate).toBe(0.9);
    });

    it('should select the en-US voice from the cache when voices are already loaded', () => {
      const usVoice = { lang: 'en-US', name: 'US English' } as SpeechSynthesisVoice;
      getVoicesMock.mockReturnValue([usVoice]);

      void service.speakWord('hello');

      const utterance = speakMock.mock.calls[0][0] as SpeechSynthesisUtterance;
      expect(utterance.voice).toBe(usVoice);
    });

    it('should attach onvoiceschanged and refresh the cache when voices load later', () => {
      // First call: no voices available yet — selection skipped, listener attached.
      void service.speakWord('hello');
      expect(voicesChangedHandler).not.toBeNull();
      const firstUtterance = speakMock.mock.calls[0][0] as SpeechSynthesisUtterance;
      expect(firstUtterance.voice).toBeUndefined();

      // Platform later publishes the voice list.
      const usVoice = { lang: 'en-US', name: 'US English' } as SpeechSynthesisVoice;
      getVoicesMock.mockReturnValue([usVoice]);
      voicesChangedHandler!();

      // The next utterance should now pick up the cached US voice.
      void service.speakWord('world');
      const secondUtterance = speakMock.mock.calls[1][0] as SpeechSynthesisUtterance;
      expect(secondUtterance.voice).toBe(usVoice);
    });

    it('should not re-attach the onvoiceschanged listener on subsequent calls', () => {
      void service.speakWord('hello');
      const firstHandler = voicesChangedHandler;
      void service.speakWord('world');
      expect(voicesChangedHandler).toBe(firstHandler);
    });

    it('should not warn on interrupted/canceled errors', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      void service.speakWord('hello');
      const utterance = speakMock.mock.calls[0][0] as SpeechSynthesisUtterance;
      const makeEvent = (error: string) => ({ error }) as unknown as SpeechSynthesisErrorEvent;
      utterance.onerror!(makeEvent('interrupted'));
      utterance.onerror!(makeEvent('canceled'));
      expect(warnSpy).not.toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it('should warn on other speechSynthesis errors', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      void service.speakWord('hello');
      const utterance = speakMock.mock.calls[0][0] as SpeechSynthesisUtterance;
      utterance.onerror!({ error: 'audio-busy' } as unknown as SpeechSynthesisErrorEvent);
      expect(warnSpy).toHaveBeenCalledWith('speechSynthesis error:', 'audio-busy');
      warnSpy.mockRestore();
    });

    it('should resolve the speakWord promise when the utterance ends', async () => {
      const done = service.speakWord('hello');
      const utterance = speakMock.mock.calls[0][0] as SpeechSynthesisUtterance;
      // Drive the platform end event and let the microtask settle.
      utterance.onend!(undefined as unknown as SpeechSynthesisEvent);
      await expect(done).resolves.toBeUndefined();
    });

    it('speakSequence should queue utterances one after another (no cancel)', async () => {
      const announced: number[] = [];
      const sequence = service.speakSequence(['One.', 'Two.'], i => announced.push(i));

      // First utterance is queued immediately; no cancel before the sequence.
      expect(cancelMock).not.toHaveBeenCalled();
      expect(speakMock).toHaveBeenCalledTimes(1);
      expect(announced).toEqual([0]); // index announced BEFORE the utterance starts
      const first = speakMock.mock.calls[0][0] as SpeechSynthesisUtterance;
      expect(first.text).toBe('One.');

      // The second is queued only once the first has ended.
      first.onend!(undefined as unknown as SpeechSynthesisEvent);
      await Promise.resolve();
      expect(speakMock).toHaveBeenCalledTimes(2);
      expect((speakMock.mock.calls[1][0] as SpeechSynthesisUtterance).text).toBe('Two.');

      const second = speakMock.mock.calls[1][0] as SpeechSynthesisUtterance;
      second.onend!(undefined as unknown as SpeechSynthesisEvent);
      await expect(sequence).resolves.toBeUndefined();
      expect(announced).toEqual([0, 1]);
    });

    it('speakSequence should skip blank texts', async () => {
      const sequence = service.speakSequence(['  ', 'Real.']);
      expect(speakMock).toHaveBeenCalledTimes(1);
      expect((speakMock.mock.calls[0][0] as SpeechSynthesisUtterance).text).toBe('Real.');
      (speakMock.mock.calls[0][0] as SpeechSynthesisUtterance).onend!(
        undefined as unknown as SpeechSynthesisEvent
      );
      await sequence;
    });

    it('cancelSpeech should stop the sequence loop and cancel utterances', async () => {
      const sequence = service.speakSequence(['One.', 'Two.', 'Three.']);
      expect(speakMock).toHaveBeenCalledTimes(1);

      service.cancelSpeech();
      expect(cancelMock).toHaveBeenCalled();

      // The in-flight first utterance ends (canceled); the loop must then bail
      // because its generation was superseded by cancelSpeech().
      (speakMock.mock.calls[0][0] as SpeechSynthesisUtterance).onerror!(
        { error: 'canceled' } as unknown as SpeechSynthesisErrorEvent
      );
      await sequence;
      expect(speakMock).toHaveBeenCalledTimes(1);
    });

    it('a newer speakSequence supersedes an in-flight one', async () => {
      const first = service.speakSequence(['A1.', 'A2.']);
      const second = service.speakSequence(['B1.']);

      // End the currently queued utterance(s) so both loops settle.
      (speakMock.mock.calls[0][0] as SpeechSynthesisUtterance).onend!(
        undefined as unknown as SpeechSynthesisEvent
      );
      if (speakMock.mock.calls[1]) {
        (speakMock.mock.calls[1][0] as SpeechSynthesisUtterance).onend!(
          undefined as unknown as SpeechSynthesisEvent
        );
      }
      await Promise.all([first, second]);

      // The first loop must not continue to A2. once superseded by B1.
      const spoken = speakMock.mock.calls.map(c => (c[0] as SpeechSynthesisUtterance).text);
      expect(spoken).not.toContain('A2.');
    });

    it('a newer speakWord supersedes an in-flight sentence sequence', async () => {
      const sequence = service.speakSequence(['One.', 'Two.']);
      const wordPromise = service.speakWord('hello');
      expect(cancelMock).toHaveBeenCalled(); // speakWord cancels the queue

      // Settle both pending promises: current utterance errors as canceled,
      // then the word's own utterance ends.
      const inFlight = speakMock.mock.calls[speakMock.mock.calls.length - 1][0] as SpeechSynthesisUtterance;
      // 'One.' was the queued sentence; the cancel surfaced on it.
      (speakMock.mock.calls[0][0] as SpeechSynthesisUtterance).onerror!(
        { error: 'canceled' } as unknown as SpeechSynthesisErrorEvent
      );
      inFlight.onend!(undefined as unknown as SpeechSynthesisEvent);
      await Promise.all([sequence, wordPromise]);

      const spoken = speakMock.mock.calls.map(c => (c[0] as SpeechSynthesisUtterance).text);
      expect(spoken).not.toContain('Two.');
      expect(spoken).toContain('hello');
    });

    it('speakSequence should not throw when speechSynthesis is unavailable', async () => {
      Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: undefined });
      await expect(service.speakSequence(['One.'])).resolves.toBeUndefined();
      expect(() => service.cancelSpeech()).not.toThrow();
    });
  });

  describe('playAuthenticatedOneShot onEnd', () => {
    const helloUrl = `${environment.apiUrl}/api/WordAudio?word=hello`;
    let objectUrlSeq = 0;

    beforeEach(() => {
      // jsdom has no object-URL support; the one-shot path builds a blob URL.
      vi.spyOn(URL, 'createObjectURL').mockImplementation(() => `blob:mock-${++objectUrlSeq}`);
      vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
      // MockHowl defers onload on a REAL 1ms timer — when the whole suite
      // runs on a loaded CI runner those callbacks starve past any generous
      // timeout (PR #101 CI). Fake timers let startOneShot advance the load
      // deterministically, so no test here waits on the wall clock.
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    // Start a one-shot, serve its authenticated blob, and advance MockHowl's
    // deferred onload so the promise resolves `true` (playing). The async
    // advance drains the HTTP microtasks first, then the mock's load timer.
    async function startOneShot(onEnd?: () => void): Promise<boolean> {
      const promise = service.playAuthenticatedOneShot(helloUrl, 'mp3', onEnd);
      const request = httpTestingController.expectOne(helloUrl);
      request.flush(new Blob(['data'], { type: 'audio/mpeg' }));
      await vi.advanceTimersByTimeAsync(10);
      return promise;
    }

    it('resolves true once playback starts but does not fire onEnd yet', async () => {
      const onEnd = vi.fn();
      const ok = await startOneShot(onEnd);

      expect(ok).toBe(true);
      // Started, not finished: onEnd only fires on the real end of playback.
      expect(onEnd).not.toHaveBeenCalled();
    });

    it('fires onEnd exactly once when the sound reports it ended', async () => {
      const onEnd = vi.fn();
      await startOneShot(onEnd);

      lastHowlConfig!['onend']!();
      lastHowlConfig!['onend']!(); // a duplicate end must not double-fire

      expect(onEnd).toHaveBeenCalledTimes(1);
    });

    it('fires onEnd when a superseding one-shot stops the pending sound', async () => {
      const onEnd = vi.fn();
      await startOneShot(onEnd);

      // A newer word calls stopWordOneShot internally, releasing the waiter
      // instead of leaving its promise unresolved forever.
      void service.playAuthenticatedOneShot(`${environment.apiUrl}/api/WordAudio?word=world`);
      httpTestingController.expectOne(`${environment.apiUrl}/api/WordAudio?word=world`);

      expect(onEnd).toHaveBeenCalledTimes(1);
    });

    it('does not fire onEnd on a fetch miss - the caller falls back to TTS', async () => {
      const onEnd = vi.fn();
      const promise = service.playAuthenticatedOneShot(helloUrl, 'mp3', onEnd);
      // Blob responses cannot auto-convert an error body; drive the 404
      // through the error channel instead of flush.
      httpTestingController
        .expectOne(helloUrl)
        .error(new ErrorEvent('NotFound', { error: '404' }), { status: 404, statusText: 'Not Found' });

      await expect(promise).resolves.toBe(false);
      // The `false` result carries the signal; the follow-up (TTS) owns it.
      expect(onEnd).not.toHaveBeenCalled();
    });
  });
});
