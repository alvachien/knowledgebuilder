import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  TranslocoService,
  TRANSLOCO_MISSING_HANDLER,
  TRANSLOCO_TRANSPILER,
} from '@jsverse/transloco';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { AppPageTitle } from '../page-title/page-title';

import { HabitCalendarComponent } from './habit-calendar.component';
import { dateToIso, isoToDate, todayIso } from './habit-date.util';
import type { Habit, HabitItem, PunchOut } from './habit.models';
import { HabitService } from './habit.service';

/**
 * Calendar entrance: per-habit punch windows fold into day counts and habit/item
 * entries; navigation refetches only the punch window (items load once); the day
 * view orders by session count. Fixture dates derive from the real today so the
 * suite never rots (see docs/testing-habit-ui.md).
 */

const habit = {
  id: 7,
  name: 'Running',
  description: null,
  cycle: 'weekly',
  startDate: day(-30),
  endDate: null,
  state: 'active',
  hasPunches: true,
  createdAt: '',
  progress: { cycleFrom: '', cycleTo: '', rootCriterion: {} as never, criteria: [] },
} as unknown as Habit;

const items: HabitItem[] = [
  { id: 1, habitId: 7, name: 'Run', order: 0, createdAt: '', hasPunches: true, properties: [] },
  { id: 2, habitId: 7, name: 'Gym', order: 1, createdAt: '', hasPunches: true, properties: [] },
];

function day(offset: number): string {
  const d = isoToDate(todayIso());
  d.setDate(d.getDate() + offset);
  return dateToIso(d);
}

function punch(id: number, punchDate: string, itemId: number): PunchOut {
  return { id, habitId: 7, itemId, punchedAt: '', punchDate, createdAt: '', values: [] };
}

const flush = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

async function createCalendar(punches: PunchOut[] = [], getHabits?: () => unknown) {
  const service = {
    getHabits: vi.fn(getHabits ?? (() => of([habit]))),
    getItems: vi.fn(() => of(items)),
    getHabitPunches: vi.fn(() => of(punches)),
  };
  const snackbar = { open: vi.fn() };
  TestBed.configureTestingModule({
    providers: [
      { provide: HabitService, useValue: service },
      { provide: MatSnackBar, useValue: snackbar },
      {
        provide: TranslocoService,
        useValue: {
          translate: (key: string) => key,
          getActiveLang: () => 'en',
          langChanges$: of('en'),
          events$: of(),
          config: { reRenderOnLangChange: false, prodMode: true },
        } as unknown as TranslocoService,
      },
      { provide: TRANSLOCO_TRANSPILER, useValue: {} },
      { provide: TRANSLOCO_MISSING_HANDLER, useValue: {} },
      { provide: AppPageTitle, useValue: { title: '' } },
    ],
  });
  const fixture = TestBed.createComponent(HabitCalendarComponent);
  await flush();
  return { comp: fixture.componentInstance, service, fixture, snackbar };
}

describe('HabitCalendarComponent', () => {
  it('month view loads once (habits + items) and queries the visible month window', async () => {
    const { comp, service } = await createCalendar();
    expect(comp.loading()).toBe(false);

    const d = new Date();
    const monthStart = dateToIso(new Date(d.getFullYear(), d.getMonth(), 1));
    const monthEnd = dateToIso(new Date(d.getFullYear(), d.getMonth() + 1, 0));
    expect(service.getHabitPunches).toHaveBeenCalledWith(7, monthStart, monthEnd);
    expect(service.getItems).toHaveBeenCalledTimes(1);
  });

  it('folds punches into per-day counts and habit/item entries', async () => {
    const y = day(-1);
    const punches = [punch(1, y, 1), punch(2, y, 1), punch(3, y, 2)];
    const { comp } = await createCalendar(punches);

    expect(comp.punchCount(y)).toBe(3);
    const entries = comp.dayEntriesFor(y, 5);
    expect(entries).toHaveLength(2);
    const run = entries.find((e) => e.itemId === 1)!;
    expect(run.itemName).toBe('Run');
    expect(run.count).toBe(2);
    expect(comp.punchCount(todayIso())).toBe(0);
  });

  it('caps month chips and reports the hidden count', async () => {
    const y = day(-1);
    const many: PunchOut[] = [];
    for (let i = 0; i < 5; i++) {
      many.push(punch(10 + i, y, i % 2 === 0 ? 1 : 2));
    }
    const { comp } = await createCalendar(many);

    // Two distinct habit/item groups only (items alternate) — cap of 1 would hide 1.
    expect(comp.dayEntriesFor(y, 1)).toHaveLength(1);
    expect(comp.hiddenCount(y, 1)).toBe(1);
    expect(comp.hiddenCount(y, 5)).toBe(0);
  });

  it('prev/next re-query only the punch window, shifted by month', async () => {
    const { comp, service } = await createCalendar();
    service.getHabitPunches.mockClear();
    service.getItems.mockClear();

    comp.prev();
    await flush();
    const d = new Date();
    const prevStart = dateToIso(new Date(d.getFullYear(), d.getMonth() - 1, 1));
    const prevEnd = dateToIso(new Date(d.getFullYear(), d.getMonth(), 0));
    expect(service.getHabitPunches).toHaveBeenCalledWith(7, prevStart, prevEnd);
    expect(service.getItems).not.toHaveBeenCalled();

    comp.next();
    comp.next();
    await flush();
    const nextStart = dateToIso(new Date(d.getFullYear(), d.getMonth() + 1, 1));
    const last = service.getHabitPunches.mock.calls.at(-1) as unknown as [number, string, string];
    expect(last[1]).toBe(nextStart);
  });

  it('selecting a day switches to the day view with a same-day window and sorted entries', async () => {
    const y = day(-1);
    const punches = [punch(1, y, 1), punch(2, y, 2), punch(3, y, 2), punch(4, y, 2)];
    const { comp, service } = await createCalendar(punches);
    service.getHabitPunches.mockClear();

    comp.selectDay(y);
    await flush();

    expect(comp.viewMode()).toBe('day');
    expect(service.getHabitPunches).toHaveBeenCalledWith(7, y, y);
    // Day entries sort busiest first: Gym(3) before Run(1).
    expect(comp.dayEntries().map((e) => e.itemName)).toEqual(['Gym', 'Run']);
    expect(comp.periodLabel()).not.toBe('');
  });

  it('week view spans Monday..Sunday around the anchor', async () => {
    const { comp } = await createCalendar();
    const days = comp.weekDays();
    expect(days).toHaveLength(7);
    expect(new Date(days[0] + 'T00:00:00').getDay()).toBe(1); // Monday …
    expect(new Date(days[6] + 'T00:00:00').getDay()).toBe(0); // … Sunday
    expect(days).toContain(todayIso());
  });

  it('empty habit list renders without any punch query', async () => {
    const { comp, service } = await createCalendar([], () => of([]));
    expect(comp.loading()).toBe(false);
    expect(service.getHabitPunches).not.toHaveBeenCalled();
    expect(Object.keys(comp.punchMap())).toHaveLength(0);
  });

  it('habit load failure flips the retry state and reports the error', async () => {
    const { comp, snackbar } = await createCalendar([], () => throwError(() => new Error('boom')));
    await flush();
    expect(comp.loadFailed()).toBe(true);
    expect(comp.loading()).toBe(false);
    expect(snackbar.open).toHaveBeenCalled();
  });
});
