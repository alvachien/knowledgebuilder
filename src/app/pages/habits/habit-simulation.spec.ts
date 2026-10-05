import { simulateCycle, simCycleDates, simulationIsApproximate, type SimCriterion, type SimItem } from './habit-simulation';

/**
 * Preview simulation fidelity (review M4): the window must follow the API's
 * anchor-then-natural-window-then-clamp order, and day-count conditions must be
 * evaluated against the fabricated per-item quantities (weighted by baseRate),
 * not against the bare item count.
 */

function isoUtc(d: Date): string {
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

describe('simCycleDates — API window anchoring', () => {
  it('anchors a future start date on startDate instead of today (no empty window)', () => {
    // Old code: today (Wed 2026-09-23) → window Mon 21…Sun 27 clamped below
    // start Oct 5 → windowTo < windowFrom → []. Now the anchor is re-clamped
    // into the window first.
    const dates = simCycleDates('weekly', '2026-10-05', null, '2026-09-23');
    expect(dates.length).toBeGreaterThan(0);
    expect(dates[0]).toBe('2026-10-05'); // Monday of that week — natural window, no clamp needed
    expect(dates[dates.length - 1]).toBe('2026-10-11'); // Sunday
    expect(dates.length).toBe(7);
  });

  it('weekly window is ISO Mon–Sun around the anchor', () => {
    const dates = simCycleDates('weekly', '2026-01-01', null, '2026-09-23');
    expect(dates[0]).toBe('2026-09-21'); // Monday
    expect(dates[6]).toBe('2026-09-27'); // Sunday
    expect(dates.length).toBe(7);
  });

  it('weekly window is clamped at both ends of the active window', () => {
    const dates = simCycleDates('weekly', '2026-09-23', '2026-09-25', '2026-09-24');
    expect(dates).toEqual(['2026-09-23', '2026-09-24', '2026-09-25']);
  });

  it('monthly window is the calendar month of the anchor', () => {
    const dates = simCycleDates('monthly', '2026-01-01', '2026-12-31', '2026-02-15');
    expect(dates.length).toBe(28); // Feb 2026, not a leap year
    expect(dates[0]).toBe('2026-02-01');
    expect(dates[27]).toBe('2026-02-28');
  });

  it('monthly window boundaries clamp to start/end', () => {
    const dates = simCycleDates('monthly', '2026-02-10', '2026-02-20', '2026-02-15');
    expect(dates[0]).toBe('2026-02-10');
    expect(dates[dates.length - 1]).toBe('2026-02-20');
    expect(dates.length).toBe(11);
  });

  it('a habit that already ended anchors on endDate', () => {
    const dates = simCycleDates('weekly', '2026-01-01', '2026-03-04', '2026-09-23');
    expect(dates.length).toBeGreaterThan(0);
    expect(dates[dates.length - 1]).toBe('2026-03-04');
    expect(dates[0]).toBe('2026-03-02'); // Monday of the final week
  });

  it('daily cycle yields exactly the (clamped) anchor day', () => {
    expect(simCycleDates('daily', '2026-09-01', null, '2026-09-23')).toEqual(['2026-09-23']);
    expect(simCycleDates('daily', '2026-10-01', null, '2026-09-23')).toEqual(['2026-10-01']);
  });

  it('whole cycle spans the entire habit, not a single day', () => {
    // Regression: without a `whole` branch the preview fell through to the
    // daily single-day window, hiding all but one day of the whole-period goal.
    const dates = simCycleDates('whole', '2026-09-21', '2026-10-05', '2026-09-23');
    expect(dates[0]).toBe('2026-09-21');
    expect(dates[dates.length - 1]).toBe('2026-10-05');
    expect(dates.length).toBe(15);
  });

  it('open-ended whole cycle runs start…today and clamps to the span', () => {
    expect(simCycleDates('whole', '2026-09-21', null, '2026-09-25')).toEqual([
      '2026-09-21', '2026-09-22', '2026-09-23', '2026-09-24', '2026-09-25',
    ]);
    // Future start (today before startDate): the single-day window still works.
    expect(simCycleDates('whole', '2026-10-01', null, '2026-09-23')).toEqual(['2026-10-01']);
  });
});

describe('simulateCycle', () => {
  const items: SimItem[] = [
    { name: 'Run', properties: [{ name: 'distance', propertyType: 'numeric' }] },
  ];
  const booleanItems: SimItem[] = [
    { name: 'Pushups', properties: [{ name: 'done', propertyType: 'boolean' }] },
  ];
  const perDayListItems: SimItem[] = [
    { name: 'Words', properties: [{ name: 'word', propertyType: 'list', itemUniqueness: 'per_day' }] },
  ];
  const perCycleListItems: SimItem[] = [
    { name: 'Words', properties: [{ name: 'word', propertyType: 'list', itemUniqueness: 'per_cycle' }] },
  ];

  function rootCriterion(overrides: Partial<SimCriterion>): SimCriterion {
    return {
      name: 'Goal',
      isRoot: true,
      criterionType: 'condition',
      propertyName: 'distance',
      threshold: null,
      operator: null,
      operandNames: null,
      aggregationMode: null,
      successType: 'cumulative',
      cycleTarget: null,
      ...overrides,
    };
  }

  it('future start date yields a non-empty simulation (old code: empty preview)', () => {
    const days = simulateCycle('weekly', '2030-01-01', null, items, [rootCriterion({ threshold: 30 })]);
    expect(days.length).toBeGreaterThan(0);
    expect(days[0].date).toBe('2030-01-01'); // Tuesday → window clamped from start
    expect(days[days.length - 1].date).toBe('2030-01-06'); // Sunday
  });

  // A start date ≥ a week back keeps the (unbounded-end) weekly window at its
  // full 7 days regardless of the real test-run weekday — the simulation
  // anchors on the browser's today.
  const pastStart = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return isoUtc(d);
  })();

  it('numeric cumulative root passes on the final day (ideal pace toward the threshold)', () => {
    const days = simulateCycle('weekly', pastStart, null, items, [rootCriterion({ threshold: 10 })]);
    expect(days.length).toBe(7);
    expect(days[days.length - 1].rootPassed).toBe(true);
    expect(days[days.length - 2].rootPassed).toBe(false);
    expect(days[0].rootPassed).toBe(false);
    expect(days[days.length - 1].rootValue).toBeCloseTo(10, 5);
  });

  // The cumulative target is the ROOT THRESHOLD itself (spec: no stored
  // cycleTarget for cumulative roots) — lowering the threshold changes the pace.
  it('threshold drives the cumulative pace', () => {
    const days = simulateCycle('weekly', pastStart, null, items, [rootCriterion({ threshold: 10 })]);
    expect(days[0].rootValue).toBeCloseTo(10 / 7, 5);
    expect(days[days.length - 1].rootValue).toBeCloseTo(10, 5);
    expect(days[days.length - 1].rootPassed).toBe(true);
  });

  it('cumulative pass is latched once reached', () => {
    const days = simulateCycle('weekly', pastStart, null, items, [rootCriterion({ threshold: 4 })]);
    // The ideal pace crosses 4 on day 5 (4/7 × n ≥ 4 ⇒ n = 7)… monotone pace:
    // every day from the first pass onward stays passed.
    let seenPass = false;
    for (const d of days) {
      if (d.rootPassed) {
        seenPass = true;
      } else {
        expect(seenPass, d.date).toBe(false); // no pass→fail flip
      }
    }
    expect(days[days.length - 1].rootPassed).toBe(true);
  });

  it('list cumulative root paces at its threshold too', () => {
    const days = simulateCycle(
      'weekly',
      pastStart,
      null,
      perDayListItems,
      [rootCriterion({ propertyName: 'word', threshold: 4 })]
    );
    expect(days[days.length - 1].rootValue).toBeCloseTo(4, 5);
    expect(days[days.length - 1].rootPassed).toBe(true);
  });

  it('daily numeric root with threshold > item count passes every day (M4)', () => {
    // 1 item, daily root threshold 30 km, cycleTarget 5 of 7 days. The
    // fabricated quantity reaches the day threshold every day, so exactly one
    // successful day lands per simulated day.
    const days = simulateCycle(
      'weekly',
      pastStart,
      null,
      items,
      [rootCriterion({ propertyName: 'distance', threshold: 30, successType: 'daily', cycleTarget: 5 })]
    );
    expect(days.length).toBe(7);
    days.forEach((d, i) => {
      expect(d.rootValue, `day ${i}`).toBe(i + 1); // successful-days counter
    });
    // The cycle passes when the 5th successful day lands.
    expect(days[3].rootPassed).toBe(false);
    expect(days[4].rootPassed).toBe(true);
  });

  it('daily numeric quantities respect the base rate weighting', () => {
    const weightedItems: SimItem[] = [
      { name: 'Pushups', properties: [{ name: 'reps', propertyType: 'numeric', baseRate: 0.5 }] },
    ];
    const days = simulateCycle(
      'weekly',
      pastStart,
      null,
      weightedItems,
      [rootCriterion({ propertyName: 'reps', threshold: 10, successType: 'daily', cycleTarget: 7 })]
    );
    // Fabricated qty × baseRate ≥ the daily threshold every day ⇒ 7 successful
    // days (dayValue must solve the weighted sum, not split the target by item
    // count — foundation check).
    days.forEach((d, i) => {
      expect(d.rootValue, `day ${i}`).toBe(i + 1);
    });
    expect(days[days.length - 1].rootPassed).toBe(true);
  });

  it('daily list root counts fabricated entries', () => {
    const days = simulateCycle(
      'daily',
      isoUtc(new Date()),
      null,
      perDayListItems,
      [rootCriterion({ propertyName: 'word', threshold: 10, successType: 'daily', cycleTarget: 1 })]
    );
    expect(days.length).toBe(1);
    expect(days[0].rootValue).toBe(1); // the single fabricated day passes
    expect(days[0].rootPassed).toBe(true);
  });

  it('daily boolean day value is capped at one point per item per day', () => {
    const days = simulateCycle(
      'weekly',
      pastStart,
      null,
      booleanItems,
      [rootCriterion({ propertyName: 'done', threshold: 2, successType: 'daily', cycleTarget: 5 })]
    );
    // 1 scoped boolean item < item-count threshold 2 ⇒ no fabricated punch can
    // pass a day, so the successful-day counter stays at 0 (correct per spec
    // boolean count semantics).
    expect(days.length).toBe(7);
    expect(days.every((d) => d.rootValue === 0 && !d.rootPassed)).toBe(true);
  });

  it('daily composite root counts days on its pass bit, not the operand count (RC-11)', () => {
    // AND over two per-item boolean conditions: both done every day ⇒ every day
    // passes ⇒ the counter climbs 1..7 and the cycle lands at cycleTarget 5.
    const condA: SimCriterion = { name: 'A', isRoot: false, criterionType: 'condition', propertyName: 'done', scopeItemNames: ['Pushups'], threshold: 1 };
    const rootC: SimCriterion = {
      name: 'Root',
      isRoot: true,
      criterionType: 'composite',
      operator: 'and',
      operandNames: ['A'],
      successType: 'daily',
      cycleTarget: 5,
    };
    const days = simulateCycle('weekly', pastStart, null, booleanItems, [condA, rootC]);
    // NB: a real AND needs ≥2 operands; the simulation engine only counts
    // passing operands, so this pins the pass-bit mechanics.
    days.forEach((d, i) => {
      expect(d.rootValue, `day ${i}`).toBe(i + 1);
    });
    expect(days[3].rootPassed).toBe(false);
    expect(days[4].rootPassed).toBe(true);
  });

  it('approximate flag: subset scopes, non-monotonic modes and per_cycle lists', () => {
    const subset: SimCriterion = rootCriterion({ propertyName: 'distance', threshold: 10, scopeItemNames: ['Run'] });
    expect(simulationIsApproximate(items, [subset])).toBe(true);
    const avg: SimCriterion = rootCriterion({ propertyName: 'distance', threshold: 10, aggregationMode: 'avg' });
    expect(simulationIsApproximate(items, [avg])).toBe(true);
    expect(
      simulationIsApproximate(perCycleListItems, [rootCriterion({ propertyName: 'word', threshold: 10 })])
    ).toBe(true);
    // Plain per_day lists and monotonic modes simulate faithfully.
    expect(
      simulationIsApproximate(perDayListItems, [rootCriterion({ propertyName: 'word', threshold: 10 })])
    ).toBe(false);
    expect(simulationIsApproximate(booleanItems, [rootCriterion({ propertyName: 'done', threshold: 1 })])).toBe(false);
  });

  it('composite cumulative evaluation passes only when all operands pass', () => {
    const condA: SimCriterion = { name: 'A', isRoot: false, criterionType: 'condition', propertyName: 'distance', threshold: 1 };
    const condB: SimCriterion = { name: 'B', isRoot: false, criterionType: 'condition', propertyName: 'distance', threshold: 50 };
    const rootC: SimCriterion = {
      name: 'Root',
      isRoot: true,
      criterionType: 'composite',
      operator: 'and',
      operandNames: ['A', 'B'],
      successType: 'cumulative',
    };
    const days = simulateCycle('weekly', pastStart, null, items, [condA, condB, rootC]);
    expect(days.length).toBe(7);
    // The slower operand ramps to its threshold only at the cycle's end ⇒
    // early days fail; both pass on the final day.
    expect(days[0].rootPassed).toBe(false);
    expect(days[6].rootPassed).toBe(true);
  });
});
