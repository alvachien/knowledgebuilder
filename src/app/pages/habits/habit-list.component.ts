import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { firstValueFrom } from 'rxjs';

import { AppPageTitle } from '../page-title/page-title';

import { HabitConfirmDialogComponent } from './habit-confirm-dialog.component';
import { HabitCriterionSummaryComponent } from './habit-criterion-summary.component';
import { showHabitError } from './habit-error-messages';
import { HabitPageHeaderComponent } from './habit-page-header.component';
import { HabitPunchDialogComponent } from './habit-punch-dialog.component';
import { HabitSharesDialogComponent } from './habit-shares-dialog.component';
import { canPunchToday } from './habit-window.util';
import type { Habit } from './habit.models';
import { HabitService } from './habit.service';

/**
 * Habit list (FR-2.2): each habit card embeds current-cycle progress from
 * `GET /api/Habits`. Punch / edit / shares / deactivate / delete actions; deactivation
 * is confirmed as permanent (FR-2.4). After a punch the affected habit is re-fetched
 * in place so progress updates without a full reload (FR-4.4). "Shares…" opens the
 * invitation dialog (per-user read-only invites — immediate, revocable, no confirm).
 */
@Component({
  selector: 'app-habit-list',
  templateUrl: 'habit-list.component.html',
  styleUrl: 'habit-list.component.scss',
  host: {
    class: 'app-main-content',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatMenuModule,
    MatIconModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    TranslocoModule,
    HabitCriterionSummaryComponent,
    HabitPageHeaderComponent,
  ],
})
export class HabitListComponent {
  private readonly service = inject(HabitService);
  private readonly dialog = inject(MatDialog);
  private readonly snackbar = inject(MatSnackBar);
  private readonly transloco = inject(TranslocoService);
  private readonly pageTitle = inject(AppPageTitle);
  private readonly destroyRef = inject(DestroyRef);

  readonly habits = signal<Habit[]>([]);
  readonly loading = signal(true);
  readonly loadFailed = signal(false);

  constructor() {
    this.pageTitle.title = this.transloco.translate('habits.nav');
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.loadFailed.set(false);
    this.service
      .getHabits()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (habits) => {
          this.habits.set(habits);
          this.loading.set(false);
        },
        error: (err: unknown) => {
          this.loading.set(false);
          this.loadFailed.set(true);
          showHabitError(this.snackbar, this.transloco, err);
        },
      });
  }

  root(habit: Habit) {
    return habit.progress.rootCriterion;
  }

  /** Daily (day-count) mode: the root carries successType 'daily'. */
  isDaily(habit: Habit): boolean {
    return this.root(habit).successType === 'daily';
  }

  /** A composite root judges the day by its pass bit, not a numeric value. */
  isCompositeRoot(habit: Habit): boolean {
    return this.root(habit).criterionType === 'composite';
  }

  /**
   * The API rejects NEW punches whose date falls outside [startDate, endDate]
   * (FR-3.3) — but an active habit past its end date still accepts back-fills
   * for past in-window days, so the button only disappears when nothing is
   * punchable at all (future start / inactive).
   */
  canPunch(habit: Habit): boolean {
    return canPunchToday(habit);
  }

  /** Progress denominator: daily counts days, cumulative uses the condition
   * threshold / composite required-operand count (server-side derived). */
  progressPercent(habit: Habit): number {
    const r = this.root(habit);
    const goal = this.isDaily(habit) ? (r.cycleTarget ?? 1) : (r.threshold ?? 1);
    const current = this.isDaily(habit) ? (r.successfulDays ?? 0) : (r.currentValue ?? 0);
    return Math.min(100, Math.round((current / goal) * 100));
  }

  fmt(value: number | null): string {
    return value === null ? '—' : `${Math.round(value * 100) / 100}`;
  }

  openPunch(habit: Habit): void {
    void (async () => {
      try {
        const items = await firstValueFrom(this.service.getItems(habit.id));
        const ref = this.dialog.open(HabitPunchDialogComponent, {
          data: { habit, items },
          width: '560px',
          // Keep in sync with the detail page's opener — content-hugging height.
          enterAnimationDuration: 800,
          exitAnimationDuration: 500,
        });
        ref.afterClosed()
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe((result) => {
            if (result === 'saved') {
              void this.refreshHabit(habit.id);
            }
          });
      } catch (err) {
        showHabitError(this.snackbar, this.transloco, err);
      }
    })();
  }

  /** Open the per-habit invitation manager (read-only grants to named users). */
  openShares(habit: Habit): void {
    this.dialog.open(HabitSharesDialogComponent, {
      data: { habitId: habit.id, habitName: habit.name },
      width: '480px',
      enterAnimationDuration: 400,
      exitAnimationDuration: 300,
    });
  }

  deactivate(habit: Habit): void {
    const ref = this.dialog.open(HabitConfirmDialogComponent, {
      data: {
        title: this.transloco.translate('habits.list.deactivate'),
        message: this.transloco.translate('habits.list.deactivateConfirm'),
        confirmLabel: this.transloco.translate('habits.list.deactivate'),
      },
      width: '420px',
    });
    ref.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((ok) => {
      if (ok === true) {
        this.service
          .deactivateHabit(habit.id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: (updated) => this.patchHabit(updated),
            error: (err: unknown) => showHabitError(this.snackbar, this.transloco, err),
          });
      }
    });
  }

  remove(habit: Habit): void {
    const ref = this.dialog.open(HabitConfirmDialogComponent, {
      data: {
        title: this.transloco.translate('habits.list.delete'),
        message: this.transloco.translate('habits.list.deleteConfirm', { name: habit.name }),
        confirmLabel: this.transloco.translate('ok'),
      },
      width: '420px',
    });
    ref.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((ok) => {
      if (ok === true) {
        this.service
          .deleteHabit(habit.id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => this.load(),
            error: (err: unknown) => showHabitError(this.snackbar, this.transloco, err),
          });
      }
    });
  }

  private async refreshHabit(id: number): Promise<void> {
    try {
      this.patchHabit(await firstValueFrom(this.service.getHabit(id)));
    } catch (err) {
      showHabitError(this.snackbar, this.transloco, err);
    }
  }

  private patchHabit(updated: Habit): void {
    this.habits.update((list) => list.map((h) => (h.id === updated.id ? updated : h)));
  }
}
