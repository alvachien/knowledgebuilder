import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NgZone } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { AudioService } from './audio-service.service';

describe('AudioService', () => {
  let service: AudioService;
  let howlerVolumeSpy: ReturnType<typeof vi.fn>;

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
    // the runner under CI load). See "should complete all subjects on
    // destroy" / "should handle load and play cycle".
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

    (window as any).Howl = MockHowl;
    (window as any).Howler = {
      volume: howlerVolumeSpy,
    };

    TestBed.configureTestingModule({
      providers: [
        AudioService,
        { provide: NgZone, useValue: new NgZone({}) },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(AudioService);
  });

  afterEach(() => {
    (window as any).Howl = undefined;
    (window as any).Howler = undefined;
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

  it('should complete all subjects on destroy', async () => {
    let stateCompleted = false;
    let positionCompleted = false;
    let durationCompleted = false;
    let volumeCompleted = false;

    service.state$.subscribe({ complete: () => (stateCompleted = true) });
    service.position$.subscribe({ complete: () => (positionCompleted = true) });
    service.duration$.subscribe({ complete: () => (durationCompleted = true) });
    service.volume$.subscribe({ complete: () => (volumeCompleted = true) });

    service.ngOnDestroy();

    await new Promise(resolve => setTimeout(resolve, 0));
    expect(stateCompleted).toBe(true);
    expect(positionCompleted).toBe(true);
    expect(durationCompleted).toBe(true);
    expect(volumeCompleted).toBe(true);
  });

  it('should handle load and play cycle', async () => {
    void service.load('test.mp3');
    await new Promise(resolve => setTimeout(resolve, 10));
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
      originalCtor = (window as unknown as { SpeechSynthesisUtterance?: unknown }).SpeechSynthesisUtterance;
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
      (window as unknown as { SpeechSynthesisUtterance: unknown }).SpeechSynthesisUtterance = originalCtor;
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
      service.speakWord('hello');

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

      service.speakWord('hello');

      const utterance = speakMock.mock.calls[0][0] as SpeechSynthesisUtterance;
      expect(utterance.voice).toBe(usVoice);
    });

    it('should attach onvoiceschanged and refresh the cache when voices load later', () => {
      // First call: no voices available yet — selection skipped, listener attached.
      service.speakWord('hello');
      expect(voicesChangedHandler).not.toBeNull();
      const firstUtterance = speakMock.mock.calls[0][0] as SpeechSynthesisUtterance;
      expect(firstUtterance.voice).toBeUndefined();

      // Platform later publishes the voice list.
      const usVoice = { lang: 'en-US', name: 'US English' } as SpeechSynthesisVoice;
      getVoicesMock.mockReturnValue([usVoice]);
      voicesChangedHandler!();

      // The next utterance should now pick up the cached US voice.
      service.speakWord('world');
      const secondUtterance = speakMock.mock.calls[1][0] as SpeechSynthesisUtterance;
      expect(secondUtterance.voice).toBe(usVoice);
    });

    it('should not re-attach the onvoiceschanged listener on subsequent calls', () => {
      service.speakWord('hello');
      const firstHandler = voicesChangedHandler;
      service.speakWord('world');
      expect(voicesChangedHandler).toBe(firstHandler);
    });

    it('should not warn on interrupted/canceled errors', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      service.speakWord('hello');
      const utterance = speakMock.mock.calls[0][0] as SpeechSynthesisUtterance;
      const makeEvent = (error: string) => ({ error } as unknown as SpeechSynthesisErrorEvent);
      utterance.onerror!(makeEvent('interrupted'));
      utterance.onerror!(makeEvent('canceled'));
      expect(warnSpy).not.toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it('should warn on other speechSynthesis errors', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      service.speakWord('hello');
      const utterance = speakMock.mock.calls[0][0] as SpeechSynthesisUtterance;
      utterance.onerror!({ error: 'audio-busy' } as unknown as SpeechSynthesisErrorEvent);
      expect(warnSpy).toHaveBeenCalledWith('speechSynthesis error:', 'audio-busy');
      warnSpy.mockRestore();
    });
  });
});
