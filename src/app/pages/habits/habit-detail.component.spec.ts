import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import {
  TranslocoService,
  TRANSLOCO_MISSING_HANDLER,
  TRANSLOCO_TRANSPILER,
} from '@jsverse/transloco';
import { delay, of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { AppPageTitle } from '../page-title/page-title';

import { HabitDetailComponent } from './habit-detail.component';
import type { DayHistoryOut, Habit } from './habit.models';
import { HabitApiError } from './habit.models';
import { HabitService } from './habit.service';

/**
 * History-filter semantics (review L9): rapid Apply clicks must render only
 * the latest response (Subject + switchMap), and an inverted from/to picked
 * with the date controls must never reach the API (which now 422s it).
 */

const habit: Habit = {
  id: 7,
  name: 'Morning run',
  description: null,
  cycle: 'weekly',
  startDate: '2026-09-01',
  endDate: null,
  state: 'active',
  hasPunches: false,
  createdAt: '2026-09-01T08:00:00Z',
  progress: {
    cycleFrom: '2026-09-21',
    cycleTo: '2026-09-27',
    rootCriterion: {
      criterionId: 10,
      name: 'Goal',
      isRoot: true,
      criterionType: 'condition',
      passed: false,
      propertyName: 'distance',
      aggregationMode: null,
      currentValue: 5,
      threshold: 30,
      successType: 'cumulative',
      // Cumulative roots carry no stored cycle target — progress derives it.
      cycleTarget: null,
      currentDayValue: null,
      successfulDays: null,
      operator: null,
      operandIds: null,
    },
    criteria: [],
  },
};

function day(date: string): DayHistoryOut {
  return { date, cycleFrom: '2026-09-21', cycleTo: '2026-09-27', isSuccessful: false, criteria: [], punches: [] };
}

/** Let all in-flight timers/microtasks settle. */
const wait = (ms = 250) => new Promise<void>((resolve) => setTimeout(resolve, ms));

async function createDetail(
  getHistory: (id: number, from?: string, to?: string) => unknown,
  queryDate?: string,
  habitOverride?: Habit,
) {
  const shown = habitOverride ?? habit;
  const service = {
    getHabit: vi.fn(() => of(shown)),
    getItems: vi.fn(() => of([])),
    getHistory: vi.fn(getHistory),
    deletePunch: vi.fn(() => of(undefined)),
  };
  await TestBed.configureTestingModule({
    providers: [
      { provide: HabitService, useValue: service },
      {
        provide: ActivatedRoute,
        useValue: {
          snapshot: {
            paramMap: { get: () => '7' },
            queryParamMap: { get: (key: string) => (key === 'date' ? queryDate ?? null : null) },
          },
        },
      },
      { provide: MatDialog, useValue: { open: vi.fn() } },
      { provide: MatSnackBar, useValue: { open: vi.fn() } },
      {
        provide: TranslocoService,
        useValue: {
          translate: (key: string) => key,
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
  await TestBed.compileComponents();
  const fixture = TestBed.createComponent(HabitDetailComponent);
  return { comp: fixture.componentInstance, service };
}

describe('HabitDetailComponent history filter', () => {
  it('renders only the latest response when an earlier request resolves last (L9)', async () => {
    const stale = [day('2026-09-01')];
    const fresh = [day('2026-09-02')];
    let n = 0;
    const { comp } = await createDetail((_id: number, from?: string) => {
      if (from === undefined) {
        return of<DayHistoryOut[]>([]); // unfiltered chip baseline (U7) — not counted
      }
      n++;
      if (n === 1) {
        return of<DayHistoryOut[]>([]); // initial load from the constructor
      }
      // Apply #1 is slow, Apply #2 (same tick) is fast.
      return n === 2 ? of<DayHistoryOut[]>(stale).pipe(delay(80)) : of<DayHistoryOut[]>(fresh).pipe(delay(5));
    });
    await wait();
    expect(comp.history()).toEqual([]);

    comp.applyFilter();
    comp.applyFilter();
    await wait(400);

    // Without switchMap the late `stale` response would clobber `fresh`.
    expect(comp.history()).toEqual(fresh);
    expect(comp.history()).not.toEqual(stale);
  });

  it('prefills the history range from ?date= (calendar day link)', async () => {
    const { comp, service } = await createDetail(() => of<DayHistoryOut[]>([]), '2026-09-15');
    await wait();

    expect(service.getHistory).toHaveBeenCalledWith(7, '2026-09-15', '2026-09-15');
    expect(comp.fromDate).toEqual(new Date(2026, 8, 15));
    expect(comp.toDate).toEqual(new Date(2026, 8, 15));
  });

  it('without ?date= keeps the clamped current-cycle default range', async () => {
    const { service } = await createDetail(() => of<DayHistoryOut[]>([]));
    await wait();

    // start 2026-09-01, cycle 2026-09-21→27 (fixture): from = max(start, cycleFrom).
    expect(service.getHistory).toHaveBeenCalledWith(7, '2026-09-21', '2026-09-27');
  });

  it('never sends an inverted from > to range (pinned API rejection, L9)', async () => {
    const { comp, service } = await createDetail(() => of<DayHistoryOut[]>([]));
    await wait();
    // Sep 20 → Sep 10 (inverted): the query must go out swapped.
    comp.fromDate = new Date(2026, 8, 20);
    comp.toDate = new Date(2026, 8, 10);

    comp.applyFilter();
    await wait();

    const last = service.getHistory.mock.calls[service.getHistory.mock.calls.length - 1] as unknown as [
      number,
      string | undefined,
      string | undefined,
    ];
    expect(last[0]).toBe(7);
    expect(last[1]).toBe('2026-09-10');
    expect(last[2]).toBe('2026-09-20');
  });

  it('default range on load is the current cycle window', async () => {
    const { service } = await createDetail(() => of<DayHistoryOut[]>([]));
    await wait();
    expect(service.getHistory).toHaveBeenCalledWith(7, '2026-09-21', '2026-09-27');
  });

  it('an open-ended whole cycle (cycleTo null) conditions the upper bound unset (FR-4.1)', async () => {
    // No sentinel date may ever reach the picker or the query: the request
    // goes out with only `from` (= max(startDate, cycleFrom)); `to` is absent.
    const openEnded: Habit = {
      ...habit,
      cycle: 'whole',
      startDate: '2026-09-01',
      progress: { ...habit.progress, cycleFrom: '2026-09-01', cycleTo: null },
    };
    const { comp, service } = await createDetail(() => of<DayHistoryOut[]>([]), undefined, openEnded);
    await wait();

    expect(service.getHistory).toHaveBeenCalledWith(7, '2026-09-01', undefined);
    expect(comp.toDate).toBeNull();
  });

  it('U7: the chip anchors on the true first-passing day even when the visible range excludes it', async () => {
    // Cumulative fixture habit: the cycle first passed on 09-22.
    const full = [day('2026-09-21'), { ...day('2026-09-22'), isSuccessful: true }, { ...day('2026-09-23'), isSuccessful: true }];
    const visible = [full[2]]; // user narrows the filter to 09-23 only
    const { comp } = await createDetail((_id: number, from?: string) =>
      of<DayHistoryOut[]>(from === undefined ? full : visible)
    );
    await wait();

    expect(comp.history()).toEqual(visible);
    expect(comp.fullHistory()).toEqual(full);
    // Before the fix the chip jumped onto 09-23 (first success IN THE WINDOW).
    expect(comp.showChipFor(visible[0])).toBe(false);
    // The true first-passing day keeps it, even though it is not visible now.
    expect(comp.showChipFor(full[1])).toBe(true);
  });

  it('U7: chip still renders when the unfiltered baseline request fails (graceful fallback)', async () => {
    const visible = [{ ...day('2026-09-23'), isSuccessful: true }];
    const { comp } = await createDetail((_id: number, from?: string) =>
      from === undefined ? throwError(() => new HabitApiError('httpError', 'boom', 500)) : of<DayHistoryOut[]>(visible)
    );
    await wait();

    expect(comp.fullHistory()).toEqual([]);
    expect(comp.showChipFor(visible[0])).toBe(true);
  });
});
