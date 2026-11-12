import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { Title } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslocoModule, TranslocoService, TRANSLOCO_TRANSPILER } from '@jsverse/transloco';
import { differenceInDays } from 'date-fns';
import { BehaviorSubject, of } from 'rxjs';
import { vi } from 'vitest';

import type { LearningTimeLeaderboardEntry } from '../../interfaces';
import { UserAuthInfo } from '../../interfaces';
import { AuthService, UserLearningTimeService } from '../../services';
import { NavigationFocusDirective } from '../../shared/navigation-focus/navigation-focus';
import { AppPageTitle } from '../page-title/page-title';

import { HomepageComponent } from './homepage';

// Stub class for the AppPageTitle service
class MockAppPageTitle {
  _title = '';
  _originalTitle = 'Knowledge Habit Builder';

  get title(): string {
    return this._title;
  }

  set title(title: string) {
    this._title = title;
  }
}

describe('HomepageComponent', () => {
  let component: HomepageComponent;
  let fixture: ComponentFixture<HomepageComponent>;
  let mockAuth: { authContent: BehaviorSubject<UserAuthInfo> };
  let mockLearningTime: { getLeaderboard: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    // Key-echoing stub (shape shared with navbar.spec) — the transloco pipe and
    // the *transloco directive need translate/_loadDependencies/langChanges$ in
    // addition to the service basics, because this suite now renders the template.
    const mockTranslocoService = {
      setActiveLang: vi.fn(),
      getActiveLang: vi.fn().mockReturnValue('en'),
      translate: vi.fn((key: string) => key),
      selectTranslate: vi.fn().mockReturnValue(of('')),
      _loadDependencies: vi.fn().mockReturnValue(of(null)),
      langChanges$: of('en'),
      events$: of(),
      activeLang: 'en',
      config: { reRenderOnLangChange: true, prodMode: false },
    };
    mockAuth = { authContent: new BehaviorSubject<UserAuthInfo>(new UserAuthInfo()) };
    mockLearningTime = { getLeaderboard: vi.fn().mockReturnValue(of([])) };

    await TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        RouterTestingModule,
        MatButtonModule,
        MatCardModule,
        MatDividerModule,
        MatIconModule,
        NavigationFocusDirective,
        TranslocoModule,
      ],
      providers: [
        { provide: Title, useValue: { setTitle: vi.fn() } },
        { provide: AppPageTitle, useClass: MockAppPageTitle },
        { provide: TranslocoService, useValue: mockTranslocoService },
        { provide: TRANSLOCO_TRANSPILER, useValue: {} },
        // Signed-out by default: the leaderboard section stays hidden exactly
        // like it does for anonymous visitors, so the existing template tests
        // keep their expectations.
        { provide: AuthService, useValue: mockAuth },
        { provide: UserLearningTimeService, useValue: mockLearningTime },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomepageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate daysleft1 correctly', () => {
    const today = new Date();
    const expectedDays = differenceInDays(new Date(2027, 4, 22), today);
    expect(component.daysleft1).toBe(expectedDays);
  });

  it('should calculate daysleft2 correctly', () => {
    const today = new Date();
    const expectedDays = differenceInDays(new Date(2028, 5, 15), today);
    expect(component.daysleft2).toBe(expectedDays);
  });

  it('should calculate daysleft3 correctly', () => {
    const today = new Date();
    const expectedDays = differenceInDays(new Date(2031, 5, 6), today);
    expect(component.daysleft3).toBe(expectedDays);
  });

  it('should set title to empty string on init', () => {
    const appPageTitle = TestBed.inject(AppPageTitle) as MockAppPageTitle;
    expect(appPageTitle.title).toBe(''); // Initially empty

    component.ngOnInit();

    expect(appPageTitle.title).toBe('');
  });

  it('should have correct host bindings', () => {
    expect(component.mainContentClass).toBe(true);
    expect(component.animationsDisabled).toBe(false);
  });

  describe('learning ledger grid', () => {
    it('renders all seven rows, incl. the Chinese entry linking /chinese', () => {
      fixture.detectChanges();
      const rows = Array.from(
        (fixture.nativeElement as HTMLElement).querySelectorAll('a.ledger-row')
      );
      // 6 study categories + habits streak row.
      expect(rows.length).toBe(7);
      const hrefs = rows.map((r) => r.getAttribute('href'));
      expect(hrefs).toEqual(['/vocabulary', '/translating', '/listening', '/chinese', '/formula', '/knowledge', '/habits']);
      const chineseRow = rows.find((r) => r.getAttribute('href') === '/chinese');
      expect(chineseRow?.textContent).toContain('chinese');
      // Key-echo transpiler: the reused `classical_literature` subtitle renders.
      expect(chineseRow?.textContent).toContain('classical_literature');
    });
  });

  describe('learning leaderboard', () => {
    const week: LearningTimeLeaderboardEntry[] = [
      { userId: 'u-1', userName: 'Alva', totalSeconds: 4320 }, // 1 h 12 m
      { userId: 'u-2', userName: 'Ben', totalSeconds: 600 },
    ];
    const month: LearningTimeLeaderboardEntry[] = [
      { userId: 'u-3', userName: 'Cara', totalSeconds: 7200 }, // 2 h
    ];

    /** Fresh component observing the mocks' current state (constructor subscribes). */
    function createSignedInFixture(): ComponentFixture<HomepageComponent> {
      mockAuth.authContent.next(UserAuthInfo.createAuthenticated({ userId: 'u-1' }));
      const f = TestBed.createComponent(HomepageComponent);
      f.detectChanges();
      return f;
    }

    it('is absent for anonymous visitors', () => {
      fixture.detectChanges();
      expect((fixture.nativeElement as HTMLElement).querySelector('.leaderboard-section')).toBeNull();
      expect(mockLearningTime.getLeaderboard).not.toHaveBeenCalled();
    });

    it('is absent while signed in but both windows are empty', () => {
      const f = createSignedInFixture();
      expect((f.nativeElement as HTMLElement).querySelector('.leaderboard-section')).toBeNull();
    });

    it('fetches both windows once, signed in', () => {
      createSignedInFixture();
      expect(mockLearningTime.getLeaderboard).toHaveBeenCalledWith(7);
      expect(mockLearningTime.getLeaderboard).toHaveBeenCalledWith(30);
    });

    it('renders names and formatted durations per column', () => {
      mockLearningTime.getLeaderboard.mockImplementation((w: number) =>
        of(w === 7 ? week : month)
      );
      const f = createSignedInFixture();
      const el = f.nativeElement as HTMLElement;

      const section = el.querySelector('.leaderboard-section');
      expect(section).toBeTruthy();
      // Both columns with their period headings (key-echo transpiler).
      expect(section!.querySelectorAll('.leaderboard-column').length).toBe(2);
      expect(section!.textContent).toContain('past_week');
      expect(section!.textContent).toContain('past_month');
      const entries = Array.from(section!.querySelectorAll('.leaderboard-entry'));
      expect(entries.length).toBe(3);
      // Units come from the key-echo translate: 'unit_hours'/'unit_minutes'.
      expect(entries[0].textContent).toContain('Alva');
      expect(entries[0].textContent).toContain('1 unit_hours 12 unit_minutes');
      expect(entries[1].textContent).toContain('10 unit_minutes');
      // Sub-hour totals drop the hours fragment entirely.
      expect(entries[2].textContent).toContain('Cara');
      expect(entries[2].textContent).toContain('2 unit_hours');
      expect(entries[2].textContent).not.toContain('unit_minutes');
    });

    it('renders a single column when only one window has data', () => {
      mockLearningTime.getLeaderboard.mockImplementation((w: number) =>
        of(w === 7 ? [] : month)
      );
      const f = createSignedInFixture();
      const el = f.nativeElement as HTMLElement;

      expect(el.querySelectorAll('.leaderboard-column').length).toBe(1);
      expect(el.querySelector('.leaderboard-section')?.textContent).toContain('past_month');
    });
  });
});
