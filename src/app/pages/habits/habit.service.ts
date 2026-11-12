import type { HttpErrorResponse} from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { Observable} from 'rxjs';
import { of, throwError } from 'rxjs';
import { catchError, finalize, shareReplay, tap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';

import type {
  CriterionCreateInWizard,
  CriterionOut,
  CriterionUpdate,
  DayHistoryOut,
  Habit,
  HabitCreate,
  HabitItem,
  HabitUpdate,
  ItemCreate,
  ItemUpdate,
  PropertyCreate,
  PropertyOut,
  PropertyUpdate,
  PunchCreate,
  PunchOut,
  PunchUpdate,
  ShareGrant,
  SharedHabitDetail,
  SharedHabitSummary,
  UserSearchHit,
} from './habit.models';
import { HabitApiError } from './habit.models';

/**
 * HTTP wrapper for aclearningutil's habit-tracking API. The bearer token is attached
 * automatically by `authInterceptor`, which matches both `environment.apiUrl`
 * (the habit API) and `environment.idServerUrl` (acidserver's user-search call below).
 * Every failure is normalized into a `HabitApiError` carrying the API's stable
 * machine-readable `code` (ProblemDetails `extensions.code`) plus a human `detail`.
 *
 * Reads are cached here (the service is a root singleton, so the cache outlives the
 * routed components that read it): the habit list plus, per habit, its items,
 * criteria, punch list and day history. Writes invalidate the scope they touched, so
 * a page that re-reads after a punch always goes to the network. `getHabit`, shares
 * and the "shared with me" reads stay live — see `cachedRead()`.
 */
@Injectable({ providedIn: 'root' })
export class HabitService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/Habits`;
  private readonly sharedBaseUrl = `${environment.apiUrl}/api/SharedHabits`;

  /**
   * Cache key of the habit list — the `global` scope + the name `getHabits()` passes
   * to `cachedRead()`. Keep the two in step if either ever changes.
   */
  private static readonly LIST_KEY = 'global|habits';

  /** Cached payloads by `scope|name`; `name` carries the range for windowed reads. */
  private cache = new Map<string, { epoch: number; value: unknown }>();
  /** In-flight requests by the same key, so parallel callers share one round trip. */
  private requests = new Map<string, Observable<unknown>>();
  /**
   * Per-scope invalidation counters. A response is only stored while its scope's
   * epoch is unchanged — otherwise a write landing mid-flight would be overwritten
   * by the pre-write snapshot that was already on the wire.
   */
  private epochs = new Map<string, number>();

  // ── Cached reads ──────────────────────────────────────────────────────────

  /**
   * `GET /api/Habits` (list + server-derived progress). Cached in the global scope:
   * revisiting the list or the calendar replays the last result instead of
   * re-requesting, and concurrent callers share one request. `forceRefresh` bypasses
   * it for an explicit reload. Any write clears it, as does `clearCaches()`.
   */
  getHabits(forceRefresh = false): Observable<Habit[]> {
    return this.cachedRead('habits', 'global', () => this.handle(this.http.get<Habit[]>(this.baseUrl)), forceRefresh);
  }

  /**
   * A single habit — deliberately NOT cached: it is the in-place refresh callers use
   * right after a punch (FR-4.4). When the list is cached, the fresh row also replaces
   * its entry there, so the cache stays honest without a second round trip.
   */
  getHabit(id: number): Observable<Habit> {
    return this.handle(this.http.get<Habit>(`${this.baseUrl}/${id}`)).pipe(
      tap((habit) => {
        const entry = this.cache.get(HabitService.LIST_KEY);
        if (entry) {
          const list = entry.value as Habit[];
          this.cache.set(HabitService.LIST_KEY, {
            epoch: entry.epoch,
            value: list.map((h) => (h.id === habit.id ? habit : h)),
          });
        }
      })
    );
  }

  /** Day history of one habit (detail page, punch dialog). Cached per habit + range. */
  getHistory(id: number, from?: string, to?: string, forceRefresh = false): Observable<DayHistoryOut[]> {
    return this.cachedRead(
      `history|${from ?? ''}|${to ?? ''}`,
      id,
      () => this.handle(this.http.get<DayHistoryOut[]>(`${this.baseUrl}/${id}/History`, { params: this.rangeParams(from, to) })),
      forceRefresh
    );
  }

  /**
   * Habit-scoped flat punch list (calendar page) — optional `from`/`to` day bounds,
   * ordered by punchDate desc then punchedAt desc. Cached per habit + range, so
   * stepping months and coming back to an already-seen window is free.
   */
  getHabitPunches(habitId: number, from?: string, to?: string, forceRefresh = false): Observable<PunchOut[]> {
    return this.cachedRead(
      `punches|${from ?? ''}|${to ?? ''}`,
      habitId,
      () => this.handle(this.http.get<PunchOut[]>(`${this.baseUrl}/${habitId}/Punches`, { params: this.rangeParams(from, to) })),
      forceRefresh
    );
  }

  /** Items (with their properties) of one habit. Cached per habit. */
  getItems(habitId: number, forceRefresh = false): Observable<HabitItem[]> {
    return this.cachedRead(
      'items',
      habitId,
      () => this.handle(this.http.get<HabitItem[]>(`${this.baseUrl}/${habitId}/Items`)),
      forceRefresh
    );
  }

  /** Criteria of one habit. Cached per habit. */
  getCriteria(habitId: number, forceRefresh = false): Observable<CriterionOut[]> {
    return this.cachedRead(
      'criteria',
      habitId,
      () => this.handle(this.http.get<CriterionOut[]>(`${this.baseUrl}/${habitId}/Criteria`)),
      forceRefresh
    );
  }

  /** Forget everything cached — logout, or a caller that insists on fresh data. */
  clearCaches(): void {
    const scopes = new Set<string>(['global']);
    for (const scope of this.epochs.keys()) {
      scopes.add(scope);
    }
    for (const key of this.cache.keys()) {
      scopes.add(key.split('|')[0]);
    }
    for (const key of this.requests.keys()) {
      scopes.add(key.split('|')[0]);
    }
    for (const scope of scopes) {
      this.bump(scope);
    }
  }

  // ── Habits ────────────────────────────────────────────────────────────────

  createHabit(body: HabitCreate): Observable<Habit> {
    return this.write(this.http.post<Habit>(this.baseUrl, body));
  }

  updateHabit(id: number, body: HabitUpdate): Observable<Habit> {
    return this.write(this.http.put<Habit>(`${this.baseUrl}/${id}`, body), id);
  }

  deactivateHabit(id: number): Observable<Habit> {
    return this.write(this.http.post<Habit>(`${this.baseUrl}/${id}/Deactivate`, {}), id);
  }

  deleteHabit(id: number): Observable<void> {
    return this.write(this.http.delete<void>(`${this.baseUrl}/${id}`), id);
  }

  // ── Items & properties ────────────────────────────────────────────────────
  addItem(habitId: number, body: ItemCreate): Observable<HabitItem> {
    return this.write(this.http.post<HabitItem>(`${this.baseUrl}/${habitId}/Items`, body), habitId);
  }

  updateItem(habitId: number, itemId: number, body: ItemUpdate): Observable<HabitItem> {
    return this.write(this.http.put<HabitItem>(`${this.baseUrl}/${habitId}/Items/${itemId}`, body), habitId);
  }

  deleteItem(habitId: number, itemId: number): Observable<void> {
    return this.write(this.http.delete<void>(`${this.baseUrl}/${habitId}/Items/${itemId}`), habitId);
  }

  addProperty(habitId: number, itemId: number, body: PropertyCreate): Observable<PropertyOut> {
    return this.write(this.http.post<PropertyOut>(`${this.baseUrl}/${habitId}/Items/${itemId}/Properties`, body), habitId);
  }

  updateProperty(habitId: number, itemId: number, propertyId: number, body: PropertyUpdate): Observable<PropertyOut> {
    return this.write(
      this.http.put<PropertyOut>(`${this.baseUrl}/${habitId}/Items/${itemId}/Properties/${propertyId}`, body),
      habitId
    );
  }

  deleteProperty(habitId: number, itemId: number, propertyId: number): Observable<void> {
    return this.write(this.http.delete<void>(`${this.baseUrl}/${habitId}/Items/${itemId}/Properties/${propertyId}`), habitId);
  }

  // ── Criteria ──────────────────────────────────────────────────────────────
  addCriterion(habitId: number, body: CriterionCreateInWizard): Observable<CriterionOut> {
    return this.write(this.http.post<CriterionOut>(`${this.baseUrl}/${habitId}/Criteria`, body), habitId);
  }

  updateCriterion(
    habitId: number,
    criterionId: number,
    body: CriterionUpdate
  ): Observable<CriterionOut> {
    return this.write(this.http.put<CriterionOut>(`${this.baseUrl}/${habitId}/Criteria/${criterionId}`, body), habitId);
  }

  deleteCriterion(habitId: number, criterionId: number): Observable<void> {
    return this.write(this.http.delete<void>(`${this.baseUrl}/${habitId}/Criteria/${criterionId}`), habitId);
  }

  // ── Punches ───────────────────────────────────────────────────────────────
  createPunch(habitId: number, itemId: number, body: PunchCreate): Observable<PunchOut> {
    return this.write(this.http.post<PunchOut>(`${this.baseUrl}/${habitId}/Items/${itemId}/Punches`, body), habitId);
  }

  updatePunch(habitId: number, itemId: number, punchId: number, body: PunchUpdate): Observable<PunchOut> {
    return this.write(this.http.put<PunchOut>(`${this.baseUrl}/${habitId}/Items/${itemId}/Punches/${punchId}`, body), habitId);
  }

  deletePunch(habitId: number, itemId: number, punchId: number): Observable<void> {
    return this.write(this.http.delete<void>(`${this.baseUrl}/${habitId}/Items/${itemId}/Punches/${punchId}`), habitId);
  }

  // ── Shares: per-habit invitations (owner-managed) ─────────────────────────
  getShares(habitId: number): Observable<ShareGrant[]> {
    return this.handle(this.http.get<ShareGrant[]>(`${this.baseUrl}/${habitId}/Shares`));
  }

  /** Invite one user (immediate read-only grant). Names come from searchUsers. */
  addShare(habitId: number, granteeUserId: string, granteeUserName: string): Observable<ShareGrant> {
    return this.handle(
      this.http.post<ShareGrant>(`${this.baseUrl}/${habitId}/Shares`, { granteeUserId, granteeUserName })
    );
  }

  deleteShare(habitId: number, grantId: number): Observable<void> {
    return this.handle(this.http.delete<void>(`${this.baseUrl}/${habitId}/Shares/${grantId}`));
  }

  /**
   * User directory lookup served by ACIDSERVER (not this API) — the invitation picker
   * resolves a username substring to { userId, userName }. `authInterceptor` attaches
   * the UI's bearer token (audience api.knowledgebuilder) because the URL lives under
   * `environment.idServerUrl`.
   */
  searchUsers(query: string): Observable<UserSearchHit[]> {
    // Client-side mirror of acidserver's hard 1..50-char `q` limit (an over-long
    // query 400s with an UNMAPPED body; a blank one is pointless): trim first, then
    // truncate silently to 50 — a search box that refuses keystrokes would
    // surprise more than a quietly clamped query.
    const q = query.trim().slice(0, 50);
    if (q.length === 0) {
      return of<UserSearchHit[]>([]);
    }
    return this.handle(
      this.http.get<UserSearchHit[]>(`${environment.idServerUrl}/api/users/search`, { params: { q } })
    );
  }

  // ── "Shared with me" (read-only, cross-user) ──────────────────────────────
  getSharedHabits(): Observable<SharedHabitSummary[]> {
    return this.handle(this.http.get<SharedHabitSummary[]>(this.sharedBaseUrl));
  }

  getSharedHabit(id: number): Observable<SharedHabitDetail> {
    return this.handle(this.http.get<SharedHabitDetail>(`${this.sharedBaseUrl}/${id}`));
  }

  /** Same DayHistoryOut granularity the owner sees — full punch values included. */
  getSharedHistory(id: number, from?: string, to?: string): Observable<DayHistoryOut[]> {
    return this.handle(
      this.http.get<DayHistoryOut[]>(`${this.sharedBaseUrl}/${id}/History`, { params: this.rangeParams(from, to) })
    );
  }

  /**
   * A successful write: normalize errors like `handle()` does, then invalidate what
   * it could have changed. `habitId` is the habit the write targets — every mutation
   * below knows it, so no scope has to be guessed at the call site. The global scope
   * (the habit list, whose progress is server-derived) is bumped for every write; the
   * habit's own scope (items / criteria / punches / history) is bumped with it, since
   * e.g. a punch moves `item.hasPunches` and `property.todayValue`, and a criterion
   * edit moves the pass bits inside the day history.
   */
  private write<T>(obs: Observable<T>, habitId?: number): Observable<T> {
    return this.handle(obs).pipe(
      tap(() => {
        if (habitId !== undefined) {
          this.bump(HabitService.habitScope(habitId));
        }
        this.bump('global');
      })
    );
  }

  /**
   * Read through the cache: replay the stored payload when the scope has not been
   * written since, share one request between concurrent callers, and store the result
   * only if the scope's epoch is still the one the request started with. A failed read
   * is never cached, so a retry reaches the network.
   */
  private cachedRead<T>(name: string, scope: number | 'global', load: () => Observable<T>, force: boolean): Observable<T> {
    const scopeKey = scope === 'global' ? 'global' : HabitService.habitScope(scope);
    const key = `${scopeKey}|${name}`;

    if (force) {
      this.cache.delete(key);
      this.requests.delete(key);
    } else {
      const hit = this.cache.get(key);
      if (hit && hit.epoch === (this.epochs.get(scopeKey) ?? 0)) {
        return of(hit.value as T);
      }
      const inflight = this.requests.get(key);
      if (inflight) {
        return inflight as Observable<T>;
      }
    }

    const epoch = this.epochs.get(scopeKey) ?? 0;
    const request = load().pipe(
      tap((value) => {
        if (epoch === (this.epochs.get(scopeKey) ?? 0)) {
          this.cache.set(key, { epoch, value });
        }
      }),
      finalize(() => {
        this.requests.delete(key);
      }),
      shareReplay({ bufferSize: 1, refCount: false })
    );
    this.requests.set(key, request);
    return request;
  }

  /** Retire a scope: bump its epoch and drop its entries and in-flight shares. */
  private bump(scopeKey: string): void {
    this.epochs.set(scopeKey, (this.epochs.get(scopeKey) ?? 0) + 1);
    const prefix = `${scopeKey}|`;
    for (const key of [...this.cache.keys()]) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
    for (const key of [...this.requests.keys()]) {
      if (key.startsWith(prefix)) {
        this.requests.delete(key);
      }
    }
  }

  private static habitScope(habitId: number): string {
    return `habit:${habitId}`;
  }

  private rangeParams(from?: string, to?: string): Record<string, string> {
    const params: Record<string, string> = {};
    if (from) {
      params['from'] = from;
    }
    if (to) {
      params['to'] = to;
    }
    return params;
  }

  /** Central error normalization: ProblemDetails { code, detail } → HabitApiError. */
  private handle<T>(obs: Observable<T>): Observable<T> {
    return obs.pipe(
      catchError((err: HttpErrorResponse) => {
        const body = err.error as { code?: string; detail?: string } | null;
        const code = body?.code;
        if (typeof code === 'string' && code.length > 0) {
          return throwError(() => new HabitApiError(code, body?.detail ?? '', err.status));
        }
        if (err.status === 0) {
          return throwError(() => new HabitApiError('networkError', '', 0));
        }
        return throwError(() => new HabitApiError('httpError', err.message ?? '', err.status));
      })
    );
  }
}
