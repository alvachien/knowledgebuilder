import { FilterJoinType, FilterOperation, FilterUtility } from 'actslib';
import type { EnumLike, IFilterCondition, IFilterDefinition } from 'actslib';

import {
  appendMember,
  defaultOperatorsFor,
  depthOf,
  describeMember,
  emitLeaf,
  emitTree,
  emptyLeaf,
  effectiveOperators,
  findMember,
  findProperty,
  hasActiveFilterDefinition,
  leafIsIncomplete,
  mutateNode,
  parentIdOf,
  removeMember,
  replaceLeaf,
  seedTree,
  summarizeFilterDefinition,
  validateTree,
  valueEditorFor,
} from './filter-dialog-model';
import type {
  FilterCustomOperator,
  FilterableProperty,
  FilterIdGen,
  SharedFilterDialogLeaf,
  SharedFilterDialogNode,
} from './filter-dialog-model';

// ---------------------------------------------------------------------------
// Fixture schema: one string property with a custom op, one number, one enum.
// ---------------------------------------------------------------------------

const IS_PHRASE: FilterCustomOperator = {
  id: 'isPhrase',
  labelKey: 'test.opIsPhrase',
  emit: property => ({ property, operation: FilterOperation.Contains, lowValue: ' ' }),
  recognize: c => c.operation === FilterOperation.Contains && c.lowValue === ' ',
};

const COLOR_VALUES: EnumLike = { red: 'red', blue: 'blue', green: 'green' };

const enword: FilterableProperty = {
  key: 'enword',
  labelKey: 'test.word',
  kind: 'string',
  customOperators: [IS_PHRASE],
  prepareValue: v => String(v).trim().toLowerCase(),
};

const rating: FilterableProperty = {
  key: 'rating',
  labelKey: 'test.rating',
  kind: 'number',
};

const color: FilterableProperty = {
  key: 'color',
  labelKey: 'test.color',
  kind: 'enum',
  enumValues: COLOR_VALUES,
  choices: [
    { value: 'red', labelKey: 'test.red' },
    { value: 'blue', labelKey: 'test.blue' },
    { value: 'green', labelKey: 'test.green' },
  ],
};

const schema: FilterableProperty[] = [enword, rating, color];

/** Labels resolve through a small dictionary — keys not listed pass through. */
const LABELS: Record<string, string> = {
  'test.word': 'word',
  'test.rating': 'rating',
  'test.color': 'color',
  'test.red': 'red',
  'test.blue': 'blue',
  'test.green': 'green',
  'test.opIsPhrase': 'is phrase',
  'common.joinAnd': 'AND',
  'common.joinOr': 'OR',
  'common.filterGroup': 'group',
  'common.opContains': 'contains',
  'common.opBeginsWith': 'starts with',
  'common.opEqual': 'equals',
  'common.opEndsWith': 'ends with',
  'common.opGreaterThan': '>',
  'common.opGreaterOrEqual': '>=',
  'common.opLessThan': '<',
  'common.opLessOrEqual': '<=',
  'common.opBetween': 'between',
};
const labels = { translate: (key: string): string => LABELS[key] ?? key };

const mkIdGen = (): FilterIdGen => {
  let n = 0;
  return () => ++n;
};

const wordLeaf = (text: string): SharedFilterDialogLeaf => ({
  id: 101,
  propertyKey: 'enword',
  operator: FilterOperation.Contains,
  single: text,
  between: [null, null],
  choices: [],
});

const ratingLeaf = (value: number | null, op = FilterOperation.GreaterOrEqual): SharedFilterDialogLeaf => ({
  id: 102,
  propertyKey: 'rating',
  operator: op,
  single: value,
  between: [null, null],
  choices: [],
});

describe('filter-dialog-model', () => {
  describe('operators', () => {
    it('defaults strings to the full actslib matrix (shape match + lexicographic + Between)', () => {
      expect(defaultOperatorsFor('string')).toEqual([
        FilterOperation.BeginsWith,
        FilterOperation.Contains,
        FilterOperation.Equal,
        FilterOperation.EndsWith,
        FilterOperation.GreaterOrEqual,
        FilterOperation.GreaterThan,
        FilterOperation.LessOrEqual,
        FilterOperation.LessThan,
        FilterOperation.Between,
      ]);
    });

    it('defaults numbers to comparisons plus Between', () => {
      expect(defaultOperatorsFor('number')).toContain(FilterOperation.Between);
      expect(defaultOperatorsFor('number')).toContain(FilterOperation.GreaterOrEqual);
      expect(defaultOperatorsFor('date')).toEqual(defaultOperatorsFor('number'));
    });

    it('an enum property only ever offers Equal (membership is the editor)', () => {
      expect(defaultOperatorsFor('enum')).toEqual([FilterOperation.Equal]);
      expect(effectiveOperators(color)).toEqual([FilterOperation.Equal]);
    });

    it('a whitelist narrows (in its own order) and drops unsupported operators', () => {
      const p: FilterableProperty = {
        key: 'k',
        labelKey: 'test.k',
        kind: 'number',
        operations: [FilterOperation.Equal, FilterOperation.Contains], // Contains is not numeric
      };
      expect(effectiveOperators(p)).toEqual([FilterOperation.Equal]);
    });
  });

  describe('editor dispatch', () => {
    it('routes kind + operator to the right value editor', () => {
      expect(valueEditorFor(enword, FilterOperation.Contains)).toBe('text');
      expect(valueEditorFor(rating, FilterOperation.Equal)).toBe('number');
      expect(valueEditorFor(rating, FilterOperation.Between)).toBe('between');
      expect(valueEditorFor(color, FilterOperation.Equal)).toBe('enum');
      expect(valueEditorFor(enword, 'isPhrase')).toBe('none');
    });
  });

  describe('seedTree', () => {
    it('seeds an empty/undefined definition into an empty root (inert AND scaffold join)', () => {
      const root = seedTree(undefined, schema, mkIdGen());
      expect(root.join).toBe(FilterJoinType.AND);
      expect(root.members).toEqual([]);

      // The wrapper's join is scaffold (top level is a single node, so it is
      // never evaluated): any definition seed yields the inert AND wrapper.
      const explicit = seedTree({ join: FilterJoinType.OR, conditions: [] }, schema, mkIdGen());
      expect(explicit.join).toBe(FilterJoinType.AND);
      expect(explicit.members).toEqual([]);
    });

    it('seeds a two-condition definition as ONE root group of leaves', () => {
      const root = seedTree(
        {
          join: FilterJoinType.AND,
          conditions: [
            { property: 'enword', operation: FilterOperation.BeginsWith, lowValue: 'App' },
            { property: 'rating', operation: FilterOperation.LessThan, lowValue: 4 },
          ],
        },
        schema,
        mkIdGen()
      );
      // Case 2: the top level holds a single node — the definition becomes
      // the root GROUP, its conditions its members.
      expect(root.members.length).toBe(1);
      const top = root.members[0] as SharedFilterDialogNode;
      expect(top.join).toBe(FilterJoinType.AND);
      const [word, num] = top.members as SharedFilterDialogLeaf[];
      expect(word).toEqual(expect.objectContaining({ propertyKey: 'enword', operator: 'BeginsWith', single: 'App' }));
      expect(num).toEqual(expect.objectContaining({ propertyKey: 'rating', operator: '<', single: 4 }));
    });

    it('preserves nesting to any depth', () => {
      const def: IFilterDefinition = {
        join: FilterJoinType.AND,
        conditions: [
          { property: 'enword', operation: FilterOperation.Contains, lowValue: 'x' },
          {
            join: FilterJoinType.OR,
            conditions: [
              { property: 'rating', operation: FilterOperation.Equal, lowValue: 5 },
              {
                join: FilterJoinType.AND,
                conditions: [
                  { property: 'enword', operation: FilterOperation.EndsWith, lowValue: 'y' },
                  { property: 'rating', operation: FilterOperation.GreaterThan, lowValue: 1 },
                ],
              },
            ],
          },
        ],
      };
      const root = seedTree(def, schema, mkIdGen());
      // Normalized to one top node: the definition IS the root group.
      const top = root.members[0] as SharedFilterDialogNode;
      expect(root.members.length).toBe(1);
      const orGroup = top.members[1] as SharedFilterDialogNode;
      expect(orGroup.join).toBe(FilterJoinType.OR);
      const andGroup = orGroup.members[1] as SharedFilterDialogNode;
      expect((andGroup.members[0] as SharedFilterDialogLeaf).single).toBe('y');
    });

    it('folds a custom-operator condition back into its valueless leaf', () => {
      const root = seedTree(
        { join: FilterJoinType.AND, conditions: [{ property: 'enword', operation: FilterOperation.Contains, lowValue: ' ' }] },
        schema,
        mkIdGen()
      );
      const leaf = root.members[0] as SharedFilterDialogLeaf;
      expect(leaf.operator).toBe('isPhrase');
    });

    it('folds an enum OR-of-Equal group into one multi-choice leaf, and seeds bare Equals', () => {
      const root = seedTree(
        {
          join: FilterJoinType.AND,
          conditions: [
            {
              join: FilterJoinType.OR,
              conditions: [
                { property: 'color', operation: FilterOperation.Equal, lowValue: 'red', enumValues: COLOR_VALUES },
                { property: 'color', operation: FilterOperation.Equal, lowValue: 'blue', enumValues: COLOR_VALUES },
              ],
            },
            { property: 'rating', operation: FilterOperation.Equal, lowValue: 2 },
          ],
        },
        schema,
        mkIdGen()
      );
      // Two-condition definition -> one root group; its first member folds.
      const top = root.members[0] as SharedFilterDialogNode;
      expect(top.members.length).toBe(2);
      const folded = top.members[0] as SharedFilterDialogLeaf;
      expect(folded.propertyKey).toBe('color');
      expect(folded.choices).toEqual(['red', 'blue']);
    });

    it('does NOT fold an OR group that mixes properties or joins with AND', () => {
      const root = seedTree(
        {
          join: FilterJoinType.AND,
          conditions: [
            {
              join: FilterJoinType.OR,
              conditions: [
                { property: 'color', operation: FilterOperation.Equal, lowValue: 'red' },
                { property: 'rating', operation: FilterOperation.Equal, lowValue: 2 },
              ],
            },
          ],
        },
        schema,
        mkIdGen()
      );
      expect(Array.isArray((root.members[0] as SharedFilterDialogNode).members)).toBe(true); // stays a group
    });

    it('seeds Between bounds into the leaf', () => {
      const root = seedTree(
        {
          join: FilterJoinType.AND,
          conditions: [{ property: 'rating', operation: FilterOperation.Between, lowValue: 2, highValue: 4 }],
        },
        schema,
        mkIdGen()
      );
      const leaf = root.members[0] as SharedFilterDialogLeaf;
      expect(leaf.operator).toBe('Between');
      expect(leaf.between).toEqual([2, 4]);
    });

    it('seeds a bare condition (case 1) into the same root + leaf as its wrapper', () => {
      const bare: IFilterCondition = {
        property: 'enword',
        operation: FilterOperation.Contains,
        lowValue: 'apple',
      };
      const fromBare = seedTree(bare, schema, mkIdGen());
      const fromWrapper = seedTree(
        { join: FilterJoinType.AND, conditions: [bare] },
        schema,
        mkIdGen()
      );
      expect(fromBare.members.length).toBe(1);
      // Both spellings seed the same leaf shape (ids differ between runs).
      expect(fromBare.members[0]).toEqual(
        expect.objectContaining({ propertyKey: 'enword', operator: 'Contains', single: 'apple' })
      );
      expect(fromWrapper.members[0]).toEqual(
        expect.objectContaining({ propertyKey: 'enword', operator: 'Contains', single: 'apple' })
      );
      // Re-emitting the bare seed yields the wrapper (Simplify at Submit restores the bare form).
      expect(emitTree(fromBare, schema).conditions).toEqual([bare]);
    });

    it('never mutates the caller definition', () => {
      const def: IFilterDefinition = {
        join: FilterJoinType.AND,
        conditions: [{ property: 'enword', operation: FilterOperation.Contains, lowValue: 'x' }],
      };
      const before = JSON.stringify(def);
      seedTree(def, schema, mkIdGen());
      expect(JSON.stringify(def)).toBe(before);
    });
  });

  describe('emitTree', () => {
    const node = (...members: SharedFilterDialogNode['members']): SharedFilterDialogNode => ({
      id: 1,
      join: FilterJoinType.AND,
      members,
    });

    it('emits string conditions with prepareValue applied (trim + lowercase)', () => {
      const def = emitTree(node(wordLeaf('  APP ')), schema);
      expect(def.conditions).toEqual([{ property: 'enword', operation: FilterOperation.Contains, lowValue: 'app' }]);
    });

    it('emits custom operators via their emit hook (no prepareValue)', () => {
      const phrase: SharedFilterDialogLeaf = { ...wordLeaf('ignored'), operator: 'isPhrase' };
      expect(emitLeaf(phrase, schema)).toEqual({ property: 'enword', operation: FilterOperation.Contains, lowValue: ' ' });
    });

    it('emits one enum choice as a single Equal, N choices as an OR-of-Equal group (with enumValues)', () => {
      const one: SharedFilterDialogLeaf = { id: 3, propertyKey: 'color', operator: 'Equal', single: null, between: [null, null], choices: ['red'] };
      const many: SharedFilterDialogLeaf = { ...one, id: 4, choices: ['red', 'blue'] };
      expect(emitLeaf(one, schema)).toEqual({ property: 'color', operation: FilterOperation.Equal, lowValue: 'red', enumValues: COLOR_VALUES });
      const group = emitLeaf(many, schema) as IFilterDefinition;
      expect(group.join).toBe(FilterJoinType.OR);
      expect((group.conditions as IFilterCondition[]).map(c => c.lowValue)).toEqual(['red', 'blue']);
    });

    it('emits Between with both bounds prepared', () => {
      const leaf: SharedFilterDialogLeaf = {
        id: 5,
        propertyKey: 'rating',
        operator: FilterOperation.Between,
        single: null,
        between: [2, 4],
        choices: [],
      };
      expect(emitLeaf(leaf, schema)).toEqual({ property: 'rating', operation: FilterOperation.Between, lowValue: 2, highValue: 4 });
    });

    it('drops incomplete leaves and empty sub-groups', () => {
      const emptyGroup: SharedFilterDialogNode = { id: 9, join: FilterJoinType.OR, members: [wordLeaf('  ')] };
      const def = emitTree(node(wordLeaf('ok'), emptyGroup), schema);
      expect(def.conditions.length).toBe(1);
      expect((def.conditions[0] as IFilterCondition).lowValue).toBe('ok');
    });

    it('an empty root emits an empty definition (the clear-filter state)', () => {
      expect(emitTree(node(), schema)).toEqual({ join: FilterJoinType.AND, conditions: [] });
    });

    it('round-trips: emit -> seed -> emit is stable (nesting, enum fold, custom, Between)', () => {
      const root: SharedFilterDialogNode = {
        id: 1,
        join: FilterJoinType.AND,
        members: [
          wordLeaf(' pie '),
          {
            id: 2,
            join: FilterJoinType.OR,
            members: [
              { id: 3, propertyKey: 'color', operator: 'Equal', single: null, between: [null, null], choices: ['red', 'blue'] },
              {
                id: 4,
                propertyKey: 'rating',
                operator: 'Between',
                single: null,
                between: [1, 5],
                choices: [],
              },
            ],
          },
        ],
      };
      const first = emitTree(root, schema);
      const second = emitTree(seedTree(first, schema, mkIdGen()), schema);
      // Root normalization: a 2+ condition definition seeds as the scaffold's
      // SINGLE top group, so the raw re-emit wraps one level deeper — and
      // Simplify at the Submit boundary unwraps it back to the identical
      // definition (the round-trip the dialog actually performs).
      expect(second.conditions).toEqual([first]);
      expect(FilterUtility.Simplify(second)).toEqual(first);
    });
  });

  describe('tree edits (immutable)', () => {
    const buildTree = (): SharedFilterDialogNode => ({
      id: 1,
      join: FilterJoinType.AND,
      members: [
        wordLeaf('a'),
        { id: 2, join: FilterJoinType.OR, members: [ratingLeaf(3), { ...wordLeaf('b'), id: 103 }] },
      ],
    });

    it('findMember / parentIdOf / depthOf locate members through nesting', () => {
      const root = buildTree();
      expect(findMember(root, 103)?.id).toBe(103);
      expect(parentIdOf(root, 103)).toBe(2);
      expect(parentIdOf(root, 2)).toBe(1);
      expect(depthOf(root, 103, 1)).toBe(3);
      expect(depthOf(root, 999, 1)).toBe(0);
    });

    it('append/remove/replace replace the path and leave untouched siblings identical', () => {
      const root = buildTree();
      const before = root.members[0];

      const appended = appendMember(root, 2, ratingLeaf(5, FilterOperation.Equal));
      expect(appended).not.toBe(root);
      expect((findMember(appended, 2) as SharedFilterDialogNode).members.length).toBe(3);
      expect(findMember(appended, 101)).toBe(before); // untouched leaf keeps identity

      const removed = removeMember(root, 103);
      expect((findMember(removed, 2) as SharedFilterDialogNode).members.length).toBe(1);
      expect((findMember(removed, 2) as SharedFilterDialogNode).members[0]).toBe(root.members[1] && (root.members[1] as SharedFilterDialogNode).members[0]);

      const patched = replaceLeaf(root, 101, { ...wordLeaf('z'), id: 101 });
      expect((findMember(patched, 101) as SharedFilterDialogLeaf).single).toBe('z');
      expect((findMember(patched, 103) as SharedFilterDialogLeaf).single).toBe('b');
    });

    it('mutateNode flips a join immutably', () => {
      const root = buildTree();
      const flipped = mutateNode(root, 2, n => ({ ...n, join: FilterJoinType.AND }));
      expect((findMember(flipped, 2) as SharedFilterDialogNode).join).toBe(FilterJoinType.AND);
      expect((findMember(root, 2) as SharedFilterDialogNode).join).toBe(FilterJoinType.OR);
    });

    it('emptyLeaf picks the first property with its first operator', () => {
      const leaf = emptyLeaf(schema[0], mkIdGen());
      expect(leaf.propertyKey).toBe('enword');
      expect(leaf.operator).toBe(FilterOperation.BeginsWith);
      expect(leaf.single).toBeNull();
    });
  });

  describe('validateTree', () => {
    const rootOf = (...members: SharedFilterDialogNode['members']): SharedFilterDialogNode => ({
      id: 1,
      join: FilterJoinType.AND,
      members,
    });

    it('flags blank text, null numeric and null Between bounds; custom ops never', () => {
      const phrase: SharedFilterDialogLeaf = { ...wordLeaf(''), operator: 'isPhrase' };
      const v = validateTree(rootOf(wordLeaf('  '), ratingLeaf(null), phrase), schema);
      expect(v.missingValueIds).toEqual([101, 102]);
      expect(v.canSubmit).toBe(false);
    });

    it('flags an enum leaf with zero choices, accepts one or more', () => {
      const none: SharedFilterDialogLeaf = { id: 7, propertyKey: 'color', operator: 'Equal', single: null, between: [null, null], choices: [] };
      const one: SharedFilterDialogLeaf = { ...none, id: 8, choices: ['red'] };
      expect(leafIsIncomplete(none, color)).toBe(true);
      expect(leafIsIncomplete(one, color)).toBe(false);
      expect(validateTree(rootOf(one, ratingLeaf(2)), schema).canSubmit).toBe(true);
    });

    it('flags a Between whose low exceeds its high (and missing bounds)', () => {
      const bad: SharedFilterDialogLeaf = { id: 9, propertyKey: 'rating', operator: 'Between', single: null, between: [5, 2], choices: [] };
      const missing: SharedFilterDialogLeaf = { ...bad, id: 10, between: [5, null] };
      const ok: SharedFilterDialogLeaf = { ...bad, id: 11, between: [2, 5] };
      expect(validateTree(rootOf(bad, ok), schema).missingValueIds).toEqual([9]);
      expect(validateTree(rootOf(missing, ok), schema).missingValueIds).toEqual([10]);
      expect(validateTree(rootOf(ok, ok), schema).canSubmit).toBe(true);
    });

    it('zero is a valid number value (not treated as empty)', () => {
      expect(leafIsIncomplete(ratingLeaf(0, FilterOperation.Equal), rating)).toBe(false);
    });

    it('every rendered group must branch; only the invisible wrapper root is exempt', () => {
      const single: SharedFilterDialogNode = { id: 20, join: FilterJoinType.OR, members: [wordLeaf('a')] };
      const empty: SharedFilterDialogNode = { id: 21, join: FilterJoinType.OR, members: [] };
      expect(validateTree(rootOf(single, ratingLeaf(1)), schema).invalidGroupIds).toEqual([20]);
      expect(validateTree(rootOf(empty, ratingLeaf(1)), schema).invalidGroupIds).toEqual([21]);
      // the wrapper holding one leaf is fine (case 1 — the exemption is
      // structural: the wrapper is never rendered)…
      expect(validateTree(rootOf(wordLeaf('a')), schema).canSubmit).toBe(true);
      // …but a violation inside any RENDERED group, the top row included, is caught.
      const deep: SharedFilterDialogNode = { id: 22, join: FilterJoinType.AND, members: [single, ratingLeaf(2)] };
      expect(validateTree(rootOf(deep, wordLeaf('x')), schema).invalidGroupIds).toEqual([20]);
    });

    it('the empty root (case 0) is not submittable — Clear Filter owns it', () => {
      const v = validateTree(rootOf(), schema);
      expect(v.emptyTree).toBe(true);
      expect(v.canSubmit).toBe(false);
      // A non-empty tree does not carry the flag.
      expect(validateTree(rootOf(wordLeaf('a')), schema).emptyTree).toBe(false);
    });
  });

  describe('summarizeFilterDefinition', () => {
    const cond = (property: string, operation: FilterOperation, lowValue: unknown, highValue?: unknown): IFilterCondition =>
      highValue === undefined
        ? { property, operation, lowValue: lowValue as string | number }
        : { property, operation, lowValue: lowValue as string | number, highValue: highValue as string | number };

    it('joins members with the group join word and parenthesizes nested multi-member groups', () => {
      const def: IFilterDefinition = {
        join: FilterJoinType.AND,
        conditions: [
          cond('enword', FilterOperation.Contains, 'app'),
          {
            join: FilterJoinType.OR,
            conditions: [cond('rating', FilterOperation.GreaterOrEqual, 3), cond('rating', FilterOperation.LessOrEqual, 4)],
          },
        ],
      };
      expect(summarizeFilterDefinition(def, schema, labels)).toBe('word contains app AND (rating >= 3 OR rating <= 4)');
    });

    it('renders custom operators through their recognize hook', () => {
      const def: IFilterDefinition = { join: FilterJoinType.AND, conditions: [cond('enword', FilterOperation.Contains, ' ')] };
      expect(summarizeFilterDefinition(def, schema, labels)).toBe('word is phrase');
    });

    it('renders an enum OR fold as one slash-joined phrase and a bare Equal as one label', () => {
      const many: IFilterDefinition = {
        join: FilterJoinType.AND,
        conditions: [
          {
            join: FilterJoinType.OR,
            conditions: [cond('color', FilterOperation.Equal, 'red'), cond('color', FilterOperation.Equal, 'blue')],
          },
        ],
      };
      expect(summarizeFilterDefinition(many, schema, labels)).toBe('color red/blue');
      const one: IFilterDefinition = { join: FilterJoinType.AND, conditions: [cond('color', FilterOperation.Equal, 'green')] };
      expect(summarizeFilterDefinition(one, schema, labels)).toBe('color green');
    });

    it('renders Between as low≤x≤high', () => {
      const def: IFilterDefinition = { join: FilterJoinType.AND, conditions: [cond('rating', FilterOperation.Between, 2, 5)] };
      expect(summarizeFilterDefinition(def, schema, labels)).toBe('rating 2≤x≤5');
    });

    it('renders a bare condition (case 1) like its wrapper', () => {
      const bare: IFilterCondition = { property: 'enword', operation: FilterOperation.Contains, lowValue: 'app' };
      expect(summarizeFilterDefinition(bare, schema, labels)).toBe('word contains app');
    });

    it('caps with an ellipsis and returns empty string for an empty definition', () => {
      const def: IFilterDefinition = {
        join: FilterJoinType.AND,
        conditions: [cond('enword', FilterOperation.Contains, 'abcdefghij'), cond('enword', FilterOperation.Contains, 'klmnopqrst')],
      };
      const capped = summarizeFilterDefinition(def, schema, labels, 20);
      expect(capped.length).toBe(20);
      expect(capped.endsWith('…')).toBe(true);
      expect(summarizeFilterDefinition({ join: FilterJoinType.AND, conditions: [] }, schema, labels)).toBe('');
    });

    it('the ellipsis cut never splits a surrogate pair (L1)', () => {
      const def: IFilterDefinition = {
        join: FilterJoinType.AND,
        conditions: [
          cond('enword', FilterOperation.Contains, 'abcdefghi𠀋'), // CJK Ext-B: 2 UTF-16 units
          cond('enword', FilterOperation.Contains, 'klmnopqrst'),
        ],
      };
      // "word contains abcdefghi" is 23 units — a UTF-16 slice at 24 would
      // end on the high surrogate alone; the code-point slice keeps 𠀋 whole.
      const capped = summarizeFilterDefinition(def, schema, labels, 25);
      expect(capped.endsWith('…')).toBe(true);
      const surrogateFree = capped.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '');
      expect(surrogateFree).not.toMatch(/[\uD800-\uDFFF]/);
    });
  });

  describe('describeMember', () => {
    it('labels nodes with their join and leaves with their condition phrase', () => {
      const root = seedTree(
        {
          join: FilterJoinType.AND,
          conditions: [
            { property: 'enword', operation: FilterOperation.Contains, lowValue: 'app' },
            { join: FilterJoinType.OR, conditions: [{ property: 'rating', operation: FilterOperation.Equal, lowValue: 2 }, { property: 'rating', operation: FilterOperation.Equal, lowValue: 3 }] },
          ],
        },
        schema,
        mkIdGen()
      );
      // Normalized to one top group node; the labels come from its members.
      const top = root.members[0] as SharedFilterDialogNode;
      expect(describeMember(top, schema, labels)).toBe('group (AND)');
      expect(describeMember(top.members[0], schema, labels)).toBe('word contains app');
      expect(describeMember(top.members[1], schema, labels)).toBe('group (OR)');
    });

    it('labels an incomplete leaf with just its property name', () => {
      expect(describeMember(wordLeaf(''), schema, labels)).toBe('word');
    });
  });

  describe('hasActiveFilterDefinition', () => {
    it('is false for undefined/empty and true when any (nested) condition exists', () => {
      expect(hasActiveFilterDefinition(undefined)).toBe(false);
      expect(hasActiveFilterDefinition({ join: FilterJoinType.AND, conditions: [] })).toBe(false);
      expect(
        hasActiveFilterDefinition({
          join: FilterJoinType.AND,
          conditions: [{ join: FilterJoinType.OR, conditions: [{ property: 'rating', operation: FilterOperation.Equal, lowValue: 2 }] }],
        })
      ).toBe(true);
    });

    it('a bare condition (case 1) is always active', () => {
      expect(
        hasActiveFilterDefinition({ property: 'enword', operation: FilterOperation.Contains, lowValue: 'a' })
      ).toBe(true);
    });
  });

  describe('a definition missing the conditions key (M1)', () => {
    // Legal JSON decode from persistence/URL round-trips; actslib's own
    // Simplify/MatchFilter treat a missing `conditions` as empty, so every
    // model walk must degrade to case 0 / match-all instead of throwing.
    const malformed = { join: FilterJoinType.OR } as IFilterDefinition;

    it('hasActiveFilterDefinition reads it as inactive', () => {
      expect(hasActiveFilterDefinition(malformed)).toBe(false);
      // Nested too: a malformed sub-group is simply no condition anywhere.
      expect(
        hasActiveFilterDefinition({
          join: FilterJoinType.AND,
          conditions: [malformed],
        })
      ).toBe(false);
    });

    it('seedTree yields no top node (the empty-seed scaffold path)', () => {
      const root = seedTree(malformed, schema, mkIdGen());
      expect(root.members).toEqual([]);
      // A malformed NESTED group seeds as an empty (invalid, fixable) group.
      const nested = seedTree(
        { join: FilterJoinType.AND, conditions: [{ property: 'enword', operation: FilterOperation.Contains, lowValue: 'x' }, malformed] },
        schema,
        mkIdGen()
      );
      const top = nested.members[0] as SharedFilterDialogNode;
      expect(top.members.length).toBe(2);
      expect((top.members[1] as SharedFilterDialogNode).members).toEqual([]);
    });

    it('summarizeFilterDefinition renders it as the empty string', () => {
      expect(summarizeFilterDefinition(malformed, schema, labels)).toBe('');
    });
  });

  describe('findProperty', () => {
    it('locates by key and misses gracefully', () => {
      expect(findProperty(schema, 'rating')).toBe(rating);
      expect(findProperty(schema, 'nope')).toBeUndefined();
    });
  });
});
