import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { catchError, forkJoin, map, of, switchMap } from 'rxjs';

import { AppPageTitle } from '../page-title/page-title';

import { dateToIso, isoToDate, todayIso } from './habit-date.util';
import { showHabitError } from './habit-error-messages';
import { HabitPageHeaderComponent } from './habit-page-header.component';
import type { Habit, HabitItem, PunchOut } from './habit.models';
import { HabitService } from './habit.service';

export type HabitCalendarViewMode = 'month' | 'week' | 'day';

/** One habit-item combination punched on a day, with how many sessions. */
export interface HabitCalendarDayEntry {
  habitId: number;
  habitName: string;
  itemId: number;
  itemName: string;
  count: number;
}

/**
 * Calendar entrance (second entry page, ported from the reference habit-ui): month /
 * week / day grids of past punches across ALL of the user's habits — the discoverable
 * history view. Driven by `GET .../Punches?from=&to=` per habit (the API has no
 * cross-habit aggregate; habit counts here are personal-scale, so one call per habit
 * per visible period is fine). Habits + item names load once; navigation only refetches
 * the punch window. Day rows deep-link to the habit detail (`?date=` prefilter).
 */
@Component({
  selector: 'app-habit-calendar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'habit-calendar.component.html',
  styleUrl: 'habit-calendar.component.scss',
  host: {
    class: 'app-main-content',
  },
  imports: [
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    TranslocoModule,
    HabitPageHeaderComponent,
  ],
})
export class HabitCalendarComponent {
  private readonly service = inject(HabitService);
  private readonly snackbar = inject(MatSnackBar);
  private readonly transloco = inject(TranslocoService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly pageTitle = inject(AppPageTitle);

  readonly viewMode = signal<HabitCalendarViewMode>('month');
  readonly currentDate = signal(new Date());
  readonly selectedDay = signal(todayIso());

  readonly habits = signal<Habit[]>([]);
  readonly punchMap = signal<Record<string, number>>({});
  readonly detailMap = signal<Record<string, HabitCalendarDayEntry[]>>({});

  readonly loading = signal(true);
  readonly loadFailed = signal(false);

  /** habitId → (itemId → name) — loaded once with the habits. */
  private readonly itemNames = new Map<number, Record<number, string>>();

  readonly today = todayIso();

  private readonly lang = toSignal(this.transloco.langChanges$, { initialValue: this.transloco.getActiveLang() });

  /** Localized short weekday names, Monday-first (matches the API's cycle boundaries). */
  readonly weekDayNames = computed(() => {
    const locale = this.lang().startsWith('zh') ? 'zh-CN' : 'en-US';
    // 2024-01-01 was a Monday.
    return Array.from({ length: 7 }, (_, i) => new Date(2024, 0, 1 + i).toLocaleDateString(locale, { weekday: 'short' }));
  });

  readonly periodLabel = computed(() => {
    const d = this.currentDate();
    const locale = this.lang().startsWith('zh') ? 'zh-CN' : 'en-US';
    const mode = this.viewMode();
    if (mode === 'month') {
      return d.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
    }
    if (mode === 'week') {
      const days = this.weekDays();
      const first = isoToDate(days[0]);
      const last = isoToDate(days[6]);
      return first.getMonth() === last.getMonth()
        ? `${first.toLocaleDateString(locale, { month: 'long' })} ${first.getDate()}–${last.getDate()}, ${first.getFullYear()}`
        : `${first.toLocaleDateString(locale, { month: 'short', day: 'numeric' })} – ${last.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
    return isoToDate(this.selectedDay()).toLocaleDateString(locale, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  });

  /** Day-view rows: the selected day's entries, busiest habit-item first. */
  readonly dayEntries = computed(() => [...(this.detailMap()[this.selectedDay()] ?? [])].sort((a, b) => b.count - a.count));

  constructor() {
    this.pageTitle.title = this.transloco.translate('habits.calendar.title');
    this.loadHabits();
  }

  /** Load (or reload after a failure): habits + item names, then the visible window. */
  loadHabits(): void {
    this.loading.set(true);
    this.loadFailed.set(false);
    this.service
      .getHabits()
      .pipe(
        switchMap((habits) => {
          this.habits.set(habits);
          if (habits.length === 0) {
            return of<HabitItem[][] | null>(null);
          }
          return forkJoin(habits.map((h) => this.service.getItems(h.id)));
        }),
        catchError((err: unknown) => {
          showHabitError(this.snackbar, this.transloco, err);
          this.loading.set(false);
          this.loadFailed.set(true);
          return of<HabitItem[][] | null>(null);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((itemLists) => {
        if (itemLists !== null) {
          const habits = this.habits();
          itemLists.forEach((items, idx) => {
            this.itemNames.set(habits[idx].id, Object.fromEntries(items.map((i) => [i.id, i.name])));
          });
        }
        this.loadPunches();
      });
  }

  private loadPunches(): void {
    const habits = this.habits();
    if (habits.length === 0) {
      this.punchMap.set({});
      this.detailMap.set({});
      this.loading.set(false);
      return;
    }
    this.loading.set(true);
    const { from, to } = this.rangeFor();
    forkJoin(habits.map((h) => this.service.getHabitPunches(h.id, from, to)))
      .pipe(
        map((results) => this.foldPunches(results)),
        catchError((err: unknown) => {
          showHabitError(this.snackbar, this.transloco, err);
          return of<{ punchMap: Record<string, number>; detailMap: Record<string, HabitCalendarDayEntry[]> } | null>(null);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((folded) => {
        if (folded !== null) {
          this.punchMap.set(folded.punchMap);
          this.detailMap.set(folded.detailMap);
        }
        this.loading.set(false);
      });
  }

  private foldPunches(results: PunchOut[][]): { punchMap: Record<string, number>; detailMap: Record<string, HabitCalendarDayEntry[]> } {
    const punchMap: Record<string, number> = {};
    const detailMap: Record<string, HabitCalendarDayEntry[]> = {};
    const habits = this.habits();
    results.forEach((punches, idx) => {
      const habit = habits[idx];
      for (const p of punches) {
        punchMap[p.punchDate] = (punchMap[p.punchDate] ?? 0) + 1;
        const entries = (detailMap[p.punchDate] ??= []);
        const existing = entries.find((e) => e.habitId === habit.id && e.itemId === p.itemId);
        if (existing) {
          existing.count++;
        } else {
          entries.push({
            habitId: habit.id,
            habitName: habit.name,
            itemId: p.itemId,
            itemName: this.itemNames.get(habit.id)?.[p.itemId] ?? `#${p.itemId}`,
            count: 1,
          });
        }
      }
    });
    return { punchMap, detailMap };
  }

  setView(mode: HabitCalendarViewMode): void {
    if (mode === this.viewMode()) {
      return;
    }
    if (mode === 'day') {
      this.selectedDay.set(dateToIso(this.currentDate()));
    }
    this.viewMode.set(mode);
    this.loadPunches();
  }

  prev(): void {
    this.shift(-1);
  }

  next(): void {
    this.shift(1);
  }

  private shift(dir: 1 | -1): void {
    const d = new Date(this.currentDate());
    const mode = this.viewMode();
    if (mode === 'month') {
      d.setMonth(d.getMonth() + dir);
    } else if (mode === 'week') {
      d.setDate(d.getDate() + 7 * dir);
    } else {
      d.setDate(d.getDate() + dir);
      this.selectedDay.set(dateToIso(d));
    }
    this.currentDate.set(d);
    this.loadPunches();
  }

  selectDay(dateStr: string): void {
    this.selectedDay.set(dateStr);
    this.currentDate.set(isoToDate(dateStr));
    this.viewMode.set('day');
    this.loadPunches();
  }

  calendarDays(): string[] {
    const d = this.currentDate();
    const year = d.getFullYear();
    const month = d.getMonth();
    const lastDay = new Date(year, month + 1, 0).getDate();
    // Mon-based grid: pad the leading partial week and complete the trailing row.
    const startOffset = (new Date(year, month, 1).getDay() + 6) % 7;
    const days: string[] = [];
    for (let i = startOffset - 1; i >= 0; i--) {
      days.push(dateToIso(new Date(year, month, -i)));
    }
    for (let i = 1; i <= lastDay; i++) {
      days.push(dateToIso(new Date(year, month, i)));
    }
    const remainder = days.length % 7;
    for (let i = 1; remainder !== 0 && i <= 7 - remainder; i++) {
      days.push(dateToIso(new Date(year, month + 1, i)));
    }
    return days;
  }

  weekDays(): string[] {
    const anchor = this.currentDate();
    const monday = new Date(anchor);
    monday.setDate(anchor.getDate() - ((anchor.getDay() + 6) % 7));
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return dateToIso(d);
    });
  }

  isCurrentMonth(dateStr: string): boolean {
    const d = this.currentDate();
    return dateStr.startsWith(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }

  isToday(dateStr: string): boolean {
    return dateStr === this.today;
  }

  punchCount(dateStr: string): number {
    return this.punchMap()[dateStr] ?? 0;
  }

  dayEntriesFor(dateStr: string, max: number): HabitCalendarDayEntry[] {
    return (this.detailMap()[dateStr] ?? []).slice(0, max);
  }

  hiddenCount(dateStr: string, max: number): number {
    return Math.max(0, (this.detailMap()[dateStr] ?? []).length - max);
  }

  dayNumber(dateStr: string): number {
    return Number(dateStr.slice(8, 10));
  }

  weekdayName(dateStr: string): string {
    const locale = this.lang().startsWith('zh') ? 'zh-CN' : 'en-US';
    return isoToDate(dateStr).toLocaleDateString(locale, { weekday: 'short' });
  }

  private rangeFor(): { from: string; to: string } {
    const d = this.currentDate();
    const mode = this.viewMode();
    if (mode === 'month') {
      return { from: dateToIso(new Date(d.getFullYear(), d.getMonth(), 1)), to: dateToIso(new Date(d.getFullYear(), d.getMonth() + 1, 0)) };
    }
    if (mode === 'week') {
      const days = this.weekDays();
      return { from: days[0], to: days[6] };
    }
    const iso = this.selectedDay();
    return { from: iso, to: iso };
  }
}
