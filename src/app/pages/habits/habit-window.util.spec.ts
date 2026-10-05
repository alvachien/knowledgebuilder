import { dateToIso, isoToDate, todayIso } from './habit-date.util';
import { canPunchOn, canPunchToday, punchDateBounds, type HabitWindow } from './habit-window.util';

/** Offset from today as `yyyy-MM-dd` — fixtures never hard-code dates (stale-clock rule). */
function day(offset: number): string {
  const d = isoToDate(todayIso());
  d.setDate(d.getDate() + offset);
  return dateToIso(d);
}

function habit(partial: Partial<HabitWindow> = {}): HabitWindow {
  return { state: 'active', startDate: day(-10), endDate: null, ...partial };
}

describe('canPunchOn', () => {
  it('allows any PAST day inside an open-ended window; never the future', () => {
    const h = habit();
    expect(canPunchOn(h, day(-10))).toBe(true); // start, inclusive
    expect(canPunchOn(h, todayIso())).toBe(true);
    // Revised spec FR-3.1: back-fill is for missed days only — the API
    // rejects future punch dates, so the UI must not offer them.
    expect(canPunchOn(h, day(365))).toBe(false);
  });

  it('allows days inside a bounded window, rejects outside', () => {
    const h = habit({ endDate: day(-2) });
    expect(canPunchOn(h, day(-5))).toBe(true);
    expect(canPunchOn(h, day(-2))).toBe(true); // end, inclusive
    expect(canPunchOn(h, day(-1))).toBe(false);
  });

  it('rejects days before the start date', () => {
    expect(canPunchOn(habit({ startDate: day(5) }), todayIso())).toBe(false);
  });

  it('rejects inactive habits regardless of date', () => {
    expect(canPunchOn(habit({ state: 'inactive' }), todayIso())).toBe(false);
  });

  it('offers the Punch affordance while any day is back-fills-able (FR-3.3 gates the PUNCH DATE)', () => {
    expect(canPunchToday(habit())).toBe(true);
    expect(canPunchToday(habit({ startDate: day(1) }))).toBe(false);
    // Active habit whose period ended yesterday: today itself is out of
    // window, but the past in-window days are still punchable — the
    // back-fill capability keeps the button visible.
    expect(canPunchToday(habit({ endDate: day(-1) }))).toBe(true);
    expect(canPunchToday(habit({ state: 'inactive', endDate: day(-1) }))).toBe(false);
  });
});

describe('punchDateBounds', () => {
  it('spans startDate..today for open-ended in-window habits', () => {
    const h = habit({ startDate: day(-10) });
    expect(punchDateBounds(h)).toEqual({ min: day(-10), max: todayIso() });
  });

  it('caps at endDate once the period passed — back-fill stays available (FR-3.1)', () => {
    const h = habit({ startDate: day(-10), endDate: day(-2) });
    // The old contract forbade back-fill after the period; the revised spec
    // gates on the punch date, not "today", while the habit is still active.
    expect(punchDateBounds(h)).toEqual({ min: day(-10), max: day(-2) });
  });

  it('uses today when endDate lies in the future', () => {
    const h = habit({ startDate: day(-10), endDate: day(7) });
    expect(punchDateBounds(h)).toEqual({ min: day(-10), max: todayIso() });
  });

  it('returns null when no day is punchable (future start / inactive)', () => {
    expect(punchDateBounds(habit({ startDate: day(3) }))).toBeNull();
    expect(punchDateBounds(habit({ state: 'inactive' }))).toBeNull();
  });
});
