import { OverlayContainer } from '@angular/cdk/overlay';
import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import {
  TranslocoService,
  TRANSLOCO_MISSING_HANDLER,
  TRANSLOCO_TRANSPILER,
} from '@jsverse/transloco';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { AppPageTitle } from '../page-title/page-title';
import { AuthService } from '../../services';

import { HabitListComponent } from './habit-list.component';
import { HabitWizardComponent } from './habit-wizard.component';
import type { CriterionProgressOut, Habit, HabitCreate, HabitItem } from './habit.models';
import { HabitService } from './habit.service';

/**
 * Interactive user journeys — the UI counterpart of the API's RC scenario
 * tables (aclearningutil/docs/testing.md § 2), driven the way a user drives
 * the app: DOM clicks and typed input, never component method calls. Each
 * journey runs the full loop **create → punch → verify the rendered output**:
 *
 *   wizard (template card → Next … → Create) → habit list card renders the
 *   embedded progress → Punch opens the REAL MatDialog → the user types /
 *   ticks values → the dialog submits → the list re-fetches and the rendered
 *   verdict must match what the fake server computed.
 *
 * The service is an in-memory fake that applies punch semantics server-side
 * (numeric × baseRate, list entry counts, boolean day counting, cumulative
 * pass at the derived threshold target, daily-mode successful-day tally); the tests assert
 * ONLY what the DOM shows. Both directions again: fail states and the pass
 * state after the crossing punch; the journey ends with deactivation
 * (RC-15's visible outcome).
 *
 * See docs/testing-habit-ui.md § "Interactive journeys".
 */

// ── Fake server ──────────────────────────────────────────────────────────────

interface FakeState {
  habits: Habit[];
  items: Record<number, HabitItem[]>;
  root: Record<number, CriterionProgressOut>;
}

function isoMonday(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() - ((d.getDay() + 6) % 7));
}
function iso(d: Date): string {
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

/** Create → punch → verify journeys against one stateful fake, one per test. */
function makeFake() {
  const state: FakeState = { habits: [], items: {}, root: {} };
  let habitSeq = 0;
  let itemSeq = 0;
  let propSeq = 0;
  let punchSeq = 0;

  const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

  function createHabit(body: HabitCreate): Habit {
    const id = ++habitSeq;
    const rootIn = body.criteria.find((c) => c.isRoot);
    if (!rootIn) {
      throw new Error('fake: payload without root criterion');
    }
    const dailyMode = rootIn.successType === 'daily';
    // Cumulative roots carry NO cycleTarget (the target is the threshold / the
    // required passing-operand count — spec, revised 2026-10).
    const cycleTarget = dailyMode ? (rootIn.cycleTarget ?? 1) : null;

    const monday = isoMonday(new Date());
    const habit: Habit = {
      id,
      name: body.name,
      description: body.description ?? null,
      cycle: body.cycle,
      startDate: body.startDate,
      endDate: body.endDate ?? null,
      state: 'active',
      hasPunches: false,
      createdAt: new Date().toISOString(),
      progress: {
        cycleFrom: iso(monday),
        cycleTo: iso(new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6)),
        rootCriterion: {
          criterionId: 900 + id,
          name: rootIn.name,
          isRoot: true,
          criterionType: rootIn.criterionType,
          passed: false,
          propertyName: rootIn.propertyName ?? null,
          aggregationMode: rootIn.aggregationMode ?? null,
          currentValue: dailyMode ? 0 : 0,
          // Condition root: the day threshold doubles as the cumulative target; a
          // composite root's derived target is the operand count (AND).
          threshold: rootIn.threshold ?? (rootIn.criterionType === 'composite' ? (rootIn.operandCriterionNames?.length ?? 1) : 1),
          successType: rootIn.successType ?? null,
          cycleTarget,
          currentDayValue: dailyMode ? 0 : null,
          successfulDays: dailyMode ? 0 : null,
          operator: rootIn.operator ?? null,
          operandIds: null,
        },
        criteria: [],
      },
    };

    const items: HabitItem[] = body.items.map((it, i) => ({
      id: ++itemSeq,
      habitId: id,
      name: it.name,
      order: i,
      createdAt: '',
      hasPunches: false,
      properties: it.properties.map((p, j) => ({
        id: ++propSeq,
        itemId: itemSeq,
        name: p.name,
        propertyType: p.propertyType,
        baseRate: p.baseRate ?? null,
        itemUniqueness: p.itemUniqueness ?? null,
        order: j,
        createdAt: '',
        currentCycleValue: 0,
        todayValue: null,
      })),
    }));
    state.habits.push(habit);
    state.items[id] = items;
    state.root[id] = habit.progress.rootCriterion;
    return habit;
  }

  /** Common bookkeeping every punch performs (FR-3.1: habit now has punches). */
  function markPunched(habitId: number): void {
    const habit = state.habits.find((h) => h.id === habitId);
    if (!habit || !state.root[habitId]) {
      throw new Error('fake: unknown habit');
    }
    habit.hasPunches = true;
  }

  /** Cumulative roots pass at their threshold (no cycleTarget — spec). */
  function cumulativePassed(root: CriterionProgressOut): boolean {
    return (root.currentValue ?? 0) >= (root.threshold ?? Infinity);
  }

  function numericPunch(habitId: number, itemId: number, propertyId: number, numValue: number): void {
    markPunched(habitId);
    const items = state.items[habitId];
    const item = items.find((i) => i.id === itemId)!;
    const prop = item.properties.find((p) => p.id === propertyId)!;
    const weighted = numValue * (prop.baseRate ?? 1);
    prop.todayValue = (prop.todayValue ?? 0) + weighted;
    prop.currentCycleValue += weighted;
    const root = state.root[habitId];
    root.currentValue = (root.currentValue ?? 0) + weighted;
    root.passed = cumulativePassed(root);
  }

  function listPunch(habitId: number, itemId: number, propertyId: number, entries: string[]): void {
    markPunched(habitId);
    const items = state.items[habitId];
    const item = items.find((i) => i.id === itemId)!;
    const prop = item.properties.find((p) => p.id === propertyId)!;
    const fresh = [...new Set(entries)]; // per_day: one dedup pass per day
    prop.todayValue = (prop.todayValue ?? 0) + fresh.length;
    prop.currentCycleValue += fresh.length;
    const root = state.root[habitId];
    root.currentValue = (root.currentValue ?? 0) + fresh.length;
    root.passed = cumulativePassed(root);
  }

  function booleanPunch(habitId: number, itemId: number, propertyId: number, checked: boolean): void {
    markPunched(habitId);
    const items = state.items[habitId];
    const item = items.find((i) => i.id === itemId)!;
    const prop = item.properties.find((p) => p.id === propertyId)!;
    prop.todayValue = checked ? 1 : 0;
    prop.currentCycleValue = Math.max(prop.currentCycleValue, checked ? 1 : 0);
    // Daily-mode condition root: the day passes when ≥ threshold items are done
    // today (the day is judged against the condition's own threshold — spec);
    // single-day journeys: one passing day at most.
    const root = state.root[habitId];
    const doneToday = state.items[habitId].flatMap((i) => i.properties)
      .filter((p) => p.propertyType === 'boolean' && (p.todayValue ?? 0) === 1).length;
    root.currentDayValue = doneToday;
    root.successfulDays = (root.currentDayValue ?? 0) >= (root.threshold ?? 1) ? 1 : 0;
    root.currentValue = root.successfulDays;
    root.passed = (root.successfulDays ?? 0) >= (root.cycleTarget ?? Infinity);
  }

  const service = {
    // Captured create payload for assertions.
    createBodies: [] as HabitCreate[],
    getHabits: vi.fn(() => of(state.habits.map(clone))),
    getHabit: vi.fn((id: number) => {
      const h = state.habits.find((x) => x.id === id);
      if (!h) {
        throw new Error(`fake: no habit ${id}`);
      }
      return of(clone(h));
    }),
    createHabit: vi.fn((body: HabitCreate) => {
      service.createBodies.push(body);
      return of(clone(createHabit(body)));
    }),
    getItems: vi.fn((habitId: number) => of(clone(state.items[habitId] ?? []))),
    getHistory: vi.fn(() => of([])),
    deleteHabit: vi.fn(() => of(undefined)),
    deactivateHabit: vi.fn((id: number) => {
      const h = state.habits.find((x) => x.id === id)!;
      h.state = 'inactive';
      return of(clone(h));
    }),
    createPunch: vi.fn((habitId: number, itemId: number, body: { values: { propertyId: number; boolValue?: boolean | null; numValue?: number | null; listEntries?: string[] | null }[] }) => {
      for (const v of body.values) {
        const prop = state.items[habitId].flatMap((i) => i.properties).find((p) => p.id === v.propertyId)!;
        if (prop.propertyType === 'numeric' && v.numValue) {
          numericPunch(habitId, itemId, v.propertyId, v.numValue);
        } else if (prop.propertyType === 'list' && v.listEntries) {
          listPunch(habitId, itemId, v.propertyId, v.listEntries);
        } else if (prop.propertyType === 'boolean' && v.boolValue !== undefined && v.boolValue !== null) {
          booleanPunch(habitId, itemId, v.propertyId, v.boolValue);
        }
      }
      return of({
        id: ++punchSeq,
        habitId,
        itemId,
        punchedAt: new Date().toISOString(),
        punchDate: iso(new Date()),
        createdAt: new Date().toISOString(),
        values: body.values.map((v) => ({ ...v, propertyName: 'x', propertyType: 'numeric', boolValue: null, numValue: null, listEntries: null })),
      });
    }),
  };
  return service;
}

// ── DOM harness ──────────────────────────────────────────────────────────────

const flush = () => new Promise<void>((resolve) => setTimeout(resolve, 0));
const norm = (s: string | null | undefined): string => (s ?? '').replace(/\s+/g, ' ').trim();

/** Buttons embed mat-icon ligatures ("arrow_forward habits.wizard.next") — match by substring. */
function buttonWith(root: ParentNode, text: string): HTMLButtonElement | undefined {
  return Array.from(root.querySelectorAll('button')).find((b) => norm(b.textContent).includes(text));
}

async function startJourney(templateKey: string) {
  const service = makeFake();
  const router = { navigate: vi.fn(async () => true) };
  await TestBed.configureTestingModule({
    providers: [
      provideNoopAnimations(),
      { provide: HabitService, useValue: service },
      { provide: Router, useValue: router },
      { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } } } },
      { provide: MatSnackBar, useValue: { open: vi.fn() } },
      { provide: AuthService, useValue: { authSubject: { getValue: () => ({ getUserName: () => 'Alice' }) } } },
      {
        provide: TranslocoService,
        useValue: {
          translate: vi.fn((key: string) => key),
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
  const appRef = TestBed.inject(ApplicationRef);
  const overlayHost = TestBed.inject(OverlayContainer).getContainerElement();

  // ── Step 1: the wizard, driven entirely by clicks. ──
  const wizard = TestBed.createComponent(HabitWizardComponent);
  wizard.detectChanges();
  const card = Array.from((wizard.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('.template-card')).find(
    (c) => norm(c.querySelector('.template-name')?.textContent) === `habits.templates.${templateKey}`
  );
  if (!card) {
    throw new Error(`template card "${templateKey}" not rendered`);
  }
  card.click();
  wizard.detectChanges();

  // Click Next until the Create button replaces it (4 steps for a template flow).
  for (let guard = 0; guard < 8; guard++) {
    const next = buttonWith(wizard.nativeElement, 'habits.wizard.next');
    if (!next) {
      break;
    }
    next.click();
    wizard.detectChanges();
  }
  const create = buttonWith(wizard.nativeElement, 'habits.wizard.create');
  expect(create).toBeDefined();
  create!.click();
  await flush();
  appRef.tick();
  wizard.detectChanges();

  // ── Step 2: the list page shows the freshly created habit. ──
  const list = TestBed.createComponent(HabitListComponent);
  list.detectChanges();
  await flush();
  appRef.tick();
  list.detectChanges();

  const ui = {
    service,
    router,
    appRef,
    list,
    cardFor(name: string): HTMLElement {
      const c = Array.from((list.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('.habit-card')).find(
        (x) => norm(x.querySelector('mat-card-title')?.textContent) === name
      );
      if (!c) {
        throw new Error(`no card "${name}"`);
      }
      return c;
    },
    label(name: string): string {
      return norm(ui.cardFor(name).querySelector('.habit-progress-label')?.textContent);
    },
    today(name: string): string {
      return norm(ui.cardFor(name).querySelector('.habit-day-progress')?.textContent);
    },
    hasChip(name: string): boolean {
      return ui.cardFor(name).querySelector('.habit-pass') !== null;
    },
    /** Open the punch dialog the way a user does and wait for its DOM. */
    async openPunch(name: string): Promise<HTMLElement> {
      const btn = buttonWith(ui.cardFor(name), 'habits.list.punch');
      expect(btn).toBeDefined();
      btn!.click();
      await flush();
      appRef.tick();
      const dlg = overlayHost.querySelector('.mat-mdc-dialog-container');
      expect(dlg).not.toBeNull();
      return dlg as HTMLElement;
    },
    /** Type into the dialog's numeric field and submit the buffered punch. */
    async punchNumeric(dlg: HTMLElement, value: string): Promise<void> {
      const input = dlg.querySelector('input[type=number]') as HTMLInputElement;
      expect(input).not.toBeNull();
      input.value = value;
      input.dispatchEvent(new Event('input'));
      appRef.tick();
      const submit = buttonWith(dlg, 'habits.punch.punchButton')!;
      expect(submit.disabled).toBe(false);
      submit.click();
      await flush();
      appRef.tick();
    },
    async punchList(dlg: HTMLElement, text: string): Promise<void> {
      const area = dlg.querySelector('textarea') as HTMLTextAreaElement;
      expect(area).not.toBeNull();
      area.value = text;
      area.dispatchEvent(new Event('input'));
      appRef.tick();
      const submit = buttonWith(dlg, 'habits.punch.punchButton')!;
      expect(submit.disabled).toBe(false);
      submit.click();
      await flush();
      appRef.tick();
    },
    async tickFirstBoolean(dlg: HTMLElement): Promise<void> {
      const cb = dlg.querySelector('mat-checkbox input') as HTMLInputElement;
      expect(cb).not.toBeNull();
      cb.click();
      await flush();
      appRef.tick();
    },
    /**
     * Close the dialog → list refreshes with the server's new verdict.
     * A fully successful buffered Punch closes the dialog itself (carrying
     * 'saved', which already triggered the refresh) — then the button is gone
     * with the destroyed view, so the click is skipped and we only settle.
     * Boolean-only journeys keep the dialog open (auto-submit doesn't close),
     * so the button is still there for those.
     */
    async closePunch(dlg: HTMLElement): Promise<void> {
      const closeBtn = buttonWith(dlg, 'close');
      if (closeBtn) {
        closeBtn.click();
      }
      await flush();
      appRef.tick();
      list.detectChanges();
    },
    /** Deactivate via the card menu + the confirm dialog. */
    async deactivate(name: string): Promise<void> {
      const trigger = ui.cardFor(name).querySelector('button[aria-label="habits.list.actions"]') as HTMLButtonElement;
      expect(trigger).not.toBeNull();
      trigger.click();
      appRef.tick();
      const item = Array.from(overlayHost.querySelectorAll<HTMLElement>('.mat-mdc-menu-item')).find(
        (li) => norm(li.textContent).includes('habits.list.deactivate')
      );
      expect(item).not.toBeNull();
      item!.click();
      await flush();
      appRef.tick();
      const confirm = overlayHost.querySelector('.mat-mdc-dialog-container') as HTMLElement;
      expect(confirm).not.toBeNull();
      // The irreversible warning is exactly the confirm message key.
      expect(norm(confirm.querySelector('mat-dialog-content')?.textContent)).toContain('habits.list.deactivateConfirm');
      const warn = buttonWith(confirm, 'habits.list.deactivate') ?? Array.from(confirm.querySelectorAll('button')).find((b) => b.className.includes('warn'));
      warn!.click();
      await flush();
      appRef.tick();
      list.detectChanges();
    },
  };
  return ui;
}

// ═════════════════════════════════════════════════════════════════════════════
describe('Habit user journeys — create → punch → verify (interactive DOM)', () => {
  it('RC-1 — create the running template, punch 12 km (still failing), punch 18 km (pass), then deactivate', async () => {
    const ui = await startJourney('running');

    // ── Verify what creation sent: the template's shape round-trips intact. ──
    const body = ui.service.createBodies[0];
    expect(body.cycle).toBe('weekly');
    expect(body.items[0].properties[0]).toMatchObject({ name: 'distance', propertyType: 'numeric' });
    const rootIn = body.criteria.find((c) => c.isRoot)!;
    expect(rootIn).toMatchObject({ criterionType: 'condition', propertyName: 'distance', threshold: 30, successType: 'cumulative' });
    // Cumulative roots carry no cycleTarget — the target is the threshold (spec).
    expect(rootIn.cycleTarget ?? null).toBeNull();
    expect(ui.router.navigate).toHaveBeenCalledWith(['/habits', 1]);

    // Initial card: 0 / 30, no chip.
    expect(ui.label('habits.templates.running')).toBe('0 / 30');
    expect(ui.hasChip('habits.templates.running')).toBe(false);

    // ── Punch #1: 12 km — below target, verdict must stay failed. ──
    const dlg1 = await ui.openPunch('habits.templates.running');
    await ui.punchNumeric(dlg1, '12');
    await ui.closePunch(dlg1);
    expect(ui.label('habits.templates.running')).toBe('12 / 30');
    expect(ui.hasChip('habits.templates.running')).toBe(false);

    // ── Punch #2: +18 km — the cumulative root passes at the target. ──
    const dlg2 = await ui.openPunch('habits.templates.running');
    await ui.punchNumeric(dlg2, '18');
    await ui.closePunch(dlg2);
    expect(ui.label('habits.templates.running')).toBe('30 / 30');
    expect(ui.hasChip('habits.templates.running')).toBe(true);

    // ── Deactivate: permanent, punch gone, verdict remains. ──
    await ui.deactivate('habits.templates.running');
    const card = ui.cardFor('habits.templates.running');
    expect(norm(card.querySelector('.habit-state')?.textContent)).toBe('habits.list.stateInactive');
    expect(buttonWith(card, 'habits.list.punch')).toBeUndefined();
    expect(ui.hasChip('habits.templates.running')).toBe(true); // history stays visible (RC-15)
  });

  it('RC-5 — create the vocabulary template and type words into the list textarea: 8 fails, 2 more pass', async () => {
    const ui = await startJourney('vocabulary');
    const name = 'habits.templates.vocabulary';

    expect(ui.service.createBodies[0].items[0].properties[0].itemUniqueness).toBe('per_day');
    expect(ui.label(name)).toBe('0 / 10');

    const dlg = await ui.openPunch(name);
    await ui.punchList(dlg, 'ephemeral\nlucid\nterse\nverbose\nconcise\nopaque\nnuance\ntangible');
    await ui.closePunch(dlg);
    expect(ui.label(name)).toBe('8 / 10');
    expect(ui.hasChip(name)).toBe(false);

    const dlg2 = await ui.openPunch(name);
    await ui.punchList(dlg2, 'abstract\nluminous');
    await ui.closePunch(dlg2);
    expect(ui.label(name)).toBe('10 / 10');
    expect(ui.hasChip(name)).toBe(true);
  });

  it('RC-18/RC-6 — create meditation and tick the session: the day counts once (1 / 5 days, today 1 / 1), no cycle chip', async () => {
    // Single-boolean daily condition root (meditation template): the day passes when
    // the day's done-count reaches the root threshold (1); cycleTarget 5 is the
    // user-set count of successful days — daily mode keeps a stored target.
    const ui = await startJourney('meditation');
    const name = 'habits.templates.meditation';

    const rootIn = ui.service.createBodies[0].criteria.find((c) => c.isRoot)!;
    expect(rootIn.successType).toBe('daily');
    expect(rootIn.threshold).toBe(1);
    expect(rootIn.cycleTarget).toBe(5);

    expect(ui.label(name)).toContain('0 / 5');

    // Boolean checkboxes auto-submit on toggle — no buffered submit, just close.
    const dlg = await ui.openPunch(name);
    await ui.tickFirstBoolean(dlg);
    await ui.closePunch(dlg);

    expect(ui.label(name)).toContain('1 / 5');
    expect(ui.today(name)).toContain('1 / 1'); // today passed, shown live
    expect(ui.hasChip(name)).toBe(false); // 1 of the required 5 days
  });

  it('RC-11 — morning exercise is an AND tree over per-item done flags (spec FR-5.4): four criteria, composite daily root, cycleTarget 5', async () => {
    const ui = await startJourney('morning_exercise');

    const body = ui.service.createBodies[0];
    const rootIn = body.criteria.find((c) => c.isRoot)!;
    expect(rootIn.criterionType).toBe('composite');
    expect(rootIn.operator).toBe('and');
    expect(rootIn.operandCriterionNames).toHaveLength(4);
    expect(rootIn.successType).toBe('daily');
    expect(rootIn.cycleTarget).toBe(5);
    for (const condition of body.criteria.filter((c) => !c.isRoot)) {
      expect(condition.criterionType).toBe('condition');
      expect(condition.propertyName).toBe('done');
      expect(condition.itemScope).toBe('subset');
      expect(condition.threshold).toBe(1); // boolean condition = integer item count
      expect(condition.scopeItemNames).toHaveLength(1);
    }
    // The AND tree cannot pass on one checkbox — the fake server drives only
    // single-item journeys, so assert the initial failing card here.
    expect(ui.label('habits.templates.morning_exercise')).toContain('0 / 5');
    expect(ui.hasChip('habits.templates.morning_exercise')).toBe(false);
  });
});
