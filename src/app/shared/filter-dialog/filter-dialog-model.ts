// Pure model of the shared filter dialog (docs/reusable-filter-dialog-design.md).
//
// Everything the dialog can do to its condition tree lives here as plain
// functions over plain objects: seeding a caller's actslib `IFilterDefinition`
// into editable nodes, emitting edited nodes back to a definition, immutable
// tree edits, validation, and the human-readable summary. The component is
// thin by design — it holds signals and wires the template, while all logic
// below is unit-testable without Angular.

import { FilterJoinType, FilterOperation, FilterUtility } from 'actslib';
import type { EnumLike, FilterRoot, IFilterCondition, IFilterDefinition } from 'actslib';

// ---------------------------------------------------------------------------
// Schema (per-page configuration)
// ---------------------------------------------------------------------------

/** What kind of values a property carries. Drives the default operator list,
 *  the value editor, and the seed/emit dispatch. */
export type FilterPropertyKind = 'string' | 'number' | 'date' | 'enum';

/** One value in an enum property's multiple-choice editor. */
export interface FilterEnumChoice {
  value: string | number;
  /** i18n key, translated by the dialog. */
  labelKey: string;
}

/** A valueless, app-specific operator (e.g. vocabulary's `isPhrase`). The page
 *  supplies the actslib encoding and the fold-back recognizer. */
export interface FilterCustomOperator {
  /** editor-local id; never crosses the dialog boundary */
  id: string;
  labelKey: string;
  /** actslib condition this operator emits on Submit */
  emit(property: string): IFilterCondition;
  /** true when `condition` is one of this operator's emissions (seed fold-back) */
  recognize(condition: IFilterCondition): boolean;
}

/** One filterable property of the page's evaluated target shape. */
export interface FilterableProperty {
  /** actslib condition property name (matched against the evaluated target) */
  key: string;
  /** i18n key naming the property in the editor, tree labels and preview */
  labelKey: string;
  kind: FilterPropertyKind;
  /** offered operators; default = the kind's supported set, in this order */
  operations?: FilterOperation[];
  /** kind 'enum': actslib enum validation, passed through to each condition */
  enumValues?: EnumLike;
  /** kind 'enum': the choices of the multiple-value editor */
  choices?: FilterEnumChoice[];
  /** valueless operators appended to the operator select */
  customOperators?: FilterCustomOperator[];
  /** number editor constraint (UI only, not enforced on emit) */
  numberRange?: { min?: number; max?: number };
  /** transforms a raw string/number value before it is emitted (D6: trim +
   *  lowercase); never applied to dates or custom operators */
  prepareValue?: (value: string | number) => string | number;
}

/** MAT_DIALOG_DATA: the schema, the filter in effect (seed), and labels.
 *  The seed is a `FilterRoot` (actslib case 0/1/2): a group definition or a
 *  bare condition — either case-1 spelling re-seeds the same single leaf. */
export interface FilterDialogData {
  properties: FilterableProperty[];
  root?: FilterRoot;
  /** deepest group level the toolbar offers; default 4 */
  maxDepth?: number;
  /** dialog title i18n key; default 'common.editFilter' */
  titleKey?: string;
}

/** Submit result: the edited filter as a `FilterRoot` — the emitted tree
 *  passed through `FilterUtility.Simplify`, so a single-condition filter
 *  (case 1) leaves as a bare condition and the wrapper/group tree (case 2)
 *  as a definition. Case 0 (empty) cannot be submitted; clearing the filter
 *  is the pages' Clear Filter button. Cancel returns undefined. */
export interface FilterDialogResult {
  root: FilterRoot;
}

/**
 * A fresh filter root: case 0 (match-all) — the cleared-filter state the
 * pages' Clear Filter button installs directly. The dialog itself can never
 * emit this (the `validateTree` emptyTree gate blocks case 0 at Submit).
 */
export const emptyFilterDefinition = (): IFilterDefinition => ({
  join: FilterJoinType.AND,
  conditions: [],
});

// ---------------------------------------------------------------------------
// Editor state
// ---------------------------------------------------------------------------

/** Scalar value an editor holds (the three kinds the value editors cover). */
export type FilterScalar = string | number | Date;

/**
 * One editable leaf. The three value slots (single / between / choices)
 * coexist so switching the property or operator never discards what the user
 * typed — `emitLeaf` reads only the slot the current dispatch selects.
 */
export interface SharedFilterDialogLeaf {
  id: number;
  propertyKey: string;
  /** a FilterOperation value, or one of the property's custom operator ids */
  operator: string;
  /** valued single-value operators (all kinds) */
  single: FilterScalar | null;
  /** Between bounds [low, high] */
  between: [FilterScalar | null, FilterScalar | null];
  /** enum multiple-choice selection */
  choices: FilterScalar[];
}

/** One editable group node: an AND/OR join over an ordered member list. */
export interface SharedFilterDialogNode {
  id: number;
  join: FilterJoinType;
  members: SharedFilterDialogMember[];
}

/** One tree member: a condition leaf or a nested group node. */
export type SharedFilterDialogMember = SharedFilterDialogLeaf | SharedFilterDialogNode;

/** Discriminate a nested group node from a leaf (nodes carry `members`). */
export const isFilterDialogNode = (
  m: SharedFilterDialogMember
): m is SharedFilterDialogNode => (m as SharedFilterDialogNode).members !== undefined;

/** Allocate editor ids; passed into the seed/insert helpers. */
export type FilterIdGen = () => number;

// ---------------------------------------------------------------------------
// Operators
// ---------------------------------------------------------------------------

/** The numeric/comparison operators actslib supports on number and date. */
const COMPARISON_OPS: FilterOperation[] = [
  FilterOperation.GreaterOrEqual,
  FilterOperation.GreaterThan,
  FilterOperation.Equal,
  FilterOperation.LessOrEqual,
  FilterOperation.LessThan,
  FilterOperation.Between,
];

/** All string operators actslib supports: shape match (BeginsWith/Contains/
 *  Equal/EndsWith) plus lexicographic comparisons and Between (inclusive on
 *  both bounds) — the full matrix of FilterUtility.MatchStringCondition. */
const STRING_OPS: FilterOperation[] = [
  FilterOperation.BeginsWith,
  FilterOperation.Contains,
  FilterOperation.Equal,
  FilterOperation.EndsWith,
  FilterOperation.GreaterOrEqual,
  FilterOperation.GreaterThan,
  FilterOperation.LessOrEqual,
  FilterOperation.LessThan,
  FilterOperation.Between,
];

/** The default operator list offered for each kind. */
export const defaultOperatorsFor = (kind: FilterPropertyKind): FilterOperation[] => {
  switch (kind) {
    case 'string':
      return STRING_OPS;
    case 'number':
    case 'date':
      return COMPARISON_OPS;
    case 'enum':
      // Membership is all actslib can express; the leaf's operator is fixed.
      return [FilterOperation.Equal];
  }
};

/**
 * Operators offered for a property: the whitelist when given (order preserved)
 * else the kind default. An enum property always offers only `Equal` — its
 * multi-choice editor compiles to OR-of-`Equal` (§7.3), so the select is fixed.
 */
export const effectiveOperators = (prop: FilterableProperty): FilterOperation[] => {
  if (prop.kind === 'enum') {
    return [FilterOperation.Equal];
  }
  const defaults = defaultOperatorsFor(prop.kind);
  if (!prop.operations) {
    return defaults;
  }
  // Narrow the whitelist to what the kind actually supports; drop the rest.
  const supported = new Set<string>(defaults);
  return prop.operations.filter(op => supported.has(op));
};

/** True when `operator` is one of the property's custom (valueless) ids. */
export const findCustomOperator = (
  prop: FilterableProperty | undefined,
  operator: string
): FilterCustomOperator | undefined => prop?.customOperators?.find(o => o.id === operator);

/** Look up a property by key in the schema. */
export const findProperty = (
  schema: FilterableProperty[],
  key: string
): FilterableProperty | undefined => schema.find(p => p.key === key);

/** Which value editor a leaf's property kind + operator selects (§7 table). */
export type FilterValueEditor = 'text' | 'number' | 'date' | 'between' | 'enum' | 'none';

export const valueEditorFor = (prop: FilterableProperty, operator: string): FilterValueEditor => {
  if (findCustomOperator(prop, operator)) {
    return 'none';
  }
  if (operator === FilterOperation.Between) {
    return 'between';
  }
  switch (prop.kind) {
    case 'enum':
      return 'enum';
    case 'number':
      return 'number';
    case 'date':
      return 'date';
    case 'string':
      return 'text';
  }
};

// ---------------------------------------------------------------------------
// Construction / seeding (definition -> editor tree)
// ---------------------------------------------------------------------------

/** actslib's discriminator: a leaf condition carries a string `property`. */
const isFilterCondition = (m: IFilterCondition | IFilterDefinition): m is IFilterCondition =>
  typeof (m as IFilterCondition).property === 'string';

/**
 * A definition's members, tolerating a missing `conditions` key: actslib's
 * own `Simplify`/`MatchFilter` treat `undefined` conditions as empty (JSON
 * from persistence or a hand-built `{ join }` decodes without the key), so
 * every walk here degrades the same way — to case 0 / match-all — instead of
 * throwing during change detection.
 */
const membersOf = (def: IFilterDefinition): Array<IFilterCondition | IFilterDefinition> =>
  def.conditions ?? [];

/**
 * True when a filter root holds at least one condition anywhere (nested
 * included). A bare condition (case 1) is always active; dialog-emitted
 * definitions never contain empty sub-groups, so the recursion is defensive
 * for hand-built seeds — pages use this to decide between the "new filter"
 * and the summary menu label.
 */
export const hasActiveFilterDefinition = (root: FilterRoot | undefined): boolean =>
  !!root &&
  (isFilterCondition(root)
    ? true
    : membersOf(root).some(c => (isFilterCondition(c) ? true : hasActiveFilterDefinition(c))));

/** A blank leaf for a property (all value slots cleared, first operator). */
export const emptyLeaf = (prop: FilterableProperty, newId: FilterIdGen): SharedFilterDialogLeaf => {
  const ops = effectiveOperators(prop);
  const custom = prop.customOperators?.[0];
  // Prefer the first valued operator; only default to a custom op when it has none.
  const operator = ops.length > 0 ? ops[0] : custom?.id ?? FilterOperation.Equal;
  return {
    id: newId(),
    propertyKey: prop.key,
    operator,
    single: null,
    between: [null, null],
    choices: [],
  };
};

const blankLeaf = (propertyKey: string, operator: string, newId: FilterIdGen): SharedFilterDialogLeaf => ({
  id: newId(),
  propertyKey,
  operator,
  single: null,
  between: [null, null],
  choices: [],
});

/**
 * Try to fold an OR-of-`Equal` group back into one enum multi-choice leaf
 * (§7.3): the group must be OR-joined, every member an `Equal` condition on
 * the same enum property. Returns the leaf or null (not a fold candidate).
 */
const foldEnumOrGroup = (
  def: IFilterDefinition,
  schema: FilterableProperty[],
  newId: FilterIdGen
): SharedFilterDialogLeaf | null => {
  const members = membersOf(def);
  if (def.join !== FilterJoinType.OR || members.length < 2) {
    return null;
  }
  const conditions = members.filter(isFilterCondition);
  if (conditions.length !== members.length) {
    return null; // a nested group is among the members — not a fold candidate
  }
  const first = conditions[0];
  const prop = findProperty(schema, first.property);
  if (!prop || prop.kind !== 'enum') {
    return null;
  }
  if (!conditions.every(c => c.property === prop.key && c.operation === FilterOperation.Equal)) {
    return null;
  }
  const leaf = blankLeaf(prop.key, FilterOperation.Equal, newId);
  leaf.choices = conditions.map(c => c.lowValue as FilterScalar);
  return leaf;
};

const seedCondition = (
  cond: IFilterCondition,
  schema: FilterableProperty[],
  newId: FilterIdGen
): SharedFilterDialogLeaf => {
  const prop = findProperty(schema, cond.property);
  // Custom (valueless) operators are recognized before any value dispatch.
  const custom = prop?.customOperators?.find(o => o.recognize(cond));
  if (custom) {
    return blankLeaf(cond.property, custom.id, newId);
  }
  if (cond.operation === FilterOperation.Between) {
    const leaf = blankLeaf(cond.property, FilterOperation.Between, newId);
    leaf.between = [cond.lowValue ?? null, cond.highValue ?? null];
    return leaf;
  }
  if (prop?.kind === 'enum') {
    const leaf = blankLeaf(cond.property, FilterOperation.Equal, newId);
    leaf.choices = cond.lowValue === undefined ? [] : [cond.lowValue];
    return leaf;
  }
  const leaf = blankLeaf(cond.property, cond.operation, newId);
  leaf.single = cond.lowValue ?? null;
  return leaf;
};

/**
 * Copy a caller's `FilterRoot` into editable nodes. The tree's top level is
 * normalized to a SINGLE node — the actslib root itself: a bare condition
 * (or any chain of 1-member definition wrappers, the case-1 spellings)
 * seeds one condition leaf; a 2+ member definition seeds one GROUP node
 * (the case-2 root, its join carried over); an empty/absent seed leaves the
 * wrapper without a member (the transient empty tree). The wrapper is inert
 * scaffold — its join is never evaluated and `FilterUtility.Simplify`
 * unwraps its single member at the Submit boundary — kept only so the
 * recursive helpers have a node to work from. Structure below the top is
 * preserved to any depth (never flattened); enum OR-groups and custom-op
 * conditions fold back into single leaves (the top node included) so
 * re-editing is lossless. The input is never mutated.
 */
export const seedTree = (
  root: FilterRoot | undefined,
  schema: FilterableProperty[],
  newId: FilterIdGen
): SharedFilterDialogNode => {
  const seedNode = (def: IFilterDefinition): SharedFilterDialogNode => {
    const members: SharedFilterDialogMember[] = [];
    for (const member of membersOf(def)) {
      if (isFilterCondition(member)) {
        members.push(seedCondition(member, schema, newId));
        continue;
      }
      const folded = foldEnumOrGroup(member, schema, newId);
      if (folded) {
        members.push(folded);
        continue;
      }
      members.push(seedNode(member));
    }
    return {
      id: newId(),
      join: def.join ?? FilterJoinType.AND,
      members,
    };
  };

  // Normalize the seed to a single top node (the root itself), or none.
  const seedTop = (r: FilterRoot): SharedFilterDialogMember | null => {
    let current: IFilterCondition | IFilterDefinition = r;
    while (!isFilterCondition(current) && membersOf(current).length === 1) {
      current = membersOf(current)[0]; // 1-member wrappers are case-1 spellings
    }
    if (isFilterCondition(current)) {
      return seedCondition(current, schema, newId);
    }
    if (membersOf(current).length === 0) {
      return null; // case 0 — the tree gets no top node
    }
    // 2+ conditions: the definition becomes THE root group node.
    return foldEnumOrGroup(current, schema, newId) ?? seedNode(current);
  };
  const top = root ? seedTop(root) : null;
  return {
    id: newId(),
    join: FilterJoinType.AND, // inert scaffold join (a single-member wrapper never evaluates it)
    members: top ? [top] : [],
  };
};

// ---------------------------------------------------------------------------
// Emitting (editor tree -> definition)
// ---------------------------------------------------------------------------

const prepare = (prop: FilterableProperty | undefined, value: FilterScalar | null): FilterScalar | null => {
  if (value === null || !prop?.prepareValue) {
    return value;
  }
  return typeof value === 'string' || typeof value === 'number' ? prop.prepareValue(value) : value;
};

/** True when a leaf's active slot has no usable value yet. */
export const leafIsIncomplete = (leaf: SharedFilterDialogLeaf, prop: FilterableProperty): boolean => {
  switch (valueEditorFor(prop, leaf.operator)) {
    case 'none':
      return false;
    case 'enum':
      return leaf.choices.length === 0;
    case 'between':
      return leaf.between[0] === null || leaf.between[1] === null || leaf.between[0] === '' || leaf.between[1] === '';
    case 'text':
      return String(leaf.single ?? '').trim().length === 0;
    default:
      return leaf.single === null || leaf.single === '';
  }
};

/**
 * One leaf -> condition(s). Returns null when the leaf is incomplete (the
 * caller drops it; validation ensures this never happens at Submit). An enum
 * with N>1 choices expands to an OR-of-`Equal` group (§7.3).
 */
export const emitLeaf = (
  leaf: SharedFilterDialogLeaf,
  schema: FilterableProperty[]
): IFilterCondition | IFilterDefinition | null => {
  const prop = findProperty(schema, leaf.propertyKey);
  if (!prop) {
    return null;
  }
  const custom = findCustomOperator(prop, leaf.operator);
  if (custom) {
    return custom.emit(prop.key);
  }
  if (leaf.operator === FilterOperation.Between) {
    if (leafIsIncomplete(leaf, prop)) {
      return null;
    }
    return {
      property: prop.key,
      operation: FilterOperation.Between,
      lowValue: prepare(prop, leaf.between[0]) as FilterScalar,
      highValue: prepare(prop, leaf.between[1]) as FilterScalar,
      ...(prop.enumValues ? { enumValues: prop.enumValues } : {}),
    };
  }
  if (prop.kind === 'enum') {
    if (leaf.choices.length === 0) {
      return null;
    }
    const condition = (value: FilterScalar): IFilterCondition => ({
      property: prop.key,
      operation: FilterOperation.Equal,
      lowValue: value,
      ...(prop.enumValues ? { enumValues: prop.enumValues } : {}),
    });
    if (leaf.choices.length === 1) {
      return condition(leaf.choices[0]);
    }
    return { join: FilterJoinType.OR, conditions: leaf.choices.map(condition) };
  }
  if (leafIsIncomplete(leaf, prop)) {
    return null;
  }
  return {
    property: prop.key,
    operation: leaf.operator as FilterOperation,
    lowValue: prepare(prop, leaf.single) as FilterScalar,
    ...(prop.enumValues ? { enumValues: prop.enumValues } : {}),
  };
};

/**
 * Emit the editor tree to an actslib definition. Incomplete leaves and
 * emptied sub-groups are dropped (an empty group would match everything).
 * The dialog's Submit boundary passes this through
 * `FilterUtility.Simplify`, so a single-condition filter leaves as a bare
 * condition (case 1); the raw wrapper is what the live preview renders.
 * Validation guarantees nothing is dropped and the root is non-empty at
 * Submit.
 */
export const emitTree = (root: SharedFilterDialogNode, schema: FilterableProperty[]): IFilterDefinition => {
  const emitNode = (node: SharedFilterDialogNode): Array<IFilterCondition | IFilterDefinition> => {
    const out: Array<IFilterCondition | IFilterDefinition> = [];
    for (const member of node.members) {
      if (isFilterDialogNode(member)) {
        const conditions = emitNode(member);
        if (conditions.length > 0) {
          out.push({ join: member.join, conditions });
        }
        continue;
      }
      const emitted = emitLeaf(member, schema);
      if (emitted) {
        out.push(emitted);
      }
    }
    return out;
  };
  return { join: root.join, conditions: emitNode(root) };
};

// ---------------------------------------------------------------------------
// Immutable edits
// ---------------------------------------------------------------------------

/** The member with `memberId`, or null. */
export const findMember = (
  node: SharedFilterDialogNode,
  memberId: number
): SharedFilterDialogMember | null => {
  for (const m of node.members) {
    if (m.id === memberId) {
      return m;
    }
    if (isFilterDialogNode(m)) {
      const found = findMember(m, memberId);
      if (found) {
        return found;
      }
    }
  }
  return null;
};

/** The id of the group that directly contains `memberId`, or null. */
export const parentIdOf = (node: SharedFilterDialogNode, memberId: number): number | null => {
  for (const m of node.members) {
    if (m.id === memberId) {
      return node.id;
    }
    if (isFilterDialogNode(m)) {
      const found = parentIdOf(m, memberId);
      if (found !== null) {
        return found;
      }
    }
  }
  return null;
};

/** Level of the member with `memberId` (root = `depth`); 0 when not found. */
export const depthOf = (node: SharedFilterDialogNode, memberId: number, depth: number): number => {
  if (node.id === memberId) {
    return depth;
  }
  for (const m of node.members) {
    if (m.id === memberId) {
      return depth + 1;
    }
    if (isFilterDialogNode(m)) {
      const found = depthOf(m, memberId, depth + 1);
      if (found > 0) {
        return found;
      }
    }
  }
  return 0;
};

/** Replace the group node with `nodeId` (and its ancestors) immutably. */
export const mutateNode = (
  root: SharedFilterDialogNode,
  nodeId: number,
  transform: (node: SharedFilterDialogNode) => SharedFilterDialogNode
): SharedFilterDialogNode => {
  const walk = (node: SharedFilterDialogNode): SharedFilterDialogNode => {
    if (node.id === nodeId) {
      return transform(node);
    }
    let changed = false;
    const members = node.members.map(m => {
      if (!isFilterDialogNode(m)) {
        return m;
      }
      const updated = walk(m);
      if (updated !== m) {
        changed = true;
      }
      return updated;
    });
    return changed ? { ...node, members } : node;
  };
  return walk(root);
};

/** Swap the leaf with `leafId` for `updated` (new object; same id). */
export const replaceLeaf = (
  root: SharedFilterDialogNode,
  leafId: number,
  updated: SharedFilterDialogLeaf
): SharedFilterDialogNode => {
  const parentId = parentIdOf(root, leafId);
  if (parentId === null) {
    return root;
  }
  return mutateNode(root, parentId, node => ({
    ...node,
    members: node.members.map(m => (m.id === leafId ? updated : m)),
  }));
};

/** Append a member to the group with `nodeId`. */
export const appendMember = (
  root: SharedFilterDialogNode,
  nodeId: number,
  member: SharedFilterDialogMember
): SharedFilterDialogNode =>
  mutateNode(root, nodeId, node => ({ ...node, members: [...node.members, member] }));

/** Remove the member with `memberId` from its parent group. */
export const removeMember = (root: SharedFilterDialogNode, memberId: number): SharedFilterDialogNode => {
  const parentId = parentIdOf(root, memberId);
  if (parentId === null) {
    return root;
  }
  return mutateNode(root, parentId, node => ({
    ...node,
    members: node.members.filter(m => m.id !== memberId),
  }));
};

// ---------------------------------------------------------------------------
// Validation (Submit gate)
// ---------------------------------------------------------------------------

export interface FilterTreeValidation {
  /** ids of leaves whose active value editor holds no usable value */
  missingValueIds: number[];
  /** ids of rendered groups (the single top row included) with fewer than two members */
  invalidGroupIds: number[];
  /** true when the root holds no members (case 0 — clearing is the pages' job) */
  emptyTree: boolean;
  /** true when the tree can be submitted (case 1 or case 2, all values present) */
  canSubmit: boolean;
}

/**
 * Validate the editor tree against the three-case taxonomy (see
 * docs/filter-hierarchy-contract.md): the invisible wrapper root must carry
 * at least one member (case 0 is not the dialog's business — the pages'
 * Clear Filter button owns the empty filter), every leaf must have a value
 * (except valueless custom ops and the between low<=high rule), and every
 * RENDERED group must branch (>= 2 members) — the single top GROUP row
 * included, which is why `walk` only exempts the wrapper itself. The
 * wrapper holds at most one node by construction, so its exemption is
 * structural: a 1-member wrapper IS case 1 (a lone condition leaf).
 */
export const validateTree = (root: SharedFilterDialogNode, schema: FilterableProperty[]): FilterTreeValidation => {
  const missingValueIds: number[] = [];
  const invalidGroupIds: number[] = [];
  const emptyTree = root.members.length === 0;
  const checkBetweenOrder = (leaf: SharedFilterDialogLeaf): boolean => {
    const [low, high] = leaf.between;
    if (low === null || high === null || low === '' || high === '') {
      return false; // incompleteness already flagged
    }
    if (typeof low === 'number' && typeof high === 'number') {
      return low <= high;
    }
    if (low instanceof Date && high instanceof Date) {
      return low.getTime() <= high.getTime();
    }
    if (typeof low === 'string' && typeof high === 'string') {
      return low <= high;
    }
    return true;
  };
  const walk = (node: SharedFilterDialogNode, isRoot: boolean): void => {
    if (!isRoot && node.members.length < 2) {
      invalidGroupIds.push(node.id);
    }
    for (const m of node.members) {
      if (isFilterDialogNode(m)) {
        walk(m, false);
        continue;
      }
      const prop = findProperty(schema, m.propertyKey);
      if (!prop) {
        missingValueIds.push(m.id);
        continue;
      }
      if (leafIsIncomplete(m, prop) || (m.operator === FilterOperation.Between && !checkBetweenOrder(m))) {
        missingValueIds.push(m.id);
      }
    }
  };
  walk(root, true);
  return {
    missingValueIds,
    invalidGroupIds,
    emptyTree,
    canSubmit: !emptyTree && missingValueIds.length === 0 && invalidGroupIds.length === 0,
  };
};

// ---------------------------------------------------------------------------
// Summary (preview + menu label)
// ---------------------------------------------------------------------------

/** i18n key naming each actslib operator (used by the summary and labels). */
export const FILTER_OPERATION_LABEL_KEYS: Record<FilterOperation, string> = {
  [FilterOperation.BeginsWith]: 'common.opStartsWith',
  [FilterOperation.Contains]: 'common.opContains',
  [FilterOperation.Equal]: 'common.opEqual',
  [FilterOperation.EndsWith]: 'common.opEndsWith',
  [FilterOperation.GreaterThan]: 'common.opGreaterThan',
  [FilterOperation.GreaterOrEqual]: 'common.opGreaterOrEqual',
  [FilterOperation.LessThan]: 'common.opLessThan',
  [FilterOperation.LessOrEqual]: 'common.opLessOrEqual',
  [FilterOperation.Between]: 'common.opBetween',
};

/**
 * Labelers the summary needs, resolved from a page's TranslocoService and the
 * schema. The dialog supplies these; callers building a menu label pass the
 * same shape.
 */
export interface FilterSummaryLabels {
  translate: (key: string) => string;
}

const displayScalar = (value: FilterScalar): string =>
  value instanceof Date ? value.toLocaleDateString() : String(value);

/**
 * Compact math symbols for the comparison operators on numeric/date properties
 * ("rating >=3" rather than "rating Greater or equal 3"). String properties
 * keep the word labels (their Equal means something different from `=`).
 */
const COMPARISON_SYMBOLS: Partial<Record<FilterOperation, string>> = {
  [FilterOperation.GreaterOrEqual]: '>=',
  [FilterOperation.GreaterThan]: '>',
  [FilterOperation.Equal]: '=',
  [FilterOperation.LessOrEqual]: '<=',
  [FilterOperation.LessThan]: '<',
};

/** Render one emitted condition (or enum OR-group) to a short phrase. */
const describeCondition = (
  cond: IFilterCondition,
  schema: FilterableProperty[],
  labels: FilterSummaryLabels
): string => {
  const prop = findProperty(schema, cond.property);
  const propLabel = prop ? labels.translate(prop.labelKey) : cond.property;
  const custom = prop?.customOperators?.find(o => o.recognize(cond));
  if (custom) {
    return `${propLabel} ${labels.translate(custom.labelKey)}`;
  }
  if (cond.operation === FilterOperation.Between) {
    const low = cond.lowValue === undefined ? '?' : displayScalar(cond.lowValue);
    const high = cond.highValue === undefined ? '?' : displayScalar(cond.highValue);
    return `${propLabel} ${low}≤x≤${high}`;
  }
  if (prop?.kind === 'enum') {
    const choice = prop.choices?.find(c => c.value === cond.lowValue);
    const valueLabel = choice ? labels.translate(choice.labelKey) : displayScalar(cond.lowValue as FilterScalar);
    return `${propLabel} ${valueLabel}`;
  }
  const isNumericKind = prop?.kind === 'number' || prop?.kind === 'date';
  const opLabel = (isNumericKind ? COMPARISON_SYMBOLS[cond.operation] : undefined)
    ?? labels.translate(FILTER_OPERATION_LABEL_KEYS[cond.operation] ?? cond.operation);
  const value = cond.lowValue === undefined ? '' : ` ${displayScalar(cond.lowValue)}`;
  return `${propLabel}${value ? ` ${opLabel}${value}` : ` ${opLabel}`}`;
};

/**
 * Human-readable rendering of a filter root in the same parenthesized
 * notation the filter menu label uses — a bare condition (case 1) renders
 * like its 1-member wrapper. Multi-member sub-groups get parentheses;
 * an OR group of same-enum-property `Equal`s renders as one `prop a/b/c`
 * phrase (the enum fold's display). `maxLength` caps with an ellipsis.
 */
export const summarizeFilterDefinition = (
  root: FilterRoot,
  schema: FilterableProperty[],
  labels: FilterSummaryLabels,
  maxLength = Number.POSITIVE_INFINITY
): string => {
  // actslib's normalizer (the exact inverse of the Simplify Submit uses): if
  // the library ever changes the case-1 wrapper spelling, the label follows
  // the evaluation instead of drifting from it.
  const def: IFilterDefinition = FilterUtility.ToDefinition(root);
  const foldEnumParts = (group: IFilterDefinition): string[] | null => {
    const members = membersOf(group);
    const folded = members.every(
      c => isFilterCondition(c) && c.operation === FilterOperation.Equal
    );
    if (!folded || members.length < 2) {
      return null;
    }
    const conditions = members as IFilterCondition[];
    const prop = findProperty(schema, conditions[0].property);
    if (!prop || prop.kind !== 'enum') {
      return null;
    }
    if (!conditions.every(c => c.property === prop.key)) {
      return null;
    }
    const propLabel = labels.translate(prop.labelKey);
    const valueLabels = conditions.map(c => {
      const choice = prop.choices?.find(ch => ch.value === c.lowValue);
      return choice ? labels.translate(choice.labelKey) : displayScalar(c.lowValue as FilterScalar);
    });
    return [`${propLabel} ${valueLabels.join('/')}`];
  };

  const renderGroup = (group: IFilterDefinition, nested: boolean): string | null => {
    const folded = foldEnumParts(group);
    if (folded) {
      return folded.join(' ');
    }
    const parts: string[] = [];
    for (const member of membersOf(group)) {
      if (isFilterCondition(member)) {
        parts.push(describeCondition(member, schema, labels));
        continue;
      }
      const sub = renderGroup(member, true);
      if (sub !== null) {
        parts.push(sub);
      }
    }
    if (parts.length === 0) {
      return null;
    }
    const joinWord = group.join === FilterJoinType.OR
      ? labels.translate('common.joinOr')
      : labels.translate('common.joinAnd');
    const joined = parts.join(` ${joinWord} `);
    return nested && parts.length > 1 ? `(${joined})` : joined;
  };

  const joined = renderGroup(def, false) ?? '';
  if (joined.length <= maxLength) {
    return joined;
  }
  // Slice by CODE POINT: a UTF-16 slice can cut an astral-plane character
  // (e.g. a CJK Ext-B ideograph in a classical-name filter) between its
  // surrogates, which the menu label would render as U+FFFD.
  return `${Array.from(joined).slice(0, maxLength - 1).join('').trimEnd()}…`;
};

/**
 * The tree-row label for one member: "Condition group (AND)" for nodes, a
 * single-phrase condition summary for leaves (mirrors the emitted condition).
 */
export const describeMember = (
  member: SharedFilterDialogMember,
  schema: FilterableProperty[],
  labels: FilterSummaryLabels
): string => {
  if (isFilterDialogNode(member)) {
    const joinWord = member.join === FilterJoinType.OR
      ? labels.translate('common.joinOr')
      : labels.translate('common.joinAnd');
    return `${labels.translate('common.filterGroup')} (${joinWord})`;
  }
  // Render the leaf's would-be condition; fall back to an incomplete marker.
  const emitted = emitLeaf(member, schema);
  if (!emitted) {
    const prop = findProperty(schema, member.propertyKey);
    return prop ? labels.translate(prop.labelKey) : member.propertyKey;
  }
  if (isFilterDialogConditionLike(emitted)) {
    return describeCondition(emitted, schema, labels);
  }
  // An enum multi-choice emits an OR group; describe it via the summary path.
  const summary = summarizeFilterDefinition(emitted, schema, labels);
  return summary || labels.translate(findProperty(schema, member.propertyKey)?.labelKey ?? member.propertyKey);
};

/** Narrow the emitLeaf result: a condition carries a string `property`. */
const isFilterDialogConditionLike = (
  v: IFilterCondition | IFilterDefinition
): v is IFilterCondition => typeof (v as IFilterCondition).property === 'string';
