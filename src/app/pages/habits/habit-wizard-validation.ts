// Pure client-side mirrors of the API's habit-wizard validation rules
// (design-habit-api.md § Validation, error codes shared with
// habit-error-messages.ts). Each check returns the transloco error key — or
// null when valid — so the wizard can surface the same message before the
// server's 422. Kept component-free so every branch is unit-testable.

import type { AggregationMode, CompositeOperator, HabitCycle, PropertyType, SuccessType } from './habit.models';

/** Flat view of a draft item consumed by {@link checkItems}. */
export interface WizardItemView {
  name: string;
  properties: { name: string; propertyType: PropertyType; baseRate: number | null }[];
}

/** Flat view of a draft criterion consumed by {@link checkCriteria}. */
export interface WizardCriterionView {
  key: number;
  name: string;
  isRoot: boolean;
  criterionType: 'condition' | 'composite';
  /** Condition: the chosen property name; composite: null. */
  propertyName: string | null;
  /** Resolved type of the chosen property (null when unmatched). */
  propertyType: PropertyType | null;
  /** Condition: effective aggregation mode (null ⇒ the property type's default). */
  aggregationMode: AggregationMode | null;
  itemScope: 'all' | 'subset';
  scopeItemCount: number;
  /** True when at least one scoped item (or any item, for scope=all) defines the name. */
  nameInScope: boolean;
  threshold: number | null;
  operator: CompositeOperator | null;
  operandKeys: number[];
  /** Root only — the habit's success mode. */
  successType: SuccessType | null;
  cycleTarget: number | null;
}

/**
 * Natural length of one cycle window in days (API day-count ceiling).
 * `whole` spans a user-defined period, so it has no fixed calendar ceiling —
 * mirrors the API (HabitRuleValidator), where daily-mode targets on a whole
 * cycle are not capped to 7/31. POSITIVE_INFINITY ⇒ the ceiling check passes
 * for any cycleTarget.
 */
export function cycleMaxDays(cycle: HabitCycle): number {
  if (cycle === 'whole') {
    return Number.POSITIVE_INFINITY;
  }
  return cycle === 'daily' ? 1 : cycle === 'weekly' ? 7 : 31;
}

/** Aggregation modes a property type accepts (null = the type's default). */
export function allowedAggregationModes(type: PropertyType | null): (AggregationMode | null)[] {
  switch (type) {
    case 'boolean':
      // ever_true is the only mode — null (default) and the explicit value are
      // both accepted.
      return [null, 'ever_true'];
    case 'numeric':
      return [null, 'sum', 'avg', 'max', 'min', 'latest'];
    case 'list':
      return [null, 'union_distinct', 'latest'];
    default:
      return [null];
  }
}

/** Items-step gate; returns an error key or null (mirrors `noItems`,
 * `itemWithoutProperties`, `duplicateName`, `invalidName`, `invalidBaseRate`,
 * and the habit-wide same-name⇒same-type rule). */
export function checkItems(items: WizardItemView[]): string | null {
  if (items.length === 0) {
    return 'habits.errors.noItems';
  }
  if (items.some((i) => !i.name.trim())) {
    return 'habits.wizard.err.itemNameRequired';
  }
  const seenItem = new Set<string>();
  for (const i of items) {
    const n = i.name.trim().toLowerCase();
    if (seenItem.has(n)) {
      return 'habits.errors.duplicateName';
    }
    seenItem.add(n);
  }
  const nameTypes = new Map<string, PropertyType>();
  for (const i of items) {
    if (i.properties.length === 0) {
      return 'habits.errors.itemWithoutProperties';
    }
    if (i.properties.some((p) => !p.name.trim())) {
      return 'habits.wizard.err.propNameRequired';
    }
    for (const p of i.properties) {
      if (p.propertyType === 'numeric' && p.baseRate !== null && !(p.baseRate > 0)) {
        return 'habits.errors.invalidBaseRate';
      }
      const trimmed = p.name.trim();
      const prior = nameTypes.get(trimmed);
      if (prior !== undefined && prior !== p.propertyType) {
        return 'habits.errors.invalidPropertyType';
      }
      nameTypes.set(trimmed, p.propertyType);
    }
  }
  return null;
}

/** Targets-step "cycle target" gate for the template flow (FR-5.3): a daily-mode
 * root needs a positive whole number of successful days bounded by the cycle
 * length; a cumulative root takes no cycle target at all (it is derived). The
 * threshold override must stay positive when provided. */
export function checkTargets(
  successType: SuccessType | null,
  cycle: HabitCycle,
  cycleTarget: number | null,
  rootPropType: PropertyType | null,
  threshold: number | null
): string | null {
  if (successType === 'daily') {
    // Absent/non-finite ⇒ the field was never filled: missingCycleTarget;
    // a present but illegal value (0, fraction, over the cycle ceiling):
    // invalidTarget — mirrors checkRootTargets on the criteria step.
    if (cycleTarget === null || !Number.isFinite(cycleTarget) || cycleTarget < 1) {
      return 'habits.errors.missingCycleTarget';
    }
    if (Math.floor(cycleTarget) !== cycleTarget || cycleTarget > cycleMaxDays(cycle)) {
      return 'habits.errors.invalidTarget';
    }
  }
  if (rootPropType === null || rootPropType === 'boolean' || threshold === null) {
    return null;
  }
  if (!Number.isFinite(threshold) || threshold <= 0) {
    return 'habits.errors.invalidThreshold';
  }
  return null;
}

/** Criteria-step gate; returns an error key or null. Mirrors the API rules:
 * the root carries a successType; daily roots need a bounded whole cycleTarget
 * (condition or composite — a composite day passes on its pass bit); cumulative
 * roots never carry one (derived target); conditions validate threshold, aggregation
 * mode and in-scope property presence. */
export function checkCriteria(criteria: WizardCriterionView[], cycle: HabitCycle): string | null {
  if (criteria.length === 0) {
    return 'habits.errors.noCriteria';
  }
  if (!criteria.some((c) => c.isRoot)) {
    return 'habits.errors.noRootCriterion';
  }
  if (criteria.some((c) => !c.name.trim())) {
    return 'habits.wizard.err.critNameRequired';
  }
  const names = new Set<string>();
  for (const c of criteria) {
    const n = c.name.trim().toLowerCase();
    if (names.has(n)) {
      return 'habits.errors.duplicateName';
    }
    names.add(n);
  }
  if (hasOperandCycle(criteria)) {
    return 'habits.errors.circularCriterion';
  }
  const maxDays = cycleMaxDays(cycle);
  for (const c of criteria) {
    if (c.criterionType === 'condition') {
      if (!c.propertyName || !c.propertyName.trim()) {
        return 'habits.wizard.err.conditionNeedsProperty';
      }
      if (c.itemScope === 'subset' && c.scopeItemCount === 0) {
        return 'habits.errors.scopeItemsRequired';
      }
      if (!allowedAggregationModes(c.propertyType).includes(c.aggregationMode)) {
        return 'habits.errors.invalidPropertyType';
      }
      // The bound name must exist on at least one in-scope item (spec).
      if (!c.nameInScope) {
        return 'habits.errors.unknownOperandName';
      }
      // Every condition carries a positive threshold (integer item-count for booleans).
      if (c.threshold === null || !Number.isFinite(c.threshold) || c.threshold <= 0) {
        return 'habits.errors.invalidThreshold';
      }
      if (c.propertyType === 'boolean' && Math.floor(c.threshold) !== c.threshold) {
        return 'habits.errors.invalidThreshold';
      }
      if (c.isRoot) {
        const targetErr = checkRootTargets(c, cycle, maxDays);
        if (targetErr) {
          return targetErr;
        }
      }
    } else {
      const min = c.operator === 'not' ? 1 : 2;
      if (c.operandKeys.length < min) {
        return 'habits.errors.invalidOperandCount';
      }
      if (c.isRoot) {
        const targetErr = checkRootTargets(c, cycle, maxDays);
        if (targetErr) {
          return targetErr;
        }
      }
    }
  }
  return null;
}

function checkRootTargets(c: WizardCriterionView, cycle: HabitCycle, maxDays: number): string | null {
  if (c.successType === null) {
    return 'habits.errors.invalidTarget';
  }
  if (c.successType === 'daily') {
    if (c.cycleTarget === null || c.cycleTarget < 1) {
      return 'habits.errors.missingCycleTarget';
    }
    if (Math.floor(c.cycleTarget) !== c.cycleTarget || c.cycleTarget > maxDays) {
      return 'habits.errors.invalidTarget';
    }
    // The daily-cycle single-day habit must ask for exactly one day.
    if (cycle === 'daily' && c.cycleTarget !== 1) {
      return 'habits.errors.invalidTarget';
    }
  } else if (c.cycleTarget !== null) {
    // Cumulative roots never carry a stored cycle target.
    return 'habits.errors.invalidTarget';
  }
  return null;
}

/** True when the operand graph is not acyclic (self-loops and A↔B 2-cycles). */
export function hasOperandCycle(criteria: WizardCriterionView[]): boolean {
  const byKey = new Map(criteria.map((c) => [c.key, c]));
  // 0 = on the current DFS path, 1 = fully explored.
  const state = new Map<number, number>();
  const visit = (c: WizardCriterionView): boolean => {
    const s = state.get(c.key);
    if (s === 0) {
      return true;
    }
    if (s === 1) {
      return false;
    }
    state.set(c.key, 0);
    for (const k of c.operandKeys) {
      const operand = byKey.get(k);
      if (operand && visit(operand)) {
        return true;
      }
    }
    state.set(c.key, 1);
    return false;
  };
  return criteria.some((c) => visit(c));
}
