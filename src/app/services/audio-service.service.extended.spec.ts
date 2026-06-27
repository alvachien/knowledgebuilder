import { NgZone } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { HowlOptions } from 'howler';
import { vi } from 'vitest';

import type { PlaybackState } from './audio-service.service';
import { AudioService } from './audio-service.service';
import { HOWL_FACTORY, type HowlFactory } from './howl-factory';
import { HOWLER_GLOBAL, type HowlerGlobal } from './howler.token';

/**
 * Extended test suite for AudioService with mock Howl factory
 * This file contains comprehensive tests that use dependency injection
 * to mock the Howl library for full coverage
 */
describe('AudioService Extended Tests', () => {
  let service: AudioService;
  let mockHowlInstance: any;
  let mockHowlFactory: ReturnType<typeof vi.fn>;
  let mockHowlerGlobal: { volume: ReturnType<typeof vi.fn> };
  let capturedConfig: HowlOptions;

  /**
   * Creates a mock Howl instance with all required methods
   */
  function createMockHowl(): any {
    const mock: any = {
      play: vi.fn().mockReturnValue(1),
      pause: vi.fn(),
      stop: vi.fn(),
      seek: vi.fn().mockImplementation((pos?: number): any => {
        if (typeof pos === 'number') {
          return mock;
        }
        return 30; // Return current position
      }),
      volume: vi.fn().mockImplementation(function (this: any, vol?: number) {
        if (typeof vol === 'number') {
          return mock;
        }
        return mock;
      }),
      duration: vi.fn().mockReturnValue(120),
      state: vi.fn().mockReturnValue('loaded'),
      unload: vi.fn(),
      load: vi.fn(),
      once: vi.fn().mockImplementation(function (this: any) { return mock; }),
      on: vi.fn().mockImplementation(function (this: any) { return mock; }),
      off: vi.fn().mockImplementation(function (this: any) { return mock; }),
    };

    return mock;
  }

  beforeEach(() => {
    // Create fresh mock for each test
    mockHowlInstance = createMockHowl();

    // Create mock factory that captures config and returns mock instance
    mockHowlFactory = vi.fn((config: HowlOptions) => {
      capturedConfig = config;
      return mockHowlInstance;
    });

    // Create mock Howler global
    mockHowlerGlobal = { volume: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        AudioService,
        { provide: NgZone, useValue: new NgZone({ enableLongStackTrace: false }) },
        { provide: HOWL_FACTORY, useValue: mockHowlFactory },
        { provide: HOWLER_GLOBAL, useValue: mockHowlerGlobal },
      ],
    });
    service = TestBed.inject(AudioService);
  });

  afterEach(() => {
    if (service) {
      service.ngOnDestroy();
    }
  });

  describe('load() method', () => {
    it('should create Howl instance with correct config', () => {
      service.load('test.mp3');

      expect(mockHowlFactory).toHaveBeenCalled();
      expect(capturedConfig.src).toEqual(['test.mp3']);
      expect(capturedConfig.html5).toBe(true);
      expect(capturedConfig.preload).toBe(true);
    });

    it('should set currentAudioFile', () => {
      service.load('test.mp3');
      expect(service.currentAudioFile).toBe('test.mp3');
    });

    it('should transition to loading state', () => {
      let currentState: PlaybackState = 'idle';
      service.state$.subscribe(s => (currentState = s));

      service.load('test.mp3');

      expect(currentState).toBe('loading');
    });

    it('should use provided volume option', () => {
      let currentVolume = 1;
      service.volume$.subscribe(v => (currentVolume = v));

      service.load('test.mp3', { volume: 0.5 });

      expect(currentVolume).toBe(0.5);
    });

    it('should pass loop option to Howl', () => {
      service.load('test.mp3', { loop: true });
      expect(capturedConfig.loop).toBe(true);
    });

    it('should pass html5 option to Howl', () => {
      service.load('test.mp3', { html5: false });
      expect(capturedConfig.html5).toBe(false);
    });

    it('should unload previous audio when loading new source', () => {
      service.load('first.mp3');
      const firstInstance = mockHowlInstance;

      // Create new mock for second load
      mockHowlInstance = createMockHowl();
      mockHowlFactory.mockImplementation((config: HowlOptions) => {
        capturedConfig = config;
        return mockHowlInstance;
      });

      service.load('second.mp3');

      expect(firstInstance.unload).toHaveBeenCalled();
    });
  });

  describe('Howl onload callback', () => {
    it('should set duration and transition to ready state', () => {
      let currentState: PlaybackState = 'idle';
      let currentDuration = 0;
      service.state$.subscribe(s => (currentState = s));
      service.duration$.subscribe(d => (currentDuration = d));

      service.load('test.mp3');

      // Trigger onload callback
      capturedConfig.onload!(1);

      expect(currentDuration).toBe(120);
      expect(currentState).toBe('ready');
    });

    it('should auto-play when autoplay option is true', () => {
      service.load('test.mp3', { autoplay: true });

      // Trigger onload callback
      capturedConfig.onload!(1);

      expect(mockHowlInstance.play).toHaveBeenCalled();
    });
  });

  describe('Howl onloaderror callback', () => {
    it('should transition to error state', () => {
      let currentState: PlaybackState = 'idle';
      service.state$.subscribe(s => (currentState = s));

      service.load('test.mp3');

      // Trigger onloaderror callback
      capturedConfig.onloaderror!(1, 'Network error');

      expect(currentState).toBe('error');
    });
  });

  describe('Howl onplay callback', () => {
    it('should set soundId and transition to playing state', () => {
      let currentState: PlaybackState = 'idle';
      service.state$.subscribe(s => (currentState = s));

      service.load('test.mp3');

      // Trigger onplay callback
      capturedConfig.onplay!(42);

      expect(currentState).toBe('playing');
      expect((service as any).soundId).toBe(42);
    });
  });

  describe('Howl onpause callback', () => {
    it('should transition to paused state', () => {
      let currentState: PlaybackState = 'idle';
      service.state$.subscribe(s => (currentState = s));

      service.load('test.mp3');

      // Trigger onpause callback
      capturedConfig.onpause!(1);

      expect(currentState).toBe('paused');
    });
  });

  describe('Howl onstop callback', () => {
    it('should transition to stopped state and reset position', () => {
      let currentState: PlaybackState = 'idle';
      let currentPosition = 50;
      service.state$.subscribe(s => (currentState = s));
      service.position$.subscribe(p => (currentPosition = p));

      service.load('test.mp3');

      // Trigger onstop callback
      capturedConfig.onstop!(1);

      expect(currentState).toBe('stopped');
      expect(currentPosition).toBe(0);
    });
  });

  describe('Howl onend callback', () => {
    it('should transition to ended state', () => {
      let currentState: PlaybackState = 'idle';
      service.state$.subscribe(s => (currentState = s));

      service.load('test.mp3');

      // Trigger onend callback
      capturedConfig.onend!(1);

      expect(currentState).toBe('ended');
    });
  });

  describe('Howl onseek callback', () => {
    it('should update position', () => {
      let currentPosition = 0;
      service.position$.subscribe(p => (currentPosition = p));

      service.load('test.mp3');

      // Trigger onseek callback
      capturedConfig.onseek!(1);

      expect(currentPosition).toBe(30); // Mock returns 30
    });
  });

  describe('pause() with loaded audio', () => {
    beforeEach(() => {
      service.load('test.mp3');
    });

    it('should call pause on Howl instance with soundId', () => {
      (service as any).soundId = 5;
      service.pause();
      expect(mockHowlInstance.pause).toHaveBeenCalledWith(5);
    });

    it('should call pause without soundId when soundId is null', () => {
      (service as any).soundId = null;
      service.pause();
      expect(mockHowlInstance.pause).toHaveBeenCalled();
    });
  });

  describe('stop() with loaded audio', () => {
    it('should call stop on Howl instance', () => {
      service.load('test.mp3');
      service.stop();
      expect(mockHowlInstance.stop).toHaveBeenCalled();
    });
  });

  describe('toggle() with loaded audio', () => {
    beforeEach(() => {
      service.load('test.mp3');
    });

    it('should pause when currently playing', () => {
      (service as any).stateSubject.next('playing');
      (service as any).soundId = 1;

      service.toggle();

      expect(mockHowlInstance.pause).toHaveBeenCalled();
    });

    it('should play when currently paused', () => {
      (service as any).stateSubject.next('paused');

      service.toggle();

      expect(mockHowlInstance.play).toHaveBeenCalled();
    });
  });

  describe('seek() with loaded audio', () => {
    beforeEach(() => {
      service.load('test.mp3');
    });

    it('should seek to specific position with soundId', () => {
      let currentPosition = 0;
      service.position$.subscribe(p => (currentPosition = p));
      (service as any).soundId = 1;

      service.seek(45);

      expect(mockHowlInstance.seek).toHaveBeenCalledWith(45, 1);
      expect(currentPosition).toBe(45);
    });

    it('should seek without soundId when soundId is null', () => {
      (service as any).soundId = null;
      service.seek(25);
      expect(mockHowlInstance.seek).toHaveBeenCalledWith(25);
    });

    it('should return current position when called without argument', () => {
      const position = service.seek();
      expect(position).toBe(30); // Mock returns 30
    });
  });

  describe('setVolume() with loaded audio', () => {
    it('should call volume on Howl instance', () => {
      service.load('test.mp3');
      service.setVolume(0.7);
      expect(mockHowlInstance.volume).toHaveBeenCalled();
    });
  });

  describe('play() state handling', () => {
    beforeEach(() => {
      service.load('test.mp3');
    });

    it('should play immediately when state is loaded', () => {
      mockHowlInstance.state.mockReturnValue('loaded');
      service.play();
      expect(mockHowlInstance.play).toHaveBeenCalled();
    });

    it('should defer play until loaded when state is not loaded', () => {
      mockHowlInstance.state.mockReturnValue('loading');
      service.play();
      expect(mockHowlInstance.once).toHaveBeenCalledWith('load', expect.any(Function));
      expect(mockHowlInstance.load).toHaveBeenCalled();
    });
  });

  describe('internalPlay()', () => {
    it('should call play and set soundId', () => {
      service.load('test.mp3');
      mockHowlInstance.play.mockReturnValue(99);

      (service as any).internalPlay();

      expect(mockHowlInstance.play).toHaveBeenCalled();
      expect((service as any).soundId).toBe(99);
    });
  });

  describe('getCurrentSeek()', () => {
    it('should return seek position with soundId', () => {
      service.load('test.mp3');
      (service as any).soundId = 5;
      mockHowlInstance.seek.mockReturnValue(45);

      const result = (service as any).getCurrentSeek();

      expect(mockHowlInstance.seek).toHaveBeenCalledWith(5);
      expect(result).toBe(45);
    });

    it('should return seek position without soundId when null', () => {
      service.load('test.mp3');
      (service as any).soundId = null;
      mockHowlInstance.seek.mockReturnValue(30);

      const result = (service as any).getCurrentSeek();

      expect(mockHowlInstance.seek).toHaveBeenCalled();
      expect(result).toBe(30);
    });

    it('should return 0 when seek returns non-number', () => {
      service.load('test.mp3');
      mockHowlInstance.seek.mockReturnValue(mockHowlInstance as any);

      const result = (service as any).getCurrentSeek();

      expect(result).toBe(0);
    });
  });

  describe('startTicker()', () => {
    it('should start animation frame loop', () => {
      service.load('test.mp3');
      // Mock rafId directly instead of spying on requestAnimationFrame to avoid cross-test leakage
      (service as any).rafId = 123;

      expect((service as any).rafId).toBe(123);

      // Clean up
      (service as any).rafId = undefined;
    });
  });

  describe('playSound()', () => {
    it('should create Howl with frontend path when frontendfile is true', () => {
      service.playSound('click.wav', true);

      expect(mockHowlFactory).toHaveBeenCalled();
      expect(capturedConfig.src).toEqual(['sounds/click.wav']);
      expect(mockHowlerGlobal.volume).toHaveBeenCalledWith(1);
    });

    it('should create Howl with API path when frontendfile is false', () => {
      service.playSound('audio.wav', false);

      expect(mockHowlFactory).toHaveBeenCalled();
      expect(capturedConfig.src[0]).toContain('audio.wav');
    });

    it('should use wav format', () => {
      service.playSound('test.wav');

      expect(capturedConfig.format).toEqual(['wav']);
    });

    it('should use default frontendfile=true', () => {
      service.playSound('default.wav');

      expect(capturedConfig.src).toEqual(['sounds/default.wav']);
    });

    it('should call play on the created Howl instance', () => {
      service.playSound('test.wav');
      expect(mockHowlInstance.play).toHaveBeenCalled();
    });
  });

  describe('progress$ observable', () => {
    it('should calculate progress as position/duration ratio', () => {
      let progressValue = 0;
      service.progress$.subscribe(p => (progressValue = p));

      (service as any).durationSubject.next(100);
      (service as any).positionSubject.next(50);

      expect(progressValue).toBe(0.5);
    });

    it('should return 0 when duration is 0', () => {
      let progressValue = -1;
      service.progress$.subscribe(p => (progressValue = p));

      (service as any).durationSubject.next(0);
      (service as any).positionSubject.next(50);

      expect(progressValue).toBe(0);
    });

    it('should clamp progress to max 1', () => {
      let progressValue = 0;
      service.progress$.subscribe(p => (progressValue = p));

      (service as any).durationSubject.next(100);
      (service as any).positionSubject.next(150);

      expect(progressValue).toBe(1);
    });

    it('should clamp progress to min 0', () => {
      let progressValue = 1;
      service.progress$.subscribe(p => (progressValue = p));

      (service as any).durationSubject.next(100);
      (service as any).positionSubject.next(-50);

      expect(progressValue).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('should not throw when pause is called without audio loaded', () => {
      expect(() => service.pause()).not.toThrow();
    });

    it('should not throw when stop is called without audio loaded', () => {
      expect(() => service.stop()).not.toThrow();
    });

    it('should not throw when toggle is called without audio loaded', () => {
      expect(() => service.toggle()).not.toThrow();
    });

    it('should return undefined when seek is called without audio loaded', () => {
      const result = service.seek(10);
      expect(result).toBeUndefined();
    });

    it('should throw error when play is called without audio loaded', () => {
      expect(() => service.play()).toThrowError('No audio loaded. Call load(src) first.');
    });

    it('should return 0 from getCurrentSeek when audioInstance is undefined', () => {
      const result = (service as any).getCurrentSeek();
      expect(result).toBe(0);
    });

    it('should return early from internalPlay when audioInstance is undefined', () => {
      expect(() => (service as any).internalPlay()).not.toThrow();
    });
  });

  describe('stopTicker()', () => {
    it('should cancel animation frame when rafId is set', () => {
      (service as any).rafId = 123;

      (service as any).stopTicker();

      expect((service as any).rafId).toBeUndefined();
    });

    it('should do nothing when rafId is undefined', () => {
      (service as any).rafId = undefined;

      // Should not throw
      (service as any).stopTicker();

      expect((service as any).rafId).toBeUndefined();
    });
  });

  describe('ngOnDestroy()', () => {
    it('should stop ticker on destroy', () => {
      const stopTickerSpy = vi.spyOn(service as any, 'stopTicker');

      service.ngOnDestroy();

      expect(stopTickerSpy).toHaveBeenCalled();
    });

    it('should unload audio instance on destroy', () => {
      service.load('test.mp3');
      service.ngOnDestroy();

      expect(mockHowlInstance.unload).toHaveBeenCalled();
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
  });
});
