import type { StepperSelectionEvent } from '@angular/cdk/stepper';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import type { MatStepper } from '@angular/material/stepper';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDateFnsModule, provideDateFnsAdapter } from '@angular/material-date-fns-adapter';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { firstValueFrom } from 'rxjs';

import { AppPageTitle } from '../page-title/page-title';

import { HabitConfirmDialogComponent } from './habit-confirm-dialog.component';
import { provideHabitDateLocale } from './habit-date-locale';
import { dateToIso, isoToDate, todayIso } from './habit-date.util';
import { showHabitError } from './habit-error-messages';
import { simulateCycle, simulationIsApproximate, type SimCriterion, type SimDay, type SimItem } from './habit-simulation';
import { HABIT_TEMPLATES, resolveTemplate, templateRoot, type HabitTemplate } from './habit-templates';
import { allowedAggregationModes, checkCriteria, checkItems, checkTargets, type WizardCriterionView, type WizardItemView } from './habit-wizard-validation';
import type {
  AggregationMode,
  CompositeOperator,
  CriterionCreateInWizard,
  CriterionUpdate,
  HabitCycle,
  HabitCreate,
  ItemCreate,
  ItemUniqueness,
  PropertyCreate,
  PropertyType,
  SuccessType,
} from './habit.models';
import { HabitService } from './habit.service';

/** Editable client-side mirror of an item property. */
interface DraftProperty {
  key: number;
  id?: number;
  name: string;
  propertyType: PropertyType;
  baseRate: number | null;
  itemUniqueness: ItemUniqueness | null;
  isNew: boolean;
}

interface DraftItem {
  key: number;
  id?: number;
  name: string;
  isNew: boolean;
  hasPunches: boolean;
  properties: DraftProperty[];
}

interface DraftCriterion {
  key: number;
  id?: number;
  name: string;
  isRoot: boolean;
  criterionType: 'condition' | 'composite';
  /** Condition: the bound property NAME — the API reference is name-based (spec FR-2.3). */
  propertyName: string | null;
  /**
   * Condition: LOCAL provenance for the name binding — the draft key of the item
   * property row the criterion was seeded/picked from. The payload still
   * carries the NAME; this key only lets step-3 renames re-point the binding
   * instead of stranding it (which the Targets/Preview gate reports as
   * `unknownOperandName`).
   */
  boundPropKey: number | null;
  /** Condition: null = the property type's default aggregation mode. */
  aggregationMode: AggregationMode | null;
  itemScope: 'all' | 'subset';
  scopeItemKeys: number[];
  threshold: number | null;
  operator: CompositeOperator | null;
  operandKeys: number[];
  /** Root only — the habit's success mode. */
  successType: SuccessType | null;
  /** Daily root: successful days required; cumulative: null (derived). */
  cycleTarget: number | null;
  isNew: boolean;
}

/**
 * Client-side abort raised by `addDraftCriterion` (U4) when a composite operand
 * cannot be resolved even after topological ordering — the criteria drafts are
 * inconsistent (dangling reference or unexpected cycle). Sending the payload
 * would 422 and the save catch's `loadForEdit()` would destroy the editing
 * session, so the save stops HERE and the message tells the user to fix the
 * criteria. Never reaches the server.
 */
class PendingOperandError extends Error {
  constructor(criterionName: string) {
    super(`unresolved operand in criterion "${criterionName}"`);
  }
}

const STEPS_CREATE_TEMPLATE = ['picker', 'basics', 'items', 'targets', 'preview'] as const;
const STEPS_CREATE_CUSTOM = ['picker', 'basics', 'items', 'criteria'] as const;
const STEPS_EDIT = ['basics', 'items', 'criteria'] as const;

type StepId = 'picker' | 'basics' | 'items' | 'targets' | 'criteria' | 'preview';

/**
 * Habit create/edit wizard (FR-5, design-habit-ui.md § HabitWizardComponent).
 *
 * Create: template picker → Basics → Items & Properties → (Templates: Targets →
 * Preview) | (Custom: Criteria editor). The template flow seeds the FULL spec
 * criterion tree (AND groups included); the Targets step overrides the daily
 * cycleTarget or the cumulative condition threshold. Custom/Edit flows edit the tree
 * directly in the Criteria step. The whole create payload goes out as ONE
 * atomic `POST /api/Habits` with name-based references.
 *
 * Edit: Basics → Items → Criteria, pre-populated from parallel GETs; submit is
 * PUT + sequenced per-entity add/update/delete calls (operands/scope by id,
 * conditions bound by NAME). Type/uniqueness are immutable on existing properties
 * and items with punches cannot be deleted (FR-2.3 server locks are mirrored
 * client-side).
 */
@Component({
  selector: 'app-habit-wizard',
  templateUrl: 'habit-wizard.component.html',
  styleUrl: 'habit-wizard.component.scss',
  host: {
    class: 'app-main-content',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CdkTextareaAutosize,
    FormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatDateFnsModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatSelectModule,
    MatStepperModule,
    MatTooltipModule,
    TranslocoModule,
  ],
  // Date pickers follow the active Transloco language (en → enUS, zh → zhCN).
  providers: [provideDateFnsAdapter(), provideHabitDateLocale()],
})
export class HabitWizardComponent {
  private readonly service = inject(HabitService);
  private readonly snackbar = inject(MatSnackBar);
  private readonly transloco = inject(TranslocoService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly pageTitle = inject(AppPageTitle);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);

  // ── Flow state ────────────────────────────────────────────────────────────
  readonly editId = Number(this.route.snapshot.paramMap.get('id'));
  readonly isEdit = !Number.isNaN(this.editId) && this.editId > 0;
  readonly step = signal(0);
  readonly loading = signal(!this.isEdit ? false : true);
  readonly saving = signal(false);
  readonly stepError = signal<string | null>(null);

  readonly templates = HABIT_TEMPLATES;
  readonly templateKey = signal<string | null>(null);

  // ── Basics (plain fields: DOM events run in the zone and mark OnPush dirty) ─
  name = '';
  description = '';
  cycle: HabitCycle = 'weekly';
  startDate: Date | null = new Date();
  endDate: Date | null = null;
  /** Edit mode: the loaded habit already has punches → cycle field locks (FR-2.3). */
  hasPunches = false;

  // ── Structure drafts ──────────────────────────────────────────────────────
  items: DraftItem[] = [];
  criteria: DraftCriterion[] = [];
  deletedItemIds: number[] = [];
  deletedPropertyIds: number[] = [];
  deletedCriterionIds: number[] = [];

  // ── Targets step (template flow) — overrides applied onto the draft root ──
  // Daily roots: targetCycle = successful days required. Cumulative CONDITION roots:
  // targetThreshold overrides the root's threshold (the displayed target itself
  // is derived from it — spec: cumulative roots carry no cycleTarget).
  targetCycle = 1;
  targetThreshold: number | null = null;

  // ── Preview simulation ────────────────────────────────────────────────────
  readonly simDays = signal<SimDay[]>([]);
  readonly simCursor = signal(0);
  readonly simApproximate = signal(false);
  private simTimer: ReturnType<typeof setInterval> | null = null;

  private keySeq = 1;

  constructor() {
    this.pageTitle.title = this.transloco.translate(
      this.isEdit ? 'habits.wizard.titleEdit' : 'habits.wizard.title'
    );
    if (this.isEdit) {
      void this.loadForEdit();
    }
  }

  // ── Step model ────────────────────────────────────────────────────────────

  get steps(): readonly StepId[] {
    if (this.isEdit) {
      return STEPS_EDIT;
    }
    return this.templateKey() === 'custom' ? STEPS_CREATE_CUSTOM : STEPS_CREATE_TEMPLATE;
  }

  get currentStep(): StepId {
    return this.steps[Math.min(this.step(), this.steps.length - 1)];
  }

  get isLastStep(): boolean {
    return this.step() >= this.steps.length - 1;
  }

  stepLabel(id: StepId): string {
    return this.transloco.translate(`habits.wizard.step.${id}`);
  }

  /**
   * Whether the wizard holds work a template re-click / Cancel would destroy.
   * Only used in the create flow (edit mode loads server truth, nothing to lose).
   */
  isDirty(): boolean {
    if (this.isEdit) {
      return false;
    }
    return this.name.trim() !== '' || this.description.trim() !== '' || this.items.length > 0 || this.criteria.length > 0;
  }

  selectTemplate(t: HabitTemplate | 'custom'): void {
    // Re-picking a template silently wipes items/criteria edits (review L14) —
    // confirm while there is unsaved work.
    if (this.isDirty()) {
      this.confirmThen('habits.wizard.templateOverwriteConfirm', () => this.applyTemplate(t));
      return;
    }
    this.applyTemplate(t);
  }

  private applyTemplate(t: HabitTemplate | 'custom'): void {
    this.templateKey.set(t === 'custom' ? 'custom' : t.key);
    if (t !== 'custom') {
      // Seed from ONE resolved view: item/property names are translated through
      // i18n `nameKey`s (key-echo ⇒ English fallback) together with the criteria
      // that reference them, so `seedTemplateCriteria`' name-based wiring never
      // mixes locales. The resolved names materialize into the draft and the
      // POST payload as ordinary editable user data.
      const rt = resolveTemplate(t, (key) => this.transloco.translate(key));
      this.cycle = rt.cycle;
      if (!this.name) {
        this.name = this.transloco.translate(`habits.templates.${rt.key}`);
      }
      this.items = rt.items.map((item) => ({
        key: this.keySeq++,
        name: item.name,
        isNew: true,
        hasPunches: false,
        properties: item.properties.map((p) => ({
          key: this.keySeq++,
          name: p.name,
          propertyType: p.propertyType,
          baseRate: p.baseRate ?? null,
          itemUniqueness: p.itemUniqueness ?? null,
          isNew: true,
        })),
      }));
      const root = templateRoot(rt);
      this.targetCycle = root.successType === 'daily' ? (root.cycleTarget ?? 1) : 1;
      this.targetThreshold = root.successType === 'cumulative' && root.criterionType === 'condition' ? (root.threshold ?? null) : null;
      this.criteria = this.seedTemplateCriteria(rt);
    } else {
      this.items = [];
      this.criteria = [];
    }
  }

  /**
   * Map a template's criteria into editable drafts. Names resolve in two passes
   * so composite operands (referenced by name) wire onto the right draft keys,
   * and per-item subset scopes re-bind to the ACTUAL step-2 items — a renamed
   * item keeps its condition (matched by position), per the spec's note that renames
   * follow the entity, not the label.
   */
  private seedTemplateCriteria(t: HabitTemplate): DraftCriterion[] {
    const drafts: DraftCriterion[] = t.criteria.map((tc) => ({
      key: this.keySeq++,
      name: tc.name,
      isRoot: tc.isRoot,
      criterionType: tc.criterionType,
      propertyName: tc.propertyName ?? null,
      boundPropKey: null,
      aggregationMode: null,
      itemScope: tc.scopeItemNames && tc.scopeItemNames.length > 0 ? 'subset' : 'all',
      scopeItemKeys: [],
      threshold: tc.threshold ?? null,
      operator: tc.operator ?? null,
      operandKeys: [],
      successType: tc.successType ?? null,
      cycleTarget: tc.successType === 'daily' ? (tc.cycleTarget ?? null) : null,
      isNew: true,
    }));
    const keyByName = new Map(drafts.map((d, i) => [t.criteria[i].name, d.key]));
    t.criteria.forEach((tc, i) => {
      if (tc.operandNames) {
        drafts[i].operandKeys = tc.operandNames
          .map((n) => keyByName.get(n))
          .filter((k): k is number => k !== undefined);
      }
      if (tc.scopeItemNames && tc.scopeItemNames.length > 0) {
        // Match the template item by position/name; fall back to the same-index
        // item so a renamed template item keeps its dedicated condition.
        const wanted = tc.scopeItemNames[0];
        const tplIdx = t.items.findIndex((it) => it.name === wanted);
        const item = this.items[tplIdx >= 0 ? tplIdx : 0];
        if (item) {
          drafts[i].scopeItemKeys = [item.key];
        }
      }
      // Anchor the property binding to the row INSIDE this condition's scope, so a
      // step-3 rename re-points the dedicated condition (not whichever same-named
      // row happens to come first in the item list).
      drafts[i].boundPropKey = this.propKeyForName(
        tc.propertyName ?? null,
        drafts[i].itemScope === 'subset' ? drafts[i].scopeItemKeys : undefined
      );
    });
    return drafts;
  }

  /** Opens the shared confirm dialog with a pre-translated message; runs `proceed` on yes. */
  private confirmThen(messageKey: string, proceed: () => void): void {
    const ref = this.dialog.open(HabitConfirmDialogComponent, {
      data: {
        title: this.transloco.translate(this.isEdit ? 'habits.wizard.titleEdit' : 'habits.wizard.title'),
        message: this.transloco.translate(messageKey),
        confirmLabel: this.transloco.translate('ok'),
      },
      width: '420px',
    });
    ref.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((ok) => {
      if (ok === true) {
        proceed();
      }
    });
  }

  isTemplateFlow(): boolean {
    return !this.isEdit && this.templateKey() !== null && this.templateKey() !== 'custom';
  }

  /** Root criterion (template/custom/edit alike). */
  rootCriterion(): DraftCriterion | undefined {
    return this.criteria.find((c) => c.isRoot);
  }

  /** "Minimum per session" is editable for numeric/list condition roots only. */
  rootPropType(): PropertyType | null {
    const root = this.rootCriterion();
    if (!root || root.criterionType !== 'condition' || !root.propertyName) {
      return null;
    }
    const prop = this.items.flatMap((i) => i.properties).find((p) => p.name === root.propertyName);
    return prop?.propertyType ?? null;
  }

  next(): void {
    const err = this.validateStep(this.currentStep);
    if (err) {
      this.stepError.set(err);
      return;
    }
    this.stepError.set(null);
    this.applyTargetsToDraft();
    const nextIdx = Math.min(this.step() + 1, this.steps.length - 1);
    this.step.set(nextIdx);
    if (this.currentStep === 'preview') {
      this.startSimulation();
    }
  }

  back(): void {
    this.stopSimulation();
    this.stepError.set(null);
    this.step.set(Math.max(0, this.step() - 1));
  }

  /**
   * The Material stepper header moves its own selection before notifying us
   * (click or keyboard); route through goTo() so the same validation gates as
   * the footer Next apply, then write the stepper back if the gate landed the
   * wizard somewhere else than where the user clicked.
   */
  onHeaderSelect(stepper: MatStepper, event: StepperSelectionEvent): void {
    const want = event.selectedIndex;
    if (want === this.step()) {
      return;
    }
    this.goTo(want);
    if (stepper.selectedIndex !== this.step()) {
      stepper.selectedIndex = this.step();
    }
  }

  goTo(index: number): void {
    if (index === this.step()) {
      return;
    }
    // Allow free backward jumps; forward jumps must pass the gates in between.
    if (index < this.step()) {
      this.stopSimulation();
      this.step.set(index);
      return;
    }
    for (let i = this.step(); i < index; i++) {
      const stepId = this.steps[i];
      const err = this.validateStep(stepId);
      if (err) {
        this.step.set(i);
        this.stepError.set(err);
        return;
      }
      this.applyTargetsToDraft();
    }
    this.step.set(index);
    if (this.currentStep === 'preview') {
      this.startSimulation();
    }
  }

  // ── Items & properties ────────────────────────────────────────────────────

  addItem(): void {
    this.items.push({ key: this.keySeq++, name: '', isNew: true, hasPunches: false, properties: [] });
  }

  removeItem(item: DraftItem): void {
    if (this.isEdit && !item.isNew) {
      if (item.hasPunches) {
        return; // disabled in template too; belt and braces
      }
      if (item.id !== undefined) {
        this.deletedItemIds.push(item.id);
      }
    }
    this.items = this.items.filter((i) => i !== item);
    for (const c of this.criteria) {
      c.scopeItemKeys = c.scopeItemKeys.filter((k) => k !== item.key);
    }
    this.pruneOrphanCriteria();
  }

  /**
   * Removing an item empties the subset scope of its dedicated criterion. Such a
   * condition is unsendable (the API rejects empty subsets with unknownOperandName),
   * and a composite left with fewer operands than its operator needs is too —
   * drop them and cascade to parents. AND-tree templates (morning_exercise,
   * sleep, journaling, strength) hit this on every item removal; custom/edit
   * flows benefit too. An emptied root surfaces as noRootCriterion/noCriteria at
   * the step gate rather than a silent rewrite.
   */
  private pruneOrphanCriteria(): void {
    for (;;) {
      const dead = this.criteria.filter(
        (c) =>
          (c.criterionType === 'condition' && c.itemScope === 'subset' && c.scopeItemKeys.length === 0) ||
          (c.criterionType === 'composite' && c.operandKeys.length < (c.operator === 'not' ? 1 : 2)),
      );
      if (dead.length === 0) {
        return;
      }
      for (const d of dead) {
        if (this.isEdit && !d.isNew && d.id !== undefined && !this.deletedCriterionIds.includes(d.id)) {
          this.deletedCriterionIds.push(d.id);
        }
        this.criteria = this.criteria.filter((x) => x !== d);
      }
      for (const other of this.criteria) {
        other.operandKeys = other.operandKeys.filter((k) => !dead.some((d) => d.key === k));
      }
    }
  }

  addProperty(item: DraftItem): void {
    item.properties.push({
      key: this.keySeq++,
      name: '',
      propertyType: 'boolean',
      baseRate: null,
      itemUniqueness: null,
      isNew: true,
    });
  }

  removeProperty(item: DraftItem, prop: DraftProperty): void {
    if (this.isEdit && !prop.isNew && prop.id !== undefined) {
      this.deletedPropertyIds.push(prop.id);
    }
    item.properties = item.properties.filter((p) => p !== prop);
    // The row is gone — drop provenance so nothing pretends to follow a
    // deleted property. The condition keeps its name binding and surfaces at the
    // gate if the name no longer resolves (delete is not a rename).
    for (const c of this.criteria) {
      if (c.boundPropKey === prop.key) {
        c.boundPropKey = null;
      }
    }
  }

  /**
   * Step-3 property name edit. Item renames already follow the entity (scope
   * references bind draft keys); the criterion→property API reference is a
   * NAME, so a rename would strand every condition bound to the old name and the
   * Targets/Preview gate would answer `unknownOperandName` with no way back.
   * Leaves whose provenance points at THIS row re-point to the new (trimmed)
   * name as the user types — rename follows the entity, not the label.
   */
  onPropNameChange(prop: DraftProperty, value: string): void {
    prop.name = value;
    const next = value.trim();
    for (const c of this.criteria) {
      if (c.criterionType === 'condition' && c.boundPropKey === prop.key) {
        c.propertyName = next;
      }
    }
  }

  /** Draft key of the first in-scope property row carrying this trimmed name. */
  private propKeyForName(name: string | null, scopeItemKeys?: number[]): number | null {
    if (!name) {
      return null;
    }
    const scoped =
      scopeItemKeys && scopeItemKeys.length > 0
        ? this.items.filter((i) => scopeItemKeys.includes(i.key))
        : this.items;
    for (const i of scoped) {
      const hit = i.properties.find((p) => p.name.trim() === name);
      if (hit) {
        return hit.key;
      }
    }
    return null;
  }

  /** Fires when a list property's type changes — default uniqueness per_day. */
  onPropTypeChange(prop: DraftProperty): void {
    if (prop.propertyType === 'list') {
      prop.itemUniqueness = prop.itemUniqueness ?? 'per_day';
    } else {
      prop.itemUniqueness = null;
    }
    if (prop.propertyType !== 'numeric') {
      prop.baseRate = null;
    }
  }

  /** Unique property names across items (criterion condition targets). */
  propertyNames(): string[] {
    const names = new Set<string>();
    for (const i of this.items) {
      for (const p of i.properties) {
        if (p.name.trim()) {
          names.add(p.name.trim());
        }
      }
    }
    return [...names];
  }

  /** Property options with id (edit mode conditions anchor by id). */
  propertyOptions(): { name: string; id: number | null }[] {
    const seen = new Map<string, { name: string; id: number | null }>();
    for (const i of this.items) {
      for (const p of i.properties) {
        const name = p.name.trim();
        if (name && !seen.has(name)) {
          seen.set(name, { name, id: p.id ?? null });
        }
      }
    }
    return [...seen.values()];
  }

  onConditionPropChange(c: DraftCriterion): void {
    // Re-anchor provenance to the row the name was picked from (scoped), so a
    // later step-3 rename of THAT row re-points this condition.
    c.boundPropKey = this.propKeyForName(
      c.propertyName,
      c.itemScope === 'subset' ? c.scopeItemKeys : undefined
    );
    // Keep the aggregation mode legal for the newly chosen property type; the
    // null default is always allowed.
    const allowed = allowedAggregationModes(this.propTypeFor(c.propertyName));
    if (c.aggregationMode !== null && !allowed.includes(c.aggregationMode)) {
      c.aggregationMode = null;
    }
  }

  // ── Criteria editor (custom create + edit) ────────────────────────────────

  addCriterion(kind: 'condition' | 'composite'): void {
    const isRoot = this.criteria.length === 0;
    this.criteria.push({
      key: this.keySeq++,
      name: '',
      isRoot,
      criterionType: kind,
      propertyName: null,
      boundPropKey: null,
      aggregationMode: null,
      itemScope: 'all',
      scopeItemKeys: [],
      threshold: kind === 'condition' ? 1 : null,
      operator: kind === 'composite' ? 'and' : null,
      operandKeys: [],
      // Roots need an explicit mode; cumulative is the neutral default the
      // user flips to daily (day-count) when wanted.
      successType: isRoot ? 'cumulative' : null,
      cycleTarget: null,
      isNew: true,
    });
  }

  removeCriterion(c: DraftCriterion): void {
    if (c.isRoot) {
      return;
    }
    if (this.isEdit && !c.isNew && c.id !== undefined) {
      this.deletedCriterionIds.push(c.id);
    }
    this.criteria = this.criteria.filter((x) => x !== c);
    for (const other of this.criteria) {
      other.operandKeys = other.operandKeys.filter((k) => k !== c.key);
    }
  }

  setRoot(c: DraftCriterion): void {
    if (!c.isRoot) {
      const old = this.criteria.find((x) => x.isRoot);
      if (old) {
        // Root-only inputs (mode + target) travel with the designation (review
        // H1a); the demoted criterion clears them so its PUT omits them. A
        // daily composite root is legitimate (pass bit per day) — no type ban.
        c.successType = old.successType ?? 'cumulative';
        c.cycleTarget = old.successType === 'daily' ? old.cycleTarget : null;
        old.successType = null;
        old.cycleTarget = null;
      }
    }
    for (const x of this.criteria) {
      x.isRoot = x === c;
    }
  }

  isRootCriterion(c: DraftCriterion): boolean {
    return c.isRoot;
  }

  criterionNameOf(key: number): string {
    return this.criteria.find((c) => c.key === key)?.name || '?';
  }

  /** Composite operands may not reference themselves (circularity gate 1). */
  operandCandidates(c: DraftCriterion): DraftCriterion[] {
    return this.criteria.filter((x) => x.key !== c.key);
  }

  isOperand(c: DraftCriterion, o: DraftCriterion): boolean {
    return c.operandKeys.includes(o.key);
  }

  isItemInScope(c: DraftCriterion, item: DraftItem): boolean {
    return c.scopeItemKeys.includes(item.key);
  }

  toggleScopeItem(c: DraftCriterion, item: DraftItem, checked: boolean): void {
    const at = c.scopeItemKeys.indexOf(item.key);
    if (checked && at === -1) {
      c.scopeItemKeys.push(item.key);
    } else if (!checked && at !== -1) {
      c.scopeItemKeys.splice(at, 1);
    }
  }

  /** Property type for a condition criterion's chosen property name. */
  propTypeFor(name: string | null): PropertyType | null {
    if (!name) {
      return null;
    }
    return this.items.flatMap((i) => i.properties).find((p) => p.name.trim() === name)?.propertyType ?? null;
  }

  /** Aggregation modes the chosen property offers (null = type default). */
  allowedModes(name: string | null): (AggregationMode | null)[] {
    return allowedAggregationModes(this.propTypeFor(name));
  }

  /** Denominator for the preview progress bar (mode-aware, mirrors the API). */
  simGoal(): number {
    return this.derivedRootTarget(this.rootCriterion());
  }

  /** Success-mode select on the root (spec "Success types"). */
  onSuccessTypeChange(c: DraftCriterion, mode: SuccessType): void {
    c.successType = mode;
    if (mode === 'daily' && (c.cycleTarget === null || c.cycleTarget === undefined)) {
      c.cycleTarget = 1;
    }
    if (mode === 'cumulative') {
      // The cumulative target is derived from the tree — never stored (spec).
      c.cycleTarget = null;
    }
  }

  toNumOrNull(v: unknown): number | null {
    if (v === null || v === undefined || v === '') {
      return null;
    }
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }

  toggleOperand(c: DraftCriterion, o: DraftCriterion, checked: boolean): void {
    const at = c.operandKeys.indexOf(o.key);
    if (checked && at === -1) {
      c.operandKeys.push(o.key);
    } else if (!checked && at !== -1) {
      c.operandKeys.splice(at, 1);
    }
  }

  // ── Validation / gating ───────────────────────────────────────────────────

  private validateStep(id: StepId): string | null {
    const t = (key: string) => this.transloco.translate(key);
    switch (id) {
      case 'picker':
        return this.templateKey() === null ? t('habits.wizard.err.pickTemplate') : null;
      case 'basics':
        if (!this.name.trim()) {
          return t('habits.wizard.err.nameRequired');
        }
        if (this.startDate === null) {
          return t('habits.wizard.err.startRequired');
        }
        if (this.endDate && dateToIso(this.endDate) < dateToIso(this.startDate)) {
          return t('habits.wizard.err.dateRange');
        }
        return null;
      case 'items': {
        const key = checkItems(this.itemsView());
        return key ? t(key) : null;
      }
      case 'targets': {
        // The template flow has no Criteria step, but the seeded AND-tree is
        // still part of the payload — gate it here (item removals prune it; the
        // user gets a localized message instead of a server 422).
        const treeKey = checkCriteria(this.criteriaViews(), this.cycle);
        if (treeKey) {
          return t(treeKey);
        }
        const root = this.rootCriterion();
        const key = checkTargets(
          root?.successType ?? null,
          this.cycle,
          this.targetCycle,
          this.rootPropType(),
          this.targetThreshold
        );
        return key ? t(key) : null;
      }
      case 'criteria':
        return this.validateCriteria();
      case 'preview':
        // Save runs from here in the template flow — re-gate the tree (state may
        // have changed since Targets).
        return this.validateCriteria();
      default:
        return null;
    }
  }

  private validateCriteria(): string | null {
    const key = checkCriteria(this.criteriaViews(), this.cycle);
    return key ? this.transloco.translate(key) : null;
  }

  private itemsView(): WizardItemView[] {
    return this.items.map((i) => ({
      name: i.name,
      properties: i.properties.map((p) => ({ name: p.name, propertyType: p.propertyType, baseRate: p.baseRate })),
    }));
  }

  private criteriaViews(): WizardCriterionView[] {
    return this.criteria.map((c) => ({
      key: c.key,
      name: c.name,
      isRoot: c.isRoot,
      criterionType: c.criterionType,
      propertyName: c.propertyName,
      propertyType: this.propTypeFor(c.propertyName),
      aggregationMode: c.aggregationMode,
      itemScope: c.itemScope,
      scopeItemCount: c.scopeItemKeys.length,
      nameInScope: this.conditionNameInScope(c),
      threshold: c.threshold,
      operator: c.operator,
      operandKeys: [...c.operandKeys],
      successType: c.successType,
      cycleTarget: c.cycleTarget,
    }));
  }

  /** True when at least one in-scope draft item defines the condition's property name. */
  private conditionNameInScope(c: DraftCriterion): boolean {
    if (c.criterionType !== 'condition' || !c.propertyName) {
      return true; // non-condition / unfinished handled by other checks
    }
    const scoped = c.itemScope === 'subset'
      ? this.items.filter((i) => c.scopeItemKeys.includes(i.key))
      : this.items;
    return scoped.some((i) => i.properties.some((p) => p.name.trim() === c.propertyName));
  }

  private applyTargetsToDraft(): void {
    if (!this.isTemplateFlow()) {
      return;
    }
    const root = this.rootCriterion();
    if (!root) {
      return;
    }
    if (root.successType === 'daily') {
      root.cycleTarget = this.targetCycle;
    }
    const ptype = this.rootPropType();
    if (ptype !== null && root.successType === 'cumulative' && this.targetThreshold !== null) {
      root.threshold = this.targetThreshold;
    }
  }

  // ── Payload builders ──────────────────────────────────────────────────────

  private buildItemsPayload(): ItemCreate[] {
    return this.items.map((item, i) => ({
      name: item.name.trim(),
      order: i,
      properties: item.properties.map((p, j) => ({
        name: p.name.trim(),
        propertyType: p.propertyType,
        baseRate: p.propertyType === 'numeric' ? p.baseRate : null,
        itemUniqueness: p.propertyType === 'list' ? p.itemUniqueness ?? 'per_day' : null,
        order: j,
      })),
    }));
  }

  private buildCriteriaPayload(): CriterionCreateInWizard[] {
    const itemKeyToName = new Map(this.items.map((i) => [i.key, i.name.trim()]));
    return this.criteria.map((c) => ({
      name: c.name.trim(),
      isRoot: c.isRoot,
      criterionType: c.criterionType,
      propertyName: c.criterionType === 'condition' ? c.propertyName : null,
      aggregationMode: c.criterionType === 'condition' ? c.aggregationMode : null,
      itemScope: c.criterionType === 'condition' ? c.itemScope : null,
      scopeItemNames:
        c.criterionType === 'condition' && c.itemScope === 'subset'
          ? c.scopeItemKeys.map((k) => itemKeyToName.get(k)).filter((n): n is string => !!n)
          : null,
      threshold: c.criterionType === 'condition' ? c.threshold : null,
      operator: c.criterionType === 'composite' ? c.operator : null,
      operandCriterionNames:
        c.criterionType === 'composite'
          ? c.operandKeys.map((k) => this.criteria.find((x) => x.key === k)?.name.trim()).filter((n): n is string => !!n)
          : null,
      // Root only: the mode travels; a cumulative root omits the derived target.
      successType: c.isRoot ? c.successType : null,
      cycleTarget: c.isRoot && c.successType === 'daily' ? c.cycleTarget : null,
    }));
  }

  buildCreatePayload(): HabitCreate {
    return {
      name: this.name.trim(),
      description: this.description.trim() || null,
      cycle: this.cycle,
      startDate: this.startDate ? dateToIso(this.startDate) : todayIso(),
      endDate: this.endDate ? dateToIso(this.endDate) : null,
      items: this.buildItemsPayload(),
      criteria: this.buildCriteriaPayload(),
    };
  }

  private draftSimItems(): SimItem[] {
    return this.items.map((i) => ({
      name: i.name.trim(),
      properties: i.properties.map((p) => ({
        name: p.name.trim(),
        propertyType: p.propertyType,
        baseRate: p.propertyType === 'numeric' ? p.baseRate : null,
      })),
    }));
  }

  private draftSimCriteria(): SimCriterion[] {
    const itemKeyToName = new Map(this.items.map((i) => [i.key, i.name.trim()]));
    return this.criteria.map((c) => ({
      name: c.name.trim(),
      isRoot: c.isRoot,
      criterionType: c.criterionType,
      propertyName: c.propertyName,
      scopeItemNames: c.itemScope === 'subset' ? c.scopeItemKeys.map((k) => itemKeyToName.get(k)).filter((n): n is string => !!n) : null,
      aggregationMode: c.criterionType === 'condition' ? c.aggregationMode : null,
      threshold: c.threshold,
      operator: c.operator,
      operandNames: c.operandKeys.map((k) => this.criteria.find((x) => x.key === k)?.name.trim()).filter((n): n is string => !!n),
      successType: c.isRoot ? c.successType : null,
      cycleTarget: c.isRoot && c.successType === 'daily' ? c.cycleTarget : null,
    }));
  }

  // ── Preview simulation ────────────────────────────────────────────────────

  startSimulation(): void {
    this.stopSimulation();
    this.applyTargetsToDraft();
    const simItems = this.draftSimItems();
    const simCriteria = this.draftSimCriteria();
    this.simApproximate.set(simulationIsApproximate(simItems, simCriteria));
    const days = simulateCycle(this.cycle, this.startDate ? dateToIso(this.startDate) : todayIso(), this.endDate ? dateToIso(this.endDate) : null, simItems, simCriteria);
    this.simDays.set(days);
    this.simCursor.set(0);
    if (days.length > 0) {
      this.simTimer = setInterval(() => {
        const cur = this.simCursor();
        if (cur >= days.length - 1) {
          this.stopSimulation();
          return;
        }
        this.simCursor.set(cur + 1);
      }, 650);
      this.destroyRef.onDestroy(() => this.stopSimulation());
    }
  }

  replay(): void {
    this.startSimulation();
  }

  private stopSimulation(): void {
    if (this.simTimer !== null) {
      clearInterval(this.simTimer);
      this.simTimer = null;
    }
  }

  /** Progress % across the cycle as of the animation cursor. The goal is the
   * root's target: daily mode counts successful days, cumulative uses the
   * derived value (condition root: its threshold — spec: no stored cycleTarget). */
  simPercent(): number {
    const days = this.simDays();
    const cur = days[this.simCursor()];
    if (!cur) {
      return 0;
    }
    const root = this.rootCriterion();
    const goal = this.derivedRootTarget(root);
    return Math.min(100, Math.round((cur.rootValue / goal) * 100));
  }

  private derivedRootTarget(root: DraftCriterion | undefined): number {
    if (!root) {
      return 1;
    }
    if (root.successType === 'daily') {
      return root.cycleTarget ?? 1;
    }
    if (root.criterionType === 'condition') {
      return root.threshold ?? 1;
    }
    if (root.operator === 'and') {
      return Math.max(1, root.operandKeys.length);
    }
    return 1;
  }

  simCurrent(): SimDay | null {
    return this.simDays()[this.simCursor()] ?? null;
  }

  fmtNum(v: number): string {
    return `${Math.round(v * 100) / 100}`;
  }

  // ── Load (edit) ───────────────────────────────────────────────────────────

  private async loadForEdit(): Promise<void> {
    this.loading.set(true);
    try {
      const [habit, items, criteria] = await Promise.all([
        firstValueFrom(this.service.getHabit(this.editId)),
        firstValueFrom(this.service.getItems(this.editId)),
        firstValueFrom(this.service.getCriteria(this.editId)),
      ]);
      this.name = habit.name;
      this.description = habit.description ?? '';
      this.cycle = habit.cycle;
      this.hasPunches = habit.hasPunches;
      this.startDate = isoToDate(habit.startDate);
      this.endDate = habit.endDate ? isoToDate(habit.endDate) : null;
      this.templateKey.set('custom');

      this.items = items.map((i) => ({
        key: this.keySeq++,
        id: i.id,
        name: i.name,
        isNew: false,
        hasPunches: i.hasPunches,
        properties: i.properties.map((p) => ({
          key: this.keySeq++,
          id: p.id,
          name: p.name,
          propertyType: p.propertyType,
          baseRate: p.baseRate,
          itemUniqueness: p.itemUniqueness,
          isNew: false,
        })),
      }));

      // Two passes: keys first, then operand cross-references by id→key.
      const keyByCriterionId = new Map(criteria.map((c) => [c.id, this.keySeq++]));
      const byId = new Map(criteria.map((c) => [c.id, c]));
      const drafts: DraftCriterion[] = criteria.map((c) => ({
        key: keyByCriterionId.get(c.id) as number,
        id: c.id,
        name: c.name,
        isRoot: c.isRoot,
        criterionType: c.criterionType,
        propertyName: c.propertyName,
        boundPropKey: null,
        aggregationMode: c.aggregationMode,
        itemScope: c.itemScope ?? 'all',
        scopeItemKeys: (c.scopeItemIds ?? [])
          .map((id) => this.items.find((i) => i.id === id)?.key)
          .filter((k): k is number => k !== undefined),
        threshold: c.threshold,
        operator: c.operator,
        operandKeys: [],
        successType: c.successType,
        cycleTarget: c.cycleTarget,
        isNew: false,
      }));
      for (const draft of drafts) {
        const source = byId.get(draft.id as number);
        draft.operandKeys = (source?.operandCriterionIds ?? [])
          .map((id) => keyByCriterionId.get(id))
          .filter((k): k is number => k !== undefined);
        // Anchor the property binding to a loaded row so renames follow the
        // entity here too (edit flow).
        if (draft.criterionType === 'condition') {
          draft.boundPropKey = this.propKeyForName(
            draft.propertyName,
            draft.itemScope === 'subset' ? draft.scopeItemKeys : undefined
          );
        }
      }
      this.criteria = drafts;
      // The server state is now mirrored in full — pending deletions from a
      // previous (failed) save are already applied and must not be replayed
      // (review H2: a re-DELETE 404s and wedges the retry loop).
      this.deletedItemIds = [];
      this.deletedPropertyIds = [];
      this.deletedCriterionIds = [];
    } catch (err) {
      showHabitError(this.snackbar, this.transloco, err);
      await this.router.navigate(['/habits']);
    } finally {
      this.loading.set(false);
    }
  }

  // ── Save ──────────────────────────────────────────────────────────────────

  save(): void {
    const err = this.validateStep(this.currentStep);
    if (err) {
      this.stepError.set(err);
      return;
    }
    this.stepError.set(null);
    this.saving.set(true);
    void (async () => {
      try {
        if (this.isEdit) {
          await this.saveEdit();
        } else {
          const created = await firstValueFrom(this.service.createHabit(this.buildCreatePayload()));
          await this.router.navigate(['/habits', created.id]);
        }
      } catch (e) {
        if (e instanceof PendingOperandError) {
          // Local abort (U4): nothing doomed was sent and the drafts are the
          // user's work-in-progress — surface a localized error and KEEP the
          // session. A genuine server failure below re-reads truth instead.
          this.snackbar.open(
            this.transloco.translate('habits.wizard.err.pendingOperand'),
            undefined,
            { duration: 5000, panelClass: ['habit-error-snackbar'] }
          );
        } else {
          showHabitError(this.snackbar, this.transloco, e);
          if (this.isEdit) {
            // Per-endpoint transactions keep the server consistent — re-read truth.
            await this.loadForEdit();
          }
        }
      } finally {
        this.saving.set(false);
      }
    })();
  }

  cancel(): void {
    // Create flow only — edit mode holds server truth, so leaving loses nothing
    // the user typed beyond this step's inputs (and the step is validated on save).
    if (!this.isEdit && this.isDirty()) {
      this.confirmThen('habits.wizard.discardChangesConfirm', () => void this.router.navigate(['/habits']));
      return;
    }
    void this.router.navigate(['/habits']);
  }

  private async saveEdit(): Promise<void> {
    const basics = {
      name: this.name.trim(),
      description: this.description.trim() || null,
      cycle: this.cycle,
      startDate: this.startDate ? dateToIso(this.startDate) : todayIso(),
      endDate: this.endDate ? dateToIso(this.endDate) : null,
    };
    await firstValueFrom(this.service.updateHabit(this.editId, basics));

    // 1. New items — created WITH their properties inline. The API rejects
    // zero-property items (`itemWithoutProperties`), so the old two-step
    // POST item + POST properties sequence always failed (review C1).
    const justCreated = new Set(this.items.filter((i) => i.isNew).map((i) => i.key));
    for (const item of this.items.filter((i) => justCreated.has(i.key))) {
      const created = await firstValueFrom(
        this.service.addItem(this.editId, {
          name: item.name.trim(),
          order: this.items.indexOf(item),
          properties: item.properties.map((p, j) => this.toPropertyCreate(p, j)),
        })
      );
      item.id = created.id;
      item.isNew = false;
      // The create response echoes the properties with their server ids.
      const idByName = new Map(created.properties.map((p) => [p.name, p.id] as const));
      for (const prop of item.properties) {
        prop.id = idByName.get(prop.name.trim());
        prop.isNew = false;
      }
    }
    // 2. Existing items: rename + property adds/updates/removes.
    for (const item of this.items.filter((i) => !justCreated.has(i.key) && i.id !== undefined)) {
      const itemId = item.id as number;
      await firstValueFrom(this.service.updateItem(this.editId, itemId, { name: item.name.trim(), order: this.items.indexOf(item) }));
      // Property adds remain per-POST for EXISTING items (review C1).
      for (const prop of item.properties.filter((p) => p.isNew)) {
        const p = await firstValueFrom(
          this.service.addProperty(this.editId, itemId, this.toPropertyCreate(prop, item.properties.indexOf(prop)))
        );
        prop.id = p.id;
        prop.isNew = false;
      }
      for (const prop of item.properties.filter((p) => !p.isNew && p.id !== undefined)) {
        const propId = prop.id as number;
        const desiredName = prop.name.trim();
        const desiredOrder = item.properties.indexOf(prop);
        await firstValueFrom(
          this.service.updateProperty(this.editId, itemId, propId, {
            name: desiredName,
            baseRate: prop.propertyType === 'numeric' ? prop.baseRate : null,
            order: desiredOrder,
          })
        );
      }
    }
    // 3. Deleted properties, then items.
    for (const pid of this.deletedPropertyIds) {
      const owner = this.findItemOfProperty(pid);
      if (owner?.id !== undefined) {
        await firstValueFrom(this.service.deleteProperty(this.editId, owner.id, pid));
      }
    }
    for (const iid of this.deletedItemIds) {
      await firstValueFrom(this.service.deleteItem(this.editId, iid));
    }
    // 4. Criteria: deletes → new adds (topological, incl. the designated root) → updates.
    for (const cid of this.deletedCriterionIds) {
      await firstValueFrom(this.service.deleteCriterion(this.editId, cid));
    }
    // New criteria FIRST, in topological order (U4): a composite is POSTed only
    // after the new drafts it references, so every operand id is resolvable by
    // the time any payload leaves. This also covers existing composites edited
    // to gain a NEW operand — their PUTs (below) see the just-created ids — and
    // the designated root's POST still precedes the demoting PUTs, keeping the
    // server from ever being root-less (review H1a). The old sequence (root
    // POST → updates → adds in draft order) silently dropped unresolvable
    // operand ids, shipping shrunken or doomed payloads.
    const pendingNew = this.criteria.filter((x) => x.isNew);
    for (const c of this.orderNewCriteriaByRefs(pendingNew)) {
      await this.addDraftCriterion(c);
    }
    const createdCriteria = new Set(pendingNew);
    const nameToId = new Map(this.criteria.filter((c) => c.id !== undefined).map((c) => [c.name.trim(), c.id as number]));
    // Existing criteria update root-first: the designated root's promotion
    // demotes the old server root (atomically clearing its targets). The
    // remaining PUTs carry isRoot:false and omit the target fields, so the
    // server-cleared values stay cleared. The just-created drafts are excluded
    // — their full state went out on the POST (newRoot included).
    const updates = this.criteria.filter((x) => !x.isNew && !createdCriteria.has(x) && x.id !== undefined);
    updates.sort((a, b) => Number(b.isRoot) - Number(a.isRoot));
    for (const c of updates) {
      await firstValueFrom(this.service.updateCriterion(this.editId, c.id as number, this.toCriterionUpdate(c, nameToId)));
    }
    // The save persisted — the recorded deletions are server truth now. Reset
    // them so an error-retry of a LATER save cannot re-issue stale DELETEs
    // (review H2: loadForEdit also clears them, this covers the success path).
    this.deletedItemIds = [];
    this.deletedPropertyIds = [];
    this.deletedCriterionIds = [];
    await this.router.navigate(['/habits', this.editId]);
  }

  private toPropertyCreate(p: DraftProperty, order: number): PropertyCreate {
    return {
      name: p.name.trim(),
      propertyType: p.propertyType,
      baseRate: p.propertyType === 'numeric' ? p.baseRate : null,
      itemUniqueness: p.propertyType === 'list' ? p.itemUniqueness ?? 'per_day' : null,
      order,
    };
  }

  /**
   * Topological order for freshly added criteria (U4): a composite is POSTed
   * only AFTER every NEW operand it references. References to already-created
   * criteria carry server ids and impose no ordering. The criteria-step gate
   * (`checkCriteria` → circularCriterion) guarantees a DAG; should an
   * unexpected cycle still appear, its members are appended in draft order
   * and `addDraftCriterion`'s guard surfaces an explicit error instead of a
   * doomed payload.
   */
  private orderNewCriteriaByRefs(pending: DraftCriterion[]): DraftCriterion[] {
    const byKey = new Map(pending.map((c) => [c.key, c]));
    const state = new Map<number, 'visiting' | 'done'>();
    const ordered: DraftCriterion[] = [];
    const visit = (c: DraftCriterion): void => {
      const s = state.get(c.key);
      if (s !== undefined) {
        return; // done, or mid-cycle (left to the guard below)
      }
      state.set(c.key, 'visiting');
      for (const k of c.operandKeys) {
        const dep = byKey.get(k);
        if (dep) {
          visit(dep);
        }
      }
      state.set(c.key, 'done');
      ordered.push(c);
    };
    for (const c of pending) {
      visit(c);
    }
    return ordered;
  }

  private async addDraftCriterion(c: DraftCriterion): Promise<void> {
    // Resolve composite operands FIRST (U4): an unresolvable reference used to
    // be silently filtered out, shipping a payload the server 422s — and the
    // save catch's loadForEdit() reload then destroyed the whole session.
    let operandIds: number[] | null = null;
    if (c.criterionType === 'composite') {
      const ids: number[] = [];
      for (const k of c.operandKeys) {
        const id = this.criteria.find((x) => x.key === k)?.id;
        if (id === undefined) {
          throw new PendingOperandError(c.name.trim());
        }
        ids.push(id);
      }
      operandIds = ids;
    }
    const created = await firstValueFrom(
      this.service.addCriterion(this.editId, {
        name: c.name.trim(),
        isRoot: c.isRoot,
        criterionType: c.criterionType,
        propertyName: c.criterionType === 'condition' ? c.propertyName : null,
        aggregationMode: c.criterionType === 'condition' ? c.aggregationMode : null,
        itemScope: c.criterionType === 'condition' ? c.itemScope : null,
        scopeItemIds:
          c.criterionType === 'condition' && c.itemScope === 'subset'
            ? c.scopeItemKeys.map((k) => this.items.find((i) => i.key === k)?.id).filter((id): id is number => id !== undefined)
            : null,
        threshold: c.criterionType === 'condition' ? c.threshold : null,
        operator: c.criterionType === 'composite' ? c.operator : null,
        operandCriterionIds: operandIds,
        successType: c.isRoot ? c.successType : null,
        cycleTarget: c.isRoot && c.successType === 'daily' ? c.cycleTarget : null,
      })
    );
    c.id = created.id;
    c.isNew = false;
  }

  private toCriterionUpdate(c: DraftCriterion, nameToId: Map<string, number>): CriterionUpdate {
    const update: CriterionUpdate = {
      name: c.name.trim(),
      isRoot: c.isRoot,
      propertyName: c.criterionType === 'condition' ? c.propertyName : null,
      aggregationMode: c.criterionType === 'condition' ? c.aggregationMode : null,
      itemScope: c.criterionType === 'condition' ? c.itemScope : null,
      scopeItemIds:
        c.criterionType === 'condition' && c.itemScope === 'subset'
          ? c.scopeItemKeys.map((k) => this.items.find((i) => i.key === k)?.id).filter((id): id is number => id !== undefined)
          : null,
      threshold: c.criterionType === 'condition' ? c.threshold : null,
      operator: c.criterionType === 'composite' ? c.operator : null,
      operandCriterionIds:
        c.criterionType === 'composite'
          ? c.operandKeys.map((k) => {
              const op = this.criteria.find((x) => x.key === k);
              const id = op?.id ?? (op ? nameToId.get(op.name.trim()) : undefined);
              // Guarded like addDraftCriterion (U4): never silently drop an
              // operand — a PUT with a shrunken operand list would pass the
              // server but save the WRONG tree, and a doomed id would 422 into
              // the destructive reload. Abort locally instead.
              if (id === undefined) {
                throw new PendingOperandError(c.name.trim());
              }
              return id;
            })
          : null,
    };
    if (c.isRoot) {
      // Root only: a demoted criterion omits successType/cycleTarget entirely
      // (the server clears them atomically on promote — review H1a).
      update.successType = c.successType;
      update.cycleTarget = c.successType === 'daily' ? c.cycleTarget : null;
    }
    return update;
  }

  private findItemOfProperty(propertyId: number): DraftItem | undefined {
    return this.items.find((i) => i.properties.some((p) => p.id === propertyId));
  }
}
