import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTree, MatTreeNodeDef, MatTreeNodeOutlet, MatNestedTreeNode } from '@angular/material/tree';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { FilterJoinType } from 'actslib';

import {
  appendMember,
  describeMember,
  emitTree,
  emptyLeaf,
  effectiveOperators,
  FILTER_OPERATION_LABEL_KEYS,
  findMember,
  findProperty,
  isFilterDialogNode,
  mutateNode,
  parentIdOf,
  removeMember,
  replaceLeaf,
  seedTree,
  summarizeFilterDefinition,
  validateTree,
  valueEditorFor,
  depthOf,
} from './filter-dialog-model';
import type { FilterSummaryLabels } from './filter-dialog-model';
import type {
  FilterDialogData,
  FilterDialogResult,
  FilterableProperty,
  FilterPropertyKind,
  FilterScalar,
  FilterValueEditor,
  SharedFilterDialogLeaf,
  SharedFilterDialogMember,
  SharedFilterDialogNode,
} from './filter-dialog-model';

/**
 * Project-wide filter condition editor (docs/reusable-filter-dialog-design.md):
 * pages pass a `FilterableProperty[]` schema plus the actslib
 * `IFilterDefinition` in effect, and get an edited definition back on Submit
 * (`undefined` on Cancel/backdrop/Esc — the caller keeps its previous filter).
 *
 * The layout follows the vocabulary filter dialog it generalizes: a
 * `mat-tree` navigator (left) renders the condition tree, the detail pane
 * (right) edits the selected member — a group's AND/OR join, or a leaf's
 * property / operator / value (the value editor dispatches by kind:
 * text, number, date, Between's two inputs, or the enum multiple-choice list,
 * with valueless custom operators) — and a draggable splitter sizes the panes.
 * Insert/delete live in a toolbar above the tree and target the selection;
 * Submit stays disabled while validation fails (missing values, nested groups
 * with fewer than two members — root exempt, flagged in the tree).
 *
 * CDK invariants this component relies on (§6.3 of the design — do not
 * "simplify"): `[trackBy]` is object REFERENCE (nested children are read once
 * per view, so replaced nodes must re-create), `[expansionKey]` is the editor
 * id with `[isExpanded]="true"` (always-open survives re-creation), and every
 * edit replaces objects through the `root` signal — in-place writes would not
 * dirty the OnPush view and would leave labels/preview stale.
 */
@Component({
  selector: 'app-filter-dlg',
  templateUrl: 'filter-dialog.component.html',
  styleUrl: 'filter-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTree,
    MatNestedTreeNode,
    MatTreeNodeDef,
    MatTreeNodeOutlet,
    TranslocoModule,
  ],
})
export class SharedFilterDialogComponent {
  readonly dialogRef = inject(MatDialogRef<SharedFilterDialogComponent, FilterDialogResult>);
  private readonly transloco = inject(TranslocoService);

  // Field initializers run in declaration order — `root`'s reads everything
  // above it (`data`, `newId`) and `selectedId` reads `root`.
  readonly data = inject<FilterDialogData>(MAT_DIALOG_DATA);
  private nextId = 1;
  private readonly newId = (): number => this.nextId++;
  readonly properties = this.data.properties;
  readonly maxDepth = this.data.maxDepth ?? 4;
  readonly titleKey = this.data.titleKey ?? 'common.editFilter';
  readonly root = signal<SharedFilterDialogNode>(seedTree(this.data.root, this.data.properties, this.newId));
  readonly selectedId = signal<number>(this.root().id);

  /** Labeler for the model's renderers (tree rows + preview). */
  private readonly labels: FilterSummaryLabels = {
    translate: key => this.transloco.translate(key),
  };

  /** Options for the group join select. */
  readonly joinOptions: { value: string; labelKey: string }[] = [
    { value: FilterJoinType.AND, labelKey: 'common.joinAnd' },
    { value: FilterJoinType.OR, labelKey: 'common.joinOr' },
  ];

  // --- mat-tree wiring (see the CDK invariants in the class doc) ------------

  /** Top-level rows of the navigator; a new array only when the tree changes. */
  readonly treeData = computed(() => [this.root()]);

  readonly childrenAccessor = (member: SharedFilterDialogMember): SharedFilterDialogMember[] =>
    isFilterDialogNode(member) ? member.members : [];

  /** Row-differencing identity: the object REFERENCE, not the id. */
  readonly trackByMember = (_index: number, member: SharedFilterDialogMember): SharedFilterDialogMember => member;

  /** Expansion ids survive immutable replacement so the tree stays open. */
  readonly expansionKeyMember = (member: SharedFilterDialogMember): number => member.id;

  // --- Splitter --------------------------------------------------------------

  /** Left pane width as a percentage of the split area. */
  readonly splitLeft = signal(40);
  readonly splitMin = 25;
  readonly splitMax = 65;
  private splitRect: DOMRect | null = null;

  // --- Selection -------------------------------------------------------------

  select(member: SharedFilterDialogMember): void {
    this.selectedId.set(member.id);
  }

  isSelected(member: SharedFilterDialogMember): boolean {
    return member.id === this.selectedId();
  }

  memberById(memberId: number): SharedFilterDialogMember | null {
    const root = this.root();
    return root.id === memberId ? root : findMember(root, memberId);
  }

  /** Member currently reflected in the detail pane. */
  selectedMember(): SharedFilterDialogMember | null {
    return this.memberById(this.selectedId());
  }

  /** True when the selection is not the root (which can never be deleted). */
  canDeleteSelected(): boolean {
    const selected = this.selectedMember();
    return selected !== null && selected.id !== this.root().id;
  }

  /**
   * The group that accepts toolbar inserts: the selected group itself, or the
   * parent of the selected leaf; null when nothing is selected.
   */
  insertTargetId(): number | null {
    const selected = this.selectedMember();
    if (!selected) {
      return null;
    }
    return isFilterDialogNode(selected) ? selected.id : parentIdOf(this.root(), selected.id);
  }

  canInsertCondition(): boolean {
    return this.insertTargetId() !== null && this.properties.length > 0;
  }

  /** Respects the depth cap: no new group at the deepest allowed level. */
  canInsertGroup(): boolean {
    const targetId = this.insertTargetId();
    if (targetId === null || this.properties.length === 0) {
      return false;
    }
    const target = this.memberById(targetId);
    return !!target && isFilterDialogNode(target) && this.canAddGroup(target);
  }

  private canAddGroup(node: SharedFilterDialogNode): boolean {
    return depthOf(this.root(), node.id, 1) < this.maxDepth;
  }

  /** Insert a blank condition (first property) into the target group and select it. */
  onInsertCondition(): void {
    const targetId = this.insertTargetId();
    const first = this.properties[0];
    if (targetId === null || !first) {
      return;
    }
    const leaf = emptyLeaf(first, this.newId);
    this.root.update(root => appendMember(root, targetId, leaf));
    this.selectedId.set(leaf.id);
  }

  /** Insert an OR-joined group (one default condition) into the target group and select it. */
  onInsertGroup(): void {
    const targetId = this.insertTargetId();
    const first = this.properties[0];
    if (targetId === null || !first) {
      return;
    }
    const target = this.memberById(targetId);
    if (!target || !isFilterDialogNode(target) || !this.canAddGroup(target)) {
      return;
    }
    const group: SharedFilterDialogNode = {
      id: this.newId(),
      join: FilterJoinType.OR,
      members: [emptyLeaf(first, this.newId)],
    };
    this.root.update(root => appendMember(root, targetId, group));
    this.selectedId.set(group.id);
  }

  /** Delete the selected member (leaf, or group with its subtree); selection moves to the parent. */
  onDeleteSelected(): void {
    const selected = this.selectedMember();
    if (!selected || selected.id === this.root().id) {
      return;
    }
    const parentId = parentIdOf(this.root(), selected.id);
    if (parentId === null) {
      return;
    }
    this.root.update(root => removeMember(root, selected.id));
    this.selectedId.set(parentId);
  }

  // --- Detail-pane edits (immutable, through the root signal) ---------------

  onJoinChange(nodeId: number, join: FilterJoinType): void {
    this.root.update(root => mutateNode(root, nodeId, node => ({ ...node, join })));
  }

  /** Property switch: resets operator to the new property's default and clears values. */
  onPropertyChange(leafId: number, key: string): void {
    const prop = findProperty(this.properties, key);
    if (!prop) {
      return;
    }
    // Reuse the leaf id so selection/expansion survive the swap.
    this.root.update(root => replaceLeaf(root, leafId, emptyLeaf(prop, () => leafId)));
  }

  onOperatorChange(leafId: number, operator: string): void {
    this.patchLeaf(leafId, leaf => ({ ...leaf, operator }));
  }

  onSingleChange(leafId: number, raw: unknown): void {
    this.patchLeaf(leafId, leaf => {
      const prop = findProperty(this.properties, leaf.propertyKey);
      return { ...leaf, single: this.toScalar(raw, prop?.kind ?? 'string') };
    });
  }

  onBetweenChange(leafId: number, which: 0 | 1, raw: unknown): void {
    this.patchLeaf(leafId, leaf => {
      const prop = findProperty(this.properties, leaf.propertyKey);
      const value = this.toScalar(raw, prop?.kind ?? 'string');
      const between: [FilterScalar | null, FilterScalar | null] = [
        which === 0 ? value : leaf.between[0],
        which === 1 ? value : leaf.between[1],
      ];
      return { ...leaf, between };
    });
  }

  onChoiceToggle(leafId: number, value: string | number, checked: boolean): void {
    this.patchLeaf(leafId, leaf => ({
      ...leaf,
      choices: checked ? [...leaf.choices, value] : leaf.choices.filter(v => v !== value),
    }));
  }

  private patchLeaf(
    leafId: number,
    patch: (leaf: SharedFilterDialogLeaf) => SharedFilterDialogLeaf
  ): void {
    this.root.update(root => {
      const member = findMember(root, leafId);
      return member && !isFilterDialogNode(member) ? replaceLeaf(root, leafId, patch(member)) : root;
    });
  }

  // --- Template helpers -------------------------------------------------------

  isNode(member: SharedFilterDialogMember): member is SharedFilterDialogNode {
    return isFilterDialogNode(member);
  }

  /** Leaf view for the detail pane (null for a group; type-narrows in @if). */
  leafOf(member: SharedFilterDialogMember): SharedFilterDialogLeaf | null {
    return isFilterDialogNode(member) ? null : member;
  }

  propertyOf(leaf: SharedFilterDialogLeaf): FilterableProperty | undefined {
    return findProperty(this.properties, leaf.propertyKey);
  }

  /** Operator options for a property: the valued operators, then custom ones. */
  operatorOptions(prop: FilterableProperty): { value: string; labelKey: string }[] {
    return [
      ...effectiveOperators(prop).map(op => ({ value: op, labelKey: FILTER_OPERATION_LABEL_KEYS[op] })),
      ...(prop.customOperators?.map(c => ({ value: c.id, labelKey: c.labelKey })) ?? []),
    ];
  }

  valueEditor(prop: FilterableProperty, operator: string): FilterValueEditor {
    return valueEditorFor(prop, operator);
  }

  /** Input type for a Between bound (the two inputs follow the property kind). */
  betweenInputType(prop: FilterableProperty): 'number' | 'date' | 'text' {
    return prop.kind === 'number' ? 'number' : prop.kind === 'date' ? 'date' : 'text';
  }

  isChoiceSelected(leaf: SharedFilterDialogLeaf, value: string | number): boolean {
    return leaf.choices.includes(value);
  }

  /** Tree-row label: group phrase or condition summary (model renderer). */
  describeNode(member: SharedFilterDialogMember): string {
    return describeMember(member, this.properties, this.labels);
  }

  /** Live preview: exactly what Submit will apply (incomplete rows skipped). */
  previewExpression(): string {
    return summarizeFilterDefinition(
      emitTree(this.root(), this.properties),
      this.properties,
      this.labels
    );
  }

  // --- Validation (Submit gate) -----------------------------------------------

  readonly validation = computed(() => validateTree(this.root(), this.properties));
  readonly canSubmit = computed(() => this.validation().canSubmit);

  /** Invalid nested group (fewer than two members) — for tree flagging. */
  isNodeInvalid(member: SharedFilterDialogMember): boolean {
    return isFilterDialogNode(member) && this.validation().invalidGroupIds.includes(member.id);
  }

  /** Leaf missing its value — for the detail-pane hint. */
  isLeafMissing(leaf: SharedFilterDialogLeaf): boolean {
    return this.validation().missingValueIds.includes(leaf.id);
  }

  // --- Value conversion (leaf slot <-> native input strings) ------------------

  toScalar(raw: unknown, kind: FilterPropertyKind): FilterScalar | null {
    if (raw === null || raw === undefined || raw === '') {
      return null;
    }
    if (kind === 'number') {
      const n = Number(raw);
      return Number.isFinite(n) ? n : null;
    }
    if (kind === 'date') {
      const d = raw instanceof Date ? raw : new Date(String(raw));
      return Number.isNaN(d.getTime()) ? null : d;
    }
    return String(raw);
  }

  scalarToInput(value: FilterScalar | null): string {
    if (value === null || value === undefined) {
      return '';
    }
    if (value instanceof Date) {
      const pad = (n: number): string => String(n).padStart(2, '0');
      return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
    }
    return String(value);
  }

  // --- Splitter ----------------------------------------------------------------

  onSplitPointerDown(event: PointerEvent): void {
    const splitter = event.currentTarget as HTMLElement;
    const pane = splitter.parentElement;
    if (!pane) {
      return;
    }
    this.splitRect = pane.getBoundingClientRect();
    splitter.setPointerCapture(event.pointerId);
  }

  onSplitPointerMove(event: PointerEvent): void {
    if (!this.splitRect) {
      return;
    }
    const percent = ((event.clientX - this.splitRect.left) / this.splitRect.width) * 100;
    this.splitLeft.set(this.clampSplit(percent));
  }

  onSplitPointerUp(event: PointerEvent): void {
    this.splitRect = null;
    const splitter = event.currentTarget as HTMLElement;
    if (splitter.hasPointerCapture(event.pointerId)) {
      splitter.releasePointerCapture(event.pointerId);
    }
  }

  /** Keyboard resizing: arrows nudge, Home/End jump to the clamps. */
  onSplitKeydown(event: KeyboardEvent): void {
    let next: number | null = null;
    if (event.key === 'ArrowLeft') {
      next = this.splitLeft() - 2;
    } else if (event.key === 'ArrowRight') {
      next = this.splitLeft() + 2;
    } else if (event.key === 'Home') {
      next = this.splitMin;
    } else if (event.key === 'End') {
      next = this.splitMax;
    }
    if (next !== null) {
      event.preventDefault();
      this.splitLeft.set(this.clampSplit(next));
    }
  }

  private clampSplit(percent: number): number {
    return Math.min(this.splitMax, Math.max(this.splitMin, percent));
  }

  // --- Dialog lifecycle ---------------------------------------------------------

  onCancel(): void {
    this.dialogRef.close();
  }

  /** Emit the edited tree as an actslib definition (validation gated the button). */
  onSubmit(): void {
    this.dialogRef.close({ root: emitTree(this.root(), this.properties) });
  }
}
