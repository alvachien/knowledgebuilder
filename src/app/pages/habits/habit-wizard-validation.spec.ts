import type { WizardCriterionView, WizardItemView } from './habit-wizard-validation';
import { checkCriteria, checkItems, checkTargets, cycleMaxDays, hasOperandCycle } from './habit-wizard-validation';

/** The pure wizard gates (M1-UI + M5): every branch asserted here so the
 * component's step validation cannot silently drift from the API rules. */

function item(overrides: Partial<WizardItemView> = {}): WizardItemView {
  return {
    name: 'Run',
    properties: [{ name: 'km', propertyType: 'numeric', baseRate: null }],
    ...overrides,
  };
}

function criterion(overrides: Partial<WizardCriterionView> & { key: number }): WizardCriterionView {
  return {
    name: `C${overrides.key}`,
    isRoot: false,
    criterionType: 'condition',
    propertyName: 'km',
    propertyType: 'numeric',
    aggregationMode: null,
    itemScope: 'all',
    scopeItemCount: 0,
    nameInScope: true,
    threshold: 1,
    operator: null,
    operandKeys: [],
    successType: null,
    cycleTarget: null,
    ...overrides,
  };
}

/** A root condition in cumulative mode with a valid threshold — the common baseline. */
function rootCriterion(overrides: Partial<WizardCriterionView> & { key: number } = { key: 1 }): WizardCriterionView {
  return criterion({ isRoot: true, successType: 'cumulative', ...overrides });
}

describe('checkItems', () => {
  it('rejects an empty item list with noItems', () => {
    expect(checkItems([])).toBe('habits.errors.noItems');
  });

  it('requires a name on every item', () => {
    expect(checkItems([item({ name: '  ' })])).toBe('habits.wizard.err.itemNameRequired');
  });

  it('detects duplicate item names case-insensitively', () => {
    expect(checkItems([item({ name: 'Run' }), item({ name: 'run' })])).toBe('habits.errors.duplicateName');
  });

  it('rejects an item without properties (M5a: itemWithoutProperties)', () => {
    expect(checkItems([item({ properties: [] })])).toBe('habits.errors.itemWithoutProperties');
  });

  it('requires a name on every property', () => {
    expect(checkItems([item({ properties: [{ name: '', propertyType: 'boolean', baseRate: null }] })])).toBe(
      'habits.wizard.err.propNameRequired'
    );
  });

  it('rejects non-positive base rates on numeric properties (M5c)', () => {
    expect(checkItems([item({ properties: [{ name: 'km', propertyType: 'numeric', baseRate: 0 }] })])).toBe(
      'habits.errors.invalidBaseRate'
    );
    expect(checkItems([item({ properties: [{ name: 'km', propertyType: 'numeric', baseRate: -2 }] })])).toBe(
      'habits.errors.invalidBaseRate'
    );
  });

  it('accepts null base rate (optional) and positive values', () => {
    expect(checkItems([item({ properties: [{ name: 'km', propertyType: 'numeric', baseRate: null }] })])).toBeNull();
    expect(checkItems([item({ properties: [{ name: 'km', propertyType: 'numeric', baseRate: 0.5 }] })])).toBeNull();
  });
});

describe('checkTargets', () => {
  it('is vacuous for boolean or unknown root properties (threshold part)', () => {
    expect(checkTargets('cumulative', 'weekly', 5, 'boolean', null)).toBeNull();
    expect(checkTargets('cumulative', 'weekly', 5, null, null)).toBeNull();
  });

  it('treats blank as "no override" for numeric/list roots (FR-5.3)', () => {
    expect(checkTargets('cumulative', 'weekly', 5, 'numeric', null)).toBeNull();
    expect(checkTargets('cumulative', 'weekly', 5, 'list', null)).toBeNull();
  });

  it('requires a positive value when a threshold override is provided', () => {
    expect(checkTargets('cumulative', 'weekly', 5, 'numeric', 0)).toBe('habits.errors.invalidThreshold');
    expect(checkTargets('cumulative', 'weekly', 5, 'list', -1)).toBe('habits.errors.invalidThreshold');
    expect(checkTargets('cumulative', 'weekly', 5, 'numeric', 0.01)).toBeNull();
  });

  it('daily mode needs a positive whole cycleTarget bounded by the cycle length', () => {
    expect(checkTargets('daily', 'weekly', null, 'numeric', null)).toBe('habits.errors.missingCycleTarget');
    expect(checkTargets('daily', 'weekly', 0, 'numeric', null)).toBe('habits.errors.missingCycleTarget');
    expect(checkTargets('daily', 'weekly', 2.5, 'numeric', null)).toBe('habits.errors.invalidTarget');
    expect(checkTargets('daily', 'weekly', 8, 'numeric', null)).toBe('habits.errors.invalidTarget');
    expect(checkTargets('daily', 'weekly', 7, 'numeric', null)).toBeNull();
    expect(checkTargets('daily', 'monthly', 31, 'numeric', null)).toBeNull();
    // Daily-cycle habits count exactly one day per cycle.
    expect(checkTargets('daily', 'daily', 1, 'numeric', null)).toBeNull();
    expect(checkTargets('daily', 'daily', 2, 'numeric', null)).toBe('habits.errors.invalidTarget');
    // Whole spans are user-defined — unbounded.
    expect(checkTargets('daily', 'whole', 100, 'numeric', null)).toBeNull();
  });
});

describe('cycleMaxDays', () => {
  it('mirrors the API day-count ceilings', () => {
    expect(cycleMaxDays('daily')).toBe(1);
    expect(cycleMaxDays('weekly')).toBe(7);
    expect(cycleMaxDays('monthly')).toBe(31);
  });

  it('whole has no fixed ceiling (user-defined span, API conditions it uncapped)', () => {
    expect(cycleMaxDays('whole')).toBe(Number.POSITIVE_INFINITY);
  });
});

describe('checkCriteria', () => {
  it('requires at least one criterion and exactly one root', () => {
    expect(checkCriteria([], 'weekly')).toBe('habits.errors.noCriteria');
    expect(checkCriteria([criterion({ key: 1, isRoot: false, cycleTarget: 5 })], 'weekly')).toBe(
      'habits.errors.noRootCriterion'
    );
  });

  it('requires names and rejects duplicate criteria names', () => {
    expect(checkCriteria([criterion({ key: 1, isRoot: true, name: '', cycleTarget: 5 })], 'weekly')).toBe(
      'habits.wizard.err.critNameRequired'
    );
    expect(
      checkCriteria(
        [criterion({ key: 1, isRoot: true, name: 'x', cycleTarget: 5 }), criterion({ key: 2, name: 'X' })],
        'weekly'
      )
    ).toBe('habits.errors.duplicateName');
  });

  it('requires a property on every condition and items on a subset scope', () => {
    expect(checkCriteria([criterion({ key: 1, isRoot: true, propertyName: null, cycleTarget: 5 })], 'weekly')).toBe(
      'habits.wizard.err.conditionNeedsProperty'
    );
    expect(
      checkCriteria([criterion({ key: 1, isRoot: true, itemScope: 'subset', scopeItemCount: 0, cycleTarget: 5 })], 'weekly')
    ).toBe('habits.errors.scopeItemsRequired');
  });

  it('requires a positive threshold on every condition (M5b)', () => {
    expect(checkCriteria([rootCriterion({ key: 1 }), criterion({ key: 2, threshold: 0 })], 'weekly')).toBe(
      'habits.errors.invalidThreshold'
    );
  });

  it('condition root in daily mode is valid; cycle target capped by the cycle length (M5d)', () => {
    expect(checkCriteria([rootCriterion({ key: 1, successType: 'daily', cycleTarget: 5 })], 'weekly')).toBeNull();
    expect(checkCriteria([rootCriterion({ key: 1, successType: 'daily', cycleTarget: 8 })], 'weekly')).toBe(
      'habits.errors.invalidTarget'
    );
    expect(checkCriteria([rootCriterion({ key: 1, successType: 'daily', cycleTarget: 7 })], 'weekly')).toBeNull();
    expect(checkCriteria([rootCriterion({ key: 1, successType: 'daily', cycleTarget: 31 })], 'monthly')).toBeNull();
    expect(checkCriteria([rootCriterion({ key: 1, successType: 'daily', cycleTarget: 2 })], 'daily')).toBe(
      'habits.errors.invalidTarget'
    );
    expect(checkCriteria([rootCriterion({ key: 1, successType: 'daily', cycleTarget: 1 })], 'daily')).toBeNull();
    // Whole spans are user-defined — no calendar ceiling (API parity).
    expect(checkCriteria([rootCriterion({ key: 1, successType: 'daily', cycleTarget: 100 })], 'whole')).toBeNull();
  });

  it('daily root requires a positive whole cycle target', () => {
    expect(checkCriteria([rootCriterion({ key: 1, successType: 'daily', cycleTarget: null })], 'weekly')).toBe(
      'habits.errors.missingCycleTarget'
    );
    expect(checkCriteria([rootCriterion({ key: 1, successType: 'daily', cycleTarget: 0 })], 'weekly')).toBe(
      'habits.errors.missingCycleTarget'
    );
    expect(checkCriteria([rootCriterion({ key: 1, successType: 'daily', cycleTarget: 2.5 })], 'weekly')).toBe(
      'habits.errors.invalidTarget'
    );
  });

  it('the root must carry a success type (spec: root carries success_type)', () => {
    expect(checkCriteria([rootCriterion({ key: 1, successType: null })], 'weekly')).toBe('habits.errors.invalidTarget');
  });

  it('a cumulative root must NOT carry a cycle target — the target is derived (spec)', () => {
    expect(checkCriteria([rootCriterion({ key: 1, cycleTarget: 30 })], 'weekly')).toBe('habits.errors.invalidTarget');
    // …and without one it is valid: cumulative numeric targets are unbounded.
    expect(checkCriteria([rootCriterion({ key: 1, cycleTarget: null, threshold: 300 })], 'weekly')).toBeNull();
  });

  it('boolean conditions take integer item-count thresholds (spec boolean semantics)', () => {
    expect(
      checkCriteria([rootCriterion({ key: 1, propertyType: 'boolean', propertyName: 'done', threshold: 1 })], 'weekly')
    ).toBeNull();
    expect(
      checkCriteria([rootCriterion({ key: 1, propertyType: 'boolean', propertyName: 'done', threshold: 1.5 })], 'weekly')
    ).toBe('habits.errors.invalidThreshold');
  });

  it('a condition property name must exist on at least one in-scope item (spec)', () => {
    expect(checkCriteria([rootCriterion({ key: 1, nameInScope: false })], 'weekly')).toBe(
      'habits.errors.unknownOperandName'
    );
  });

  it('aggregation modes must fit the property type', () => {
    // km is numeric — union_distinct belongs to lists.
    expect(checkCriteria([rootCriterion({ key: 1, aggregationMode: 'union_distinct' })], 'weekly')).toBe(
      'habits.errors.invalidPropertyType'
    );
    expect(checkCriteria([rootCriterion({ key: 1, aggregationMode: 'avg' })], 'weekly')).toBeNull();
    expect(
      checkCriteria(
        [rootCriterion({ key: 1, propertyType: 'boolean', propertyName: 'done', aggregationMode: 'ever_true' })],
        'weekly'
      )
    ).toBeNull();
  });

  it('same property name with two types across items is rejected (checkItems, spec name/type rule)', () => {
    expect(
      checkItems([
        item({ name: 'A', properties: [{ name: 'hours', propertyType: 'numeric', baseRate: null }] }),
        item({ name: 'B', properties: [{ name: 'hours', propertyType: 'boolean', baseRate: null }] }),
      ])
    ).toBe('habits.errors.invalidPropertyType');
    expect(
      checkItems([
        item({ name: 'A', properties: [{ name: 'hours', propertyType: 'numeric', baseRate: null }] }),
        item({ name: 'B', properties: [{ name: 'hours', propertyType: 'numeric', baseRate: 2 }] }),
      ])
    ).toBeNull();
  });

  it('M1-UI: a composite root in daily mode is valid — the day passes on the group pass bit', () => {
    expect(
      checkCriteria(
        [
          criterion({ key: 2, name: 'A' }),
          criterion({ key: 3, name: 'B' }),
          rootCriterion({
            key: 4,
            name: 'Root',
            criterionType: 'composite',
            propertyName: null,
            propertyType: null,
            threshold: null,
            successType: 'daily',
            cycleTarget: 5,
            operator: 'and',
            operandKeys: [2, 3],
          }),
        ],
        'weekly'
      )
    ).toBeNull();
    // …bounded by the cycle length like condition roots (the old dailyTargetOnComposite
    // ban is gone — composites are legitimate daily roots, spec FR-5.4 templates).
    expect(
      checkCriteria(
        [
          criterion({ key: 2, name: 'A' }),
          criterion({ key: 3, name: 'B' }),
          rootCriterion({
            key: 4,
            name: 'Root',
            criterionType: 'composite',
            propertyName: null,
            propertyType: null,
            threshold: null,
            successType: 'daily',
            cycleTarget: 8,
            operator: 'and',
            operandKeys: [2, 3],
          }),
        ],
        'weekly'
      )
    ).toBe('habits.errors.invalidTarget');
  });

  it('a composite cumulative root carries no cycle target; a daily one needs it', () => {
    const base = {
      key: 4,
      name: 'Root',
      isRoot: true,
      criterionType: 'composite' as const,
      propertyName: null,
      propertyType: null,
      threshold: null,
      operator: 'and' as const,
      operandKeys: [2, 3],
    };
    expect(checkCriteria([criterion({ key: 2, name: 'A' }), criterion({ key: 3, name: 'B' }), rootCriterion(base)], 'weekly')).toBeNull();
    expect(
      checkCriteria([criterion({ key: 2, name: 'A' }), criterion({ key: 3, name: 'B' }), rootCriterion({ ...base, cycleTarget: 2 })], 'weekly')
    ).toBe('habits.errors.invalidTarget');
    expect(
      checkCriteria(
        [criterion({ key: 2, name: 'A' }), criterion({ key: 3, name: 'B' }), rootCriterion({ ...base, successType: 'daily', cycleTarget: null })],
        'weekly'
      )
    ).toBe('habits.errors.missingCycleTarget');
  });

  it('composite operand counts (and/or ≥ 2, not ≥ 1)', () => {
    expect(
      checkCriteria(
        [
          rootCriterion({ key: 1 }),
          criterion({ key: 2, name: 'Comp', criterionType: 'composite', propertyName: null, propertyType: null, operator: 'and', operandKeys: [1] }),
        ],
        'weekly'
      )
    ).toBe('habits.errors.invalidOperandCount');
    expect(
      checkCriteria(
        [
          rootCriterion({ key: 1 }),
          criterion({ key: 2, name: 'Comp', criterionType: 'composite', propertyName: null, propertyType: null, operator: 'not', operandKeys: [1] }),
        ],
        'weekly'
      )
    ).toBeNull();
  });

  it('M5e: detects 2-cycle operand loops (A↔B) and self-loops via circularCriterion', () => {
    expect(
      checkCriteria(
        [
          criterion({ key: 1, isRoot: true, cycleTarget: 5, name: 'A', criterionType: 'composite', propertyName: null, propertyType: null, operator: 'and', operandKeys: [2] }),
          criterion({ key: 2, name: 'B', criterionType: 'composite', propertyName: null, propertyType: null, operator: 'and', operandKeys: [1] }),
          criterion({ key: 3, name: 'C' }),
          criterion({ key: 4, name: 'D' }),
        ],
        'weekly'
      )
    ).toBe('habits.errors.circularCriterion');
    expect(
      checkCriteria(
        [
          rootCriterion({ key: 1, name: 'A', criterionType: 'composite', propertyName: null, propertyType: null, threshold: null, operator: 'and', operandKeys: [1, 2] }),
          criterion({ key: 2, name: 'B' }),
        ],
        'weekly'
      )
    ).toBe('habits.errors.circularCriterion');
  });

  it('hasOperandCycle: acyclic chains and diamond references pass', () => {
    expect(
      hasOperandCycle([
        criterion({ key: 1, name: 'A' }),
        criterion({ key: 2, name: 'B', criterionType: 'composite', operator: 'and', operandKeys: [1] }),
        criterion({ key: 3, name: 'C', isRoot: true, criterionType: 'composite', operator: 'and', operandKeys: [1, 2], cycleTarget: 3 }),
      ])
    ).toBe(false);
    expect(
      hasOperandCycle([
        criterion({ key: 1, name: 'A', criterionType: 'composite', operator: 'and', operandKeys: [2] }),
        criterion({ key: 2, name: 'B', criterionType: 'composite', operator: 'and', operandKeys: [3] }),
        criterion({ key: 3, name: 'C', criterionType: 'composite', operator: 'and', operandKeys: [1] }),
      ])
    ).toBe(true);
  });
});
