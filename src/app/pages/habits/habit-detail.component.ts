import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDateFnsModule, provideDateFnsAdapter } from '@angular/material-date-fns-adapter';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { catchError, firstValueFrom, of, Subject, switchMap } from 'rxjs';

import { AppPageTitle } from '../page-title/page-title';

import { HabitConfirmDialogComponent } from './habit-confirm-dialog.component';
import { HabitCriterionSummaryComponent } from './habit-criterion-summary.component';
import { provideHabitDateLocale } from './habit-date-locale';
import { isoToDate, dateToIso, normalizeDateRange, todayIso } from './habit-date.util';
import { showHabitError } from './habit-error-messages';
import { HabitPunchDialogComponent } from './habit-punch-dialog.component';
import { HabitPunchEditDialogComponent } from './habit-punch-edit-dialog.component';
import { canPunchToday } from './habit-window.util';
import type { DayHistoryOut, Habit, HabitItem, PunchOut } from './habit.models';
import { HabitService } from './habit.service';

/**
 * Habit detail (FR-3.4): metadata, full criterion progress, per-item cycle values,
 * and the punch history grouped by day (newest first) with per-session
 * edit/delete. Date-range picker defaults to the clamped current cycle.
 */
@Component({
  selector: 'app-habit-detail',
  templateUrl: 'habit-detail.component.html',
  styleUrl: 'habit-detail.component.scss',
  host: {
    class: 'app-main-content',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    FormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatDatepickerModule,
    MatDateFnsModule,
    MatDividerModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    TranslocoModule,
    HabitCriterionSummaryComponent,
  ],
  // Without MAT_DATE_LOCALE the adapter defaults to LOCALE_ID (a string),
  // which date-fns rejects when formatting calendar text — resolved from the
  // active Transloco language (en → enUS, zh → zhCN).
  providers: [provideDateFnsAdapter(), provideHabitDateLocale()],
})
export class HabitDetailComponent {
  private readonly service = inject(HabitService);
  private readonly dialog = inject(MatDialog);
  private readonly snackbar = inject(MatSnackBar);
  private readonly transloco = inject(TranslocoService);
  private readonly route = inject(ActivatedRoute);
  private readonly pageTitle = inject(AppPageTitle);
  private readonly destroyRef = inject(DestroyRef);

  readonly habit = signal<Habit | null>(null);
  readonly items = signal<HabitItem[]>([]);
  readonly history = signal<DayHistoryOut[]>([]);
  /**
   * Unfiltered history (no from/to) — the chip computation source (U7). The
   * visible `history` can exclude the cycle's true first-passing day, which
   * used to move the "cycle complete" chip inside a narrowed range.
   */
  readonly fullHistory = signal<DayHistoryOut[]>([]);
  readonly loading = signal(true);
  readonly notFound = signal(false);

  fromDate: Date | null = null;
  toDate: Date | null = null;

  /**
   * History loads are funneled through a Subject + switchMap so rapid filter
   * Apply clicks can never render a stale (earlier) response (review L9).
   * `null` from the pipe means "request failed" — the previous list stays.
   */
  private readonly historyFilter$ = new Subject<void>();

  constructor() {
    this.pageTitle.title = this.transloco.translate('habits.nav');
    // Calendar day links arrive as `/habits/:id?date=yyyy-MM-dd` — prefilter the
    // history picker to that day (loadAll's default-cycle range only applies when
    // both dates are still null). Optional chaining: test stubs may lack queryParamMap.
    const dateParam = this.route.snapshot.queryParamMap?.get('date');
    if (dateParam) {
      const day = isoToDate(dateParam);
      this.fromDate = day;
      this.toDate = day;
    }
    this.historyFilter$
      .pipe(
        switchMap(() => {
          // The API 422s `from > to` (pinned) — guard client-side (review L9).
          const { from, to } = normalizeDateRange(
            this.fromDate ? dateToIso(this.fromDate) : undefined,
            this.toDate ? dateToIso(this.toDate) : undefined
          );
          return this.service.getHistory(this.id, from, to).pipe(
            catchError((err: unknown) => {
              showHabitError(this.snackbar, this.transloco, err);
              return of<DayHistoryOut[] | null>(null);
            })
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((days) => {
        if (days !== null) {
          this.history.set(days);
        }
      });
    void this.loadAll();
  }

  get id(): number {
    return Number(this.route.snapshot.paramMap.get('id'));
  }

  root(habit: Habit) {
    return habit.progress.rootCriterion;
  }

  /** Daily (day-count) mode: root.successType === 'daily'. */
  isDaily(): boolean {
    const h = this.habit();
    return h !== null && this.root(h).successType === 'daily';
  }

  /**
   * Punch affordance visibility (FR-3.3 gates the PUNCH DATE): active habits
   * always have at least one offerable day once started — even after the
   * period ended, where back-filling past in-window days stays legal.
   */
  canPunch(habit: Habit): boolean {
    return canPunchToday(habit);
  }

  progressPercent(): number {
    const h = this.habit();
    if (!h) {
      return 0;
    }
    const r = this.root(h);
    // Daily counts successful days; cumulative compares the aggregate against
    // the derived target (condition threshold / required passing operands).
    const goal = this.isDaily() ? (r.cycleTarget ?? 1) : (r.threshold ?? 1);
    const current = this.isDaily() ? (r.successfulDays ?? 0) : (r.currentValue ?? 0);
    return Math.min(100, Math.round((current / goal) * 100));
  }

  fmt(value: number | null): string {
    return value === null ? '—' : `${Math.round(value * 100) / 100}`;
  }

  /**
   * Timezone hint (design-habit-ui.md § Known Limitations): the server computes
   * "today" in its own timezone (NFR-5). If the browser's local date lies inside
   * the active window but the server reports no current day value, the two clocks
   * disagree — warn the user that dates shown are server-local.
   */
  serverTodayDiffers(): boolean {
    const h = this.habit();
    if (!h || h.state !== 'active') {
      return false;
    }
    const local = todayIso();
    const withinWindow = local >= h.startDate && (h.endDate === null || local <= h.endDate);
    // currentDayValue is only populated in daily mode; that's the observable case.
    return withinWindow && this.isDaily() && this.root(h).currentDayValue === null;
  }

  /**
   * In cumulative mode the "cycle complete" chip renders only on the first
   * passing day OF THE DAY'S CYCLE. Anchored on the unfiltered history (U7)
   * so a custom from/to range can never move it; falls back to the visible
   * window while the unfiltered copy is unavailable (initial load / failed).
   */
  showChipFor(day: DayHistoryOut): boolean {
    if (!day.isSuccessful) {
      return false;
    }
    if (this.isDaily()) {
      return true; // "day passed" on every passing day
    }
    const full = this.fullHistory().length > 0 ? this.fullHistory() : this.history();
    const sameCycle = full.filter((d) => d.cycleFrom === day.cycleFrom);
    const pool = sameCycle.length > 0 ? sameCycle : full;
    const ascending = [...pool].sort((a, b) => a.date.localeCompare(b.date));
    const firstSuccess = ascending.find((d) => d.isSuccessful);
    return firstSuccess?.date === day.date;
  }

  chipLabel(): string {
    return this.isDaily() ? this.transloco.translate('habits.detail.dayPassed') : this.transloco.translate('habits.detail.cycleComplete');
  }

  itemOf(itemId: number): string {
    return this.items().find((i) => i.id === itemId)?.name ?? `#${itemId}`;
  }

  valueText(punch: PunchOut, value: PunchOut['values'][number]): string {
    switch (value.propertyType) {
      case 'boolean':
        return value.boolValue ? '✓' : '✗';
      case 'numeric':
        return `${value.numValue ?? ''}`;
      default:
        return (value.listEntries ?? []).join(', ');
    }
  }

  perCyclePropertyIds(): number[] {
    return this.items()
      .flatMap((i) => i.properties)
      .filter((p) => p.propertyType === 'list' && p.itemUniqueness === 'per_cycle')
      .map((p) => p.id);
  }

  applyFilter(): void {
    this.historyFilter$.next();
  }

  clearFilter(): void {
    this.fromDate = null;
    this.toDate = null;
    this.historyFilter$.next();
  }

  openPunch(): void {
    const habit = this.habit();
    if (!habit) {
      return;
    }
    const ref = this.dialog.open(HabitPunchDialogComponent, {
      data: { habit, items: this.items() },
      width: '560px',
      // No fixed height: let the pane hug its content (sparse habits used to
      // render a mostly-empty 75vh box). Tall content is still capped by the
      // dialog's own `mat-dialog-content` max-height rule.
      enterAnimationDuration: 800,
      exitAnimationDuration: 500,
    });
    ref.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((result) => {
      if (result === 'saved') {
        void this.loadAll();
      }
    });
  }

  editPunch(punch: PunchOut): void {
    const ref = this.dialog.open(HabitPunchEditDialogComponent, {
      data: { habitId: punch.habitId, itemId: punch.itemId, punch, perCyclePropertyIds: this.perCyclePropertyIds() },
      width: '460px',
      enterAnimationDuration: 800,
      exitAnimationDuration: 500,
    });
    ref.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((result) => {
      if (result === 'saved') {
        void this.loadAll();
      }
    });
  }

  deletePunch(punch: PunchOut): void {
    const ref = this.dialog.open(HabitConfirmDialogComponent, {
      data: {
        title: this.transloco.translate('habits.detail.deletePunch'),
        message: this.transloco.translate('habits.detail.deletePunchConfirm', { date: punch.punchDate }),
        confirmLabel: this.transloco.translate('ok'),
      },
      width: '420px',
    });
    ref.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((ok) => {
      if (ok === true) {
        this.service
          .deletePunch(punch.habitId, punch.itemId, punch.id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => void this.loadAll(),
            error: (err: unknown) => showHabitError(this.snackbar, this.transloco, err),
          });
      }
    });
  }

  private async loadAll(): Promise<void> {
    this.loading.set(true);
    this.notFound.set(false);
    try {
      const [habit, items] = await Promise.all([
        firstValueFrom(this.service.getHabit(this.id)),
        firstValueFrom(this.service.getItems(this.id)),
      ]);
      this.habit.set(habit);
      this.items.set(items);

      // Default range: current cycle clamped to the habit's active window.
      // An open-ended whole cycle reports cycleTo = null — leave the upper
      // bound unset (no sentinel date, spec FR-4.1).
      if (this.fromDate === null && this.toDate === null) {
        const start = habit.startDate > habit.progress.cycleFrom ? habit.startDate : habit.progress.cycleFrom;
        this.fromDate = isoToDate(start);
        if (habit.progress.cycleTo !== null) {
          const end = habit.endDate && habit.endDate < habit.progress.cycleTo ? habit.endDate : habit.progress.cycleTo;
          this.toDate = isoToDate(end);
        }
      }
      // Unfiltered copy for the chip anchor (U7) — refreshed with every full
      // load. Failures are swallowed here (showChipFor already degrades to the
      // visible window; the filtered request surfaces errors instead).
      this.service
        .getHistory(this.id)
        .pipe(catchError(() => of<DayHistoryOut[]>([])), takeUntilDestroyed(this.destroyRef))
        .subscribe((days) => this.fullHistory.set(days));
      this.historyFilter$.next();
    } catch (err) {
      this.notFound.set(true);
      showHabitError(this.snackbar, this.transloco, err);
    } finally {
      this.loading.set(false);
    }
  }
}
