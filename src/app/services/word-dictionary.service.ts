import { HttpClient, type HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, of, tap, type Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import type { WordDictionaryEntry } from '../interfaces';

/**
 * Client for aclearningutil's per-word dictionary API (Chinese definitions +
 * bilingual example sentences from words.db), consumed by the vocabulary
 * review session. The bearer token is attached by authInterceptor (it matches
 * environment.apiUrl). A 404 (word absent from the DB) and any HTTP failure
 * resolve to null so callers hide the sections quietly - the same degradation
 * story as AudioService's authenticated one-shot audio fetch.
 * Entries are cached for the session keyed by the lowercased word (the backend
 * lookup is case-insensitive). Successes and true 404 misses are cached - a
 * word simply absent from the DB stays hidden without refetching - but
 * transient failures (5xx / network / expired token) are NOT, so the next
 * visit retries.
 */
@Injectable({
  providedIn: 'root',
})
export class WordDictionaryService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/WordDictionary`;
  private readonly cache = new Map<string, WordDictionaryEntry | null>();

  /** The entry for `word`, or null when it is blank or has no data. */
  getWord(word: string): Observable<WordDictionaryEntry | null> {
    const key = word.trim().toLowerCase();
    if (key.length === 0) {
      return of(null);
    }
    const cached = this.cache.get(key);
    if (cached !== undefined) {
      return of(cached);
    }
    // The lowercased key is sent: the DB route is NOCASE and a stable URL
    // maximizes hits in the browser's HTTP cache.
    return this.http.get<WordDictionaryEntry>(this.apiUrl, { params: { word: key } }).pipe(
      tap(entry => this.cache.set(key, entry)),
      catchError((err: HttpErrorResponse) => {
        if (err.status === 404) {
          this.cache.set(key, null);
        }
        return of(null);
      })
    );
  }
}
