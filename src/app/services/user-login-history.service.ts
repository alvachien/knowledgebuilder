import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import type { UserLoginHistory } from '../interfaces';

/**
 * Client for aclearningutil's per-day login history API. The bearer token is attached
 * by authInterceptor (it matches environment.apiUrl). recordLogin() is called once when
 * an OIDC sign-in completes; the backend upserts (user, today) idempotently, so a
 * duplicate call only bumps that day's count.
 */
@Injectable({
  providedIn: 'root',
})
export class UserLoginHistoryService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/UserLoginHistories`;

  recordLogin(): Observable<UserLoginHistory> {
    // The endpoint takes no body payload (user from the token, clock from the server);
    // the empty object is just the placeholder body HttpClient requires for POST.
    return this.http.post<UserLoginHistory>(this.apiUrl, {});
  }

  /** Own rows, newest first; omit both to get the server default (trailing 90 days). */
  getHistory(from?: string, to?: string): Observable<UserLoginHistory[]> {
    const params: Record<string, string> = {};
    if (from) {
      params['from'] = from;
    }
    if (to) {
      params['to'] = to;
    }
    return this.http.get<UserLoginHistory[]>(this.apiUrl, { params });
  }
}
