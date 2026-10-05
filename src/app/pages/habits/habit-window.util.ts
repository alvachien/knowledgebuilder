// Habit active-window rules shared by the list/detail punch gating and the punch
// dialog's date picker. The API enforces the same window (FR-3.3, revised spec:
// the state + window checks apply to NEW punches and are evaluated against the
// PUNCH DATE — not "today"; edits/deletes of existing records are exempt).
// These helpers keep the UI from offering actions the backend would reject with
// `outOfWindow`. All comparisons are on plain `yyyy-MM-dd` strings, which sort
// chronologically.

import { todayIso } from './habit-date.util';

/** The fields of a habit the window rules need (avoids a full-typed test fixture). */
export interface HabitWindow {
  state: 'active' | 'inactive';
  startDate: string;
  endDate: string | null;
}

/**
 * Whether a NEW punch may be recorded for `dayIso`: the habit is ACTIVE and the
 * punch date lies inside [startDate, endDate]; never a future date (the API
 * rejects back-dated punches beyond "on or before server today").
 */
export function canPunchOn(habit: HabitWindow, dayIso: string): boolean {
  if (habit.state !== 'active') {
    return false;
  }
  const today = todayIso();
  if (dayIso > today) {
    return false;
  }
  if (dayIso < habit.startDate) {
    return false;
  }
  return habit.endDate === null || dayIso <= habit.endDate;
}

/**
 * Whether the Punch affordance should be offered at all: the habit must be
 * active and have at least one punchable day — startDate reached (a future-start
 * habit cannot be punched yet). A habit whose endDate has PASSED still allows
 * back-filling past in-window days while active (FR-3.1), so the button stays.
 */
export function canPunchToday(habit: HabitWindow): boolean {
  return habit.state === 'active' && habit.startDate <= todayIso();
}

/**
 * Bounds for the punch dialog's date picker: `[startDate, min(endDate, today)]`
 * — back-fill within the window is allowed, future dates are not. Null when no
 * punchable day exists at all (future-start habit or inactive), in which case
 * the Punch button itself is hidden (`canPunchToday`).
 */
export function punchDateBounds(habit: HabitWindow): { min: string; max: string } | null {
  if (!canPunchToday(habit)) {
    return null;
  }
  const today = todayIso();
  const max = habit.endDate !== null && habit.endDate < today ? habit.endDate : today;
  return { min: habit.startDate, max };
}
