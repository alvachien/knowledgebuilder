import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of, switchMap, take, tap } from 'rxjs';

import { environment } from '../../environments/environment';

import type { UserLearningRating } from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class LearningRatingService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/UserLearningRatings`;
  private ratingCache = new Map<number, UserLearningRating[]>();

  getRatings(contentId: number, itemId?: number): Observable<UserLearningRating[]> {
    const cached = this.ratingCache.get(contentId);
    if (cached) {
      const result = itemId !== undefined ? cached.filter(r => r.itemId === itemId) : cached;
      return of(result);
    }

    let url = `${this.apiUrl}?contentId=${contentId}`;
    if (itemId !== undefined) {
      url += `&itemId=${itemId}`;
    }
    return this.http.get<UserLearningRating[]>(url).pipe(
      tap(ratings => {
        if (itemId === undefined) {
          // Cache the full list when fetching all ratings for a content
          this.ratingCache.set(contentId, ratings);
        }
      }),
    );
  }

  createRating(rating: UserLearningRating): Observable<UserLearningRating> {
    return this.http.post<UserLearningRating>(this.apiUrl, rating).pipe(
      tap(saved => {
        if (saved.contentId) {
          this.addOrUpdateInCache(saved.contentId, saved);
        }
      }),
    );
  }

  updateRating(id: number, rating: UserLearningRating): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, rating).pipe(
      tap(() => {
        if (rating.contentId) {
          this.addOrUpdateInCache(rating.contentId, { ...rating, id });
        }
      }),
    );
  }

  upsertRating(contentId: number, itemId: number, rating: number): Observable<UserLearningRating> {
    return this.getRatings(contentId, itemId).pipe(
      take(1),
      switchMap(existing => {
        if (existing.length > 0) {
          const record = existing[0];
          return this.updateRating(record.id!, {
            contentId,
            itemId,
            rating,
            scoreDate: record.scoreDate,
          }).pipe(
            switchMap(() => [{ ...record, rating }] as UserLearningRating[]),
          );
        }
        return this.createRating({ contentId, itemId, rating });
      }),
    );
  }

  clearCache(contentId?: number): void {
    if (contentId !== undefined) {
      this.ratingCache.delete(contentId);
    } else {
      this.ratingCache.clear();
    }
  }

  private addOrUpdateInCache(contentId: number, rating: UserLearningRating): void {
    const cached = this.ratingCache.get(contentId);
    if (!cached) {
      this.ratingCache.set(contentId, [rating]);
      return;
    }

    const idx = cached.findIndex(r => r.id === rating.id);
    if (idx >= 0) {
      cached[idx] = { ...cached[idx], ...rating };
    } else {
      cached.push(rating);
    }
  }
}
