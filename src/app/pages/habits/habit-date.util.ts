// Local-calendar-date helpers. The API's dates are plain `yyyy-MM-dd` strings and
// the server derives "today" in its own timezone (NFR-5); the UI only ever sends
// date strings and displays server-provided ones — no timezone math anywhere.

export function dateToIso(d: Date): string {
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export function isoToDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function todayIso(): string {
  return dateToIso(new Date());
}

/**
 * The punches/history endpoints reject `from > to` with 422 `invalidDateRange`
 * — date pickers are free-standing, so the UI must never send an inverted
 * range. Swapping preserves the user's obvious intent.
 */
export function normalizeDateRange(from?: string, to?: string): { from?: string; to?: string } {
  if (from && to && from > to) {
    return { from: to, to: from };
  }
  return { from, to };
}
