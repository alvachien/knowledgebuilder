import { HttpClient } from '@angular/common/http';
import { DestroyRef, Injectable, NgZone, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import type { Observable } from 'rxjs';
import { catchError, filter, of } from 'rxjs';

import { environment } from '../../environments/environment';
import type {
  LearningTimeLeaderboardEntry,
  LearningTimePreferences,
  UserLearningTime,
} from '../interfaces';

import { AuthService } from './auth.service';

/**
 * Client for aclearningutil's learning-time API plus the heartbeat that feeds it.
 *
 * While the user is ON an exercise page (route segment mapped to a content
 * category below), signed in, the tab is visible and some interaction happened
 * within the idle window, a 60-second timer POSTs one beat { categoryId }. The
 * server credits only the seconds it measured since that row's previous accepted
 * beat (capped), so a replayed, early or second-tab beat adds ~nothing and the
 * client cannot forge durations — this service is honest-ish telemetry, not an
 * accounting source.
 *
 * Passive study modes (review auto play, dictation) call markActivity() on every
 * word change; typing/clicking/scrolling refresh the window through the document
 * listeners. Hidden or idle tabs stop beating — the login-history "day span" is
 * deliberately not what this measures.
 *
 * Instantiated at application bootstrap via app.config's provideAppInitializer.
 */
@Injectable({
  providedIn: 'root',
})
export class UserLearningTimeService {
  /** Heartbeat period; the server's per-beat credit cap sits just above this. */
  private static readonly BEAT_MS = 60_000;
  /** Longer than this without any activity: the user walked away, stop beating. */
  private static readonly IDLE_LIMIT_MS = 120_000;
  /** First path segment of an exercise route -> LearningContentCategory id. */
  private static readonly ROUTE_CATEGORIES: Readonly<Record<string, number>> = {
    vocabulary: 1,
    translating: 2,
    listening: 3,
    chinese: 4,
    formula: 5,
    knowledge: 6,
  };

  /** Category of the exercise page currently displayed; 0 = not on one. */
  readonly category = signal(0);

  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly ngZone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);
  private readonly apiUrl = `${environment.apiUrl}/api/UserLearningTimes`;

  private lastActivityAt = 0;
  private isAuthorized = false;
  private displayName?: string;
  private beatTimer?: ReturnType<typeof setInterval>;
  private readonly activityEvents = ['pointerdown', 'keydown', 'wheel', 'touchstart'] as const;
  private activityListener?: () => void;

  constructor() {
    // Re-read the active category on every completed navigation; updateCategory()
    // also runs once here so a deep link straight onto an exercise page counts.
    this.router.events
      .pipe(
        filter(e => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => this.updateCategory());
    this.updateCategory();

    this.auth.authContent
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(info => {
        this.isAuthorized = info.isAuthorized;
        // Sent with each beat so the leaderboard can label the caller's rows;
        // purely cosmetic — it only ever labels this user's own totals.
        this.displayName = info.getUserName() ?? undefined;
      });

    if (typeof document !== 'undefined') {
      // Passive document listeners: any real interaction extends the active window.
      this.activityListener = () => this.markActivity();
      for (const type of this.activityEvents) {
        document.addEventListener(type, this.activityListener, { passive: true });
      }
    }

    // The tick runs outside Angular: it mostly early-returns and must not keep
    // waking change detection once a minute forever.
    this.ngZone.runOutsideAngular(() => {
      this.beatTimer = setInterval(() => this.beatIfEligible(), UserLearningTimeService.BEAT_MS);
    });

    // A root-provided service is never destroyed while the app runs; the cleanup
    // only matters where the DI scope does end — unit-test TestBed resets.
    this.destroyRef.onDestroy(() => {
      if (this.beatTimer !== undefined) {
        clearInterval(this.beatTimer);
        this.beatTimer = undefined;
      }
      if (this.activityListener && typeof document !== 'undefined') {
        for (const type of this.activityEvents) {
          document.removeEventListener(type, this.activityListener);
        }
        this.activityListener = undefined;
      }
    });
  }

  /**
   * Extend the active window. Called by the document listeners and by the passive
   * session screens (review auto play, dictation) on every word/sentence change.
   */
  markActivity(): void {
    this.lastActivityAt = Date.now();
  }

  /** Whether a beat right now is meaningful: exercise page, signed in, visible, recently active. */
  isTracking(): boolean {
    if (this.category() === 0 || !this.isAuthorized) {
      return false;
    }
    if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
      return false;
    }
    return Date.now() - this.lastActivityAt <= UserLearningTimeService.IDLE_LIMIT_MS;
  }

  /** The heartbeat tick's body (public for tests): POST one beat when tracking. */
  beatIfEligible(): void {
    if (!this.isTracking()) {
      return;
    }
    const categoryId = this.category();
    const body = this.displayName
      ? { categoryId, userName: this.displayName }
      : { categoryId };
    this.http
      .post<UserLearningTime>(this.apiUrl, body)
      .pipe(
        catchError(err => {
          // A failed beat only loses its own minute; never break the UI.
          console.error('learning-time heartbeat failed', err);
          return of(null);
        })
      )
      .subscribe();
  }

  /**
   * Top learners over a rolling trailing window of `windowDays` (server-local
   * days including today; the server clamps 1..92) up to `top` entries
   * (clamped 1..10). Needs the caller's token only for [Authorize]; the
   * ranking itself is over all users' aggregates.
   */
  getLeaderboard(windowDays: number, top = 3): Observable<LearningTimeLeaderboardEntry[]> {
    return this.http.get<LearningTimeLeaderboardEntry[]>(`${this.apiUrl}/Leaderboard`, {
      params: { window: String(windowDays), top: String(top) },
    });
  }

  /** The caller's leaderboard visibility choice; absence of a row means visible. */
  getPreferences(): Observable<LearningTimePreferences> {
    return this.http.get<LearningTimePreferences>(`${this.apiUrl}/Preferences`);
  }

  /** Upsert the visibility choice; the response echoes the stored value. */
  savePreferences(leaderboardOptOut: boolean): Observable<LearningTimePreferences> {
    return this.http.put<LearningTimePreferences>(`${this.apiUrl}/Preferences`, {
      leaderboardOptOut,
    });
  }

  /** Own rows, newest day first; omit from/to for the server default (trailing 90 days). */
  getMy(from?: string, to?: string, categoryId?: number): Observable<UserLearningTime[]> {
    const params: Record<string, string> = {};
    if (from) {
      params['from'] = from;
    }
    if (to) {
      params['to'] = to;
    }
    if (categoryId) {
      params['categoryId'] = String(categoryId);
    }
    return this.http.get<UserLearningTime[]>(this.apiUrl, { params });
  }

  private updateCategory(): void {
    const segment =
      this.router.url
        .split('?')[0]
        .split('/')
        .filter(part => part.length > 0)[0]
        ?.toLowerCase() ?? '';
    const next = UserLearningTimeService.ROUTE_CATEGORIES[segment] ?? 0;
    const changed = next !== this.category();
    this.category.set(next);
    if (changed && next !== 0) {
      // Arriving on an exercise page opens the active window.
      this.markActivity();
    }
  }
}
