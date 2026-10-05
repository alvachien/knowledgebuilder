import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';

/**
 * Entrance bar shared by the habits list, calendar and shared-gallery pages. The
 * active tab is an input rather than `routerLinkActive` — each page knows which tab
 * it owns, and the directive's `router.events` subscription would break the minimal
 * Router stubs the habit specs share.
 */
export type HabitPage = 'list' | 'calendar' | 'shared';

@Component({
  selector: 'app-habit-page-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatButtonModule, MatIconModule, TranslocoModule],
  template: `
    <nav *transloco="let t" class="habit-nav" [attr.aria-label]="t('habits.nav')">
      <a mat-button routerLink="/habits" [class.habit-nav-active]="page() === 'list'">
        <mat-icon>checklist</mat-icon> {{ t('habits.navList') }}
      </a>
      <a mat-button routerLink="/habits/calendar" [class.habit-nav-active]="page() === 'calendar'">
        <mat-icon>calendar_month</mat-icon> {{ t('habits.navCalendar') }}
      </a>
      <a mat-button routerLink="/habits/shared" [class.habit-nav-active]="page() === 'shared'">
        <mat-icon>groups</mat-icon> {{ t('habits.navShared') }}
      </a>
    </nav>
  `,
  styles: [
    `
      .habit-nav { display: inline-flex; align-items: center; gap: 4px; }
      .habit-nav a { min-width: 96px; }
      .habit-nav-active { font-weight: 600; }
    `,
  ],
})
export class HabitPageHeaderComponent {
  /** Which entrance is current — the hosting page passes it in. */
  readonly page = input<HabitPage>('list');
}
