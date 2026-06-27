import { NgZone } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { AudioService } from './audio-service.service';

describe('AudioService', () => {
  let service: AudioService;
  let howlerVolumeSpy: ReturnType<typeof vi.fn>;

  // Setup proper Howl mock class
  function MockHowl(this: any, config: any) {
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
    self.unload = vi.fn();

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

    setTimeout(() => {
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
      providers: [AudioService, { provide: NgZone, useValue: new NgZone({}) }],
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
    service.load('test.mp3');
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
    service.load('test.mp3');
    service.setVolume(0.5);
    expect(service['volumeSubject'].value).toBe(0.5);
  });

  it('should clamp volume to 0-1 range', () => {
    service.load('test.mp3');
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
    service.load('test.mp3');
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
});
