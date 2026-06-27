import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import type { UserLearningRating } from '../interfaces';

import { LearningRatingService } from './learning-rating.service';

const API_URL = 'https://localhost:7135/api/UserLearningRatings';
const CONTENT_ID = 1;
const ITEM_ID = 10;

const mockRatings: UserLearningRating[] = [
  { id: 100, contentId: CONTENT_ID, itemId: ITEM_ID, rating: 3 },
  { id: 101, contentId: CONTENT_ID, itemId: 11, rating: 5 },
];

describe('LearningRatingService', () => {
  let service: LearningRatingService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        LearningRatingService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(LearningRatingService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getRatings', () => {
    it('should fetch ratings from the API when not cached', () => {
      service.getRatings(CONTENT_ID).subscribe(ratings => {
        expect(ratings).toEqual(mockRatings);
      });

      httpMock.expectOne(`${API_URL}?contentId=${CONTENT_ID}`).flush(mockRatings);
    });

    it('should return cached ratings on subsequent calls', () => {
      // First call hits the API
      service.getRatings(CONTENT_ID).subscribe();
      httpMock.expectOne(`${API_URL}?contentId=${CONTENT_ID}`).flush(mockRatings);

      // Second call returns from cache — no HTTP request expected
      service.getRatings(CONTENT_ID).subscribe(ratings => {
        expect(ratings).toEqual(mockRatings);
      });
    });

    it('should filter by itemId from cache', () => {
      // Populate the cache
      service.getRatings(CONTENT_ID).subscribe();
      httpMock.expectOne(`${API_URL}?contentId=${CONTENT_ID}`).flush(mockRatings);

      // Filtered call should come from cache
      service.getRatings(CONTENT_ID, ITEM_ID).subscribe(ratings => {
        expect(ratings.length).toBe(1);
        expect(ratings[0].itemId).toBe(ITEM_ID);
      });
    });

    it('should not cache single-item fetches (with itemId)', () => {
      // Fetching with itemId should NOT populate the full-list cache
      service.getRatings(CONTENT_ID, ITEM_ID).subscribe();
      httpMock.expectOne(`${API_URL}?contentId=${CONTENT_ID}&itemId=${ITEM_ID}`).flush([mockRatings[0]]);

      // Full-list fetch should still hit the API
      service.getRatings(CONTENT_ID).subscribe();
      httpMock.expectOne(`${API_URL}?contentId=${CONTENT_ID}`).flush(mockRatings);
    });
  });

  describe('createRating', () => {
    it('should add created rating to the cache', () => {
      // Populate cache first
      service.getRatings(CONTENT_ID).subscribe();
      httpMock.expectOne(`${API_URL}?contentId=${CONTENT_ID}`).flush(mockRatings);

      const newRating: UserLearningRating = { id: 102, contentId: CONTENT_ID, itemId: 12, rating: 4 };
      service.createRating(newRating).subscribe();
      httpMock.expectOne(API_URL).flush(newRating);

      // Verify the new rating is in the cache
      service.getRatings(CONTENT_ID).subscribe(ratings => {
        expect(ratings.length).toBe(3);
        expect(ratings.find(r => r.id === 102)).toBeDefined();
      });
    });
  });

  describe('updateRating', () => {
    it('should update the cached rating', () => {
      // Populate cache
      service.getRatings(CONTENT_ID).subscribe();
      httpMock.expectOne(`${API_URL}?contentId=${CONTENT_ID}`).flush(mockRatings);

      // Update existing rating
      service.updateRating(100, { contentId: CONTENT_ID, itemId: ITEM_ID, rating: 1 }).subscribe();
      httpMock.expectOne(`${API_URL}/100`).flush(null);

      // Verify cache reflects the update
      service.getRatings(CONTENT_ID).subscribe(ratings => {
        expect(ratings.find(r => r.id === 100)!.rating).toBe(1);
      });
    });
  });

  describe('upsertRating', () => {
    it('should update existing rating and reflect in cache', () => {
      // Populate cache
      service.getRatings(CONTENT_ID).subscribe();
      httpMock.expectOne(`${API_URL}?contentId=${CONTENT_ID}`).flush(mockRatings);

      service.upsertRating(CONTENT_ID, ITEM_ID, 4).subscribe(saved => {
        expect(saved.rating).toBe(4);
      });
      // upsertRating calls getRatings(contentId, itemId) which hits cache (no HTTP)
      // then calls updateRating since item exists
      httpMock.expectOne(`${API_URL}/100`).flush(null);

      // Verify cache
      service.getRatings(CONTENT_ID).subscribe(ratings => {
        expect(ratings.find(r => r.itemId === ITEM_ID)!.rating).toBe(4);
      });
    });

    it('should create new rating and add to cache', () => {
      // Populate cache with empty list
      service.getRatings(CONTENT_ID).subscribe();
      httpMock.expectOne(`${API_URL}?contentId=${CONTENT_ID}`).flush([]);

      const newRating: UserLearningRating = { id: 200, contentId: CONTENT_ID, itemId: ITEM_ID, rating: 5 };
      service.upsertRating(CONTENT_ID, ITEM_ID, 5).subscribe();
      // getRatings(contentId, itemId) hits cache (empty) — no HTTP
      // createRating is called
      httpMock.expectOne(API_URL).flush(newRating);

      // Verify cache now contains the new rating
      service.getRatings(CONTENT_ID).subscribe(ratings => {
        expect(ratings.length).toBe(1);
        expect(ratings[0].itemId).toBe(ITEM_ID);
      });
    });
  });

  describe('clearCache', () => {
    it('should clear cache for specific contentId', () => {
      service.getRatings(CONTENT_ID).subscribe();
      httpMock.expectOne(`${API_URL}?contentId=${CONTENT_ID}`).flush(mockRatings);

      service.clearCache(CONTENT_ID);

      // Should hit the API again
      service.getRatings(CONTENT_ID).subscribe();
      httpMock.expectOne(`${API_URL}?contentId=${CONTENT_ID}`).flush(mockRatings);
    });

    it('should clear all caches when no contentId provided', () => {
      service.getRatings(CONTENT_ID).subscribe();
      httpMock.expectOne(`${API_URL}?contentId=${CONTENT_ID}`).flush(mockRatings);

      const otherContentId = 2;
      service.getRatings(otherContentId).subscribe();
      httpMock.expectOne(`${API_URL}?contentId=${otherContentId}`).flush([]);

      service.clearCache();

      // Both should hit API again
      service.getRatings(CONTENT_ID).subscribe();
      httpMock.expectOne(`${API_URL}?contentId=${CONTENT_ID}`).flush(mockRatings);
      service.getRatings(otherContentId).subscribe();
      httpMock.expectOne(`${API_URL}?contentId=${otherContentId}`).flush([]);
    });
  });
});
