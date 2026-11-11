import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, type OnDestroy, type OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { catchError, of, Subject, takeUntil } from 'rxjs';

import type { UserAuthInfo, UserLearningTime, UserLoginHistory } from '../../interfaces';
import { AuthService, UserLearningTimeService, UserLoginHistoryService } from '../../services';

/** One rendered row of the learning-time table. */
interface LearningTimeRow {
  learnDate: string;
  /** Transloco key naming the category (e.g. 'vocabulary'). */
  categoryKey: string;
  minutes: number;
}

@Component({
  selector: 'app-user-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatCardModule, MatButtonModule, MatCheckboxModule, MatIconModule, FormsModule, TranslocoModule, DatePipe],
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.scss'],
  host: {
    class: 'app-main-content',
  },
})
export class UserDetailComponent implements OnInit, OnDestroy {
  userId = '';
  userName = '';
  history: UserLoginHistory[] = [];
  historyLoading = true;

  learningRows: LearningTimeRow[] = [];
  learningLoading = true;
  todayMinutes = 0;
  weekMinutes = 0;
  // Leaderboard visibility (the "Top Learners" section on the homepage).
  // Opting out hides only the totals there — learning time keeps accruing.
  leaderboardOptOut = false;

  // Seeded LearningContentCategory ids 1-6 -> the existing top-level nav labels.
  private static readonly CATEGORY_KEYS = ['', 'vocabulary', 'sentences', 'listening', 'chinese', 'formula', 'knowledge_bank'];

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly loginHistory = inject(UserLoginHistoryService);
  private readonly learningTime = inject(UserLearningTimeService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject<boolean>();

  ngOnInit(): void {
    this.authService.authContent
      .pipe(takeUntil(this.destroy$))
      .subscribe((auth: UserAuthInfo) => {
        this.userId = auth.getUserId() ?? '';
        this.userName = auth.getUserName() ?? '';
        this.cdr.markForCheck();
      });

    // Server default window: trailing 90 days. A failed load must clear the flag so
    // the card shows the empty state instead of a stuck spinner.
    this.loginHistory.getHistory()
      .pipe(takeUntil(this.destroy$), catchError(() => of([] as UserLoginHistory[])))
      .subscribe(rows => {
        this.history = rows;
        this.historyLoading = false;
        this.cdr.markForCheck();
      });

    // Learning time: same default window; totals are derived here because a
    // (day, category) heartbeat row is only guaranteed non-empty, not summed.
    this.learningTime.getMy()
      .pipe(takeUntil(this.destroy$), catchError(() => of([] as UserLearningTime[])))
      .subscribe(rows => {
        const today = UserDetailComponent.dayKey(new Date());
        const weekStart = UserDetailComponent.dayKey(new Date(Date.now() - 6 * 24 * 3600 * 1000));
        this.learningRows = rows.map(row => ({
          learnDate: row.learnDate,
          categoryKey: UserDetailComponent.CATEGORY_KEYS[row.categoryId] ?? '',
          minutes: Math.round(row.learningSeconds / 60),
        }));
        this.todayMinutes = UserDetailComponent.sumMinutes(rows, row => row.learnDate === today);
        this.weekMinutes = UserDetailComponent.sumMinutes(rows, row => row.learnDate >= weekStart);
        this.learningLoading = false;
        this.cdr.markForCheck();
      });

    // Current visibility choice; a failure leaves the (visible) default alone.
    this.learningTime.getPreferences()
      .pipe(takeUntil(this.destroy$), catchError(() => of(null)))
      .subscribe(prefs => {
        if (prefs) {
          this.leaderboardOptOut = prefs.leaderboardOptOut;
          this.cdr.markForCheck();
        }
      });
  }

  /** Optimistic toggle: the switch flips at once and reverts if the PUT fails. */
  onLeaderboardOptOutChange(value: boolean): void {
    const previous = this.leaderboardOptOut;
    this.leaderboardOptOut = value;
    this.learningTime.savePreferences(value)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: prefs => {
          this.leaderboardOptOut = prefs.leaderboardOptOut;
          this.cdr.markForCheck();
        },
        error: err => {
          console.error('Failed to save leaderboard preference', err);
          this.leaderboardOptOut = previous;
          this.cdr.markForCheck();
        },
      });
  }

  /** 'yyyy-MM-dd' in the browser's local zone, matching the server-local day key. */
  private static dayKey(d: Date): string {
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${m}-${day}`;
  }

  private static sumMinutes(rows: UserLearningTime[], include: (row: UserLearningTime) => boolean): number {
    return Math.round(rows.filter(include).reduce((sum, row) => sum + row.learningSeconds, 0) / 60);
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  onLogout(): void {
    this.authService.doLogout();
    void this.router.navigate(['/']);
  }
}
