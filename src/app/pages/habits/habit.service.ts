import type { HttpErrorResponse} from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { Observable} from 'rxjs';
import { of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

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
 */
@Injectable({ providedIn: 'root' })
export class HabitService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/Habits`;
  private readonly sharedBaseUrl = `${environment.apiUrl}/api/SharedHabits`;

  // ── Habits ────────────────────────────────────────────────────────────────
  getHabits(): Observable<Habit[]> {
    return this.handle(this.http.get<Habit[]>(this.baseUrl));
  }

  getHabit(id: number): Observable<Habit> {
    return this.handle(this.http.get<Habit>(`${this.baseUrl}/${id}`));
  }

  createHabit(body: HabitCreate): Observable<Habit> {
    return this.handle(this.http.post<Habit>(this.baseUrl, body));
  }

  updateHabit(id: number, body: HabitUpdate): Observable<Habit> {
    return this.handle(this.http.put<Habit>(`${this.baseUrl}/${id}`, body));
  }

  deactivateHabit(id: number): Observable<Habit> {
    return this.handle(this.http.post<Habit>(`${this.baseUrl}/${id}/Deactivate`, {}));
  }

  deleteHabit(id: number): Observable<void> {
    return this.handle(this.http.delete<void>(`${this.baseUrl}/${id}`));
  }

  getHistory(id: number, from?: string, to?: string): Observable<DayHistoryOut[]> {
    return this.handle(this.http.get<DayHistoryOut[]>(`${this.baseUrl}/${id}/History`, { params: this.rangeParams(from, to) }));
  }

  /**
   * Habit-scoped flat punch list (calendar page) — optional `from`/`to` day bounds,
   * ordered by punchDate desc then punchedAt desc.
   */
  getHabitPunches(habitId: number, from?: string, to?: string): Observable<PunchOut[]> {
    return this.handle(this.http.get<PunchOut[]>(`${this.baseUrl}/${habitId}/Punches`, { params: this.rangeParams(from, to) }));
  }

  // ── Items & properties ────────────────────────────────────────────────────
  getItems(habitId: number): Observable<HabitItem[]> {
    return this.handle(this.http.get<HabitItem[]>(`${this.baseUrl}/${habitId}/Items`));
  }

  addItem(habitId: number, body: ItemCreate): Observable<HabitItem> {
    return this.handle(this.http.post<HabitItem>(`${this.baseUrl}/${habitId}/Items`, body));
  }

  updateItem(habitId: number, itemId: number, body: ItemUpdate): Observable<HabitItem> {
    return this.handle(this.http.put<HabitItem>(`${this.baseUrl}/${habitId}/Items/${itemId}`, body));
  }

  deleteItem(habitId: number, itemId: number): Observable<void> {
    return this.handle(this.http.delete<void>(`${this.baseUrl}/${habitId}/Items/${itemId}`));
  }

  addProperty(habitId: number, itemId: number, body: PropertyCreate): Observable<PropertyOut> {
    return this.handle(this.http.post<PropertyOut>(`${this.baseUrl}/${habitId}/Items/${itemId}/Properties`, body));
  }

  updateProperty(habitId: number, itemId: number, propertyId: number, body: PropertyUpdate): Observable<PropertyOut> {
    return this.handle(
      this.http.put<PropertyOut>(`${this.baseUrl}/${habitId}/Items/${itemId}/Properties/${propertyId}`, body)
    );
  }

  deleteProperty(habitId: number, itemId: number, propertyId: number): Observable<void> {
    return this.handle(this.http.delete<void>(`${this.baseUrl}/${habitId}/Items/${itemId}/Properties/${propertyId}`));
  }

  // ── Criteria ──────────────────────────────────────────────────────────────
  getCriteria(habitId: number): Observable<CriterionOut[]> {
    return this.handle(this.http.get<CriterionOut[]>(`${this.baseUrl}/${habitId}/Criteria`));
  }

  addCriterion(habitId: number, body: CriterionCreateInWizard): Observable<CriterionOut> {
    return this.handle(this.http.post<CriterionOut>(`${this.baseUrl}/${habitId}/Criteria`, body));
  }

  updateCriterion(
    habitId: number,
    criterionId: number,
    body: CriterionUpdate
  ): Observable<CriterionOut> {
    return this.handle(this.http.put<CriterionOut>(`${this.baseUrl}/${habitId}/Criteria/${criterionId}`, body));
  }

  deleteCriterion(habitId: number, criterionId: number): Observable<void> {
    return this.handle(this.http.delete<void>(`${this.baseUrl}/${habitId}/Criteria/${criterionId}`));
  }

  // ── Punches ───────────────────────────────────────────────────────────────
  createPunch(habitId: number, itemId: number, body: PunchCreate): Observable<PunchOut> {
    return this.handle(this.http.post<PunchOut>(`${this.baseUrl}/${habitId}/Items/${itemId}/Punches`, body));
  }

  updatePunch(habitId: number, itemId: number, punchId: number, body: PunchUpdate): Observable<PunchOut> {
    return this.handle(this.http.put<PunchOut>(`${this.baseUrl}/${habitId}/Items/${itemId}/Punches/${punchId}`, body));
  }

  deletePunch(habitId: number, itemId: number, punchId: number): Observable<void> {
    return this.handle(this.http.delete<void>(`${this.baseUrl}/${habitId}/Items/${itemId}/Punches/${punchId}`));
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
