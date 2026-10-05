// Habit-tracking contract types — mirrors the camelCase JSON of aclearningutil's
// /api/Habits surface (see ../../../../../aclearningutil/docs/design-habit-api.md).
// Enum values are the API's lowercase/snake strings; no runtime conversion needed.

export type HabitCycle = 'daily' | 'weekly' | 'monthly' | 'whole';
export type HabitState = 'active' | 'inactive';
export type PropertyType = 'boolean' | 'numeric' | 'list';
export type ItemUniqueness = 'per_day' | 'per_cycle';
export type CriterionType = 'condition' | 'composite';
export type CompositeOperator = 'and' | 'or' | 'not';
export type ItemScope = 'all' | 'subset';
/** Root-carried success mode (spec "Success types"). */
export type SuccessType = 'daily' | 'cumulative';
/** Condition aggregation modes; null on the wire ⇒ the property type's default. */
export type AggregationMode =
  | 'ever_true'
  | 'sum'
  | 'avg'
  | 'max'
  | 'min'
  | 'latest'
  | 'union_distinct';

// ── Responses ───────────────────────────────────────────────────────────────

export interface CriterionProgressOut {
  criterionId: number;
  name: string;
  isRoot: boolean;
  criterionType: CriterionType;
  passed: boolean;
  /** Condition: the bound property NAME (conditions never carry a property-row id). */
  propertyName: string | null;
  /** Condition: effective aggregation mode (resolved server-side). */
  aggregationMode: AggregationMode | null;
  currentValue: number | null;
  /** Condition: pass ⇒ currentValue >= threshold (the only operator). Composite: operands required (AND: n, OR/NOT: 1). */
  threshold: number | null;
  /** Root only. */
  successType: SuccessType | null;
  /** Daily root: successful days required. Cumulative root: null (derived target). */
  cycleTarget: number | null;
  /** Daily root: today's aggregate (condition) or pass bit (composite); null outside the active window. */
  currentDayValue: number | null;
  /** Daily root only. */
  successfulDays: number | null;
  operator: CompositeOperator | null;
  operandIds: number[] | null;
}

export interface ProgressOut {
  cycleFrom: string;
  /** Null for an open-ended `whole` cycle — render "ongoing" (no sentinel). */
  cycleTo: string | null;
  rootCriterion: CriterionProgressOut;
  criteria: CriterionProgressOut[];
}

export interface Habit {
  id: number;
  name: string;
  description: string | null;
  cycle: HabitCycle;
  startDate: string;
  endDate: string | null;
  state: HabitState;
  hasPunches: boolean;
  createdAt: string;
  progress: ProgressOut;
}

/** One invitation of a habit (owner-facing Shares dialog). */
export interface ShareGrant {
  id: number;
  /** The invitee's acidserver user id (= their `sub` claim — never a private email). */
  granteeUserId: string;
  granteeUserName: string;
  createdAt: string;
}

/** acidserver /api/users/search hit — what an invitee is addressed by. */
export interface UserSearchHit {
  userId: string;
  userName: string;
}

/** "Shared with me" entry: an invited habit + the owner's display-name snapshot. */
export interface SharedHabitSummary {
  habit: Habit;
  ownerName: string;
}

/** Read-only invited-habit detail: definition, items and criteria (viewer-computed values). */
export interface SharedHabitDetail {
  habit: Habit;
  ownerName: string;
  items: HabitItem[];
  criteria: CriterionOut[];
}

export interface PropertyOut {
  id: number;
  itemId: number;
  name: string;
  propertyType: PropertyType;
  baseRate: number | null;
  itemUniqueness: ItemUniqueness | null;
  order: number;
  createdAt: string;
  currentCycleValue: number;
  todayValue: number | null;
}

export interface HabitItem {
  id: number;
  habitId: number;
  name: string;
  order: number;
  createdAt: string;
  hasPunches: boolean;
  properties: PropertyOut[];
}

export interface CriterionOut {
  id: number;
  habitId: number;
  name: string;
  isRoot: boolean;
  criterionType: CriterionType;
  /** Condition: bound property NAME. */
  propertyName: string | null;
  /** Condition: stored mode; null = the type default. */
  aggregationMode: AggregationMode | null;
  itemScope: ItemScope | null;
  scopeItemIds: number[] | null;
  threshold: number | null;
  operator: CompositeOperator | null;
  operandCriterionIds: number[] | null;
  /** Root only. */
  successType: SuccessType | null;
  /** Daily root only. */
  cycleTarget: number | null;
  createdAt: string;
}

export interface PropertyValueOut {
  propertyId: number;
  propertyName: string;
  propertyType: PropertyType;
  boolValue: boolean | null;
  numValue: number | null;
  listEntries: string[] | null;
}

export interface PunchOut {
  id: number;
  habitId: number;
  itemId: number;
  punchedAt: string;
  punchDate: string;
  createdAt: string;
  values: PropertyValueOut[];
}

export interface CriterionDayResultOut {
  criterionId: number;
  name: string;
  passed: boolean;
  currentValue: number | null;
}

export interface DayHistoryOut {
  date: string;
  /** Cycle window this day belongs to; cycleTo null for an open-ended whole cycle. */
  cycleFrom: string;
  cycleTo: string | null;
  isSuccessful: boolean;
  criteria: CriterionDayResultOut[];
  punches: PunchOut[];
}

// ── Requests ────────────────────────────────────────────────────────────────

export interface PropertyCreate {
  name: string;
  propertyType: PropertyType;
  baseRate?: number | null;
  itemUniqueness?: ItemUniqueness | null;
  order: number;
}

export interface PropertyUpdate {
  name: string;
  baseRate?: number | null;
  order: number;
}

export interface ItemCreate {
  name: string;
  order: number;
  properties: PropertyCreate[];
}

export interface ItemUpdate {
  name: string;
  order: number;
}

/** HabitCreate criteria use name-based refs (ids don't exist yet). Leaves
 * ALWAYS bind the property by name — there is no property-id binding. */
export interface CriterionCreateInWizard {
  name: string;
  isRoot: boolean;
  criterionType: CriterionType;
  propertyName?: string | null;
  aggregationMode?: AggregationMode | null;
  itemScope?: ItemScope | null;
  scopeItemNames?: string[] | null;
  scopeItemIds?: number[] | null;
  threshold?: number | null;
  operator?: CompositeOperator | null;
  operandCriterionNames?: string[] | null;
  operandCriterionIds?: number[] | null;
  /** Root only; required on the root. */
  successType?: SuccessType | null;
  /** Daily root only; must stay absent/null for a cumulative root. */
  cycleTarget?: number | null;
}

/** Post-creation criterion writes: operands/scope by id, condition property by name. */
export interface CriterionUpdate {
  name: string;
  isRoot: boolean;
  propertyName?: string | null;
  aggregationMode?: AggregationMode | null;
  itemScope?: ItemScope | null;
  scopeItemIds?: number[] | null;
  threshold?: number | null;
  operator?: CompositeOperator | null;
  operandCriterionIds?: number[] | null;
  successType?: SuccessType | null;
  cycleTarget?: number | null;
}

export interface PropertyValueCreate {
  propertyId: number;
  boolValue?: boolean | null;
  numValue?: number | null;
  listEntries?: string[] | null;
}

export interface PunchCreate {
  values: PropertyValueCreate[];
  /** Back-fill day (`yyyy-MM-dd`); null/omitted = server today. Validated in-window, never future. */
  punchDate?: string | null;
}

export interface PunchUpdate {
  values: PropertyValueCreate[];
}

export interface HabitCreate {
  name: string;
  description?: string | null;
  cycle: HabitCycle;
  startDate: string;
  endDate?: string | null;
  items: ItemCreate[];
  criteria: CriterionCreateInWizard[];
}

export interface HabitUpdate {
  name: string;
  description?: string | null;
  cycle: HabitCycle;
  startDate: string;
  endDate?: string | null;
}

/** Normalized API failure: machine-readable code (see habit-error-messages.ts). */
export class HabitApiError extends Error {
  constructor(
    public readonly code: string,
    public readonly detail: string,
    public readonly status: number
  ) {
    super(detail || code);
  }
}
