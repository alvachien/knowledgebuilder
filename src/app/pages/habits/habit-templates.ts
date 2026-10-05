// The 12 predefined habit templates from the functional spec (FR-5.4), kept
// client-side: the wizard maps a selection to a HabitCreate payload (API design
// § Templates — no server template endpoint). Display labels live in i18n under
// `habits.templates.<key>`. Item and property names ALSO carry i18n `nameKey`s
// (`habits.templateItems.*` / `habits.templateProps.*`): the wizard resolves
// them through Transloco at seed time via `resolveTemplate` (a translate that
// echoes the key falls back to the English constant), and the resolved strings
// materialize into the draft and the POST payload as ordinary editable user
// data — a habit created in zh-CN stores Chinese item names server-side.
//
// Criteria mirror the spec shapes exactly: the boolean day-count templates are an
// AND group over per-item `done >= 1` conditions with the root carrying
// `successType: daily` + cycleTarget (successful days); the cumulative ones are
// a single condition root carrying `successType: cumulative` and NO cycleTarget
// (the target is the threshold). Boolean thresholds are item COUNTS.
// NOTE: the wizard's Targets step lets the user override cycleTarget (daily
// templates) or the root threshold (cumulative templates) before saving;
// `strength` ships cycleTarget 3, the other weekly day-count templates 5.

import type {
  CompositeOperator,
  HabitCycle,
  ItemUniqueness,
  PropertyType,
  SuccessType,
} from './habit.models';

export interface HabitTemplateProperty {
  name: string;
  /** i18n key resolved at wizard seed time; `name` stays the canonical id + EN fallback. */
  nameKey: string;
  propertyType: PropertyType;
  baseRate?: number | null;
  itemUniqueness?: ItemUniqueness | null;
}

export interface HabitTemplateItem {
  name: string;
  nameKey: string;
  properties: HabitTemplateProperty[];
}

export interface HabitTemplateCriterion {
  name: string;
  isRoot: boolean;
  criterionType: 'condition' | 'composite';
  /** condition: property NAME bound across the scope. */
  propertyName?: string;
  /** condition: empty ⇒ scope all; names ⇒ subset items. */
  scopeItemNames?: string[];
  /** condition: positive threshold (integer item count for boolean properties). */
  threshold?: number;
  /** composite. */
  operator?: CompositeOperator;
  operandNames?: string[];
  /** root only. */
  successType?: SuccessType;
  /** daily root: successful days required; cumulative: undefined. */
  cycleTarget?: number;
}

export interface HabitTemplate {
  key: string;
  icon: string;
  cycle: HabitCycle;
  items: HabitTemplateItem[];
  criteria: HabitTemplateCriterion[];
  /**
   * Default overridden in the Targets step: the daily cycleTarget or the
   * cumulative root threshold (which one follows the root's successType).
   */
  defaultTarget: number;
}

/** Key namespaces: item labels are per-template; property labels share slugs. */
const itemKey = (ns: string, slug: string): string => `habits.templateItems.${ns}.${slug}`;
const propKey = (slug: string): string => `habits.templateProps.${slug}`;

const doneProp = (): HabitTemplateProperty => ({
  name: 'done',
  nameKey: propKey('done'),
  propertyType: 'boolean',
});

const boolItem = (ns: string, name: string, slug: string): HabitTemplateItem => ({
  name,
  nameKey: itemKey(ns, slug),
  properties: [doneProp()],
});

/**
 * AND-over-per-item-done day-count template (morning_exercise family).
 * Leaf names compose `${item.name} ${propertyName}` — `resolveTemplate`
 * recomposes the SAME format from the resolved parts; the single-space
 * separator is an invariant between the two.
 */
function andPerItem(rootName: string, cycleTarget: number, items: HabitTemplateItem[]): HabitTemplateCriterion[] {
  const conditions = items.map((i) => ({
    name: `${i.name} done`,
    isRoot: false,
    criterionType: 'condition' as const,
    propertyName: 'done',
    scopeItemNames: [i.name],
    threshold: 1,
  }));
  return [
    ...conditions,
    {
      name: rootName,
      isRoot: true,
      criterionType: 'composite',
      operator: 'and',
      operandNames: conditions.map((l) => l.name),
      successType: 'daily',
      cycleTarget,
    },
  ];
}

/** Single-condition cumulative root (numeric total / list count / boolean item-count). */
function cumulativeCondition(propertyName: string, threshold: number): HabitTemplateCriterion[] {
  return [
    {
      name: 'Goal',
      isRoot: true,
      criterionType: 'condition',
      propertyName,
      threshold,
      successType: 'cumulative',
    },
  ];
}

/** Single-condition daily root (one boolean item counted per day). */
function dailyCondition(propertyName: string, cycleTarget: number): HabitTemplateCriterion[] {
  return [
    {
      name: 'Goal',
      isRoot: true,
      criterionType: 'condition',
      propertyName,
      threshold: 1,
      successType: 'daily',
      cycleTarget,
    },
  ];
}

const MORNING_EXERCISE_ITEMS: HabitTemplateItem[] = [
  boolItem('morning_exercise', 'Pushups', 'pushups'),
  boolItem('morning_exercise', 'Squats', 'squats'),
  boolItem('morning_exercise', 'Stretching', 'stretching'),
  boolItem('morning_exercise', 'Plank', 'plank'),
];

const SLEEP_ITEMS: HabitTemplateItem[] = [
  boolItem('sleep', 'Bedtime before 11pm', 'bedtime_before_11pm'),
  boolItem('sleep', '7h+ sleep', 'sleep_7h'),
];

const JOURNALING_ITEMS: HabitTemplateItem[] = [
  boolItem('journaling', 'Morning pages', 'morning_pages'),
  boolItem('journaling', 'Gratitude entry', 'gratitude_entry'),
];

const STRENGTH_ITEMS: HabitTemplateItem[] = [
  boolItem('strength', 'Bench press', 'bench_press'),
  boolItem('strength', 'Deadlift', 'deadlift'),
  boolItem('strength', 'Squat', 'squat'),
  boolItem('strength', 'Pull-ups', 'pull_ups'),
];

/** The three finish-a-book templates share one `book` chapter namespace. */
const chapterItem = (n: number, properties: HabitTemplateProperty[]): HabitTemplateItem => ({
  name: `Chapter ${n + 1}`,
  nameKey: itemKey('book', `chapter_${n + 1}`),
  properties,
});

export const HABIT_TEMPLATES: HabitTemplate[] = [
  {
    key: 'morning_exercise',
    icon: 'fitness_center',
    cycle: 'weekly',
    items: MORNING_EXERCISE_ITEMS,
    criteria: andPerItem('Goal', 5, MORNING_EXERCISE_ITEMS),
    defaultTarget: 5,
  },
  {
    key: 'running',
    icon: 'directions_run',
    cycle: 'weekly',
    items: [
      {
        name: 'Morning run',
        nameKey: itemKey('running', 'morning_run'),
        properties: [{ name: 'distance', nameKey: propKey('distance'), propertyType: 'numeric' }],
      },
    ],
    criteria: cumulativeCondition('distance', 30),
    defaultTarget: 30,
  },
  {
    key: 'reading',
    icon: 'menu_book',
    cycle: 'daily',
    items: [
      {
        name: 'Books',
        nameKey: itemKey('reading', 'books'),
        properties: [{ name: 'pages', nameKey: propKey('pages'), propertyType: 'numeric' }],
      },
    ],
    criteria: cumulativeCondition('pages', 20),
    defaultTarget: 20,
  },
  {
    key: 'meditation',
    icon: 'self_improvement',
    cycle: 'weekly',
    items: [boolItem('meditation', 'Morning session', 'morning_session')],
    criteria: dailyCondition('done', 5),
    defaultTarget: 5,
  },
  {
    key: 'water',
    icon: 'local_drink',
    cycle: 'daily',
    items: [
      {
        name: 'Water intake',
        nameKey: itemKey('water', 'water_intake'),
        properties: [{ name: 'glasses', nameKey: propKey('glasses'), propertyType: 'numeric' }],
      },
    ],
    criteria: cumulativeCondition('glasses', 8),
    defaultTarget: 8,
  },
  {
    key: 'sleep',
    icon: 'bedtime',
    cycle: 'weekly',
    items: SLEEP_ITEMS,
    criteria: andPerItem('Goal', 5, SLEEP_ITEMS),
    defaultTarget: 5,
  },
  {
    key: 'vocabulary',
    icon: 'translate',
    cycle: 'daily',
    items: [
      {
        name: 'New words',
        nameKey: itemKey('vocabulary', 'new_words'),
        properties: [
          { name: 'word', nameKey: propKey('word'), propertyType: 'list', itemUniqueness: 'per_day' },
        ],
      },
    ],
    criteria: cumulativeCondition('word', 10),
    defaultTarget: 10,
  },
  {
    key: 'journaling',
    icon: 'edit_note',
    cycle: 'weekly',
    items: JOURNALING_ITEMS,
    criteria: andPerItem('Goal', 5, JOURNALING_ITEMS),
    defaultTarget: 5,
  },
  {
    key: 'strength',
    icon: 'sports_gymnastics',
    cycle: 'weekly',
    items: STRENGTH_ITEMS,
    criteria: andPerItem('Goal', 3, STRENGTH_ITEMS),
    defaultTarget: 3,
  },
  {
    key: 'book_chapters',
    icon: 'book',
    // Finishing ONE book is a whole-period goal — the chapters do not recur
    // weekly, so the marks may land in different weeks; `whole` gives the
    // finished book a passing verdict (API HabitCycle.Whole).
    cycle: 'whole',
    items: [1, 2, 3].map((n) =>
      chapterItem(n - 1, [
        { name: 'completed', nameKey: propKey('completed'), propertyType: 'boolean' },
        // hours is tracking-only — not referenced by the root criterion (RC-7).
        { name: 'hours', nameKey: propKey('hours'), propertyType: 'numeric' },
      ]),
    ),
    // Boolean condition = integer item-count threshold: 3 of the chapters completed.
    criteria: cumulativeCondition('completed', 3),
    defaultTarget: 3,
  },
  {
    key: 'book_pages',
    icon: 'collections_bookmark',
    cycle: 'whole',
    items: [1, 2, 3].map((n) =>
      chapterItem(n - 1, [{ name: 'pages', nameKey: propKey('pages'), propertyType: 'numeric' }]),
    ),
    criteria: cumulativeCondition('pages', 60),
    defaultTarget: 60,
  },
  {
    key: 'book_exercises',
    icon: 'build',
    cycle: 'whole',
    items: [1, 2, 3].map((n) =>
      chapterItem(n - 1, [
        { name: 'exercise', nameKey: propKey('exercise'), propertyType: 'list', itemUniqueness: 'per_day' },
      ]),
    ),
    // union_distinct is per-item distinct, SUMMED across chapters (spec RC-9):
    // "Ex 1" under Chapter 1 and Chapter 2 are two distinct contributions.
    criteria: cumulativeCondition('exercise', 9),
    defaultTarget: 9,
  },
];

/** The template's root criterion (exactly one). */
export function templateRoot(t: HabitTemplate): HabitTemplateCriterion {
  const root = t.criteria.find((c) => c.isRoot);
  if (!root) {
    throw new Error(`template ${t.key} has no root criterion`);
  }
  return root;
}

/**
 * Produce a copy of `t` with every user-visible NAME resolved through `tr`
 * (Transloco in the wizard). Key-echo fallback: when `tr(key)` returns the key
 * unchanged (missing translation — or the specs' key-echoing stub), the English
 * constant is kept. Items, properties AND the criteria referencing them
 * (`propertyName`, `scopeItemNames`, `operandNames`, and the `${item} ${prop}`
 * condition names emitted by `andPerItem`) all go through ONE shared
 * raw→resolved map, so the wizard's name-based criterion wiring
 * (`seedTemplateCriteria`) sees self-consistent strings in any language —
 * mixing locales is the `unknownOperandName` bug class.
 */
export function resolveTemplate(t: HabitTemplate, tr: (key: string) => string): HabitTemplate {
  const pick = (key: string, fallback: string): string => {
    const value = tr(key);
    return value === key ? fallback : value;
  };

  const itemName = new Map<string, string>();
  for (const item of t.items) {
    if (!itemName.has(item.name)) {
      itemName.set(item.name, pick(item.nameKey, item.name));
    }
  }
  const propName = new Map<string, string>();
  for (const item of t.items) {
    for (const p of item.properties) {
      if (!propName.has(p.name)) {
        propName.set(p.name, pick(p.nameKey, p.name));
      }
    }
  }

  // Pass 1: resolved name for every criterion, so composite operands wire
  // through the same map. The AND leaves (the only conditions scoping exactly
  // one item) recompose `${item} ${prop}` from the resolved parts; under
  // key-echo the output is byte-identical to `tc.name`.
  const critName = new Map<string, string>();
  for (const tc of t.criteria) {
    if (tc.criterionType === 'condition' && tc.scopeItemNames?.length === 1 && tc.propertyName) {
      const item = itemName.get(tc.scopeItemNames[0]) ?? tc.scopeItemNames[0];
      const prop = propName.get(tc.propertyName) ?? tc.propertyName;
      critName.set(tc.name, `${item} ${prop}`);
    } else {
      critName.set(tc.name, tc.name); // 'Goal' roots keep their name.
    }
  }

  // Pass 2: full copy with every name reference resolved consistently.
  return {
    ...t,
    items: t.items.map((item) => ({
      ...item,
      name: itemName.get(item.name) ?? item.name,
      properties: item.properties.map((p) => ({ ...p, name: propName.get(p.name) ?? p.name })),
    })),
    criteria: t.criteria.map((tc) => ({
      ...tc,
      name: critName.get(tc.name) ?? tc.name,
      propertyName: tc.propertyName ? propName.get(tc.propertyName) ?? tc.propertyName : tc.propertyName,
      scopeItemNames: tc.scopeItemNames?.map((s) => itemName.get(s) ?? s),
      operandNames: tc.operandNames?.map((o) => critName.get(o) ?? o),
    })),
  };
}
