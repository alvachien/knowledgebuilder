import { TestBed } from '@angular/core/testing';
import { DateAdapter } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSelect } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import {
  TranslocoService,
  TRANSLOCO_MISSING_HANDLER,
  TRANSLOCO_TRANSPILER,
} from '@jsverse/transloco';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { AppPageTitle } from '../page-title/page-title';

import { HABIT_TEMPLATES, templateRoot } from './habit-templates';
import { HabitWizardComponent } from './habit-wizard.component';
import type { CriterionOut, Habit, HabitCreate, HabitItem } from './habit.models';
import { HabitApiError } from './habit.models';
import { HabitService } from './habit.service';

/**
 * Component-level wizard tests with the HTTP service stubbed: the edit-save
 * choreography (review C1 inline item properties, H1a root-first ordering,
 * H2 idempotent retry) and the L14 dirty-state confirm guard.
 */

const serverHabit: Habit = {
  id: 7,
  name: 'Morning run',
  description: null,
  cycle: 'weekly',
  startDate: '2026-09-01',
  endDate: null,
  state: 'active',
  hasPunches: false,
  createdAt: '2026-09-01T08:00:00Z',
  progress: {
    cycleFrom: '2026-09-21',
    cycleTo: '2026-09-27',
    rootCriterion: {
      criterionId: 10,
      name: 'Goal',
      isRoot: true,
      criterionType: 'condition',
      passed: false,
      propertyName: 'distance',
      aggregationMode: null,
      currentValue: 5,
      threshold: 30,
      // Daily-mode root: counts successful days (5×30 km this week).
      successType: 'daily',
      cycleTarget: 5,
      currentDayValue: null,
      successfulDays: null,
      operator: null,
      operandIds: null,
    },
    criteria: [],
  },
};

const serverItems: HabitItem[] = [
  {
    id: 1,
    habitId: 7,
    name: 'Run',
    order: 0,
    createdAt: '',
    hasPunches: false,
    properties: [
      {
        id: 11,
        itemId: 1,
        name: 'distance',
        propertyType: 'numeric',
        baseRate: null,
        itemUniqueness: null,
        order: 0,
        createdAt: '',
        currentCycleValue: 0,
        todayValue: null,
      },
    ],
  },
  {
    id: 2,
    habitId: 7,
    name: 'Gym',
    order: 1,
    createdAt: '',
    hasPunches: false,
    properties: [
      {
        id: 21,
        itemId: 2,
        name: 'done',
        propertyType: 'boolean',
        baseRate: null,
        itemUniqueness: null,
        order: 0,
        createdAt: '',
        currentCycleValue: 0,
        todayValue: null,
      },
    ],
  },
];

const serverCriteria: CriterionOut[] = [
  {
    id: 10,
    habitId: 7,
    name: 'Goal',
    isRoot: true,
    criterionType: 'condition',
    propertyName: 'distance',
    aggregationMode: null,
    itemScope: 'all',
    scopeItemIds: null,
    threshold: 30,
    operator: null,
    operandCriterionIds: null,
    successType: 'daily',
    cycleTarget: 5,
    createdAt: '',
  },
  {
    id: 11,
    habitId: 7,
    name: 'Backup',
    isRoot: false,
    criterionType: 'condition',
    propertyName: 'done',
    aggregationMode: null,
    itemScope: 'all',
    scopeItemIds: null,
    threshold: 1,
    operator: null,
    operandCriterionIds: null,
    successType: null,
    cycleTarget: null,
    createdAt: '',
  },
];

interface ServiceStub {
  getHabit: ReturnType<typeof vi.fn>;
  getItems: ReturnType<typeof vi.fn>;
  getCriteria: ReturnType<typeof vi.fn>;
  updateHabit: ReturnType<typeof vi.fn>;
  createHabit: ReturnType<typeof vi.fn>;
  addItem: ReturnType<typeof vi.fn>;
  updateItem: ReturnType<typeof vi.fn>;
  deleteItem: ReturnType<typeof vi.fn>;
  addProperty: ReturnType<typeof vi.fn>;
  updateProperty: ReturnType<typeof vi.fn>;
  deleteProperty: ReturnType<typeof vi.fn>;
  addCriterion: ReturnType<typeof vi.fn>;
  updateCriterion: ReturnType<typeof vi.fn>;
  deleteCriterion: ReturnType<typeof vi.fn>;
}

function makeServiceStub(): ServiceStub {
  let itemSeq = 100;
  let propSeq = 900;
  let critSeq = 500;
  return {
    getHabit: vi.fn(() => of(serverHabit)),
    getItems: vi.fn(() => of(serverItems)),
    getCriteria: vi.fn(() => of(serverCriteria)),
    updateHabit: vi.fn(() => of(serverHabit)),
    createHabit: vi.fn(() => of(serverHabit)),
    addItem: vi.fn((habitId: number, body: { name: string; order: number; properties: { name: string; propertyType: string }[] }) => {
      const id = itemSeq++;
      return of({
        id,
        habitId,
        name: body.name,
        order: body.order,
        createdAt: '',
        hasPunches: false,
        properties: body.properties.map((p, j) => ({
          id: propSeq++,
          itemId: id,
          name: p.name,
          propertyType: p.propertyType,
          baseRate: null,
          itemUniqueness: null,
          order: j,
          createdAt: '',
          currentCycleValue: 0,
          todayValue: null,
        })),
      });
    }),
    updateItem: vi.fn(() => of(undefined)),
    deleteItem: vi.fn(() => of(undefined)),
    addProperty: vi.fn(() => of({ id: propSeq++ })),
    updateProperty: vi.fn(() => of(undefined)),
    deleteProperty: vi.fn(() => of(undefined)),
    addCriterion: vi.fn(() => of({ id: critSeq++ })),
    updateCriterion: vi.fn(() => of(undefined)),
    deleteCriterion: vi.fn(() => of(undefined)),
  };
}

/** All stubbed observables are cold/synchronous, so one macrotask drains the
 * whole save chain (`firstValueFrom` awaits are microtasks). */
const flush = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

async function createWizard(opts: {
  id?: string | null;
  dialogResult?: boolean;
  stub?: ServiceStub;
  /** Overrides the key-echoing translate (seed-time template i18n tests). */
  translate?: (key: string) => string;
} = {}) {
  const stub = opts.stub ?? makeServiceStub();
  const dialogStub = {
    open: vi.fn(() => ({ afterClosed: () => of(opts.dialogResult ?? false) })),
  };
  const routerStub = { navigate: vi.fn(async () => true) };
  const snackbarStub = { open: vi.fn() };
  await TestBed.configureTestingModule({
    providers: [
      { provide: HabitService, useValue: stub },
      {
        provide: ActivatedRoute,
        useValue: { snapshot: { paramMap: { get: (k: string) => (k === 'id' ? opts.id ?? null : null) } } },
      },
      { provide: Router, useValue: routerStub },
      { provide: MatSnackBar, useValue: snackbarStub },
      { provide: MatDialog, useValue: dialogStub },
      {
        // Render-capable stub (same shape as habit-punch-edit-dialog spec):
        // the *transloco directive calls _loadDependencies/selectTranslate,
        // which the plain component-level stub lacked.
        provide: TranslocoService,
        useValue: {
          translate: vi.fn(opts.translate ?? ((key: string) => key)),
          setActiveLang: vi.fn(),
          getActiveLang: vi.fn(),
          selectTranslate: vi.fn().mockReturnValue(of('')),
          _loadDependencies: vi.fn().mockReturnValue(of(null)),
          langChanges$: of('en'),
          events$: of(),
          activeLang: 'en',
          config: { reRenderOnLangChange: true, prodMode: false },
        } as unknown as TranslocoService,
      },
      { provide: TRANSLOCO_TRANSPILER, useValue: {} },
      { provide: TRANSLOCO_MISSING_HANDLER, useValue: {} },
      { provide: AppPageTitle, useValue: { title: '' } },
    ],
  });
  await TestBed.compileComponents();
  const fixture = TestBed.createComponent(HabitWizardComponent);
  await flush(); // settle the constructor's loadForEdit (edit mode)
  return { fixture, comp: fixture.componentInstance, stub, dialogStub, routerStub, snackbarStub };
}

describe('HabitWizardComponent — edit save choreography', () => {
  it('C1: creates a new item with its properties inline and sends no per-property POSTs', async () => {
    const { comp, stub } = await createWizard({ id: '7' });

    comp.addItem();
    const created = comp.items[comp.items.length - 1];
    created.name = 'Swim';
    comp.addProperty(created);
    created.properties[0].name = 'laps';
    created.properties[0].propertyType = 'numeric';
    comp.addProperty(created);
    created.properties[1].name = 'done';
    created.properties[1].propertyType = 'boolean';

    comp.save();
    await flush();

    expect(stub.addItem).toHaveBeenCalledTimes(1);
    const [habitId, body] = stub.addItem.mock.calls[0];
    expect(habitId).toBe(7);
    expect(body.name).toBe('Swim');
    expect(body.properties).toHaveLength(2);
    // The old flow POSTed `properties: []` (API: itemWithoutProperties → 422).
    expect(JSON.stringify(body.properties)).not.toBe('[]');
    expect(stub.addProperty).not.toHaveBeenCalled();
    // Server ids echoed by the create response land back on the drafts.
    expect(created.properties[0].id).toBeTypeOf('number');
    expect(created.properties[1].id).toBeTypeOf('number');
  });

  it('C1: property adds on EXISTING items still go through POST /Properties', async () => {
    const { comp, stub } = await createWizard({ id: '7' });

    const run = comp.items[0];
    comp.addProperty(run);
    run.properties[run.properties.length - 1].name = 'hours';

    comp.save();
    await flush();

    expect(stub.addItem).not.toHaveBeenCalled();
    expect(stub.addProperty).toHaveBeenCalledTimes(1);
    const [habitId, itemId, body] = stub.addProperty.mock.calls[0];
    expect(habitId).toBe(7);
    expect(itemId).toBe(1);
    expect(body.name).toBe('hours');
  });

  it('H1a: setRoot moves the root-only mode + target to the new root and clears the old', async () => {
    const { comp } = await createWizard({ id: '7' });
    const goal = comp.criteria.find((c) => c.name === 'Goal')!;
    const backup = comp.criteria.find((c) => c.name === 'Backup')!;

    comp.setRoot(backup);

    expect(backup.isRoot).toBe(true);
    expect(backup.successType).toBe('daily'); // mode travels with the root
    expect(backup.cycleTarget).toBe(5); // …and so does the daily target
    expect(goal.isRoot).toBe(false);
    expect(goal.successType).toBeNull();
    expect(goal.cycleTarget).toBeNull();
  });

  it('setRoot: promoting a composite root inherits the full daily designation (spec: composite daily roots are valid)', async () => {
    const { comp } = await createWizard({ id: '7' });
    const goal = comp.criteria.find((c) => c.name === 'Goal')!;
    const backup = comp.criteria.find((c) => c.name === 'Backup')!;
    backup.criterionType = 'composite';

    comp.setRoot(backup);

    expect(backup.successType).toBe('daily');
    expect(backup.cycleTarget).toBe(5);
    expect(goal.cycleTarget).toBeNull();
    expect(goal.successType).toBeNull();
  });

  it('H1a: the designated root is PUT first and demoted criteria omit target fields', async () => {
    const { comp, stub } = await createWizard({ id: '7' });
    const backup = comp.criteria.find((c) => c.name === 'Backup')!;
    comp.setRoot(backup);

    comp.save();
    await flush();

    expect(stub.updateCriterion).toHaveBeenCalledTimes(2);
    const updateCalls = stub.updateCriterion.mock.calls as unknown as [number, number, Record<string, unknown>][];
    const [[, firstId, firstBody], [, secondId, secondBody]] = updateCalls;
    // New root first (promotion demotes the old root atomically server-side).
    expect(firstId).toBe(11);
    expect(firstBody['isRoot']).toBe(true);
    expect(firstBody['successType']).toBe('daily');
    expect(firstBody['cycleTarget']).toBe(5);
    // The demoted old root: isRoot:false and NO target fields at all — the
    // server cleared them on promotion and the PUT must not fight that.
    expect(secondId).toBe(10);
    expect(secondBody['isRoot']).toBe(false);
    expect('successType' in secondBody).toBe(false);
    expect('cycleTarget' in secondBody).toBe(false);
  });

  it('H1a: a newly added criterion designated as root is POSTed BEFORE the demoting PUTs', async () => {
    const { comp, stub } = await createWizard({ id: '7' });
    comp.addCriterion('condition');
    const fresh = comp.criteria[comp.criteria.length - 1];
    fresh.name = 'Fresh';
    fresh.propertyName = 'distance';
    comp.setRoot(fresh); // demotes 'Goal' (id 10) — only legal after Fresh exists server-side

    comp.save();
    await flush();

    expect(stub.addCriterion).toHaveBeenCalledTimes(1);
    const [addHabitId, addBody] = stub.addCriterion.mock.calls[0] as unknown as [number, Record<string, unknown>];
    expect(addHabitId).toBe(7);
    expect(addBody['isRoot']).toBe(true);
    expect(addBody['propertyName']).toBe('distance'); // conditions bind by NAME, no propertyId field
    expect(addBody['successType']).toBe('daily'); // designation carries the mode…
    expect(addBody['cycleTarget']).toBe(5); // …and the day target (moved by setRoot)
    // Goal must be demoted (PUT) only after the new root exists (POST).
    const addAt = Math.min(...stub.addCriterion.mock.invocationCallOrder);
    const updateAt = Math.min(...stub.updateCriterion.mock.invocationCallOrder);
    expect(addAt).toBeLessThan(updateAt);
    // Both server criteria get PUTs (Goal demoted without target fields; the
    // just-added root is NOT re-PUT — it already carries its full state).
    expect(stub.updateCriterion).toHaveBeenCalledTimes(2);
    const updateIds = (stub.updateCriterion.mock.calls as unknown as [number, number][]).map((c) => c[1]);
    expect(updateIds).toEqual([10, 11]);
    expect(updateIds).not.toContain(fresh.id);
  });

  it('cumulative designated root never PUTs a cycle target (derived — spec)', async () => {
    const { comp, stub } = await createWizard({ id: '7' });
    const backup = comp.criteria.find((c) => c.name === 'Backup')!;
    comp.setRoot(backup);
    comp.onSuccessTypeChange(backup, 'cumulative');

    comp.save();
    await flush();

    const rootPut = (stub.updateCriterion.mock.calls as unknown as [number, number, Record<string, unknown>][])
      .find(([, id]) => id === 11);
    expect(rootPut).toBeTruthy();
    expect(rootPut![2]['successType']).toBe('cumulative');
    expect(rootPut![2]['cycleTarget']).toBeNull();
  });

  it('U4: a composite listed BEFORE its new operand is POSTed after it and carries the operand id', async () => {
    const { comp, stub } = await createWizard({ id: '7' });

    // New condition A + new composite B referencing A — B FIRST in the draft
    // array (user insertion order). The old sequential loop created B first and
    // silently dropped A's missing id → 422 → the catch-reload ate the session.
    comp.addCriterion('condition');
    const a = comp.criteria[comp.criteria.length - 1];
    a.name = 'Fresh A';
    a.propertyName = 'distance';
    comp.addCriterion('composite');
    const b = comp.criteria[comp.criteria.length - 1];
    b.name = 'Both';
    b.operator = 'or';
    b.operandKeys = [a.key];
    comp.criteria.splice(comp.criteria.indexOf(a), 1);
    comp.criteria.splice(comp.criteria.indexOf(b) + 1, 0, a);
    expect(comp.criteria.indexOf(b)).toBeLessThan(comp.criteria.indexOf(a));

    comp.save();
    await flush();

    // Topological create sequence: A first, then B — with A's server id wired.
    expect(stub.addCriterion).toHaveBeenCalledTimes(2);
    const bodies = (stub.addCriterion.mock.calls as unknown as [number, Record<string, unknown>][]).map((c) => c[1]);
    expect(bodies[0]['name']).toBe('Fresh A');
    expect(bodies[1]['name']).toBe('Both');
    expect(bodies[1]['operandCriterionIds']).toEqual([a.id]);
    expect(a.id).toBe(500);
    expect(b.id).toBe(501);
    // Session completed normally (navigate to the habit, no error snackbar).
    expect(stub.updateHabit).toHaveBeenCalledTimes(1);
  });

  it('U4: an existing composite PUT gains a new operand\'s freshly created id', async () => {
    const { comp, stub } = await createWizard({ id: '7' });
    // Edit flow: add condition A, then make the EXISTING 'Backup' criterion an
    // AND over the old root + A. New drafts are created before the PUT sequence,
    // so the PUT carries A's server id (the old order dropped it silently).
    comp.addCriterion('condition');
    const a = comp.criteria[comp.criteria.length - 1];
    a.name = 'Fresh A';
    a.propertyName = 'distance';
    const goal = comp.criteria.find((c) => c.name === 'Goal')!;
    const backup = comp.criteria.find((c) => c.name === 'Backup')!;
    backup.criterionType = 'composite';
    backup.operator = 'and';
    backup.operandKeys = [goal.key, a.key];

    comp.save();
    await flush();

    expect(stub.addCriterion).toHaveBeenCalledTimes(1); // A POSTed first…
    expect(a.id).toBe(500);
    const put = (stub.updateCriterion.mock.calls as unknown as [number, number, Record<string, unknown>][])
      .find(([, id]) => id === 11);
    expect(put).toBeTruthy();
    expect(put![2]['operandCriterionIds']).toEqual([10, 500]); // …so the PUT can reference it
  });

  it('U4: an unresolvable operand aborts the save locally — no doomed POST, no destructive reload', async () => {
    const { comp, stub, snackbarStub, routerStub } = await createWizard({ id: '7' });
    comp.addCriterion('composite');
    const b = comp.criteria[comp.criteria.length - 1];
    b.name = 'Broken';
    b.operator = 'and';
    // Dangling key (unreachable via the gated UI; forces the guard path).
    b.operandKeys = [9999];

    comp.save();
    await flush();

    // The doomed payload never reaches the server…
    const added = stub.addCriterion.mock.calls as unknown as [number, Record<string, unknown>][];
    expect(added.filter(([, body]) => body['name'] === 'Broken')).toHaveLength(0);
    // …an explicit localized error surfaces instead…
    expect(snackbarStub.open).toHaveBeenCalledWith(
      'habits.wizard.err.pendingOperand',
      undefined,
      expect.objectContaining({ panelClass: ['habit-error-snackbar'] })
    );
    // …and the editing session SURVIVES: no loadForEdit re-read (constructor's
    // one getCriteria call) and no navigation.
    expect(stub.getCriteria).toHaveBeenCalledTimes(1);
    expect(routerStub.navigate).not.toHaveBeenCalled();
    expect(comp.criteria.some((c) => c.name === 'Broken')).toBe(true);
  });

  it('H2: a retry after a failed save does not re-DELETE already-deleted rows', async () => {
    const { comp, stub } = await createWizard({ id: '7' });
    // deleteItem succeeds, the new criterion errors → save fails, state reloads.
    stub.addCriterion = vi.fn(() => throwError(() => new HabitApiError('invalidName', 'nope', 422)));

    comp.removeItem(comp.items[1]); // 'Gym', id 2
    expect(comp.deletedItemIds).toEqual([2]);
    comp.addCriterion('condition');
    const extra = comp.criteria[comp.criteria.length - 1];
    extra.name = 'Extra';
    extra.propertyName = 'distance';

    comp.save();
    await flush();

    expect(stub.deleteItem).toHaveBeenCalledTimes(1);
    expect(stub.deleteItem).toHaveBeenCalledWith(7, 2);
    // The error handler re-read the habit — pending deletions must be cleared
    // (before the fix they persisted and the retry wedged on 404s).
    expect(comp.deletedItemIds).toEqual([]);
    stub.addCriterion = vi.fn(() => of({ id: 501 }));

    comp.save();
    await flush();

    expect(stub.deleteItem).toHaveBeenCalledTimes(1); // still one — no repeat DELETE
  });
});

describe('HabitWizardComponent — create flow guards (L14)', () => {
  it('applies the first template without a confirm prompt', async () => {
    const { comp, dialogStub } = await createWizard({ id: null });

    comp.selectTemplate(HABIT_TEMPLATES[0]);

    expect(dialogStub.open).not.toHaveBeenCalled();
    expect(comp.templateKey()).toBe(HABIT_TEMPLATES[0].key);
    expect(comp.items.length).toBe(HABIT_TEMPLATES[0].items.length);
  });

  it('template seeding reproduces the FR-5.4 criterion tree (AND over per-item conditions, daily root)', async () => {
    const { comp } = await createWizard({ id: null });
    const morning = HABIT_TEMPLATES.find((t) => t.key === 'morning_exercise')!;

    comp.selectTemplate(morning);

    // 4 per-item conditions + 1 AND root.
    expect(comp.criteria.length).toBe(5);
    const root = comp.rootCriterion()!;
    expect(root.criterionType).toBe('composite');
    expect(root.operator).toBe('and');
    expect(root.successType).toBe('daily');
    expect(root.cycleTarget).toBe(5);
    expect(comp.targetCycle).toBe(5);
    expect(root.operandKeys.length).toBe(4);
    // Each condition: subset of exactly one item, bound to `done`, count threshold 1.
    const conditions = comp.criteria.filter((c) => c.criterionType === 'condition');
    for (const condition of conditions) {
      expect(condition.propertyName).toBe('done');
      expect(condition.itemScope).toBe('subset');
      expect(condition.scopeItemKeys.length).toBe(1);
      expect(condition.threshold).toBe(1);
      expect(root.operandKeys).toContain(condition.key);
    }
    // Each of the four items owns exactly one dedicated condition.
    const scopeKeys = conditions.flatMap((l) => l.scopeItemKeys);
    expect(new Set(scopeKeys).size).toBe(4);
    // Cumulative target fields stay unset on the daily root's override path.
    expect(comp.targetThreshold).toBeNull();
  });

  it('renaming a seeded template item keeps its dedicated condition (refs bind the entity)', async () => {
    const { comp } = await createWizard({ id: null });
    comp.selectTemplate(HABIT_TEMPLATES.find((t) => t.key === 'sleep')!);
    const firstCondition = comp.criteria.find((c) => c.criterionType === 'condition')!;
    const ownedItem = firstCondition.scopeItemKeys[0];
    comp.items.find((i) => i.key === ownedItem)!.name = '改过的名字';

    const payload = comp.buildCreatePayload();
    const root = payload.criteria.find((c) => c.isRoot)!;
    const condition = payload.criteria.find((c) => !c.isRoot)!;
    expect(condition.scopeItemNames).toEqual(['改过的名字']);
    expect(root.operandCriterionNames).toContain(condition.name);
  });

  it('removing a template item prunes its dedicated condition and keeps the AND-tree payload valid', async () => {
    const { comp } = await createWizard({ id: null });
    comp.selectTemplate(HABIT_TEMPLATES.find((t) => t.key === 'morning_exercise')!);

    // The bug: the emptied-subset condition used to ship and the server answered
    // unknownOperandName (empty scopeItemNames).
    const squats = comp.items.find((i) => i.name === 'Squats')!;
    comp.removeItem(squats);

    expect(comp.items.length).toBe(3);
    // Condition died with the item; the AND root shrank to the 3 remaining conditions.
    expect(comp.criteria.length).toBe(4);
    const root = comp.rootCriterion()!;
    expect(root.operandKeys.length).toBe(3);

    // The template flow gates criteria at the Targets step (no Criteria step).
    comp.step.set(2); // items
    comp.next(); // -> targets
    expect(comp.stepError()).toBeNull();
    comp.next(); // targets gate re-checks the tree
    expect(comp.stepError()).toBeNull();

    const payload = comp.buildCreatePayload();
    const prunedNames = payload.criteria.filter((c) => c.criterionType === 'condition').map((c) => c.name);
    expect(prunedNames).not.toContain('Squats done');
    expect(prunedNames).toHaveLength(3);
    expect(payload.criteria.find((c) => c.isRoot)!.operandCriterionNames).toHaveLength(3);
    expect(payload.criteria.every((c) => !c.scopeItemNames || c.scopeItemNames.length === 1)).toBe(true);
  });

  it('removing items until the AND root cannot stand surfaces a step error, not a bad payload', async () => {
    const { comp } = await createWizard({ id: null });
    comp.selectTemplate(HABIT_TEMPLATES.find((t) => t.key === 'sleep')!);

    for (const name of ['Bedtime before 11pm', '7h+ sleep']) {
      comp.removeItem(comp.items.find((i) => i.name === name)!);
    }

    // Both subset conditions died; the 2-operand AND root cascaded with them.
    expect(comp.criteria.length).toBe(0);
    comp.step.set(2);
    comp.next();
    // Blocked at the step gate (empty items already trip noItems; the pruned
    // tree would trip noRootCriterion one step later) — never a silent POST.
    expect(comp.stepError()).toBeTruthy();
  });

  it('asks before a re-click replaces edited items/criteria and honours Cancel', async () => {
    const { comp, dialogStub } = await createWizard({ id: null, dialogResult: false });
    comp.selectTemplate(HABIT_TEMPLATES[0]);
    dialogStub.open.mockClear();

    comp.selectTemplate(HABIT_TEMPLATES[1]);

    expect(dialogStub.open).toHaveBeenCalledTimes(1);
    // Declined: state untouched.
    expect(comp.templateKey()).toBe(HABIT_TEMPLATES[0].key);
    expect(comp.items.length).toBe(HABIT_TEMPLATES[0].items.length);
  });

  it('applies the new template after confirming', async () => {
    const { comp, dialogStub } = await createWizard({ id: null, dialogResult: true });
    comp.selectTemplate(HABIT_TEMPLATES[0]);
    dialogStub.open.mockClear();

    comp.selectTemplate('custom');

    expect(dialogStub.open).toHaveBeenCalledTimes(1);
    expect(comp.templateKey()).toBe('custom');
    expect(comp.items.length).toBe(0);
  });

  it('cancel with unsaved edits asks first and stays when declined', async () => {
    const { comp, dialogStub, routerStub } = await createWizard({ id: null, dialogResult: false });
    comp.name = 'Half-typed habit';

    comp.cancel();

    expect(dialogStub.open).toHaveBeenCalledTimes(1);
    expect(routerStub.navigate).not.toHaveBeenCalled();
  });

  it('cancel with unsaved edits conditions after confirming', async () => {
    const { comp, dialogStub, routerStub } = await createWizard({ id: null, dialogResult: true });
    comp.name = 'Half-typed habit';

    comp.cancel();

    expect(dialogStub.open).toHaveBeenCalledTimes(1);
    expect(routerStub.navigate).toHaveBeenCalledWith(['/habits']);
  });

  it('clean create wizard cancels without a prompt', async () => {
    const { comp, dialogStub, routerStub } = await createWizard({ id: null });

    comp.cancel();

    expect(dialogStub.open).not.toHaveBeenCalled();
    expect(routerStub.navigate).toHaveBeenCalledWith(['/habits']);
  });

  it('Cancel on a dirty create wizard confirms before leaving', async () => {
    const { comp, dialogStub, routerStub } = await createWizard({ id: null, dialogResult: false });
    comp.name = 'Typing something';

    comp.cancel();

    expect(dialogStub.open).toHaveBeenCalledTimes(1);
    expect(routerStub.navigate).not.toHaveBeenCalled();
  });
});

describe('HabitWizardComponent — template create payload (reading repro)', () => {
  // Repro for the reported failure: creating the 'Reading' template habit surfaced
  // "an operand references an unknown criterion" (unknownOperandName). Walks the
  // real wizard steps and pins the exact POST /api/Habits body.
  it('sends a payload whose condition resolves the template property name', async () => {
    const { comp, stub } = await createWizard({ id: null });
    const tpl = HABIT_TEMPLATES.find((t) => t.key === 'reading')!;

    comp.selectTemplate(tpl);
    comp.next(); // picker -> basics
    expect(comp.stepError()).toBeNull();
    comp.next(); // basics -> items
    expect(comp.stepError()).toBeNull();
    comp.next(); // items -> targets
    expect(comp.stepError()).toBeNull();
    comp.next(); // targets -> preview
    expect(comp.stepError()).toBeNull();

    comp.save();
    await flush();

    expect(stub.createHabit).toHaveBeenCalledTimes(1);
    const payload = stub.createHabit.mock.calls[0][0];
    expect(payload.cycle).toBe('daily');
    expect(payload.items).toEqual([
      {
        name: 'Books',
        order: 0,
        properties: [{ name: 'pages', propertyType: 'numeric', baseRate: null, itemUniqueness: null, order: 0 }],
      },
    ]);
    expect(payload.criteria).toEqual([
      {
        name: 'Goal',
        isRoot: true,
        criterionType: 'condition',
        propertyName: 'pages',
        aggregationMode: null,
        itemScope: 'all',
        scopeItemNames: null,
        threshold: 20,
        operator: null,
        operandCriterionNames: null,
        successType: 'cumulative',
        cycleTarget: null,
      },
    ]);
  });
});

describe('HabitWizardComponent — property rename re-points the seeded criterion', () => {
  // The reported failure: picking the reading template and renaming the only
  // property 'pages' → 'hours' on the items step wedged the targets gate with
  // "an operand references an unknown criterion" (unknownOperandName) — the
  // seeded condition kept the OLD name and the template flow has no criteria step
  // to re-pick it. Rename must follow the entity, like item renames do.
  it('reading template: renaming pages → hours walks steps 3→5 and ships the new name', async () => {
    const { comp, stub } = await createWizard({ id: null });
    comp.selectTemplate(HABIT_TEMPLATES.find((t) => t.key === 'reading')!);
    comp.next(); // picker -> basics
    comp.next(); // basics -> items

    const pagesProp = comp.items[0].properties[0];
    // Clearing-then-typing sequence: the intermediate empty value must not
    // strand the binding either.
    comp.onPropNameChange(pagesProp, '');
    comp.onPropNameChange(pagesProp, 'hours');
    expect(pagesProp.name).toBe('hours');
    expect(comp.rootCriterion()?.propertyName).toBe('hours');

    comp.next(); // items -> targets — the tree gate must pass now
    expect(comp.stepError()).toBeNull();
    comp.next(); // targets -> preview
    expect(comp.stepError()).toBeNull();

    comp.save();
    await flush();
    const payload = stub.createHabit.mock.calls[0][0];
    expect(payload.items[0].properties[0].name).toBe('hours');
    expect(payload.criteria[0].propertyName).toBe('hours');
  });

  it('AND-tree template: renaming one item\'s property follows only its dedicated condition', async () => {
    const { comp } = await createWizard({ id: null });
    comp.selectTemplate(HABIT_TEMPLATES.find((t) => t.key === 'morning_exercise')!);

    const squats = comp.items.find((i) => i.name === 'Squats')!;
    comp.onPropNameChange(squats.properties[0], 'sq');

    const squatsCondition = comp.criteria.find((c) => c.name === 'Squats done')!;
    const pushupsCondition = comp.criteria.find((c) => c.name === 'Pushups done')!;
    expect(squatsCondition.propertyName).toBe('sq');
    expect(squatsCondition.scopeItemKeys).toEqual([squats.key]);
    expect(pushupsCondition.propertyName).toBe('done');

    comp.step.set(2); // items
    comp.next(); // -> targets (checkCriteria on the seeded tree)
    expect(comp.stepError()).toBeNull();
  });

  it('trailing-space renames store the trimmed name (payload property equality is exact)', async () => {
    const { comp } = await createWizard({ id: null });
    comp.selectTemplate(HABIT_TEMPLATES.find((t) => t.key === 'reading')!);
    comp.onPropNameChange(comp.items[0].properties[0], 'hours ');
    expect(comp.rootCriterion()?.propertyName).toBe('hours');
  });

  it('reading template, target change only: full walk ships the new threshold', async () => {
    const { comp, stub } = await createWizard({ id: null });
    comp.selectTemplate(HABIT_TEMPLATES.find((t) => t.key === 'reading')!);
    comp.next(); // picker -> basics
    expect(comp.stepError()).toBeNull();
    comp.next(); // basics -> items
    expect(comp.stepError()).toBeNull();
    comp.next(); // items -> targets
    expect(comp.stepError()).toBeNull();
    comp.targetThreshold = 100; // the Targets-step override
    comp.next(); // targets -> preview (applyTargetsToDraft writes it onto the root)
    expect(comp.stepError()).toBeNull();
    expect(comp.rootCriterion()?.threshold).toBe(100);

    comp.save();
    await flush();
    expect(stub.createHabit).toHaveBeenCalledTimes(1);
    const payload = stub.createHabit.mock.calls[0][0];
    expect(payload.cycle).toBe('daily');
    expect(payload.items).toEqual([
      {
        name: 'Books',
        order: 0,
        properties: [{ name: 'pages', propertyType: 'numeric', baseRate: null, itemUniqueness: null, order: 0 }],
      },
    ]);
    expect(payload.criteria).toEqual([
      {
        name: 'Goal',
        isRoot: true,
        criterionType: 'condition',
        propertyName: 'pages',
        aggregationMode: null,
        itemScope: 'all',
        scopeItemNames: null,
        threshold: 100,
        operator: null,
        operandCriterionNames: null,
        successType: 'cumulative',
        cycleTarget: null,
      },
    ]);
  });

  it('reading template, rename + target change: full walk ships the retargeted payload', async () => {
    const { comp, stub } = await createWizard({ id: null });
    comp.selectTemplate(HABIT_TEMPLATES.find((t) => t.key === 'reading')!);
    comp.next(); // picker -> basics
    expect(comp.stepError()).toBeNull();
    comp.next(); // basics -> items
    comp.onPropNameChange(comp.items[0].properties[0], 'hours');
    comp.next(); // items -> targets — the gate used to fail here with unknownOperandName
    expect(comp.stepError()).toBeNull();
    comp.targetThreshold = 30;
    comp.next(); // targets -> preview
    expect(comp.stepError()).toBeNull();

    comp.save();
    await flush();
    expect(stub.createHabit).toHaveBeenCalledTimes(1);
    const payload = stub.createHabit.mock.calls[0][0];
    expect(payload.items).toEqual([
      {
        name: 'Books',
        order: 0,
        properties: [{ name: 'hours', propertyType: 'numeric', baseRate: null, itemUniqueness: null, order: 0 }],
      },
    ]);
    expect(payload.criteria).toEqual([
      {
        name: 'Goal',
        isRoot: true,
        criterionType: 'condition',
        propertyName: 'hours',
        aggregationMode: null,
        itemScope: 'all',
        scopeItemNames: null,
        threshold: 30,
        operator: null,
        operandCriterionNames: null,
        successType: 'cumulative',
        cycleTarget: null,
      },
    ]);
  });
});

describe('HabitWizardComponent — cycle field editability', () => {
  // FR-5.3: a template pre-fills the cycle but must not lock it — the
  // template flow used to render the cycle as read-only hint text.
  it('template flow renders the cycle select pre-filled and enabled', async () => {
    const { fixture, comp } = await createWizard({ id: null });
    const tpl = HABIT_TEMPLATES.find((t) => t.cycle === 'daily');
    expect(tpl).toBeTruthy();

    comp.selectTemplate(tpl!);
    comp.next(); // picker -> basics
    fixture.detectChanges();
    await fixture.whenStable();

    expect(comp.currentStep).toBe('basics');
    expect(comp.cycle).toBe('daily');
    const select = fixture.debugElement.query(By.directive(MatSelect))
      ?.componentInstance as MatSelect | undefined;
    expect(select).toBeTruthy();
    expect(select!.disabled).toBe(false);
    expect(select!.value).toBe('daily');
  });

  // FR-2.3: the only cycle lock left — editing a habit whose punches would
  // make historical cycle boundaries ambiguous.
  it('edit mode with punches disables the cycle select', async () => {
    const { fixture, comp } = await createWizard({ id: '7' });
    expect(comp.isEdit).toBe(true);

    comp.hasPunches = true;
    fixture.detectChanges();
    await fixture.whenStable();

    const select = fixture.debugElement.query(By.directive(MatSelect))
      ?.componentInstance as MatSelect | undefined;
    expect(select).toBeTruthy();
    expect(select!.disabled).toBe(true);
  });
});

describe('HabitWizardComponent — date adapter locale', () => {
  // Regression: without a MAT_DATE_LOCALE override the adapter received
  // LOCALE_ID (a string); date-fns expects a Locale object and threw
  // "Cannot read properties of undefined (reading 'preprocessor')"
  // when the start/end date pickers rendered or formatted.
  it('calendar formatting providers expose a date-fns-compatible locale', async () => {
    const { fixture } = await createWizard({ id: null });

    const adapter = fixture.debugElement.injector.get(DateAdapter);
    expect(() => adapter.getFirstDayOfWeek()).not.toThrow();
    expect(() => adapter.getMonthNames('long')).not.toThrow();
    expect(() => adapter.getDayOfWeekNames('short')).not.toThrow();
  });

  // The nz-steps header binds (nzIndexChange)="goTo($event)"; these pin the
  // validated-navigation contract the handler implements (template compile
  // with strictTemplates covers the markup itself).
  it('forward step navigation validates the current step first', async () => {
    const { comp } = await createWizard({ id: null });

    comp.goTo(1); // no template picked yet → picker step is invalid
    expect(comp.step()).toBe(0);
    expect(comp.stepError()).toBeTruthy();

    comp.selectTemplate('custom');
    comp.goTo(1);
    expect(comp.currentStep).toBe('basics');
  });
});

describe('HabitWizardComponent — all 12 templates (parametrized create coverage)', () => {
  // Reading-repro discipline (full step walk, gates stay null, payload pinned)
  // applied to EVERY FR-5.4 template: default target, targets override, and the
  // rename family. The key-echo stub resolves template names to the English
  // constants (resolveTemplate's fallback), so payloads assert against the raw
  // table — a new template is covered by this loop automatically.
  async function walkAndSave(comp: HabitWizardComponent): Promise<void> {
    comp.next(); // picker -> basics
    expect(comp.stepError()).toBeNull();
    comp.next(); // basics -> items
    expect(comp.stepError()).toBeNull();
    comp.next(); // items -> targets
    expect(comp.stepError()).toBeNull();
    comp.next(); // targets -> preview
    expect(comp.stepError()).toBeNull();
    comp.save();
    await flush();
  }

  for (const tpl of HABIT_TEMPLATES) {
    const root = templateRoot(tpl);
    const dailyRoot = root.successType === 'daily';
    const andTree = root.criterionType === 'composite';

    it(`${tpl.key}: default walk ships the template-shaped payload`, async () => {
      const { comp, stub } = await createWizard({ id: null });
      comp.selectTemplate(tpl);
      await walkAndSave(comp);

      expect(stub.createHabit).toHaveBeenCalledTimes(1);
      const payload = stub.createHabit.mock.calls[0][0] as HabitCreate;
      expect(payload.cycle).toBe(tpl.cycle);
      // Items mirror the template exactly, incl. buildItemsPayload's
      // normalization rules (baseRate numeric-only; list defaults per_day).
      expect(payload.items).toEqual(tpl.items.map((i, n) => ({
        name: i.name,
        order: n,
        properties: i.properties.map((p, m) => ({
          name: p.name,
          propertyType: p.propertyType,
          baseRate: p.propertyType === 'numeric' ? p.baseRate ?? null : null,
          itemUniqueness: p.propertyType === 'list' ? p.itemUniqueness ?? 'per_day' : null,
          order: m,
        })),
      })));

      expect(payload.criteria.length).toBe(tpl.criteria.length);
      const pRoot = payload.criteria.find((c) => c.isRoot)!;
      expect(pRoot.successType).toBe(root.successType);
      if (dailyRoot) {
        expect(pRoot.cycleTarget).toBe(tpl.defaultTarget);
      } else {
        expect(pRoot.threshold).toBe(tpl.defaultTarget);
        expect(pRoot.cycleTarget).toBeNull(); // cumulative target is derived
      }
      for (const tc of tpl.criteria) {
        const pc = payload.criteria.find((c) => c.name === tc.name);
        expect(pc, `${tpl.key}.${tc.name}`).toBeTruthy();
        if (tc.scopeItemNames) {
          const itemNames = new Set(payload.items.map((i) => i.name));
          for (const s of pc!.scopeItemNames ?? []) {
            expect(itemNames.has(s), `${tpl.key}: scope ${s}`).toBe(true);
          }
        }
        if (tc.operandNames) {
          expect([...(pc!.operandCriterionNames ?? [])].sort()).toEqual([...tc.operandNames].sort());
        }
      }
      if (andTree) {
        // AND family: one dedicated `done >= 1` condition per item.
        const conditions = payload.criteria.filter((c) => !c.isRoot);
        expect(conditions.length).toBe(tpl.items.length);
        for (const i of tpl.items) {
          const cond = conditions.find((c) => c.scopeItemNames?.[0] === i.name);
          expect(cond, `${tpl.key}.${i.name}`).toBeTruthy();
          expect(cond!.propertyName).toBe('done');
          expect(cond!.threshold).toBe(1);
        }
      } else {
        // Single-condition root: its propertyName references a real payload property.
        const propNames = payload.items.flatMap((i) => i.properties.map((p) => p.name));
        expect(propNames).toContain(pRoot.propertyName);
      }
    });

    it(`${tpl.key}: targets override flows into the payload`, async () => {
      const { comp, stub } = await createWizard({ id: null });
      comp.selectTemplate(tpl);
      comp.next(); // picker -> basics
      comp.next(); // basics -> items
      comp.next(); // items -> targets
      let override: number;
      if (dailyRoot) {
        // Every daily-root template is weekly — +1 stays under the 7-day ceiling.
        override = (root.cycleTarget ?? 1) + 1;
        comp.targetCycle = override;
      } else {
        override = (root.threshold ?? 1) + 10;
        comp.targetThreshold = override;
      }
      comp.next(); // targets -> preview (applyTargetsToDraft writes the override)
      expect(comp.stepError()).toBeNull();
      comp.save();
      await flush();

      const pRoot = (stub.createHabit.mock.calls[0][0] as HabitCreate).criteria.find((c) => c.isRoot)!;
      expect(dailyRoot ? pRoot.cycleTarget : pRoot.threshold).toBe(override);
    });

    if (andTree) {
      it(`${tpl.key}: renaming an item follows its dedicated condition's scope`, async () => {
        const { comp, stub } = await createWizard({ id: null });
        comp.selectTemplate(tpl);
        const renamed = comp.items[1] ?? comp.items[0];
        const original = renamed.name;
        renamed.name = `${original}-改`;
        await walkAndSave(comp);

        const payload = stub.createHabit.mock.calls[0][0] as HabitCreate;
        expect(payload.items.map((i) => i.name)).toContain(`${original}-改`);
        const conditions = payload.criteria.filter((c) => !c.isRoot);
        // The OLD name is gone from every scope; the condition re-derived it.
        expect(conditions.some((c) => c.scopeItemNames?.includes(original))).toBe(false);
        const followed = conditions.find((c) => c.scopeItemNames?.[0] === `${original}-改`);
        expect(followed).toBeTruthy();
        expect(followed!.propertyName).toBe('done'); // binding follows the entity, not the label
      });
    } else {
      it(`${tpl.key}: renaming the bound property follows the root's propertyName`, async () => {
        const { comp, stub } = await createWizard({ id: null });
        comp.selectTemplate(tpl);
        comp.next(); // picker -> basics
        comp.next(); // basics -> items
        const bound = root.propertyName!;
        // The root binds the FIRST row named `bound` (propKeyForName first-wins) —
        // for the book_* templates that is Chapter 1's own property.
        const itemIdx = tpl.items.findIndex((i) => i.properties.some((p) => p.name === bound));
        const prop = comp.items[itemIdx].properties.find((p) => p.name === bound)!;
        comp.onPropNameChange(prop, 'renamedProp');
        expect(comp.rootCriterion()?.propertyName).toBe('renamedProp');
        comp.next(); // items -> targets — the gate must pass with the re-pointed name
        expect(comp.stepError()).toBeNull();
        comp.next(); // targets -> preview
        expect(comp.stepError()).toBeNull();
        comp.save();
        await flush();

        const payload = stub.createHabit.mock.calls[0][0] as HabitCreate;
        expect(payload.criteria.find((c) => c.isRoot)!.propertyName).toBe('renamedProp');
        expect(payload.items[itemIdx].properties.map((p) => p.name)).toContain('renamedProp');
      });
    }
  }
});

describe('HabitWizardComponent — localized template names (seed-time i18n)', () => {
  const ZH: Record<string, string> = {
    'habits.templates.morning_exercise': '晨间锻炼',
    'habits.templateItems.morning_exercise.pushups': '俯卧撑',
    'habits.templateItems.morning_exercise.plank': '平板支撑',
    'habits.templateProps.done': '完成',
  };

  it('seeds localized names, recomposes AND condition names, passes every gate, ships the localized payload', async () => {
    const { comp, stub } = await createWizard({ id: null, translate: (key) => ZH[key] ?? key });
    const tpl = HABIT_TEMPLATES.find((t) => t.key === 'morning_exercise')!;

    comp.selectTemplate(tpl);

    expect(comp.name).toBe('晨间锻炼');
    // Unmapped item keys fall back per-key to English; the shared `done` resolves.
    expect(comp.items.map((i) => i.name)).toEqual(['俯卧撑', 'Squats', 'Stretching', '平板支撑']);
    expect(comp.items.map((i) => i.properties[0].name)).toEqual(['完成', '完成', '完成', '完成']);

    const pushups = comp.criteria.find((c) => c.name === '俯卧撑 完成');
    expect(pushups).toBeTruthy();
    expect(pushups!.propertyName).toBe('完成');
    expect(pushups!.scopeItemKeys).toEqual([comp.items[0].key]);
    expect(pushups!.boundPropKey).toBe(comp.items[0].properties[0].key);
    const squats = comp.criteria.find((c) => c.name === 'Squats 完成')!;
    expect(squats.boundPropKey).toBe(comp.items[1].properties[0].key);

    const root = comp.rootCriterion()!;
    expect([...root.operandKeys].sort((a, b) => a - b)).toEqual(
      comp.criteria.filter((c) => !c.isRoot).map((c) => c.key).sort((a, b) => a - b),
    );

    // Every step gate passes on the localized tree (the unknownOperandName class).
    comp.next(); // picker -> basics
    expect(comp.stepError()).toBeNull();
    comp.next(); // basics -> items
    expect(comp.stepError()).toBeNull();
    comp.next(); // items -> targets
    expect(comp.stepError()).toBeNull();
    comp.next(); // targets -> preview
    expect(comp.stepError()).toBeNull();
    comp.save();
    await flush();

    // The localized names materialize into the POST body as user data.
    const payload = stub.createHabit.mock.calls[0][0] as HabitCreate;
    expect(payload.items[0].name).toBe('俯卧撑');
    expect(payload.items[0].properties[0].name).toBe('完成');
    const pLeaf = payload.criteria.find((c) => c.name === '俯卧撑 完成')!;
    expect(pLeaf.scopeItemNames).toEqual(['俯卧撑']);
    expect(pLeaf.propertyName).toBe('完成');
    const pRoot = payload.criteria.find((c) => c.isRoot)!;
    expect(pRoot.operandCriterionNames).toContain('俯卧撑 完成');
    expect(pRoot.operandCriterionNames).toContain('Squats 完成');
  });
});
