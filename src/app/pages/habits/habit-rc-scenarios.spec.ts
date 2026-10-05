import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
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

import { HabitDetailComponent } from './habit-detail.component';
import { showHabitError } from './habit-error-messages';
import { HabitListComponent } from './habit-list.component';
import type {
  CriterionProgressOut,
  DayHistoryOut,
  Habit,
  HabitCycle,
  HabitItem,
  HabitState,
  PropertyValueOut,
  PunchOut,
} from './habit.models';
import { HabitApiError } from './habit.models';
import { HabitService } from './habit.service';

/**
 * Real-case (RC) scenario coverage for the habit UI — the client-side mirror of
 * `aclearningutil/docs/testing.md` § 2. The server computes every verdict
 * (cycle windows, criterion DAG, day counts); what the UI must get RIGHT is
 * rendering those verdicts. So each scenario feeds the EXACT progress/history
 * payload the API tests assert for the same RC and checks what the real
 * components show: cumulative vs daily labels, the pass chip, progress-bar
 * percentages (incl. the >target clamp), window text, the today line and its
 * out-of-window suppression, the cycle-complete/day-passed chip rules, per-item
 * history rows, the inactive state, and the duplicateEntry snack-bar.
 * Cumulative roots carry NO cycleTarget (the target is the threshold / derived
 * operand count — spec, revised 2026-10).
 *
 * RC numbering follows the functional spec; every case asserts BOTH the success
 * and the fail verdict where the UI distinguishes them. RC-3 is retired
 * (superseded by RC-5 + RC-9 — spec § RC-3 superseded) and has no scenario
 * here; its former mid-habit item-add rule is API-tested in aclearningutil.
 *
 * Conventions (see docs/testing-habit-ui.md):
 * - payload builders (`root`, `cum`, `dayCount`, `habitOf`) mirror the API DTOs
 *   one-for-one; scenarios hard-code the numbers from the API test tables.
 * - no test depends on the machine clock: every "today" is server-supplied via
 *   the progress payload the components render as-is (design-habit-ui.md §
 *   Known Limitations — the UI never re-derives verdicts).
 * - the transloco stub echoes keys, so DOM text asserts on `habits.*` keys.
 */

// ── Payload builders ─────────────────────────────────────────────────────────

let habitSeq = 1;

const root = (over: Partial<CriterionProgressOut>): CriterionProgressOut => ({
  criterionId: 1,
  name: 'C1',
  isRoot: true,
  criterionType: 'condition',
  passed: false,
  propertyName: 'distance',
  aggregationMode: null,
  currentValue: null,
  threshold: null,
  successType: null,
  cycleTarget: null,
  currentDayValue: null,
  successfulDays: null,
  operator: null,
  operandIds: null,
  ...over,
});

/** Cumulative-mode root: the target is the threshold — cycleTarget stays null (spec). */
const cum = (current: number, target: number, passed: boolean) =>
  root({ currentValue: current, threshold: target, successType: 'cumulative', passed });

/**
 * Daily-mode root: N of cycleTarget successful days; `dayThreshold` is the condition
 * root's own threshold (what the day is judged against, shown on the today
 * line). currentValue mirrors the API: the day count itself.
 */
const dayCount = (days: number, cycleTarget: number, todayValue: number | null, dayThreshold: number, passed: boolean) =>
  root({ currentValue: days, threshold: dayThreshold, successType: 'daily', cycleTarget, currentDayValue: todayValue, successfulDays: days, passed });

const habitOf = (
  name: string,
  cycle: HabitCycle,
  from: string,
  to: string,
  r: CriterionProgressOut,
  opts: { state?: HabitState; criteria?: CriterionProgressOut[]; endDate?: string | null; startDate?: string } = {}
): Habit => ({
  id: habitSeq++,
  name,
  description: null,
  cycle,
  startDate: opts.startDate ?? from,
  endDate: opts.endDate ?? null,
  state: opts.state ?? 'active',
  hasPunches: true,
  createdAt: `${from}T08:00:00Z`,
  progress: { cycleFrom: from, cycleTo: to, rootCriterion: r, criteria: opts.criteria ?? [] },
});

const norm = (s: string | null | undefined): string => (s ?? '').replace(/\s+/g, ' ').trim();

// ── List harness (full DOM rendering) ────────────────────────────────────────

const flush = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

function translocoStub() {
  return {
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
  };
}

async function createList(habits: Habit[]) {
  const service = {
    getHabits: vi.fn(() => of(habits)),
    getHabit: vi.fn((id: number) => of(habits.find((h) => h.id === id) ?? habits[0])),
    getItems: vi.fn(() => of([])),
    deactivateHabit: vi.fn(() => of(habits[0])),
    deleteHabit: vi.fn(() => of(undefined)),
  };
  await TestBed.configureTestingModule({
    providers: [
      { provide: HabitService, useValue: service },
      // RouterLink on the cards injects both — stub the tree building + href.
      {
        provide: Router,
        useValue: {
          navigate: vi.fn(),
          createUrlTree: vi.fn(() => []),
          serializeUrl: vi.fn(() => ''),
          navigated: of(undefined),
        },
      },
      {
        provide: ActivatedRoute,
        useValue: {
          snapshot: { paramMap: { get: () => null }, queryParams: of({}), fragment: null, data: of({}), url: of([]) },
          firstChild: null,
          parent: null,
        },
      },
      { provide: MatDialog, useValue: { open: vi.fn(() => ({ afterClosed: () => of(undefined) })) } },
      { provide: MatSnackBar, useValue: { open: vi.fn() } },
      { provide: AuthService, useValue: { authSubject: { getValue: () => ({ getUserName: () => 'Alice' }) } } },
      translocoStub(),
      { provide: TRANSLOCO_TRANSPILER, useValue: {} },
      { provide: TRANSLOCO_MISSING_HANDLER, useValue: {} },
      { provide: AppPageTitle, useValue: { title: '' } },
    ],
  });
  await TestBed.compileComponents();
  const fixture = TestBed.createComponent(HabitListComponent);
  fixture.detectChanges();
  await flush();
  fixture.detectChanges();

  const host: HTMLElement = fixture.nativeElement;
  const cardFor = (name: string): HTMLElement => {
    const card = Array.from(host.querySelectorAll<HTMLElement>('.habit-card')).find(
      (c) => norm(c.querySelector('mat-card-title')?.textContent) === name
    );
    if (!card) {
      throw new Error(`no habit card named "${name}"`);
    }
    return card;
  };
  return {
    fixture,
    comp: fixture.componentInstance,
    cardFor,
    label: (name: string) => norm(cardFor(name).querySelector('.habit-progress-label')?.textContent),
    today: (name: string) => norm(cardFor(name).querySelector('.habit-day-progress')?.textContent),
    hasChip: (name: string) => cardFor(name).querySelector('.habit-pass') !== null,
    window: (name: string) => norm(cardFor(name).querySelector('mat-card-subtitle')?.textContent),
  };
}

// ── Detail harness (component-level; history/chip/value logic) ───────────────

async function createDetail(habit: Habit, items: HabitItem[] = [], history: DayHistoryOut[] = []) {
  const service = {
    getHabit: vi.fn(() => of(habit)),
    getItems: vi.fn(() => of(items)),
    getHistory: vi.fn(() => of(history)),
    deletePunch: vi.fn(() => of(undefined)),
  };
  await TestBed.configureTestingModule({
    providers: [
      { provide: HabitService, useValue: service },
      { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => String(habit.id) } } } },
      { provide: Router, useValue: { navigate: vi.fn() } },
      { provide: MatDialog, useValue: { open: vi.fn() } },
      { provide: MatSnackBar, useValue: { open: vi.fn() } },
      { provide: AuthService, useValue: { authSubject: { getValue: () => ({ getUserName: () => 'Alice' }) } } },
      translocoStub(),
      { provide: TRANSLOCO_TRANSPILER, useValue: {} },
      { provide: TRANSLOCO_MISSING_HANDLER, useValue: {} },
      { provide: AppPageTitle, useValue: { title: '' } },
    ],
  });
  const fixture = TestBed.createComponent(HabitDetailComponent);
  await flush();
  return { comp: fixture.componentInstance, service };
}

const day = (date: string, successful: boolean, cycleFrom = '2026-09-14', cycleTo: string | null = '2026-09-20'): DayHistoryOut => ({
  date,
  cycleFrom,
  cycleTo,
  isSuccessful: successful,
  criteria: [],
  punches: [],
});

const punchOf = (item: string, values: PropertyValueOut[]): PunchOut => ({
  id: 1,
  habitId: 1,
  itemId: 1,
  punchedAt: '2026-09-21T10:00:00Z',
  punchDate: '2026-09-21',
  createdAt: '2026-09-21T10:00:00Z',
  values,
});

// ═════════════════════════════════════════════════════════════════════════════
describe('RC scenarios — habit list progress rendering', () => {
  it('RC-1 — weekly 10 km: failing week 5 / 10, no chip; closing week 10 / 10 with chip', async () => {
    const fail = habitOf('Wk1', 'weekly', '2026-09-21', '2026-09-27', cum(5, 10, false), {
      startDate: '2026-08-01',
      endDate: '2026-12-31',
    });
    const pass = habitOf('Wk2', 'weekly', '2026-09-28', '2026-10-04', cum(10, 10, true), {
      startDate: '2026-08-01',
      endDate: '2026-12-31',
    });
    const ui = await createList([fail, pass]);

    expect(ui.label('Wk1')).toBe('5 / 10');
    expect(ui.hasChip('Wk1')).toBe(false);
    expect(ui.comp.progressPercent(fail)).toBe(50);

    expect(ui.label('Wk2')).toBe('10 / 10');
    expect(ui.hasChip('Wk2')).toBe(true);
    expect(ui.comp.progressPercent(pass)).toBe(100);

    // Subtitle shows the habit's ACTIVE window (startDate → endDate), not the
    // per-cycle window — for a daily cycle that would read "today → today" and
    // be mistaken for a same-day end date.
    expect(ui.window('Wk1')).toContain('2026-08-01 → 2026-12-31');
    expect(ui.window('Wk2')).toContain('2026-08-01 → 2026-12-31');
  });

  it('RC-2 — monthly 300 min: 305 / 300 passes mid-month, October restarts at 60 / 300 and fails', async () => {
    const sept = habitOf('Sep', 'monthly', '2026-09-01', '2026-09-30', cum(305, 300, true));
    const oct = habitOf('Oct', 'monthly', '2026-10-01', '2026-10-31', cum(60, 300, false));
    const ui = await createList([sept, oct]);

    expect(ui.hasChip('Sep')).toBe(true);
    expect(ui.comp.progressPercent(sept)).toBe(100); // over-target clamps
    expect(ui.label('Oct')).toBe('60 / 300');
    expect(ui.hasChip('Oct')).toBe(false);
    expect(ui.comp.progressPercent(oct)).toBe(20);
  });

  it('RC-4 — scored daily mode: short day "0 / 1" + today 23 / 50; good day "1 / 1" + 76 / 50 with chip', async () => {
    const short = habitOf('Short', 'daily', '2026-09-16', '2026-09-16', dayCount(0, 1, 23, 50, false));
    const good = habitOf('Good', 'daily', '2026-09-16', '2026-09-16', dayCount(1, 1, 76, 50, true));
    const ui = await createList([short, good]);

    expect(ui.label('Short')).toContain('0 / 1');
    expect(ui.today('Short')).toContain('23 / 50');
    expect(ui.hasChip('Short')).toBe(false);

    expect(ui.label('Good')).toContain('1 / 1');
    expect(ui.today('Good')).toContain('76 / 50');
    expect(ui.hasChip('Good')).toBe(true);
  });

  it("RC-5 — weekly vocabulary per_day list: 9 / 10 fails, Thursday's third word closes at 10 / 10", async () => {
    // union_distinct counts per item over the whole window: the re-recorded
    // "ephemeral" adds nothing (Wed reaches 7), Thu brings the total to 10.
    const nine = habitOf('Words-9', 'weekly', '2026-09-14', '2026-09-20', cum(9, 10, false));
    const ten = habitOf('Words-10', 'weekly', '2026-09-14', '2026-09-20', cum(10, 10, true));
    const ui = await createList([nine, ten]);

    expect(ui.label('Words-9')).toBe('9 / 10');
    expect(ui.hasChip('Words-9')).toBe(false);
    expect(ui.hasChip('Words-10')).toBe(true);
  });

  it('RC-6 — checklist daily: 2 / 4 today fails the day, 4 / 4 passes it (labels + chip)', async () => {
    const partial = habitOf('PM-partial', 'daily', '2026-09-16', '2026-09-16', dayCount(0, 1, 2, 4, false));
    const complete = habitOf('PM-full', 'daily', '2026-09-16', '2026-09-16', dayCount(1, 1, 4, 4, true));
    const ui = await createList([partial, complete]);

    expect(ui.today('PM-partial')).toContain('2 / 4');
    expect(ui.hasChip('PM-partial')).toBe(false);
    expect(ui.today('PM-full')).toContain('4 / 4');
    expect(ui.hasChip('PM-full')).toBe(true);
  });

  it('RC-7 — Book1: the weekly run fails every window (2 / 4), the whole run passes (4 / 4)', async () => {
    const weekly = habitOf('Book1 weekly', 'weekly', '2026-09-28', '2026-10-04', cum(2, 4, false));
    // A `whole` cycle's window IS the habit span: cycleTo = endDate (2026-12-31).
    const whole = habitOf('Book1 whole', 'whole', '2026-09-21', '2026-12-31', cum(4, 4, true), {
      endDate: '2026-12-31',
    });
    const ui = await createList([weekly, whole]);

    expect(ui.label('Book1 weekly')).toBe('2 / 4');
    expect(ui.hasChip('Book1 weekly')).toBe(false);
    expect(ui.label('Book1 whole')).toBe('4 / 4');
    expect(ui.hasChip('Book1 whole')).toBe(true);
    // The card's date text is the habit's active window.
    expect(ui.window('Book1 whole')).toContain('2026-09-21 → 2026-12-31');
  });

  it('RC-8 — book pages whole: 61 / 60 passes (bar clamps), 45 / 60 stays failed at 75 %', async () => {
    const done = habitOf('Pages-61', 'whole', '2026-09-21', '2026-10-04', cum(61, 60, true));
    const open = habitOf('Pages-45', 'whole', '2026-09-21', '2026-10-04', cum(45, 60, false));
    const ui = await createList([done, open]);

    expect(ui.hasChip('Pages-61')).toBe(true);
    expect(ui.comp.progressPercent(done)).toBe(100);
    expect(ui.label('Pages-45')).toBe('45 / 60');
    expect(ui.comp.progressPercent(open)).toBe(75);
  });

  it('RC-9 — book exercises whole: 9 / 9 passes, stopped-at-8 fails', async () => {
    const done = habitOf('Ex-9', 'whole', '2026-09-21', '2026-10-04', cum(9, 9, true));
    const miss = habitOf('Ex-8', 'whole', '2026-09-21', '2026-10-04', cum(8, 9, false));
    const ui = await createList([done, miss]);

    expect(ui.hasChip('Ex-9')).toBe(true);
    expect(ui.label('Ex-8')).toBe('8 / 9');
    expect(ui.hasChip('Ex-8')).toBe(false);
  });

  it('RC-10 — composite AND root: 2 / 2 passes with the criterion summary; a short operand shows 1 / 2 failed', async () => {
    const c1 = root({ criterionId: 2, name: 'C1', isRoot: false, currentValue: 3, threshold: 3, passed: true });
    const c2pass = root({ criterionId: 3, name: 'C2', isRoot: false, currentValue: 9, threshold: 9, passed: true });
    const c2short = root({ criterionId: 3, name: 'C2', isRoot: false, currentValue: 6, threshold: 9, passed: false });
    // Cumulative AND root: the derived target is the operand count (threshold),
    // cycleTarget stays null (spec: never stored/submitted).
    const both = habitOf('Both', 'weekly', '2026-09-21', '2026-09-27',
      root({ criterionType: 'composite', operator: 'and', operandIds: [2, 3], currentValue: 2, threshold: 2, successType: 'cumulative', passed: true }),
      { criteria: [c1, c2pass] });
    const short = habitOf('Short', 'weekly', '2026-09-21', '2026-09-27',
      root({ criterionType: 'composite', operator: 'and', operandIds: [2, 3], currentValue: 1, threshold: 2, successType: 'cumulative', passed: false }),
      { criteria: [c1, c2short] });
    const ui = await createList([both, short]);

    expect(ui.label('Both')).toBe('2 / 2');
    expect(ui.hasChip('Both')).toBe(true);
    expect(ui.cardFor('Both').querySelector('app-habit-criterion-summary')).not.toBeNull();

    expect(ui.label('Short')).toBe('1 / 2');
    expect(ui.hasChip('Short')).toBe(false);
  });

  it('RC-11 — daily-mode weekly pace: "5 / 5" + today 1 / 1 passes, "4 / 5" fails; a null today value suppresses the label (FR-2.2)', async () => {
    const five = habitOf('Ex-5of5', 'weekly', '2026-09-14', '2026-09-20', dayCount(5, 5, 1, 1, true));
    const four = habitOf('Ex-4of5', 'weekly', '2026-09-14', '2026-09-20', dayCount(4, 5, 0, 1, false));
    const ended = habitOf('Ex-ended', 'weekly', '2026-09-14', '2026-09-20', dayCount(4, 5, null, 1, false));
    const ui = await createList([five, four, ended]);

    expect(ui.label('Ex-5of5')).toContain('5 / 5');
    expect(ui.today('Ex-5of5')).toContain('1 / 1');
    expect(ui.hasChip('Ex-5of5')).toBe(true);

    expect(ui.label('Ex-4of5')).toContain('4 / 5');
    expect(ui.hasChip('Ex-4of5')).toBe(false);

    expect(ui.today('Ex-ended')).toBe(''); // currentDayValue null → no today line
  });

  it('RC-13 — subset scope: the server withholds the appendix, so the card shows 2 / 3 failed; 3 / 3 passes', async () => {
    const open = habitOf('Ch-2of3', 'whole', '2026-09-21', '2026-10-05', cum(2, 3, false));
    const done = habitOf('Ch-3of3', 'whole', '2026-09-21', '2026-10-05', cum(3, 3, true));
    const ui = await createList([open, done]);

    expect(ui.label('Ch-2of3')).toBe('2 / 3');
    expect(ui.hasChip('Ch-2of3')).toBe(false);
    expect(ui.hasChip('Ch-3of3')).toBe(true);
  });

  it('RC-14 — NOT root in daily mode (legitimate per spec): a caffeine-free day is "1 / 1" and passes; a punched day is "0 / 1" and fails', async () => {
    const free = habitOf('No-caf', 'daily', '2026-09-16', '2026-09-16',
      root({ name: 'C2', criterionType: 'composite', operator: 'not', operandIds: [1], threshold: 1, successType: 'daily', cycleTarget: 1, currentValue: 1, successfulDays: 1, passed: true }));
    const hit = habitOf('Caf', 'daily', '2026-09-16', '2026-09-16',
      root({ name: 'C2', criterionType: 'composite', operator: 'not', operandIds: [1], threshold: 1, successType: 'daily', cycleTarget: 1, currentValue: 0, successfulDays: 0, passed: false }));
    const ui = await createList([free, hit]);

    expect(ui.label('No-caf')).toBe('1 / 1 habits.list.days');
    expect(ui.hasChip('No-caf')).toBe(true);
    expect(ui.label('Caf')).toBe('0 / 1 habits.list.days');
    expect(ui.hasChip('Caf')).toBe(false);
  });

  it('RC-15 — deactivated habit: state badge flips, punch button is gone, the last verdict stays visible', async () => {
    const inactive = habitOf('Old run', 'weekly', '2026-09-14', '2026-09-20', cum(10, 10, true), { state: 'inactive' });
    const ui = await createList([inactive]);

    const card = ui.cardFor('Old run');
    expect(norm(card.querySelector('.habit-state')?.textContent)).toBe('habits.list.stateInactive');
    expect(card.querySelector('.habit-state')?.classList.contains('inactive')).toBe(true);
    const buttons = Array.from(card.querySelectorAll('button')).map((b) => norm(b.textContent));
    expect(buttons.some((t) => t.includes('habits.list.punch'))).toBe(false);
    // History/progress remain fully visible (spec RC-15).
    expect(ui.label('Old run')).toBe('10 / 10');
    expect(ui.hasChip('Old run')).toBe(true);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
describe('RC scenarios — detail history and sessions', () => {
  it('RC-12 — the history picker defaults to the truncated final cycle (server clamps cycleTo to end_date)', async () => {
    // The API already reports the clamped window (cycleTo = endDate, spec RC-12)
    // — the detail page uses it as-is, no client-side clamping.
    const h = habitOf('Clamp', 'weekly', '2025-09-15', '2025-09-17', cum(3, 20, false), {
      startDate: '2025-09-01',
      endDate: '2025-09-17',
    });
    const { service } = await createDetail(h);

    expect(service.getHistory).toHaveBeenCalledWith(h.id, '2025-09-15', '2025-09-17');
  });

  it('RC-12-style history — cumulative mode puts the cycle-complete chip on the transition day only', async () => {
    const h = habitOf('Trans', 'weekly', '2026-09-14', '2026-09-20', cum(10, 10, true));
    const days = [day('2026-09-17', true), day('2026-09-16', true), day('2026-09-15', false)];
    const { comp } = await createDetail(h, [], days);

    const byDate = Object.fromEntries(days.map((d) => [d.date, comp.showChipFor(d)]));
    expect(byDate['2026-09-15']).toBe(false);
    expect(byDate['2026-09-16']).toBe(true); // earliest passing day
    expect(byDate['2026-09-17']).toBe(false); // later passing days get no chip
    expect(comp.chipLabel()).toBe('habits.detail.cycleComplete');
  });

  it('RC-11 history — daily mode chips EVERY passing day', async () => {
    const h = habitOf('Days', 'weekly', '2026-09-14', '2026-09-20', dayCount(2, 5, 1, 1, false));
    const days = [day('2026-09-17', true), day('2026-09-16', true), day('2026-09-15', false)];
    const { comp } = await createDetail(h, [], days);

    expect(days.filter((d) => comp.showChipFor(d))).toHaveLength(2);
    expect(comp.chipLabel()).toBe('habits.detail.dayPassed');
  });

  it('RC-6 / RC-9 / RC-13 / RC-16 — per-session history values: booleans as ✓/✗, numeric raw (base_rate shows in the total, not the session), lists comma-joined, out-of-scope items named', async () => {
    const item: HabitItem = {
      id: 1, habitId: 1, name: 'Appendix A', order: 0, createdAt: '', hasPunches: true, properties: [],
    };
    const boolPunch = punchOf('Appendix A', [{ propertyId: 5, propertyName: 'done', propertyType: 'boolean', boolValue: true, numValue: null, listEntries: null }]);
    const boolOff = punchOf('Appendix A', [{ propertyId: 5, propertyName: 'done', propertyType: 'boolean', boolValue: false, numValue: null, listEntries: null }]);
    const numPunch = punchOf('Appendix A', [{ propertyId: 6, propertyName: 'reps', propertyType: 'numeric', boolValue: null, numValue: 20, listEntries: null }]);
    const listPunch = punchOf('Appendix A', [{ propertyId: 7, propertyName: 'exercise', propertyType: 'list', boolValue: null, numValue: null, listEntries: ['Ex 1', 'Ex 2'] }]);
    const { comp } = await createDetail(
      habitOf('Hist', 'weekly', '2026-09-14', '2026-09-20', cum(1, 3, false)),
      [item]
    );

    expect(comp.valueText(boolPunch, boolPunch.values[0])).toBe('✓');
    expect(comp.valueText(boolOff, boolOff.values[0])).toBe('✗');
    expect(comp.valueText(numPunch, numPunch.values[0])).toBe('20'); // raw 20, not 20×base_rate
    expect(comp.valueText(listPunch, listPunch.values[0])).toBe('Ex 1, Ex 2');
    expect(comp.itemOf(1)).toBe('Appendix A');
    expect(comp.itemOf(999)).toBe('#999'); // item removed post-punch still renders
  });
});

// ═════════════════════════════════════════════════════════════════════════════
describe('RC scenarios — error surfacing', () => {
  it('RC-5b — a per_cycle duplicate punch shows the mapped duplicateEntry message in the snackbar', () => {
    const snackbar = { open: vi.fn() };
    const transloco = { translate: (k: string) => k } as unknown as TranslocoService;

    showHabitError(snackbar as never, transloco, new HabitApiError('duplicateEntry', "Entry 'ephemeral' already recorded this cycle.", 422));

    expect(snackbar.open).toHaveBeenCalledWith('habits.errors.duplicateEntry', undefined, {
      duration: 5000,
      panelClass: ['habit-error-snackbar'],
    });
  });

  it('RC-15 / FR-3.3 — punch attempts on an inactive or expired habit surface habitInactive / outOfWindow', () => {
    const snackbar = { open: vi.fn() };
    const transloco = { translate: (k: string) => k } as unknown as TranslocoService;

    showHabitError(snackbar as never, transloco, new HabitApiError('habitInactive', '', 422));
    showHabitError(snackbar as never, transloco, new HabitApiError('outOfWindow', '', 422));

    const messages = snackbar.open.mock.calls.map((c: unknown[]) => c[0]);
    expect(messages).toEqual(['habits.errors.habitInactive', 'habits.errors.outOfWindow']);
  });
});
