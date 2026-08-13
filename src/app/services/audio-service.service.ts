import { HttpClient } from '@angular/common/http';
import type { OnDestroy } from '@angular/core';
import { inject, Injectable, NgZone } from '@angular/core';
import type { Howl } from 'howler';
import type { Observable } from 'rxjs';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
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

/** Options accepted by {@link AudioService.load} / {@link AudioService.playSound}. */
type AudioLoadOptions = { autoplay?: boolean; html5?: boolean; loop?: boolean; volume?: number };

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
  private http = inject(HttpClient);

  // Object URL for the currently-loaded authenticated audio blob; revoked on
  // replace/destroy to avoid leaks. Undefined for local (non-fetched) sources.
  private objectUrl?: string;

  // One-shot word-pronunciation audio state (see playAuthenticatedOneShot).
  // Kept separate from the persistent `audioInstance` player above so a quick
  // pronunciation never disturbs a playing content track.
  private wordSound?: Howl;
  private wordGeneration = 0;

  // Monotonic counter guarding against interleaved async loads: a superseded
  // authenticated fetch must not overwrite the newer Howl/object URL.
  private loadGeneration = 0;

  constructor() {}

  ngOnDestroy(): void {
    this.stopTicker();
    this.audioInstance?.unload();
    this.revokeObjectUrl();
    this.stopWordOneShot();
    this.stateSubject.complete();
    this.positionSubject.complete();
    this.durationSubject.complete();
    this.volumeSubject.complete();
  }

  // Load a new audio source.
  //
  // Authenticated API sources (e.g. `${apiUrl}/api/Storage/...`) cannot be fetched
  // directly by Howler: HTML5 Audio's <audio> element cannot send the Bearer JWT, so
  // the StorageController's [Authorize] returns 401 and playback fails silently. Such
  // sources are fetched via HttpClient (the auth interceptor attaches the token) and
  // fed to Howler as a blob: URL - the same pattern MarkdownContentComponent uses for
  // authenticated images. `currentAudioFile` keeps the *original* URL so callers can
  // cache against it.
  async load(src: string, opts?: AudioLoadOptions): Promise<void> {
    const generation = ++this.loadGeneration;

    // Clean up previous sound
    this.stopTicker();
    if (this.audioInstance) {
      this.audioInstance.unload();
      this.audioInstance = undefined;
      this.soundId = undefined;
    }
    this.revokeObjectUrl();
    this.stateSubject.next('loading');

    const volume = opts?.volume ?? this.volumeSubject.value;
    this.volumeSubject.next(volume);
    this._currentAudioFile = src;

    if (this.isAuthenticApiUrl(src)) {
      await this.loadAuthenticated(src, opts, volume, generation);
    } else {
      this.createHowl(src, opts, volume);
    }
  }

  private createHowl(
    src: string,
    opts: AudioLoadOptions | undefined,
    volume: number,
    format?: string[]
  ): void {
    this.audioInstance = this.howlFactory({
      src: [src],
      ...(format ? { format } : {}),
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

  // Fetch an authenticated API source via HttpClient and feed Howler a blob: URL.
  private async loadAuthenticated(
    src: string,
    opts: AudioLoadOptions | undefined,
    volume: number,
    generation: number
  ): Promise<void> {
    try {
      const blob = await firstValueFrom(this.http.get(src, { responseType: 'blob' }));
      if (generation !== this.loadGeneration) {
        // Superseded by a newer load() while fetching - discard silently; the
        // newer load already reset the state and owns _currentAudioFile.
        return;
      }
      if (!blob) {
        this.ngZone.run(() => this.stateSubject.next('error'));
        return;
      }
      // Preserve the filename so Howler/browser can infer the codec from the extension;
      // the blob's MIME (from the response Content-Type) is kept as the File's type.
      const filename = src.split('/').pop()?.split('?')[0] ?? 'audio.mp3';
      const file = new File([blob], filename, { type: blob.type });
      this.objectUrl = URL.createObjectURL(file);
      this.createHowl(this.objectUrl, opts, volume, this.formatFromExtension(filename));
    } catch (err) {
      console.error('Failed to load authenticated audio:', src, err);
      this.ngZone.run(() => this.stateSubject.next('error'));
    }
  }

  // Mirrors the auth interceptor: it attaches the JWT for URLs under apiUrl.
  private isAuthenticApiUrl(src: string): boolean {
    return src === environment.apiUrl || src.startsWith(environment.apiUrl + '/');
  }

  private formatFromExtension(filename: string): string[] | undefined {
    const ext = filename.slice(filename.lastIndexOf('.') + 1).toLowerCase();
    const supported = ['mp3', 'wav', 'ogg', 'm4a', 'webm', 'aac', 'flac'];
    return supported.includes(ext) ? [ext] : undefined;
  }

  private revokeObjectUrl(): void {
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = undefined;
    }
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
    if (this.soundId !== undefined) {
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
      if (this.soundId !== undefined) {
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
      this.soundId !== undefined
        ? this.audioInstance.seek(this.soundId)
        : this.audioInstance.seek();
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

  // Simple sound effects. `frontendfile === false` plays a backend file from the API,
  // which (like load()) must be fetched via HttpClient so the Bearer JWT is attached.
  async playSound(filename: string, frontendfile = true): Promise<void> {
    const path = frontendfile ? TYPING_SOUND_URL + filename : `${environment.apiUrl}/${filename}`;
    this.howlerGlobal.volume(1);

    if (!frontendfile && this.isAuthenticApiUrl(path)) {
      try {
        const blob = await firstValueFrom(this.http.get(path, { responseType: 'blob' }));
        if (!blob) {
          return;
        }
        const file = new File([blob], filename, { type: blob.type });
        const blobUrl = URL.createObjectURL(file);
        const sound = this.howlFactory({
          src: [blobUrl],
          format: this.formatFromExtension(filename) ?? ['wav'],
        });
        sound.play();
        // Unload the sound + revoke the blob URL after playback to prevent leaks.
        const cleanup = (): void => {
          sound.unload();
          URL.revokeObjectURL(blobUrl);
        };
        sound.once('end', cleanup);
        sound.once('loaderror', cleanup);
      } catch (err) {
        console.error('Failed to load authenticated sound:', path, err);
      }
      return;
    }

    const sound = this.howlFactory({
      src: [path],
      format: ['wav'],
    });
    sound.play();
    // Unload the sound after playback to prevent memory leaks from accumulating Howl instances
    sound.once('end', () => sound.unload());
    sound.once('loaderror', () => sound.unload());
  }

  // Plays a one-shot authenticated audio source (used for per-word pronunciation
  // from the /api/WordAudio endpoint). Unlike `load()` - which drives a persistent
  // player UI - this is a fire-and-forget effect: fetch the blob via HttpClient
  // (the auth interceptor attaches the Bearer JWT), play it once, then clean up.
  //
  // Returns `false` on HTTP failure (e.g. 404 when the word is absent from
  // words.db) or Howler load/play error, so the caller can fall back to another
  // mechanism such as speechSynthesis. Returns `true` once playback has started,
  // or `true` for a request superseded while fetching (a newer word is loading).
  //
  // Calling this again - or `stopWordOneShot()` - supersedes any in-flight or
  // playing word audio, so rapid study navigation never layers a stale word over
  // the current one.
  async playAuthenticatedOneShot(src: string, format = 'mp3'): Promise<boolean> {
    this.stopWordOneShot();
    const generation = ++this.wordGeneration;

    let blob: Blob;
    try {
      blob = await firstValueFrom(this.http.get(src, { responseType: 'blob' }));
    } catch {
      return false; // 404 / network failure -> caller falls back (e.g. to TTS)
    }
    if (!blob || blob.size === 0) {
      return false;
    }
    if (generation !== this.wordGeneration) {
      // A newer request superseded this one while it was fetching.
      return true;
    }

    const objectUrl = URL.createObjectURL(blob);
    return new Promise<boolean>(resolve => {
      let settled = false;
      const settle = (ok: boolean): void => {
        if (!settled) {
          settled = true;
          resolve(ok);
        }
      };
      const release = (): void => {
        URL.revokeObjectURL(objectUrl);
        if (this.wordSound === sound) {
          this.wordSound = undefined;
        }
      };
      const sound = this.howlFactory({
        src: [objectUrl],
        format: [format],
        volume: this.volumeSubject.value,
        onload: () => {
          if (generation !== this.wordGeneration) {
            sound.unload();
            release();
            settle(true);
            return;
          }
          sound.play();
          settle(true);
        },
        onloaderror: () => {
          sound.unload();
          release();
          settle(false);
        },
        onend: () => {
          sound.unload();
          release();
        },
        onplayerror: () => settle(false),
      });
      this.wordSound = sound;
    });
  }

  // Stops and discards any in-flight/playing one-shot word audio, revoking its
  // blob URL. Safe to call when nothing is playing.
  stopWordOneShot(): void {
    this.wordGeneration++;
    const sound = this.wordSound;
    this.wordSound = undefined;
    if (sound) {
      try {
        sound.unload();
      } catch {
        // Ignore double-unload races.
      }
    }
  }
}
