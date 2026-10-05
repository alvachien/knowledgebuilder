import { dateToIso, isoToDate, normalizeDateRange, todayIso } from './habit-date.util';

describe('normalizeDateRange', () => {
  it('swaps an inverted range so the API never sees from > to (invalidDateRange 422)', () => {
    expect(normalizeDateRange('2026-09-20', '2026-09-10')).toEqual({ from: '2026-09-10', to: '2026-09-20' });
  });

  it('passes through a valid or equal range untouched', () => {
    expect(normalizeDateRange('2026-09-10', '2026-09-20')).toEqual({ from: '2026-09-10', to: '2026-09-20' });
    expect(normalizeDateRange('2026-09-10', '2026-09-10')).toEqual({ from: '2026-09-10', to: '2026-09-10' });
  });

  it('keeps open-ended ranges as-is', () => {
    expect(normalizeDateRange(undefined, '2026-09-20')).toEqual({ from: undefined, to: '2026-09-20' });
    expect(normalizeDateRange('2026-09-20', undefined)).toEqual({ from: '2026-09-20', to: undefined });
    expect(normalizeDateRange()).toEqual({ from: undefined, to: undefined });
  });
});

describe('date round-trip', () => {
  it('isoToDate and dateToIso are inverse on local calendar dates', () => {
    const d = new Date(2026, 8, 25);
    expect(dateToIso(isoToDate('2026-09-25'))).toBe('2026-09-25');
    expect(isoToDate(dateToIso(d))).toEqual(d);
  });

  it('todayIso formats the browser-local date as yyyy-MM-dd', () => {
    expect(todayIso()).toBe(dateToIso(new Date()));
    expect(todayIso()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
