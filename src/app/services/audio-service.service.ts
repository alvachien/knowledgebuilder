import type { OnDestroy } from '@angular/core';
import { inject, Injectable, NgZone } from '@angular/core';
import type { Howl } from 'howler';
import type { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';

import { environment } from '../../environments/environment';

import { HOWL_FACTORY, type HowlFactory } from './howl-factory';
import { HOWLER_GLOBAL, type HowlerGlobal } from './howler.token';

export type PlaybackState =
  | 'idle'
  | 'loading'
  | 'ready'
  | 'playing'
  | 'paused'
  | 'stopped'
  | 'ended'
  | 'error';

const TYPING_SOUND_URL = 'sounds/';

@Injectable({
  providedIn: 'root',
})
export class AudioService implements OnDestroy {
  audioInstance?: Howl;
  private soundId?: number;

  private stateSubject = new BehaviorSubject<PlaybackState>('idle');
  private positionSubject = new BehaviorSubject<number>(0);
  private durationSubject = new BehaviorSubject<number>(0);
  private volumeSubject = new BehaviorSubject<number>(1);
  private _currentAudioFile = '';
  get currentAudioFile() {
    return this._currentAudioFile;
  }

  // Animation frame ticker for position updates
  private rafId?: number;

  // Exposed observables
  readonly state$ = this.stateSubject.asObservable().pipe(distinctUntilChanged());
  readonly position$ = this.positionSubject.asObservable().pipe(distinctUntilChanged());
  readonly duration$ = this.durationSubject.asObservable().pipe(distinctUntilChanged());
  readonly volume$ = this.volumeSubject.asObservable().pipe(distinctUntilChanged());
  readonly progress$: Observable<number> = this.position$.pipe(
    map(pos => {
      const dur = this.durationSubject.value;
      return dur > 0 ? Math.min(1, Math.max(0, pos / dur)) : 0;
    }),
    distinctUntilChanged()
  );

  // Injected dependencies
  private ngZone = inject(NgZone);
  private howlFactory: HowlFactory = inject(HOWL_FACTORY);
  private howlerGlobal: HowlerGlobal = inject(HOWLER_GLOBAL);

  constructor() {}

  ngOnDestroy(): void {
    this.stopTicker();
    this.audioInstance?.unload();
    this.stateSubject.complete();
    this.positionSubject.complete();
    this.durationSubject.complete();
    this.volumeSubject.complete();
  }

  // Load a new audio source
  load(
    src: string,
    opts?: { autoplay?: boolean; html5?: boolean; loop?: boolean; volume?: number }
  ): void {
    // Clean up previous sound
    this.stopTicker();
    if (this.audioInstance) {
      this.audioInstance.unload();
      this.audioInstance = undefined;
      this.soundId = undefined;
    }
    this.stateSubject.next('loading');

    const volume = opts?.volume ?? this.volumeSubject.value;
    this.volumeSubject.next(volume);
    this._currentAudioFile = src;

    this.audioInstance = this.howlFactory({
      src: [src],
      html5: opts?.html5 ?? true, // enable HTML5 Audio for long files/streaming
      preload: true,
      loop: opts?.loop ?? false,
      volume,
      onload: () => {
        const dur = this.audioInstance?.duration() ?? 0;
        this.ngZone.run(() => {
          this.durationSubject.next(dur);
          this.stateSubject.next('ready');
        });
        // Autoplay if requested
        if (opts?.autoplay) {
          this.play();
        }
      },
      onloaderror: (_id, _err) => {
        this.ngZone.run(() => this.stateSubject.next('error'));
        // Optional: console.error('Audio load error:', err);
      },
      onplay: id => {
        this.soundId = id;
        this.ngZone.run(() => this.stateSubject.next('playing'));
        this.startTicker();
      },
      onpause: () => {
        this.ngZone.run(() => this.stateSubject.next('paused'));
        this.stopTicker();
      },
      onstop: () => {
        this.ngZone.run(() => {
          this.stateSubject.next('stopped');
          this.positionSubject.next(0);
        });
        this.stopTicker();
      },
      onend: () => {
        this.ngZone.run(() => this.stateSubject.next('ended'));
        this.stopTicker();
      },
      onseek: () => {
        // Keep position up-to-date when user seeks
        const pos = this.getCurrentSeek();
        this.ngZone.run(() => this.positionSubject.next(pos));
      },
    });
  }

  // Play the audio from the beginning
  play(): void {
    if (!this.audioInstance) {
      throw new Error('No audio loaded. Call load(src) first.');
    }

    const state = this.audioInstance.state();
    if (state !== 'loaded') {
      // Defer until loaded
      this.stateSubject.next('loading');
      this.audioInstance.once('load', () => {
        // Run inside zone to update observables
        this.ngZone.run(() => {
          this.internalPlay();
        });
      });

      // Ensure load starts if not already
      this.audioInstance.load();
      return;
    }

    this.internalPlay();
  }

  // Pause playback
  pause(): void {
    if (!this.audioInstance) {
      return;
    }
    if (this.soundId != null) {
      this.audioInstance.pause(this.soundId);
    } else {
      this.audioInstance.pause();
    }
  }

  // Stop playback and reset position to 0
  stop(): void {
    if (!this.audioInstance) {
      return;
    }
    this.audioInstance.stop();
  }

  // Toggle between play/pause
  toggle(): void {
    const state = this.stateSubject.value;
    if (state === 'playing') {
      this.pause();
    } else {
      // Only attempt to play if audio is loaded, otherwise do nothing
      if (this.audioInstance) {
        this.play();
      }
    }
  }

  // Seek to a position (seconds). If no arg, returns current position.
  seek(seconds?: number): number | void {
    if (!this.audioInstance) {
      return;
    }
    if (typeof seconds === 'number') {
      if (this.soundId != null) {
        this.audioInstance.seek(seconds, this.soundId);
      } else {
        this.audioInstance.seek(seconds);
      }
      this.positionSubject.next(seconds);
      return;
    }
    return this.getCurrentSeek();
  }

  // Volume (0..1)
  setVolume(volume: number): void {
    volume = Math.max(0, Math.min(1, volume));
    this.volumeSubject.next(volume);
    if (this.audioInstance) {
      this.audioInstance.volume(volume);
    }
  }

  // Private helpers
  private internalPlay(): void {
    if (!this.audioInstance) {
      return;
    }

    // Start playback from the beginning
    const id = this.audioInstance.play();
    this.soundId = id;
  }

  private getCurrentSeek(): number {
    if (!this.audioInstance) {
      return 0;
    }
    const s =
      this.soundId != null ? this.audioInstance.seek(this.soundId) : this.audioInstance.seek();
    return typeof s === 'number' ? s : 0;
  }

  private startTicker(): void {
    this.stopTicker();
    let lastEmit = 0;
    const TICK_INTERVAL_MS = 250; // Throttle to 4 updates/sec instead of 60fps
    const tick = () => {
      if (!this.audioInstance) {
        return;
      }
      const now = performance.now();
      if (now - lastEmit >= TICK_INTERVAL_MS) {
        lastEmit = now;
        const pos = this.getCurrentSeek();
        // Re-enter zone only at throttled intervals to update the UI
        this.ngZone.run(() => {
          this.positionSubject.next(pos);
        });
      }
      this.rafId = requestAnimationFrame(tick);
    };
    // Run the RAF loop outside Angular zone to avoid triggering change detection 60fps
    this.ngZone.runOutsideAngular(() => {
      this.rafId = requestAnimationFrame(tick);
    });
  }

  private stopTicker(): void {
    if (this.rafId !== undefined) {
      cancelAnimationFrame(this.rafId);
      this.rafId = undefined;
    }
  }

  // Old implementation for simple sound effects
  playSound(filename: string, frontendfile = true): void {
    let path = '';
    if (frontendfile) {
      path = TYPING_SOUND_URL + filename;
    } else {
      path = `${environment.apiUrl}/${filename}`;
    }
    const sound = this.howlFactory({
      src: [path],
      format: ['wav'],
    });
    this.howlerGlobal.volume(1);
    sound.play();
    // Unload the sound after playback to prevent memory leaks from accumulating Howl instances
    sound.once('end', () => sound.unload());
    sound.once('loaderror', () => sound.unload());
  }
}