// Step 4 preview simulation (docs/design-habit-ui.md § Step 4): a client-side
// animation of one ideal successful cycle. It replays the API's bottom-up
// evaluation (condition aggregation → composite → root, see design-habit-api.md)
// against fabricated "full punches" — every item punched every day, with just
// enough quantity to satisfy its criterion at the cycle's end — and never calls
// the server. Approximate by design for subset scopes, non-monotonic aggregation
// modes and per_cycle list properties; the wizard shows a warning banner when
// simulationIsApproximate() is true.
//
// Model mirrors: conditions compare the aggregate against their own threshold with
// >=; daily mode judges the ROOT per day (condition root: its threshold; composite
// root: pass bit — never the operand count); cumulative mode judges the derived
// target (condition root: threshold; composite root: passing-operand rule).

import type { AggregationMode, HabitCycle, SuccessType } from './habit.models';

export interface SimProperty {
  name: string;
  propertyType: 'boolean' | 'numeric' | 'list';
  /** Numeric weighting the API applies (`value × (baseRate ?? 1)`); null ⇒ 1. */
  baseRate?: number | null;
  /** List properties only — drives the approximate-preview warning. */
  itemUniqueness?: 'per_day' | 'per_cycle' | null;
}

export interface SimItem {
  name: string;
  properties: SimProperty[];
}

export interface SimCriterion {
  name: string;
  isRoot: boolean;
  criterionType: 'condition' | 'composite';
  /** Condition: property name; composite: operand criterion names. */
  propertyName?: string | null;
  /** Empty / undefined ⇒ all items (mirrors `itemScope: 'all'`). */
  scopeItemNames?: string[] | null;
  /** Condition: effective aggregation mode (null ⇒ type default). */
  aggregationMode?: AggregationMode | null;
  threshold?: number | null;
  operator?: 'and' | 'or' | 'not' | null;
  operandNames?: string[] | null;
  /** Root only. */
  successType?: SuccessType | null;
  /** Daily root: successful days required. Cumulative: null (derived). */
  cycleTarget?: number | null;
}

export interface SimCriterionState {
  name: string;
  passed: boolean;
  value: number;
}

export interface SimDay {
  date: string;
  criteria: SimCriterionState[];
  rootPassed: boolean;
  rootValue: number;
  /** Item names that received a fabricated punch on this day. */
  punchedItems: string[];
}

const iso = (d: Date): string => {
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
};

const parseIso = (s: string): Date => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
};

const addDays = (d: Date, n: number): Date => {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
};

/**
 * The API's ComputeCycleWindow: anchor re-clamped into the active window
 * ([startDate, endDate]), then the natural window (daily = the day; weekly =
 * ISO Mon–Sun; monthly = calendar month; whole = the entire [start, end] span),
 * finally clamped to the active window. A habit not yet started previews its
 * FIRST cycle; an ended habit previews its LAST cycle.
 */
export function simCycleDates(cycle: HabitCycle, startDate: string, endDate: string | null, today: string): string[] {
  const start = parseIso(startDate);
  const end = endDate ? parseIso(endDate) : null;
  const t = parseIso(today);
  let anchor = t;
  if (anchor < start) {
    anchor = start;
  }
  if (end && anchor > end) {
    anchor = end;
  }
  let windowFrom = anchor;
  let windowTo = anchor;
  if (cycle === 'whole') {
    windowFrom = start;
    windowTo = end ?? anchor;
  } else if (cycle === 'weekly') {
    const dow = (anchor.getDay() + 6) % 7; // Monday = 0
    windowFrom = addDays(anchor, -dow);
    windowTo = addDays(windowFrom, 6);
  } else if (cycle === 'monthly') {
    windowFrom = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    windowTo = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0);
  }
  if (windowFrom < start) {
    windowFrom = start;
  }
  if (end && windowTo > end) {
    windowTo = end;
  }
  const dates: string[] = [];
  for (let d = new Date(windowFrom); d <= windowTo; d = addDays(d, 1)) {
    dates.push(iso(d));
  }
  return dates;
}

/**
 * Fabricate one ideal punch per item per day and evaluate the criterion tree
 * bottom-up, once per day. Cumulative numeric/list conditions gain
 * `threshold / days` each day (reaching the derived target exactly at the cycle
 * end); boolean conditions are fully done from day 1; in daily mode each day's
 * fabricated quantity reaches the root condition's own threshold (or every boolean
 * item is done so composite AND roots pass every day). The pass is latched in
 * cumulative mode like the API — once reached it sticks.
 */
export function simulateCycle(
  cycle: HabitCycle,
  startDate: string,
  endDate: string | null,
  items: SimItem[],
  criteria: SimCriterion[]
): SimDay[] {
  const dates = simCycleDates(cycle, startDate, endDate, iso(new Date()));
  const root = criteria.find((c) => c.isRoot) ?? criteria[0];
  if (dates.length === 0 || !root) {
    return [];
  }
  const days = dates.length;
  const criterionByName = new Map(criteria.map((c) => [c.name, c]));
  const itemByName = new Map(items.map((i) => [i.name, i]));
  const dailyMode = root.successType === 'daily';

  const scopedItems = (c: SimCriterion): SimItem[] => {
    const names = c.scopeItemNames;
    if (!names || names.length === 0) {
      return items;
    }
    return names.map((n) => itemByName.get(n)).filter((i): i is SimItem => i !== undefined);
  };

  const propsOf = (c: SimCriterion): SimProperty[] =>
    scopedItems(c)
      .flatMap((i) => i.properties.filter((p) => p.name === c.propertyName));

  const weightFor = (p: SimProperty): number => {
    const w = p.propertyType === 'numeric' ? (p.baseRate ?? 1) : 1;
    return w > 0 ? w : 1;
  };

  /** Ideal single-day value for a condition: enough to satisfy its threshold pace-wise. */
  const dayValue = (c: SimCriterion): number => {
    const props = propsOf(c);
    const threshold = c.threshold ?? 1;
    if (props.length === 0) {
      return 0;
    }
    const firstType = props[0].propertyType;
    if (firstType === 'boolean') {
      // Every scoped item is "done" every day in the ideal cycle.
      return props.length;
    }
    if (dailyMode) {
      // Fabricate just enough to pass the day (the day's own threshold).
      const booleanCount = props.filter((p) => p.propertyType === 'boolean').length;
      const quantitative = props.filter((p) => p.propertyType !== 'boolean');
      const remaining = Math.max(0, threshold - booleanCount);
      const totalWeight = quantitative.reduce((sum, p) => sum + weightFor(p), 0);
      // Fabricated quantity per weight unit so the WEIGHTED sum reaches the
      // day's threshold exactly (each item contributes qty × baseRate).
      const perWeightUnit = totalWeight > 0 ? remaining / totalWeight : 0;
      let value = booleanCount;
      for (const p of quantitative) {
        value += perWeightUnit * weightFor(p);
      }
      return value;
    }
    // Cumulative: linear pace so the threshold is met at the very last day.
    return threshold / days;
  };

  /** Cumulative aggregate of the ideal daily values through dayIdx. */
  const cumulativeValue = (c: SimCriterion, dayIdx: number): number => {
    const props = propsOf(c);
    if (props.length === 0) {
      return 0;
    }
    if (props[0].propertyType === 'boolean') {
      return props.length; // ever_true from day 1
    }
    return dayValue(c) * (dayIdx + 1);
  };

  const evalAt = (c: SimCriterion, dayIdx: number, seen: Set<string>): SimCriterionState => {
    if (seen.has(c.name)) {
      return { name: c.name, passed: false, value: 0 }; // cycle guard (validated elsewhere)
    }
    seen.add(c.name);
    if (c.criterionType === 'condition') {
      // Daily mode judges the day's value; cumulative compares the running
      // aggregate against the condition's own threshold (its derived target when it
      // is the root).
      const value = dailyMode ? dayValue(c) : cumulativeValue(c, dayIdx);
      return { name: c.name, passed: value >= (c.threshold ?? 1), value };
    }
    const operands = (c.operandNames ?? [])
      .map((n) => criterionByName.get(n))
      .filter((o): o is SimCriterion => o !== undefined)
      .map((o) => evalAt(o, dayIdx, seen));
    const passing = operands.filter((o) => o.passed).length;
    switch (c.operator) {
      case 'or':
        return { name: c.name, passed: passing >= 1, value: passing };
      case 'not':
        return { name: c.name, passed: operands.length >= 1 && passing === 0, value: passing };
      default:
        return { name: c.name, passed: operands.length >= 1 && passing === operands.length, value: passing };
    }
  };

  const result: SimDay[] = [];
  let successfulDays = 0;
  let latched = false; // cumulative pass is latched within the cycle

  dates.forEach((date, dayIdx) => {
    const states = criteria.map((c) => evalAt(c, dayIdx, new Set<string>()));
    const rootState = states.find((s) => s.name === root.name) ?? states[0];

    let rootValue: number;
    let rootPassed: boolean;
    if (dailyMode) {
      // The composite/condition root's PASS bit marks the day successful; days count
      // toward cycleTarget. (For composites rootState.value is the operand count —
      // not the day signal.)
      if (rootState.passed) {
        successfulDays += 1;
      }
      rootValue = successfulDays;
      rootPassed = successfulDays >= (root.cycleTarget ?? 1);
    } else {
      latched = latched || rootState.passed;
      rootValue = rootState.value;
      rootPassed = latched;
    }

    result.push({
      date,
      criteria: states.map((s) => (s.name === root.name ? { ...s, value: dailyMode ? rootValue : s.value, passed: rootPassed } : s)),
      rootPassed,
      rootValue,
      punchedItems: items.map((i) => i.name),
    });
  });

  return result;
}

/**
 * True when the configuration is only approximately simulated (warning banner):
 * subset scopes (the ideal punch fills EVERY item, over-satisfying subset
 * criteria), non-monotonic aggregation modes (`avg`/`min`/`latest` — the ideal
 * pace cannot replay order sensitivity), and list properties with `per_cycle`
 * uniqueness (fabricated entries may collide).
 */
export function simulationIsApproximate(items: SimItem[], criteria: SimCriterion[]): boolean {
  const hasSubset = criteria.some((c) => c.criterionType === 'condition' && !!c.scopeItemNames && c.scopeItemNames.length > 0);
  const hasNonMonotonic = criteria.some((c) => c.aggregationMode === 'avg' || c.aggregationMode === 'min' || c.aggregationMode === 'latest');
  const hasPerCycleList = items.some((i) => i.properties.some((p) => p.propertyType === 'list' && p.itemUniqueness === 'per_cycle'));
  return hasSubset || hasNonMonotonic || hasPerCycleList;
}
