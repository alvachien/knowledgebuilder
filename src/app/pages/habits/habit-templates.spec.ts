import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { HABIT_TEMPLATES, resolveTemplate, templateRoot, type HabitTemplate } from './habit-templates';
import type { HabitCycle } from './habit.models';

function byKey(key: string): HabitTemplate {
  const t = HABIT_TEMPLATES.find((x) => x.key === key);
  if (!t) {
    throw new Error(`template ${key} missing`);
  }
  return t;
}

describe('HABIT_TEMPLATES', () => {
  it('covers the 12 templates of FR-5.4 with unique keys and icons', () => {
    expect(HABIT_TEMPLATES.length).toBe(12);
    expect(new Set(HABIT_TEMPLATES.map((t) => t.key)).size).toBe(12);
    for (const t of HABIT_TEMPLATES) {
      expect(t.icon, t.key).toMatch(/^[a-z_]+$/);
      expect(t.items.length, t.key).toBeGreaterThan(0);
    }
  });

  it('uses only valid cycles', () => {
    const valid: HabitCycle[] = ['daily', 'weekly', 'monthly', 'whole'];
    for (const t of HABIT_TEMPLATES) {
      expect(valid).toContain(t.cycle);
    }
  });

  it('runs the finish-a-book templates on the whole-period cycle', () => {
    // Chapters/pages/exercises of ONE book are not a weekly recurring goal;
    // `whole` lets marks accumulate across the habit's span (RC-7/8/9).
    for (const key of ['book_chapters', 'book_pages', 'book_exercises']) {
      expect(byKey(key).cycle, key).toBe('whole');
    }
    // The recurring templates keep their resetting cycles.
    expect(byKey('running').cycle).toBe('weekly');
    expect(byKey('water').cycle).toBe('daily');
  });

  it('every template has exactly one root, unique names and resolvable operands', () => {
    for (const t of HABIT_TEMPLATES) {
      const roots = t.criteria.filter((c) => c.isRoot);
      expect(roots.length, t.key).toBe(1);
      expect(templateRoot(t).name, t.key).toBeTruthy();
      const names = new Set(t.criteria.map((c) => c.name));
      expect(names.size, t.key).toBe(t.criteria.length);
      for (const c of t.criteria) {
        if (c.criterionType === 'composite') {
          expect(c.operandNames?.length ?? 0, t.key).toBeGreaterThanOrEqual(2);
          for (const o of c.operandNames ?? []) {
            expect(names.has(o), `${t.key}: operand ${o}`).toBe(true);
          }
        }
        if (c.scopeItemNames) {
          for (const s of c.scopeItemNames) {
            expect(t.items.some((i) => i.name === s), `${t.key}: scope item ${s}`).toBe(true);
          }
        }
      }
    }
  });

  it('roots carry a success mode; daily targets respect the cycle ceiling', () => {
    for (const t of HABIT_TEMPLATES) {
      const root = templateRoot(t);
      // Shared with the wizard's validation; whole has no fixed ceiling.
      const maxDays = t.cycle === 'whole' ? Number.POSITIVE_INFINITY : t.cycle === 'weekly' ? 7 : t.cycle === 'monthly' ? 31 : 1;
      expect(root.successType, t.key).toBeTruthy();
      if (root.successType === 'daily') {
        expect(root.cycleTarget, t.key).toBeGreaterThan(0);
        expect(root.cycleTarget, t.key).toBeLessThanOrEqual(maxDays);
        if (t.cycle === 'daily') {
          expect(root.cycleTarget, t.key).toBe(1);
        }
      } else {
        // Cumulative roots carry NO cycle target (derived — spec).
        expect(root.cycleTarget, t.key).toBeUndefined();
        expect(root.threshold, t.key).toBeGreaterThan(0);
      }
    }
  });

  it('boolean day-count templates are AND groups over per-item done >= 1 conditions (FR-5.4)', () => {
    for (const key of ['morning_exercise', 'sleep', 'journaling', 'strength']) {
      const t = byKey(key);
      const root = templateRoot(t);
      expect(root.criterionType, key).toBe('composite');
      expect(root.operator, key).toBe('and');
      expect(root.successType, key).toBe('daily');
      expect(root.operandNames?.length, key).toBe(t.items.length);
      for (const conditionName of root.operandNames ?? []) {
        const condition = t.criteria.find((c) => c.name === conditionName)!;
        expect(condition.criterionType, `${key}.${conditionName}`).toBe('condition');
        expect(condition.propertyName, `${key}.${conditionName}`).toBe('done');
        expect(condition.threshold, `${key}.${conditionName}`).toBe(1);
        expect(condition.scopeItemNames?.length, `${key}.${conditionName}`).toBe(1);
        // Every item has its own dedicated condition.
        expect(t.items.some((i) => i.name === condition.scopeItemNames![0]), `${key}.${conditionName}`).toBe(true);
      }
      // The template's cycleTarget equals its FR-5.4 default.
      expect(root.cycleTarget, key).toBe(t.defaultTarget);
    }
    expect(byKey('strength').criteria.find((c) => c.isRoot)!.cycleTarget).toBe(3);
  });

  it('meditation is a single boolean condition root counting 5 weekly days (FR-5.4 default)', () => {
    const t = byKey('meditation');
    const root = templateRoot(t);
    expect(t.cycle).toBe('weekly');
    expect(root.criterionType).toBe('condition');
    expect(root.successType).toBe('daily');
    expect(root.threshold).toBe(1); // integer item count: 1 item must be true
    expect(root.cycleTarget).toBe(5);
  });

  it('cumulative templates are single condition roots without cycle targets', () => {
    const cumulative: Record<string, [string, number]> = {
      running: ['distance', 30],
      reading: ['pages', 20],
      water: ['glasses', 8],
      vocabulary: ['word', 10],
      book_chapters: ['completed', 3],
      book_pages: ['pages', 60],
      book_exercises: ['exercise', 9],
    };
    for (const [key, [prop, threshold]] of Object.entries(cumulative)) {
      const t = byKey(key);
      expect(t.criteria.length, key).toBe(1);
      const root = templateRoot(t);
      expect(root.successType, key).toBe('cumulative');
      expect(root.criterionType, key).toBe('condition');
      expect(root.propertyName, key).toBe(prop);
      expect(root.threshold, key).toBe(threshold);
      expect(root.cycleTarget, key).toBeUndefined();
      expect(t.defaultTarget, key).toBe(threshold);
    }
  });

  it('every item and property carries a well-formed nameKey (item names unique per template)', () => {
    for (const t of HABIT_TEMPLATES) {
      // The resolver maps raw name → resolved name; duplicates would be ambiguous.
      expect(new Set(t.items.map((i) => i.name)).size, t.key).toBe(t.items.length);
      for (const i of t.items) {
        expect(i.nameKey, `${t.key}.${i.name}`).toMatch(/^habits\.templateItems\.[a-z0-9_]+\.[a-z0-9_]+$/);
        expect(i.properties.length, `${t.key}.${i.name}`).toBeGreaterThan(0);
        for (const p of i.properties) {
          expect(p.nameKey, `${t.key}.${i.name}.${p.name}`).toMatch(/^habits\.templateProps\.[a-z0-9_]+$/);
        }
      }
    }
  });
});

describe('resolveTemplate', () => {
  it('key-echo (missing translation / spec stub) keeps every name identical to the raw template', () => {
    // Master regression guard: the English output — including the recomposed
    // `${item} ${prop}` AND-leaf names — is byte-identical to `andPerItem`'s,
    // so every existing wizard/journey payload assertion keeps passing.
    for (const t of HABIT_TEMPLATES) {
      expect(resolveTemplate(t, (k) => k), t.key).toEqual(t);
    }
  });

  it('swaps item/property names and recomposes AND references consistently', () => {
    const zh: Record<string, string> = {
      'habits.templateItems.morning_exercise.pushups': '俯卧撑',
      'habits.templateProps.done': '完成',
    };
    const rt = resolveTemplate(byKey('morning_exercise'), (k) => zh[k] ?? k);

    expect(rt.items.map((i) => i.name)).toEqual(['俯卧撑', 'Squats', 'Stretching', 'Plank']);
    expect(rt.items[0].properties[0].name).toBe('完成');
    expect(rt.items[1].properties[0].name).toBe('完成');

    // AND leaf: name, propertyName and scope all speak the resolved language.
    const leaf = rt.criteria.find((c) => c.name === '俯卧撑 完成');
    expect(leaf).toBeTruthy();
    expect(leaf!.propertyName).toBe('完成');
    expect(leaf!.scopeItemNames).toEqual(['俯卧撑']);
    expect(rt.criteria.find((c) => c.name === 'Squats 完成')!.propertyName).toBe('完成');
    expect(rt.criteria.find((c) => c.name === 'Squats 完成')!.scopeItemNames).toEqual(['Squats']);

    const root = templateRoot(rt);
    expect(root.name).toBe('Goal');
    expect(root.operandNames).toEqual(['俯卧撑 完成', 'Squats 完成', 'Stretching 完成', 'Plank 完成']);
  });

  it('resolves the single-condition root property name (cumulative + daily)', () => {
    const zh: Record<string, string> = {
      'habits.templateItems.running.morning_run': '晨跑',
      'habits.templateProps.distance': '里程',
      'habits.templateProps.done': '完成',
    };
    const running = resolveTemplate(byKey('running'), (k) => zh[k] ?? k);
    expect(running.items[0].name).toBe('晨跑');
    expect(running.items[0].properties[0].name).toBe('里程');
    expect(templateRoot(running).propertyName).toBe('里程');
    expect(templateRoot(running).name).toBe('Goal');

    const meditation = resolveTemplate(byKey('meditation'), (k) => zh[k] ?? k);
    // morning_session is NOT in the fake map → the item falls back to English,
    // while the shared `done` property still resolves.
    expect(meditation.items[0].name).toBe('Morning session');
    expect(meditation.items[0].properties[0].name).toBe('完成');
    expect(templateRoot(meditation).propertyName).toBe('完成');
    expect(templateRoot(meditation).name).toBe('Goal');
  });
});

describe('template i18n coverage', () => {
  // ng test runs from the workspace root; walk up defensively in case of a
  // nested cwd. (resolveJsonModule is off, hence the fs read.)
  function localePath(file: string): string {
    let dir = process.cwd();
    for (;;) {
      const p = join(dir, 'src', 'assets', 'data', 'i18n', file);
      if (existsSync(p)) {
        return p;
      }
      const parent = dirname(dir);
      if (parent === dir) {
        throw new Error(`i18n file ${file} not found from ${process.cwd()}`);
      }
      dir = parent;
    }
  }

  function loadLocale(file: string): Record<string, unknown> {
    return JSON.parse(readFileSync(localePath(file), 'utf8')) as Record<string, unknown>;
  }

  function lookup(root: Record<string, unknown>, dotted: string): string | undefined {
    let cur: unknown = root;
    for (const seg of dotted.split('.')) {
      if (typeof cur !== 'object' || cur === null) {
        return undefined;
      }
      cur = (cur as Record<string, unknown>)[seg];
    }
    return typeof cur === 'string' && cur.length > 0 ? cur : undefined;
  }

  it('every template nameKey exists in en + zh-CN, and the en value equals the code constant', () => {
    const en = loadLocale('en.json');
    const zh = loadLocale('zh-CN.json');
    for (const t of HABIT_TEMPLATES) {
      expect(lookup(en, `habits.templates.${t.key}`), t.key).toBeTruthy();
      expect(lookup(zh, `habits.templates.${t.key}`), t.key).toBeTruthy();
      for (const i of t.items) {
        expect(lookup(en, i.nameKey), i.nameKey).toBe(i.name); // drift guard
        expect(lookup(zh, i.nameKey), i.nameKey).toBeTruthy();
      }
      for (const p of t.items.flatMap((x) => x.properties)) {
        expect(lookup(en, p.nameKey), p.nameKey).toBe(p.name);
        expect(lookup(zh, p.nameKey), p.nameKey).toBeTruthy();
      }
    }
  });

  it('zh-CN resolves every template end-to-end (no name stays English under the real dictionary)', () => {
    const zh = loadLocale('zh-CN.json');
    for (const t of HABIT_TEMPLATES) {
      const rt = resolveTemplate(t, (k) => lookup(zh, k) ?? k);
      for (let n = 0; n < t.items.length; n++) {
        expect(rt.items[n].name, `${t.key} item ${n}`).not.toBe(t.items[n].name);
        for (let m = 0; m < t.items[n].properties.length; m++) {
          expect(rt.items[n].properties[m].name, `${t.key} prop ${n}.${m}`).not.toBe(t.items[n].properties[m].name);
        }
      }
      // References follow the resolved values, so wiring stays self-consistent.
      for (const tc of rt.criteria) {
        if (tc.scopeItemNames) {
          for (const s of tc.scopeItemNames) {
            expect(rt.items.some((i) => i.name === s), `${t.key}: scope ${s}`).toBe(true);
          }
        }
        if (tc.propertyName) {
          expect(rt.items.some((i) => i.properties.some((p) => p.name === tc.propertyName)), `${t.key}: prop ${tc.propertyName}`).toBe(true);
        }
        if (tc.operandNames) {
          const names = new Set(rt.criteria.map((c) => c.name));
          for (const o of tc.operandNames) {
            expect(names.has(o), `${t.key}: operand ${o}`).toBe(true);
          }
        }
      }
    }
  });
});
