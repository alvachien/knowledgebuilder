import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslocoModule, TranslocoService, TRANSLOCO_TRANSPILER } from '@jsverse/transloco';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { vi } from 'vitest';

import type { UserLearningTime, UserLoginHistory } from '../../interfaces';
import { UserAuthInfo } from '../../interfaces';
import { AuthService, UserLearningTimeService, UserLoginHistoryService } from '../../services';

import { UserDetailComponent } from './user-detail.component';

describe('UserDetailComponent', () => {
  let component: UserDetailComponent;
  let fixture: ComponentFixture<UserDetailComponent>;
  let mockAuthService: {
    authContent: BehaviorSubject<UserAuthInfo>;
    doLogout: ReturnType<typeof vi.fn>;
  };
  let mockRouter: { navigate: ReturnType<typeof vi.fn> };
  let mockLoginHistoryService: { getHistory: ReturnType<typeof vi.fn> };
  let mockLearningTimeService: {
    getMy: ReturnType<typeof vi.fn>;
    getPreferences: ReturnType<typeof vi.fn>;
    savePreferences: ReturnType<typeof vi.fn>;
  };

  /** Server-side window default rows (dates in the past, so no today/week totals). */
  const learningRows: UserLearningTime[] = [
    { learnDate: '2026-10-05', categoryId: 1, learningSeconds: 300, lastBeatAt: '2026-10-05T09:00:00Z' },
    { learnDate: '2026-10-05', categoryId: 3, learningSeconds: 120, lastBeatAt: '2026-10-05T09:30:00Z' },
    { learnDate: '2026-10-02', categoryId: 6, learningSeconds: 60, lastBeatAt: '2026-10-02T10:00:00Z' },
  ];

  /** The server-local day key for a Date, mirroring the component's helper. */
  function dayKey(d: Date): string {
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${m}-${day}`;
  }

  const historyRows: UserLoginHistory[] = [
    {
      loginDate: '2026-10-05',
      firstLoginAt: '2026-10-05T01:00:00Z',
      lastLoginAt: '2026-10-05T08:30:00Z',
      loginCount: 2,
    },
    {
      loginDate: '2026-10-04',
      firstLoginAt: '2026-10-04T00:15:00Z',
      lastLoginAt: '2026-10-04T00:15:00Z',
      loginCount: 1,
    },
  ];

  const createMockTranslocoService = () => ({
    setActiveLang: vi.fn(),
    getActiveLang: vi.fn(),
    selectTranslate: vi.fn().mockReturnValue(of('')),
    _loadDependencies: vi.fn().mockReturnValue(of(null)),
    translate: vi.fn().mockReturnValue(''),
    activeLang: 'en',
    config: { reRenderOnLangChange: true, prodMode: false },
    langChanges$: of('en'),
    events$: of(),
  });

  beforeEach(async () => {
    mockAuthService = {
      authContent: new BehaviorSubject<UserAuthInfo>(
        UserAuthInfo.createAuthenticated({
          userId: 'test-user-id',
          userName: 'Test User',
          accessToken: 'test-token',
        })
      ),
      doLogout: vi.fn(),
    };
    mockRouter = { navigate: vi.fn() };
    mockLoginHistoryService = { getHistory: vi.fn().mockReturnValue(of(historyRows)) };
    mockLearningTimeService = {
      getMy: vi.fn().mockReturnValue(of(learningRows)),
      getPreferences: vi.fn().mockReturnValue(of({ leaderboardOptOut: false })),
      savePreferences: vi.fn().mockImplementation((v: boolean) =>
        of({ leaderboardOptOut: v })),
    };

    await TestBed.configureTestingModule({
      imports: [
        UserDetailComponent,
        MatButtonModule,
        MatCardModule,
        MatIconModule,
        NoopAnimationsModule,
        RouterTestingModule,
        TranslocoModule,
      ],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: UserLoginHistoryService, useValue: mockLoginHistoryService },
        { provide: UserLearningTimeService, useValue: mockLearningTimeService },
        { provide: TranslocoService, useValue: createMockTranslocoService() },
        { provide: TRANSLOCO_TRANSPILER, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should subscribe to authContent and set userId', () => {
      fixture.detectChanges();

      expect(component.userId).toBe('test-user-id');
    });

    it('should subscribe to authContent and set userName', () => {
      fixture.detectChanges();

      expect(component.userName).toBe('Test User');
    });

    it('should update values when authContent changes', () => {
      fixture.detectChanges();
      expect(component.userId).toBe('test-user-id');

      mockAuthService.authContent.next(
        UserAuthInfo.createAuthenticated({
          userId: 'new-user-id',
          userName: 'New User',
          accessToken: 'new-token',
        })
      );

      expect(component.userId).toBe('new-user-id');
      expect(component.userName).toBe('New User');
    });
  });

  describe('onLogout', () => {
    it('should call authService.doLogout()', () => {
      fixture.detectChanges();

      component.onLogout();

      expect(mockAuthService.doLogout).toHaveBeenCalled();
    });

    it('should navigate to home after logout', () => {
      fixture.detectChanges();

      component.onLogout();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
    });
  });

  describe('ngOnDestroy', () => {
    it('should unsubscribe from authContent subscription', () => {
      fixture.detectChanges();

      const destroySpy = vi.spyOn(component['destroy$'], 'next');
      const completeSpy = vi.spyOn(component['destroy$'], 'complete');

      component.ngOnDestroy();

      expect(destroySpy).toHaveBeenCalledWith(true);
      expect(completeSpy).toHaveBeenCalled();
    });
  });

  describe('template', () => {
    it('should display user ID', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      const content = compiled.textContent;

      expect(content).toContain('test-user-id');
    });

    it('should display user name', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      const content = compiled.textContent;

      expect(content).toContain('Test User');
    });

    it('should have a logout button', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      const button = compiled.querySelector('button[color="warn"]');

      expect(button).toBeTruthy();
    });
  });

  describe('login history', () => {
    it('should load the default-window history on init', () => {
      fixture.detectChanges();

      expect(mockLoginHistoryService.getHistory).toHaveBeenCalled();
      expect(component.history).toEqual(historyRows);
      expect(component.historyLoading).toBe(false);
    });

    it('should render one table row per day with date and login count', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      const rows = compiled.querySelectorAll('.login-history-table tbody tr');

      expect(rows.length).toBe(2);
      expect(rows[0].textContent).toContain('2026-10-05');
      expect(rows[0].textContent).toContain('2');
      expect(rows[1].textContent).toContain('2026-10-04');
    });

    it('should show the empty state when there are no records', () => {
      mockLoginHistoryService.getHistory.mockReturnValue(of([]));
      fixture.detectChanges();
      const compiled = fixture.nativeElement;

      expect(compiled.querySelector('.login-history-table')).toBeNull();
      expect(compiled.querySelector('.login-history-empty')).toBeTruthy();
    });

    it('should show the empty state (not a stuck spinner) when loading fails', () => {
      mockLoginHistoryService.getHistory.mockReturnValue(throwError(() => new Error('HTTP 500')));
      fixture.detectChanges();
      const compiled = fixture.nativeElement;

      expect(component.historyLoading).toBe(false);
      expect(compiled.querySelector('.login-history-empty')).toBeTruthy();
    });
  });

  describe('learning time', () => {
    it('should load the default-window rows and map category ids to label keys', () => {
      fixture.detectChanges();

      expect(mockLearningTimeService.getMy).toHaveBeenCalled();
      expect(component.learningLoading).toBe(false);
      // Seconds -> minutes, ids -> existing nav label keys, in server order.
      expect(component.learningRows).toEqual([
        { learnDate: '2026-10-05', categoryKey: 'vocabulary', minutes: 5 },
        { learnDate: '2026-10-05', categoryKey: 'listening', minutes: 2 },
        { learnDate: '2026-10-02', categoryKey: 'knowledge_bank', minutes: 1 },
      ]);
      // Past-dated rows leave the today/week summaries at zero.
      expect(component.todayMinutes).toBe(0);
      expect(component.weekMinutes).toBe(0);
    });

    it('should render one table row per (day, category)', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      const rows = compiled.querySelectorAll('.learning-time-table tbody tr');

      expect(rows.length).toBe(3);
      expect(rows[0].textContent).toContain('2026-10-05');
      expect(rows[0].textContent).toContain('5');
    });

    it('should total today and the last 7 days from live-dated rows', () => {
      const today = dayKey(new Date());
      const fiveDaysAgo = dayKey(new Date(Date.now() - 5 * 24 * 3600 * 1000));
      const outsideWeek = dayKey(new Date(Date.now() - 40 * 24 * 3600 * 1000));
      mockLearningTimeService.getMy.mockReturnValue(
        of([
          { learnDate: today, categoryId: 1, learningSeconds: 300, lastBeatAt: '' },
          { learnDate: today, categoryId: 3, learningSeconds: 120, lastBeatAt: '' },
          { learnDate: fiveDaysAgo, categoryId: 1, learningSeconds: 360, lastBeatAt: '' },
          { learnDate: outsideWeek, categoryId: 1, learningSeconds: 600, lastBeatAt: '' },
        ])
      );

      fixture.detectChanges();

      // Today: 420s -> 7 min. Week (>= today-6d): 780s -> 13 min.
      expect(component.todayMinutes).toBe(7);
      expect(component.weekMinutes).toBe(13);
    });

    it('should show the empty state when there are no learning rows', () => {
      mockLearningTimeService.getMy.mockReturnValue(of([]));
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      const card = compiled.querySelector('.learning-time-card');

      expect(card).toBeTruthy();
      expect(card.querySelector('.learning-time-table')).toBeNull();
      expect(card.querySelector('.login-history-empty')).toBeTruthy();
    });

    it('should show the empty state (not a stuck spinner) when loading fails', () => {
      mockLearningTimeService.getMy.mockReturnValue(throwError(() => new Error('HTTP 500')));
      fixture.detectChanges();
      const compiled = fixture.nativeElement;

      expect(component.learningLoading).toBe(false);
      expect(compiled.querySelector('.learning-time-card .login-history-empty')).toBeTruthy();
    });

    describe('leaderboard opt-out', () => {
      it('should load the stored preference into the checkbox', () => {
        mockLearningTimeService.getPreferences.mockReturnValue(of({ leaderboardOptOut: true }));

        fixture.detectChanges();

        // The switch renders in the card and the loaded value reaches the
        // bound state (the native input's checked flag is Material-internal
        // and settles a tick later — asserted via the model, not the DOM).
        expect(
          fixture.nativeElement.querySelector('.learning-time-optout input[type="checkbox"]')
        ).toBeTruthy();
        expect(component.leaderboardOptOut).toBe(true);
      });

      it('should default to visible when the preference load fails', () => {
        mockLearningTimeService.getPreferences.mockReturnValue(
          throwError(() => new Error('HTTP 500'))
        );

        fixture.detectChanges();

        expect(component.leaderboardOptOut).toBe(false);
      });

      it('should persist a toggle through savePreferences', () => {
        fixture.detectChanges();

        component.onLeaderboardOptOutChange(true);

        expect(mockLearningTimeService.savePreferences).toHaveBeenCalledWith(true);
        expect(component.leaderboardOptOut).toBe(true);
      });

      it('should revert the checkbox when saving fails', () => {
        fixture.detectChanges();
        mockLearningTimeService.savePreferences.mockReturnValue(
          throwError(() => new Error('HTTP 500'))
        );

        component.onLeaderboardOptOutChange(true);

        expect(mockLearningTimeService.savePreferences).toHaveBeenCalledWith(true);
        expect(component.leaderboardOptOut).toBe(false);
      });
    });
  });
});
