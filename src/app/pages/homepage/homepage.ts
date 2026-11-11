import type { OnInit } from '@angular/core';
import { ChangeDetectionStrategy, Component, HostBinding, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { differenceInDays } from 'date-fns';

import type { LearningTimeLeaderboardEntry } from '../../interfaces';
import { AuthService, UserLearningTimeService } from '../../services';
import { NAV_ICON } from '../../shared/nav-icons';
import { NavigationFocusDirective } from '../../shared/navigation-focus/navigation-focus';
import { AppPageTitle } from '../page-title/page-title';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.html',
  styleUrls: ['./homepage.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NavigationFocusDirective,
    RouterLink,
    MatIconModule,
    TranslocoModule,
  ],
  host: {
    class: 'app-main-content',
  },
})
export class HomepageComponent implements OnInit {
  @HostBinding('class.main-content') readonly mainContentClass = true;
  @HostBinding('class.animations-disabled') readonly animationsDisabled = false;

  daysleft1: number;
  daysleft2: number;
  daysleft3: number;
  pageTitle = inject(AppPageTitle);

  /** Ledger rows, feature notes and the CTA all label themselves from this one map. */
  protected readonly navIcon = NAV_ICON;

  // Learning leaderboard: the site's first cross-user surface. The section
  // renders only while signed in AND at least one window has entries — to
  // anonymous visitors (the homepage is public) it is simply not there.
  protected readonly isSignedIn = signal(false);
  protected readonly weekTop = signal<LearningTimeLeaderboardEntry[]>([]);
  protected readonly monthTop = signal<LearningTimeLeaderboardEntry[]>([]);
  private leaderboardRequested = false;

  private readonly auth = inject(AuthService);
  private readonly learningTime = inject(UserLearningTimeService);
  private readonly transloco = inject(TranslocoService);

  constructor() {
    const today = new Date();
    this.daysleft1 = differenceInDays(new Date(2027, 4, 22), today);
    this.daysleft2 = differenceInDays(new Date(2028, 5, 15), today);
    this.daysleft3 = differenceInDays(new Date(2031, 5, 6), today);

    this.auth.authContent
      .pipe(takeUntilDestroyed())
      .subscribe(info => {
        this.isSignedIn.set(info.isAuthorized);
        // Fetch once per page life; a failure leaves the (empty) signals
        // alone, which keeps the section hidden rather than showing a dead panel.
        if (info.isAuthorized && !this.leaderboardRequested) {
          this.leaderboardRequested = true;
          this.learningTime.getLeaderboard(7).subscribe({
            next: rows => this.weekTop.set(rows),
            error: err => console.error('Leaderboard (week) failed to load', err),
          });
          this.learningTime.getLeaderboard(30).subscribe({
            next: rows => this.monthTop.set(rows),
            error: err => console.error('Leaderboard (month) failed to load', err),
          });
        }
      });
  }

  /** '4 h 12 m' / '28 m' with i18n unit fragments (en 'h'/'m', zh 小时/分). */
  protected formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const hourUnit = this.transloco.translate('unit_hours');
    const minuteUnit = this.transloco.translate('unit_minutes');
    if (hours > 0) {
      return minutes > 0 ? `${hours} ${hourUnit} ${minutes} ${minuteUnit}` : `${hours} ${hourUnit}`;
    }
    return `${minutes} ${minuteUnit}`;
  }

  ngOnInit(): void {
    this.pageTitle.title = '';
  }
}
