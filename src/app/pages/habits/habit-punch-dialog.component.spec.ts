import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  TranslocoService,
  TRANSLOCO_MISSING_HANDLER,
  TRANSLOCO_TRANSPILER,
} from '@jsverse/transloco';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { dateToIso, isoToDate, todayIso } from './habit-date.util';
import { HabitPunchDialogComponent, todayValueDelta } from './habit-punch-dialog.component';
import type { DayHistoryOut, Habit, HabitItem } from './habit.models';
import { HabitApiError } from './habit.models';
import { HabitService } from './habit.service';

/**
 * Punch-dialog batch semantics (review L8): optimistic boolean day values roll
 * back exactly, buffered numeric hints respect base-rate weighting, and the
 * Punch click closes the dialog once the batch settles — failed items are only
 * reported via the snackbar, retrying happens by reopening.
 */

const habit = { id: 7, name: 'Test habit' } as Habit;

function makeItems(): HabitItem[] {
  return [
    {
      id: 1,
      habitId: 7,
      name: 'Run',
      order: 0,
      createdAt: '',
      hasPunches: false,
      properties: [
        {
          id: 11,
          itemId: 1,
          name: 'done',
          propertyType: 'boolean',
          baseRate: null,
          itemUniqueness: null,
          order: 0,
          createdAt: '',
          currentCycleValue: 0,
          todayValue: null,
        },
      ],
    },
    {
      id: 2,
      habitId: 7,
      name: 'Gym',
      order: 1,
      createdAt: '',
      hasPunches: false,
      properties: [
        {
          id: 21,
          itemId: 2,
          name: 'km',
          propertyType: 'numeric',
          baseRate: 0.5,
          itemUniqueness: null,
          order: 0,
          createdAt: '',
          currentCycleValue: 0,
          todayValue: null,
        },
      ],
    },
  ];
}

const flush = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

async function createDialog(
  items: HabitItem[],
  createPunch: (...args: unknown[]) => unknown,
  getHistory?: (...args: unknown[]) => unknown
) {
  const service = {
    createPunch: vi.fn(createPunch),
    getHistory: vi.fn(getHistory ?? (() => of<DayHistoryOut[]>([]))),
  };
  const snackbar = { open: vi.fn() };
  await TestBed.configureTestingModule({
    providers: [
      { provide: HabitService, useValue: service },
      { provide: MAT_DIALOG_DATA, useValue: { habit, items } },
      { provide: MatDialogRef, useValue: { close: vi.fn() } },
      { provide: MatSnackBar, useValue: snackbar },
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
    ],
  });
  const fixture = TestBed.createComponent(HabitPunchDialogComponent);
  return { comp: fixture.componentInstance, service, snackbar };
}

describe('todayValueDelta (L8d)', () => {
  it('weights numeric inputs by the base rate, defaulting to 1', () => {
    expect(todayValueDelta(0.5, { propertyId: 1, numValue: 10 })).toBe(5);
    expect(todayValueDelta(null, { propertyId: 1, numValue: 10 })).toBe(10);
    expect(todayValueDelta(2, { propertyId: 1, numValue: 2.5 })).toBe(5);
  });

  it('counts list entries and ignores booleans', () => {
    expect(todayValueDelta(null, { propertyId: 1, listEntries: ['a', 'b', 'c'] })).toBe(3);
    expect(todayValueDelta(null, { propertyId: 1, listEntries: [] })).toBe(0);
    expect(todayValueDelta(null, { propertyId: 1 })).toBe(0);
  });
});

describe('HabitPunchDialogComponent', () => {
  it('L8c: restores the previous day value when an optimistic check fails', async () => {
    const items = makeItems();
    const prop = items[0].properties[0];
    const { comp } = await createDialog(items, () => throwError(() => new HabitApiError('outOfWindow', '', 422)));

    comp.onBooleanChange(items[0], prop, true);
    await flush();

    // Before the fix the optimistic `1` survived the failed write.
    expect(prop.todayValue).toBeNull();
    expect(comp.boolState[11]).toBe(false);
  });

  it('L8c: restores an existing value when an optimistic uncheck fails', async () => {
    const items = makeItems();
    const prop = items[0].properties[0];
    prop.todayValue = 1;
    const { comp } = await createDialog(items, () => throwError(() => new HabitApiError('habitInactive', '', 422)));

    comp.onBooleanChange(items[0], prop, false);
    await flush();

    expect(prop.todayValue).toBe(1);
    expect(comp.boolState[11]).toBe(true);
  });

  it('boolean success keeps the optimistic day value', async () => {
    const items = makeItems();
    const prop = items[0].properties[0];
    const { comp } = await createDialog(items, () => of({ id: 50 }));

    comp.onBooleanChange(items[0], prop, true);
    await flush();

    expect(prop.todayValue).toBe(1);
    expect(comp.boolState[11]).toBe(true);
  });

  it('L8d: buffered numeric success accumulates the base-rate-weighted day value', async () => {
    const items = makeItems();
    const numeric = items[1].properties[0];
    const { comp } = await createDialog(items, () => of({ id: 51 }));

    comp.numInputs[21] = 10;
    comp.markDirty();
    comp.submitBuffered();
    await flush();

    // 10 km × 0.5 baseRate = 5 — the old hint added the raw 10.
    expect(numeric.todayValue).toBe(5);
    expect(comp.punchedItems.has(2)).toBe(true);
    expect(comp.numInputs[21]).toBeUndefined();
    expect(comp.dirty()).toBe(false);
    // A fully successful batch closes the dialog with 'saved' (parent refreshes).
    expect(comp.dialogRef.close).toHaveBeenCalledWith('saved');
  });

  it('L8ab: partial batch failure folds the landed items, reports the rest, and closes', async () => {
    const items = makeItems();
    const boolean = items[0].properties[0];
    const numeric = items[1].properties[0];
    boolean.todayValue = 0; // punched earlier today (not part of the batch)
    const { comp, snackbar } = await createDialog(
      items,
      (_habitId: unknown, itemId: unknown) =>
        itemId === 1 ? of({ id: 51 }) : throwError(() => new HabitApiError('outOfWindow', '', 422))
    );

    // Batch for Run (list) and Gym (numeric); Gym's POST fails.
    items[0].properties.push({
      id: 12,
      itemId: 1,
      name: 'notes',
      propertyType: 'list',
      baseRate: null,
      itemUniqueness: 'per_day',
      order: 1,
      createdAt: '',
      currentCycleValue: 0,
      todayValue: null,
    });
    comp.listInputs[12] = 'alpha\nbeta';
    comp.numInputs[21] = 10;
    comp.markDirty();
    comp.submitBuffered();
    await flush();

    // Run saved: inputs cleared, day value updated, item marked punched.
    expect(comp.punchedItems.has(1)).toBe(true);
    expect(items[0].properties[1].todayValue).toBe(2);
    expect(comp.listInputs[12]).toBeUndefined();
    // Gym failed: NOT marked punched, nothing folded into its day value.
    expect(comp.punchedItems.has(2)).toBe(false);
    expect(numeric.todayValue).toBeNull();
    // Failed items are named in an error-styled snackbar...
    expect(snackbar.open).toHaveBeenCalledTimes(1);
    expect(snackbar.open.mock.calls[0][0]).toBe('habits.punch.partialFailure');
    const options = snackbar.open.mock.calls[0][2] as { panelClass?: string[] };
    expect(options.panelClass).toEqual(['habit-error-snackbar']);
    // ...and the dialog closes regardless — retrying means reopening.
    expect(comp.dialogRef.close).toHaveBeenCalledWith('saved');
  });

  it('L8a: a fully failed batch still closes the dialog and reports the failure', async () => {
    const items = makeItems();
    const { comp, snackbar } = await createDialog(items, () => throwError(() => new HabitApiError('networkError', '', 0)));

    comp.numInputs[21] = 3;
    comp.markDirty();
    comp.submitBuffered();
    await flush();

    // Nothing landed, but the batch settled: snackbar + close. The 'saved'
    // result makes the opener refetch the authoritative state.
    expect(snackbar.open).toHaveBeenCalledTimes(1);
    expect(snackbar.open.mock.calls[0][0]).toBe('habits.punch.partialFailure');
    expect(comp.dialogRef.close).toHaveBeenCalledWith('saved');
  });

  it('Punch with nothing buffered closes the dialog — undefined when the session recorded nothing', async () => {
    const items = makeItems();
    const { comp, service } = await createDialog(items, () => of({ id: 80 }));

    comp.submitBuffered();

    expect(service.createPunch).not.toHaveBeenCalled();
    expect(comp.dialogRef.close).toHaveBeenCalledWith(undefined);
  });

  it('Punch with nothing buffered still closes with saved after a boolean auto-submit landed', async () => {
    const items = makeItems();
    const { comp } = await createDialog(items, () => of({ id: 81 }));

    comp.onBooleanChange(items[0], items[0].properties[0], true);
    await flush();
    comp.submitBuffered();

    // Booleans never set the buffered path — the click must still close, and
    // 'saved' refreshes the opener so the recorded checkbox shows up there.
    expect(comp.dialogRef.close).toHaveBeenCalledWith('saved');
  });
});

/** Back-fill support: the dialog's date picker selects the punched day. */
describe('HabitPunchDialogComponent — punch date', () => {
  function yesterdayIso(): string {
    const d = isoToDate(todayIso());
    d.setDate(d.getDate() - 1);
    return dateToIso(d);
  }

  function dayRecord(date: string, values: DayHistoryOut['punches'][number]['values'][]): DayHistoryOut[] {
    return values.map((vs, i) => ({
      date,
      cycleFrom: date,
      cycleTo: date,
      isSuccessful: false,
      criteria: [],
      punches: [
        {
          id: 100 + i,
          habitId: 7,
          itemId: 1,
          punchedAt: '',
          punchDate: date,
          createdAt: '',
          values: vs,
        },
      ],
    }));
  }

  it('defaults to today: no punchDate in the body and no History fetch', async () => {
    const items = makeItems();
    const { comp, service } = await createDialog(items, () => of({ id: 60 }));

    comp.numInputs[21] = 2;
    comp.markDirty();
    comp.submitBuffered();
    await flush();

    expect(comp.selectedDate()).toBe(todayIso());
    expect(service.getHistory).not.toHaveBeenCalled();
    expect((service.createPunch.mock.calls[0][2] as { punchDate?: string }).punchDate).toBeUndefined();
  });

  it('selecting a past day fetches its record, prefills the overlay, and sends punchDate', async () => {
    const items = makeItems();
    const y = yesterdayIso();
    const days = dayRecord(y, [
      [{ propertyId: 11, propertyName: 'done', propertyType: 'boolean', boolValue: true, numValue: null, listEntries: null }],
      [{ propertyId: 21, propertyName: 'km', propertyType: 'numeric', boolValue: null, numValue: 6, listEntries: null }],
    ]);
    const { comp, service } = await createDialog(items, () => of({ id: 61 }), () => of(days));

    comp.onDateChange(isoToDate(y));
    await flush();

    expect(service.getHistory).toHaveBeenCalledWith(7, y, y);
    expect(comp.selectedDate()).toBe(y);
    // boolean row → 1; numeric 6 × baseRate 0.5 → 3 (mirrors the server aggregation).
    expect(comp.dayState()).toEqual({ 11: 1, 21: 3 });
    expect(comp.dayValue(items[1].properties[0])).toBe(3);
    expect(comp.dayValue(items[0].properties[0])).toBe(1);

    comp.numInputs[21] = 1;
    comp.markDirty();
    comp.submitBuffered();
    await flush();
    expect(service.createPunch.mock.calls[0][2]).toEqual({
      values: [{ propertyId: 21, numValue: 1 }],
      punchDate: y,
    });
    // Past-day success accumulates the overlay, NOT the payload's todayValue:
    // recorded 6×0.5=3 plus the new session's 1×0.5 (base-rate weighting).
    expect(comp.dayState()![21]).toBe(3.5);
    expect(items[1].properties[0].todayValue).toBeNull();
  });

  it('a day change drops buffered inputs and the dirty flag', async () => {
    const items = makeItems();
    const { comp } = await createDialog(items, () => of({ id: 62 }));

    comp.numInputs[21] = 5;
    comp.markDirty();
    comp.onDateChange(isoToDate(yesterdayIso()));

    expect(comp.dirty()).toBe(false);
    expect(comp.numInputs[21]).toBeUndefined();
    expect(comp.selectedDate()).toBe(yesterdayIso());
  });

  it('uncheck-suppression follows the selected day, not today', async () => {
    const items = makeItems();
    // Yesterday has NO records; today would have one — the suppression must use the day.
    const { comp, service } = await createDialog(items, () => of({ id: 63 }));
    items[0].properties[0].todayValue = 1;

    comp.onDateChange(isoToDate(yesterdayIso()));
    await flush();
    comp.onBooleanChange(items[0], items[0].properties[0], false);
    await flush();

    expect(service.createPunch).not.toHaveBeenCalled();
    expect(comp.boolState[11]).toBe(false);
  });

  it('switching back to today restores the todayValue path', async () => {
    const items = makeItems();
    const y = yesterdayIso();
    const { comp, service } = await createDialog(
      items,
      () => of({ id: 64 }),
      () => of(dayRecord(y, [[{ propertyId: 11, propertyName: 'done', propertyType: 'boolean', boolValue: true, numValue: null, listEntries: null }]]))
    );

    comp.onDateChange(isoToDate(y));
    await flush();
    expect(comp.dayState()).toEqual({ 11: 1 });

    comp.onDateChange(isoToDate(todayIso()));
    await flush();
    expect(comp.dayState()).toBeNull();
    expect(service.getHistory).toHaveBeenCalledTimes(1); // back to today → no extra fetch
  });
});

describe('Date picker locking (revised FR-3.1: landed punches pin their date)', () => {
  const yesterdayIso = (): string => {
    const d = isoToDate(todayIso());
    d.setDate(d.getDate() - 1);
    return dateToIso(d);
  };
  it('locks the picker once a punch of this session has landed', async () => {
    const items = makeItems();
    const { comp } = await createDialog(items, () => of({ id: 70 }));
    expect(comp.dayLocked()).toBe(false);

    comp.onBooleanChange(items[0], items[0].properties[0], true);
    await flush();
    expect(comp.dayLocked()).toBe(true);

    // A locked picker ignores date changes — the stamped day cannot drift
    // under already-recorded values.
    comp.onDateChange(isoToDate(yesterdayIso()));
    expect(comp.selectedDate()).toBe(todayIso());
  });

  it('a failed punch does NOT lock the picker', async () => {
    const items = makeItems();
    const { comp } = await createDialog(
      items,
      () => throwError(() => new HabitApiError('outOfWindow', 'outside window', 422))
    );
    comp.onBooleanChange(items[0], items[0].properties[0], true);
    await flush();
    expect(comp.dayLocked()).toBe(false);
    expect(comp.selectedDate()).toBe(todayIso());

    comp.onDateChange(isoToDate(yesterdayIso()));
    expect(comp.selectedDate()).toBe(yesterdayIso());
  });
});
