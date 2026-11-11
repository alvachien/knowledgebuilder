import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';

import { environment } from '../../environments/environment';
import type { LearningTimeLeaderboardEntry } from '../interfaces';
import { UserAuthInfo } from '../interfaces';

import { AuthService } from './auth.service';
import { UserLearningTimeService } from './user-learning-time.service';

describe('UserLearningTimeService', () => {
  let service: UserLearningTimeService;
  let httpMock: HttpTestingController;
  let mockRouter: { events: Subject<unknown>; url: string };
  let mockAuth: { authContent: BehaviorSubject<UserAuthInfo> };

  const beatUrl = `${environment.apiUrl}/api/UserLearningTimes`;

  beforeEach(() => {
    mockRouter = { events: new Subject<unknown>(), url: '/help' };
    mockAuth = { authContent: new BehaviorSubject<UserAuthInfo>(new UserAuthInfo()) };

    TestBed.configureTestingModule({
      providers: [
        UserLearningTimeService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: mockRouter },
        { provide: AuthService, useValue: mockAuth },
      ],
    });
    service = TestBed.inject(UserLearningTimeService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    TestBed.resetTestingModule();
  });

  function navigate(url: string): void {
    mockRouter.url = url;
    mockRouter.events.next(new NavigationEnd(1, url, url));
  }

  function authorize(): void {
    mockAuth.authContent.next(UserAuthInfo.createAuthenticated({ userId: 'u1' }));
  }

  describe('route → category mapping', () => {
    it('maps every exercise route to its LearningContentCategory id', () => {
      const cases: [string, number][] = [
        ['/vocabulary', 1],
        ['/translating', 2],
        ['/listening', 3],
        ['/chinese', 4],
        ['/formula', 5],
        // Child routes count too: the segment is what identifies the page.
        ['/knowledge/display', 6],
      ];
      for (const [url, expected] of cases) {
        navigate(url);
        expect(service.category()).toBe(expected);
      }
    });

    it('drops tracking (category 0) on non-exercise routes', () => {
      navigate('/vocabulary');
      expect(service.category()).toBe(1);

      navigate('/help');
      expect(service.category()).toBe(0);
    });

    it('picks the category up at construction for a deep link', () => {
      TestBed.resetTestingModule();
      mockRouter = { events: new Subject<unknown>(), url: '/listening' };
      TestBed.configureTestingModule({
        providers: [
          UserLearningTimeService,
          provideHttpClient(),
          provideHttpClientTesting(),
          { provide: Router, useValue: mockRouter },
          { provide: AuthService, useValue: mockAuth },
        ],
      });
      service = TestBed.inject(UserLearningTimeService);
      httpMock = TestBed.inject(HttpTestingController);

      expect(service.category()).toBe(3);
    });
  });

  describe('beat eligibility', () => {
    it('does not beat when signed out', () => {
      navigate('/vocabulary');

      service.beatIfEligible();

      httpMock.expectNone(beatUrl);
    });

    it('does not beat off an exercise page', () => {
      authorize();
      navigate('/help');

      service.beatIfEligible();

      httpMock.expectNone(beatUrl);
    });

    it('does not beat while the document is hidden', () => {
      authorize();
      navigate('/vocabulary');
      try {
        Object.defineProperty(document, 'visibilityState', {
          configurable: true,
          get: () => 'hidden',
        });

        service.beatIfEligible();
        httpMock.expectNone(beatUrl);
      } finally {
        // The own property shadows Document.prototype's getter; deleting it back
        // restores 'visible' for every later test even if an assertion threw.
        delete (document as unknown as { visibilityState?: unknown }).visibilityState;
      }

      service.beatIfEligible();
      httpMock.expectOne(beatUrl).flush({});
    });

    it('beats POSTing only the category (seconds are the server\'s to decide)', () => {
      authorize();
      navigate('/vocabulary');

      service.beatIfEligible();

      const req = httpMock.expectOne(beatUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ categoryId: 1 });
      req.flush({});
    });

    it('sends the signed-in display name so the leaderboard can label beats', () => {
      mockAuth.authContent.next(
        UserAuthInfo.createAuthenticated({ userId: 'u1', userName: 'Alva Chen' })
      );
      navigate('/vocabulary');

      service.beatIfEligible();

      const req = httpMock.expectOne(beatUrl);
      expect(req.request.body).toEqual({ categoryId: 1, userName: 'Alva Chen' });
      req.flush({});
    });

    it('stops beating after the idle window and resumes on activity', () => {
      vi.useFakeTimers();
      try {
        authorize();
        navigate('/vocabulary');

        service.beatIfEligible();
        httpMock.expectOne(beatUrl).flush({});

        // 121s without any interaction: past the 120s idle limit.
        vi.advanceTimersByTime(121_000);
        service.beatIfEligible();
        httpMock.expectNone(beatUrl);
        expect(service.isTracking()).toBe(false);

        // A keystroke re-opens the window.
        document.dispatchEvent(new KeyboardEvent('keydown'));
        service.beatIfEligible();
        httpMock.expectOne(beatUrl).flush({});
        expect(service.isTracking()).toBe(true);
      } finally {
        vi.useRealTimers();
      }
    });

    it('auto-play word changes count as activity through markActivity', () => {
      vi.useFakeTimers();
      try {
        authorize();
        navigate('/vocabulary');
        vi.advanceTimersByTime(119_000);
        expect(service.isTracking()).toBe(true);

        vi.advanceTimersByTime(2_000);
        expect(service.isTracking()).toBe(false);

        service.markActivity();
        expect(service.isTracking()).toBe(true);
      } finally {
        vi.useRealTimers();
      }
    });

    it('a failed beat is swallowed (it only loses its own minute)', () => {
      authorize();
      navigate('/vocabulary');

      service.beatIfEligible();
      httpMock
        .expectOne(beatUrl)
        .error(new ErrorEvent('network'), { status: 401, statusText: 'Unauthorized' });

      // And a later beat can still be sent.
      service.beatIfEligible();
      httpMock.expectOne(beatUrl).flush({});
    });
  });

  describe('getLeaderboard', () => {
    it('GETs the Leaderboard route with window and top params', () => {
      let rows: LearningTimeLeaderboardEntry[] | undefined;
      service.getLeaderboard(30, 5).subscribe(r => (rows = r));

      const req = httpMock.expectOne(
        r =>
          r.url === `${beatUrl}/Leaderboard` &&
          r.params.get('window') === '30' &&
          r.params.get('top') === '5'
      );
      expect(req.request.method).toBe('GET');
      req.flush([{ userId: 'u1', userName: 'Alva', totalSeconds: 60 }]);
      expect(rows).toEqual([{ userId: 'u1', userName: 'Alva', totalSeconds: 60 }]);
    });

    it('defaults top to 3', () => {
      service.getLeaderboard(7).subscribe();

      httpMock
        .expectOne(
          r =>
            r.url === `${beatUrl}/Leaderboard` &&
            r.params.get('window') === '7' &&
            r.params.get('top') === '3'
        )
        .flush([]);
    });
  });

  describe('preferences', () => {
    it('getPreferences GETs the Preferences route', () => {
      let prefs: { leaderboardOptOut: boolean } | undefined;
      service.getPreferences().subscribe(p => (prefs = p));

      httpMock
        .expectOne(r => r.url === `${beatUrl}/Preferences` && r.method === 'GET')
        .flush({ leaderboardOptOut: true });
      expect(prefs).toEqual({ leaderboardOptOut: true });
    });

    it('savePreferences PUTs the value and echoes the stored choice', () => {
      let prefs: { leaderboardOptOut: boolean } | undefined;
      service.savePreferences(true).subscribe(p => (prefs = p));

      const req = httpMock.expectOne(
        r => r.url === `${beatUrl}/Preferences` && r.method === 'PUT'
      );
      expect(req.request.body).toEqual({ leaderboardOptOut: true });
      req.flush({ leaderboardOptOut: true });
      expect(prefs).toEqual({ leaderboardOptOut: true });
    });
  });

  describe('getMy', () => {
    it('omits params when no window is given', () => {
      const seen: string[] = [];
      service.getMy().subscribe(rows => seen.push(String(rows.length)));

      const req = httpMock.expectOne(
        r => r.url === beatUrl && r.params.keys().length === 0
      );
      expect(req.request.method).toBe('GET');
      req.flush([]);
      expect(seen).toEqual(['0']);
    });

    it('passes from, to and categoryId through', () => {
      service.getMy('2026-09-25', '2026-10-25', 3).subscribe();

      const req = httpMock.expectOne(
        r =>
          r.url === beatUrl &&
          r.params.get('from') === '2026-09-25' &&
          r.params.get('to') === '2026-10-25' &&
          r.params.get('categoryId') === '3'
      );
      req.flush([]);
    });

    it('omits only the categoryId when it is 0/undefined', () => {
      service.getMy(undefined, undefined, 0).subscribe();

      const req = httpMock.expectOne(
        r => r.url === beatUrl && r.params.keys().length === 0
      );
      req.flush([]);
    });
  });
});
