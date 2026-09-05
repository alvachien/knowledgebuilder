import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
  TranslocoService,
  TRANSLOCO_TRANSPILER,
  TRANSLOCO_MISSING_HANDLER,
} from '@jsverse/transloco';
import { FilterJoinType, FilterOperation } from 'actslib';
import type { EnumLike, IFilterCondition, IFilterDefinition } from 'actslib';
import { of } from 'rxjs';
import { vi } from 'vitest';

import type {
  FilterDialogData,
  FilterableProperty,
  SharedFilterDialogNode,
} from './filter-dialog-model';
import { SharedFilterDialogComponent } from './filter-dialog.component';

function mockTranslocoService() {
  return {
    setActiveLang: vi.fn(),
    getActiveLang: vi.fn(),
    selectTranslate: vi.fn().mockReturnValue(of('')),
    _loadDependencies: vi.fn().mockReturnValue(of(null)),
    translate: vi.fn((key: string) => key),
    activeLang: 'en',
    config: { reRenderOnLangChange: true, prodMode: false },
    langChanges$: of('en'),
    events$: of(),
  };
}

// Fixture schema mirroring the model spec: a string property with a custom
// (valueless) operator, a number property, and an enum property.
const COLOR_VALUES: EnumLike = { red: 'red', blue: 'blue' };
const IS_PHRASE = {
  id: 'isPhrase',
  labelKey: 'test.opIsPhrase',
  emit: (property: string): IFilterCondition => ({
    property,
    operation: FilterOperation.Contains,
    lowValue: ' ',
  }),
  recognize: (c: IFilterCondition): boolean =>
    c.operation === FilterOperation.Contains && c.lowValue === ' ',
};

const SCHEMA: FilterableProperty[] = [
  {
    key: 'enword',
    labelKey: 'test.word',
    kind: 'string',
    customOperators: [IS_PHRASE],
    prepareValue: v => String(v).trim().toLowerCase(),
  },
  { key: 'rating', labelKey: 'test.rating', kind: 'number' },
  {
    key: 'color',
    labelKey: 'test.color',
    kind: 'enum',
    enumValues: COLOR_VALUES,
    choices: [
      { value: 'red', labelKey: 'test.red' },
      { value: 'blue', labelKey: 'test.blue' },
    ],
  },
];

describe('SharedFilterDialogComponent', () => {
  let fixture: ComponentFixture<SharedFilterDialogComponent>;
  let closeSpy: ReturnType<typeof vi.fn>;

  async function createWith(data: FilterDialogData) {
    closeSpy = vi.fn();
    await TestBed.configureTestingModule({
      imports: [SharedFilterDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MatDialogRef, useValue: { close: closeSpy } },
        { provide: TranslocoService, useValue: mockTranslocoService() },
        { provide: TRANSLOCO_TRANSPILER, useValue: {} },
        { provide: TRANSLOCO_MISSING_HANDLER, useValue: {} },
        provideHttpClient(withXhr()),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(SharedFilterDialogComponent);
  }

  const component = () => fixture.componentInstance;
  const rootNode = () => component().root();
  const rows = () => fixture.nativeElement.querySelectorAll('.fdlg-node-row');
  const rowList = () => rows() as NodeListOf<HTMLElement>;
  const toolbarButtons = () =>
    fixture.nativeElement.querySelectorAll(
      '.fdlg-tree-toolbar button'
    ) as NodeListOf<HTMLButtonElement>;
  const actionButtons = () =>
    fixture.nativeElement.querySelectorAll(
      'mat-dialog-actions button'
    ) as NodeListOf<HTMLButtonElement>;
  /** The toolbar's disabled flags, in order: [+ condition, + group, delete]. */
  const disabledStates = (): boolean[] => Array.from(toolbarButtons()).map(b => b.disabled);
  /** The tree's single top node — the actslib root (case-1 leaf, case-2 group). */
  const topNode = () => rootNode().members[0] as SharedFilterDialogNode;

  const seedDef: IFilterDefinition = {
    join: FilterJoinType.AND,
    conditions: [
      { property: 'enword', operation: FilterOperation.Contains, lowValue: 'app' },
      {
        join: FilterJoinType.OR,
        conditions: [
          { property: 'rating', operation: FilterOperation.GreaterOrEqual, lowValue: 3 },
          { property: 'rating', operation: FilterOperation.LessOrEqual, lowValue: 4 },
        ],
      },
    ],
  };

  /** Click an option inside a mat-select in the detail pane. */
  function choose(cssClass: string, optionText: string): void {
    const select: HTMLElement = fixture.nativeElement.querySelector(`${cssClass} mat-select`);
    expect(select, `select ${cssClass}`).toBeTruthy();
    select.click();
    fixture.detectChanges();
    const option = Array.from(document.querySelectorAll<HTMLElement>('mat-option')).find(o =>
      o.textContent?.includes(optionText)
    );
    expect(option, `mat-option containing ${optionText}`).toBeDefined();
    option?.click();
    fixture.detectChanges();
  }

  function typeInto(input: HTMLInputElement, value: string): void {
    input.value = value;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }

  describe('rendering', () => {
    it('(1) opens in case 1: ONE condition node — the root — selected, delete-only armed', async () => {
      await createWith({ properties: SCHEMA });
      fixture.detectChanges();
      const root = rootNode();
      // The editor tree IS the actslib root: exactly one node (the scaffolded
      // condition), no wrapper row above it.
      expect(root.members.length).toBe(1);
      expect(rowList().length).toBe(1);
      // A blank leaf labels with just its property name (describeMember fallback).
      expect(rowList()[0].textContent).toContain('test.word');
      // The node is selected: its condition editor fills the detail pane.
      expect(fixture.nativeElement.querySelector('.fdlg-text input')).toBeTruthy();
      expect(fixture.nativeElement.querySelector('.fdlg-join')).toBeNull();
      // A selected CONDITION arms delete only.
      expect(disabledStates()).toEqual([true, true, false]);
      // Blank value -> Submit disabled by the missing-value rule.
      expect(component().validation().missingValueIds).toEqual([
        (root.members[0] as { id: number }).id,
      ]);
      expect(component().canSubmit()).toBe(false);
    });

    it('an empty definition seed (the pages\' cleared filter) scaffolds the same way', async () => {
      await createWith({ properties: SCHEMA, root: { conditions: [] } });
      fixture.detectChanges();
      expect(rootNode().members.length).toBe(1);
      expect(rowList().length).toBe(1); // the case-1 one-node tree
      expect(fixture.nativeElement.querySelector('.fdlg-text input')).toBeTruthy();
      // A non-empty seed is copied in untouched (no scaffold added):
      // the 5-row seedDef test below covers that.
    });

    it('(2) delete empties the tree (the adds re-arm); + condition restores case 1', async () => {
      await createWith({ properties: SCHEMA });
      fixture.detectChanges();
      toolbarButtons()[2].click(); // delete the selected condition
      fixture.detectChanges();
      // No rows, no selection: the transient empty state the toolbar's
      // insert buttons own.
      expect(rowList().length).toBe(0);
      expect(component().selectedId()).toBeNull();
      expect(disabledStates()).toEqual([false, false, true]); // adds armed, delete off
      expect(fixture.nativeElement.querySelector('.fdlg-detail-empty')).toBeTruthy();
      expect(component().canSubmit()).toBe(false); // case 0 is the Clear Filter button's job

      toolbarButtons()[0].click(); // + condition from the empty state
      fixture.detectChanges();
      expect(rowList().length).toBe(1); // back to the one-node case-1 tree
      expect(component().selectedId()).toBe(rootNode().members[0].id);
      expect(disabledStates()).toEqual([true, true, false]);
      expect(fixture.nativeElement.querySelector('.fdlg-text input')).toBeTruthy();
    });

    it('(3) from the empty tree + group roots a selected group; + condition adds its first child', async () => {
      await createWith({ properties: SCHEMA });
      fixture.detectChanges();
      toolbarButtons()[2].click(); // delete the case-1 node -> empty
      fixture.detectChanges();
      toolbarButtons()[1].click(); // + group
      fixture.detectChanges();
      expect(rowList().length).toBe(1); // the group IS the single root node
      const groupId = topNode().id;
      expect(topNode().members).toEqual([]);
      expect(component().selectedId()).toBe(groupId);
      expect(disabledStates()).toEqual([false, false, false]); // a GROUP arms all three
      expect(fixture.nativeElement.querySelector('.fdlg-join')).toBeTruthy();

      toolbarButtons()[0].click(); // + condition -> the group's FIRST child
      fixture.detectChanges();
      expect(rowList().length).toBe(2); // group row + nested child row
      const child = (component().memberById(groupId) as SharedFilterDialogNode).members[0];
      expect(component().selectedId()).toBe(child.id); // the child takes selection
      expect(disabledStates()).toEqual([true, true, false]); // it is a condition
      expect(rowList()[1].textContent).toContain('test.word');

      rowList()[0].click(); // back to the group: all three armed again
      fixture.detectChanges();
      expect(disabledStates()).toEqual([false, false, false]);
    });

    it('the root group node edits its join in the detail pane and emits as the case-2 root', async () => {
      await createWith({ properties: SCHEMA, root: seedDef });
      fixture.detectChanges();
      // NgModel writes its model/disabled state on a microtask.
      await fixture.whenStable();
      fixture.detectChanges();
      const joinSelect = (): HTMLElement =>
        fixture.nativeElement.querySelector('.fdlg-join mat-select');
      expect(joinSelect()).toBeTruthy();
      expect(joinSelect().getAttribute('aria-disabled')).not.toBe('true');
      expect(joinSelect().textContent).toContain('common.joinAnd');

      choose('.fdlg-join', 'common.joinOr');
      component().onSubmit();
      // Simplify unwraps the 1-member scaffold: the emitted root IS the
      // edited group (case 2), its join and members intact.
      const arg = closeSpy.mock.calls[0][0] as { root: IFilterDefinition };
      expect(arg.root.join).toBe(FilterJoinType.OR);
      expect(arg.root.conditions.length).toBe(2);
    });

    it('seeds a case-2 definition as ONE root group row with nested members', async () => {
      await createWith({ properties: SCHEMA, root: seedDef });
      fixture.detectChanges();

      // Normalized to a single top node: the root GROUP row, then enword
      // leaf, the OR group, and its two rating leaves.
      expect(rowList().length).toBe(5);
      const host: HTMLElement = fixture.nativeElement;
      const labels = Array.from(host.querySelectorAll<HTMLElement>('.fdlg-node-label'));
      expect(labels[0].textContent).toContain('common.filterGroup (common.joinAnd)');
      expect(labels[1].textContent).toContain('test.word common.opContains app');
      expect(labels[2].textContent?.trim()).toContain('(common.joinOr)');
      // The root node is selected on open -> the group join editor, and the
      // group kind arms all three toolbar buttons.
      expect(component().selectedId()).toBe(topNode().id);
      expect(fixture.nativeElement.querySelector('.fdlg-join')).toBeTruthy();
      expect(disabledStates()).toEqual([false, false, false]);
    });

    it('re-renders the tree after toolbar inserts (reference trackBy guard)', async () => {
      await createWith({ properties: SCHEMA, root: seedDef });
      fixture.detectChanges();
      expect(rowList().length).toBe(5);

      toolbarButtons()[0].click(); // +cond into the selected root group
      fixture.detectChanges();
      expect(rowList().length).toBe(6);

      // The inserted leaf holds the selection, so +group is off until the
      // root group is picked again — inserts target GROUP rows only.
      expect(toolbarButtons()[1].disabled).toBe(true);
      rowList()[0].click();
      fixture.detectChanges();
      toolbarButtons()[1].click(); // +group into the root group
      fixture.detectChanges();
      expect(rowList().length).toBe(7); // one click adds exactly one node (childless group)
    });

    it('renders the live preview uncapped', async () => {
      await createWith({ properties: SCHEMA, root: seedDef });
      fixture.detectChanges();
      const preview = fixture.nativeElement.querySelector('.fdlg-preview-expression').textContent;
      expect(preview).toContain('test.word common.opContains app');
      // rating is a numeric property, so its operator renders as a symbol.
      expect(preview).toContain('(test.rating >= 3');
    });
  });

  describe('leaf editing', () => {
    it('property switch resets the operator and value; the tree label follows', async () => {
      await createWith({ properties: SCHEMA, root: seedDef });
      fixture.detectChanges();

      rowList()[1].click(); // enword leaf (first row under the root group)
      fixture.detectChanges();
      expect(disabledStates()).toEqual([true, true, false]); // a condition: delete only

      choose('.fdlg-property', 'test.rating');

      const leaf = topNode().members[0];
      expect('propertyKey' in leaf ? leaf.propertyKey : '').toBe('rating');
      expect(component().describeNode(leaf)).not.toContain('app');
      // Root identity changed (the edit flowed through the signal).
      expect(component().previewExpression()).not.toContain('common.opContains app');
    });

    it('between shows two inputs and emits both bounds', async () => {
      await createWith({
        properties: SCHEMA,
        root: {
          join: FilterJoinType.AND,
          conditions: [
            { property: 'rating', operation: FilterOperation.GreaterOrEqual, lowValue: 2 },
            { property: 'rating', operation: FilterOperation.Equal, lowValue: 4 },
          ],
        },
      });
      fixture.detectChanges();
      rowList()[1].click(); // first rating leaf (row under the root group)
      fixture.detectChanges();

      choose('.fdlg-operator', 'common.opBetween');
      const bounds = fixture.nativeElement.querySelectorAll('.fdlg-between-bound input');
      expect(bounds.length).toBe(2);
      typeInto(bounds[0], '1');
      typeInto(bounds[1], '5');

      const leaf = topNode().members[0];
      expect('between' in leaf).toBe(true);
      component().onSubmit();
      const arg = closeSpy.mock.calls[0][0] as { root: IFilterDefinition };
      expect(arg.root.conditions[0]).toEqual({
        property: 'rating',
        operation: FilterOperation.Between,
        lowValue: 1,
        highValue: 5,
      });
    });

    it('enum renders checkboxes, multi-select emits an OR-of-Equal group with enumValues', async () => {
      await createWith({
        properties: SCHEMA,
        root: {
          join: FilterJoinType.AND,
          conditions: [
            {
              property: 'color',
              operation: FilterOperation.Equal,
              lowValue: 'red',
              enumValues: COLOR_VALUES,
            },
            { property: 'rating', operation: FilterOperation.Equal, lowValue: 4 },
          ],
        },
      });
      fixture.detectChanges();
      rowList()[1].click(); // the enum leaf (row under the root group)
      fixture.detectChanges();

      const checkboxes: NodeListOf<HTMLInputElement> = fixture.nativeElement.querySelectorAll(
        '.fdlg-choices input[type=checkbox]'
      );
      expect(checkboxes.length).toBe(2);
      expect(checkboxes[0].checked).toBe(true); // 'red' seeded

      // Check 'blue' too — the leaf now holds a two-value selection.
      checkboxes[1].click();
      fixture.detectChanges();
      const leaf = topNode().members[0];
      expect('choices' in leaf ? leaf.choices : []).toEqual(['red', 'blue']);

      component().onSubmit();
      const arg = closeSpy.mock.calls[0][0] as { root: IFilterDefinition };
      const group = arg.root.conditions[0] as IFilterDefinition;
      expect(group.join).toBe(FilterJoinType.OR);
      expect((group.conditions as IFilterCondition[]).map(c => c.lowValue)).toEqual([
        'red',
        'blue',
      ]);
      expect((group.conditions as IFilterCondition[])[0].enumValues).toBe(COLOR_VALUES);
    });

    it('custom operator hides the value editor and stays submittable', async () => {
      await createWith({ properties: SCHEMA, root: seedDef });
      fixture.detectChanges();
      rowList()[1].click(); // enword leaf (has the custom op)
      fixture.detectChanges();

      choose('.fdlg-operator', 'test.opIsPhrase');

      expect(fixture.nativeElement.querySelector('.fdlg-text input')).toBeNull();
      const leaf = topNode().members[0];
      expect('operator' in leaf ? leaf.operator : '').toBe('isPhrase');
      expect(component().canSubmit()).toBe(true); // valueless -> never missing
    });

    it('edits flow through the root signal (ancestor objects are replaced)', async () => {
      await createWith({ properties: SCHEMA, root: seedDef });
      const before = rootNode();
      const topBefore = topNode();
      const groupBefore = topBefore.members[1] as SharedFilterDialogNode;
      expect('members' in groupBefore).toBe(true);

      component().onJoinChange(groupBefore.id, FilterJoinType.AND);
      expect(rootNode()).not.toBe(before);
      const topAfter = topNode();
      expect(topAfter).not.toBe(topBefore);
      const groupAfter = topAfter.members[1] as SharedFilterDialogNode;
      expect(groupAfter).not.toBe(groupBefore);
      expect(groupAfter.join).toBe(FilterJoinType.AND);
    });
  });

  describe('validation and submit', () => {
    it('submit button reads t(submit) and tracks canSubmit live', async () => {
      await createWith({ properties: SCHEMA, root: seedDef });
      fixture.detectChanges();
      const submit = actionButtons()[1];
      expect(submit.textContent?.trim()).toBe('submit'); // mocked transloco answers with the key
      expect(submit.disabled).toBe(false);

      // Select the word leaf and wipe its text -> missing value -> Submit
      // disabled and the hint shown in the detail pane.
      rowList()[1].click();
      fixture.detectChanges();
      const input: HTMLInputElement = fixture.nativeElement.querySelector('.fdlg-text input');
      typeInto(input, '   ');
      expect(submit.disabled).toBe(true);
      expect(fixture.nativeElement.querySelector('.fdlg-error').textContent).toContain(
        'common.filterNeedsValue'
      );
    });

    it('a childless group root is flagged and blocks submit; so does the empty tree', async () => {
      await createWith({ properties: SCHEMA });
      fixture.detectChanges();
      toolbarButtons()[2].click(); // delete the case-1 node -> empty tree
      fixture.detectChanges();
      expect(component().canSubmit()).toBe(false); // case 0 — Clear Filter's job

      toolbarButtons()[1].click(); // + group -> one childless root group
      fixture.detectChanges();
      expect(rowList().length).toBe(1);
      // An empty group violates the >=2 rule, so it is flagged and blocks submit.
      expect(actionButtons()[1].disabled).toBe(true);
      expect(fixture.nativeElement.querySelector('.fdlg-node-invalid')).toBeTruthy();

      toolbarButtons()[2].click(); // delete the group -> back to the empty tree
      fixture.detectChanges();
      expect(rowList().length).toBe(0);
      expect(disabledStates()).toEqual([false, false, true]);
    });

    it('onSubmit closes with the emitted definition; onCancel closes undefined', async () => {
      await createWith({ properties: SCHEMA, root: seedDef });
      fixture.detectChanges();
      component().onSubmit();
      const arg = closeSpy.mock.calls[0][0] as { root: IFilterDefinition };
      expect(arg.root.join).toBe(FilterJoinType.AND);
      expect(arg.root.conditions.length).toBe(2);
      // prepareValue folded the string condition at emit time.
      expect((arg.root.conditions[0] as IFilterCondition).lowValue).toBe('app');

      closeSpy.mockClear();
      component().onCancel();
      expect(closeSpy).toHaveBeenCalledWith();
    });

    it('a single-condition filter submits as a BARE condition (actslib case 1)', async () => {
      await createWith({ properties: SCHEMA });
      fixture.detectChanges();
      // The dialog opens scaffolded with one BLANK condition — Submit is
      // disabled by the missing-value rule until it is filled.
      expect(component().canSubmit()).toBe(false);
      expect(actionButtons()[1].disabled).toBe(true);

      const input = fixture.nativeElement.querySelector('.fdlg-text input') as HTMLInputElement;
      expect(input).toBeTruthy();
      input.value = ' APPLE ';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(component().canSubmit()).toBe(true);
      actionButtons()[1].click();
      const arg = closeSpy.mock.calls[0][0] as { root: unknown };
      // Simplify at the boundary: the scaffold's single member leaves as the
      // bare condition (prepareValue folded the text).
      expect(arg.root).toEqual({
        property: 'enword',
        operation: FilterOperation.BeginsWith,
        lowValue: 'apple',
      });
    });

    it('a bare-condition seed renders one leaf and re-submits as the same bare condition', async () => {
      await createWith({
        properties: SCHEMA,
        root: { property: 'enword', operation: FilterOperation.Contains, lowValue: 'app' },
      });
      fixture.detectChanges();
      expect(rowList().length).toBe(1); // the one-node case-1 tree
      expect(disabledStates()).toEqual([true, true, false]);
      expect(component().canSubmit()).toBe(true);
      component().onSubmit();
      const arg = closeSpy.mock.calls[0][0] as { root: unknown };
      expect(arg.root).toEqual({ property: 'enword', operation: FilterOperation.Contains, lowValue: 'app' });
    });

    it('a 1-member group blocks submit even with its leaf filled (case 2 groups must branch)', async () => {
      await createWith({ properties: SCHEMA });
      fixture.detectChanges();
      toolbarButtons()[2].click(); // delete the case-1 node -> empty
      fixture.detectChanges();
      toolbarButtons()[1].click(); // + group
      fixture.detectChanges();
      toolbarButtons()[0].click(); // + condition -> the group's FIRST child
      fixture.detectChanges();
      expect(rowList().length).toBe(2); // group + child
      typeInto(fixture.nativeElement.querySelector('.fdlg-text input') as HTMLInputElement, 'apple');
      // The leaf is complete, but the 1-member group is the violation
      // (nested groups must branch) with its warning.
      expect(component().validation().missingValueIds).toEqual([]);
      expect(component().canSubmit()).toBe(false);
      expect(fixture.nativeElement.querySelector('.fdlg-node-warn')).toBeTruthy();
    });

    it('the depth cap disables +group below the configured maximum', async () => {
      await createWith({ properties: SCHEMA, root: seedDef, maxDepth: 2 });
      fixture.detectChanges();
      // Select the nested OR group (row 3: root group, leaf, it): inserting
      // another group would exceed the cap. The cap counts VISIBLE levels —
      // the wrapper is level 0, the root group is level 1, its children 2.
      rowList()[2].click();
      fixture.detectChanges();
      expect(component().canInsertGroup()).toBe(false);
      expect(toolbarButtons()[1].disabled).toBe(true);
    });

    it('at maxDepth 2 the root group still accepts a nested group (condA AND (condB OR condC))', async () => {
      // The contract's flagship two-level example must stay expressible at
      // the shallowest cap that describes it: root group (level 1) + one
      // nested group (level 2).
      await createWith({ properties: SCHEMA, root: seedDef, maxDepth: 2 });
      fixture.detectChanges();
      rowList()[0].click(); // the root group
      fixture.detectChanges();
      expect(component().canInsertGroup()).toBe(true);
      expect(toolbarButtons()[1].disabled).toBe(false);
    });

    it('at maxDepth 1 even the root group cannot add a nested group', async () => {
      await createWith({ properties: SCHEMA, root: seedDef, maxDepth: 1 });
      fixture.detectChanges();
      rowList()[0].click(); // the root group (visible level 1)
      fixture.detectChanges();
      expect(component().canInsertGroup()).toBe(false);
    });
  });

  describe('toolbar logic', () => {
    it('arms the buttons per the selected node kind', async () => {
      await createWith({ properties: SCHEMA, root: seedDef });
      fixture.detectChanges();

      rowList()[1].click(); // a condition leaf: delete only
      fixture.detectChanges();
      expect(disabledStates()).toEqual([true, true, false]);

      rowList()[2].click(); // a nested group (below the depth cap): all three
      fixture.detectChanges();
      expect(disabledStates()).toEqual([false, false, false]);

      rowList()[0].click(); // the root group: all three too
      fixture.detectChanges();
      expect(disabledStates()).toEqual([false, false, false]);
    });

    it('the delete button announces the selected node kind (L2)', async () => {
      await createWith({ properties: SCHEMA, root: seedDef });
      fixture.detectChanges();
      const del = () => toolbarButtons()[2];
      // The root GROUP is selected on open: the button removes a group.
      expect(del().getAttribute('aria-label')).toBe('common.removeFilterGroup');
      expect(del().getAttribute('title')).toBe('common.removeFilterGroup');
      rowList()[1].click(); // a condition leaf
      fixture.detectChanges();
      expect(del().getAttribute('aria-label')).toBe('common.removeFilterCondition');
      expect(del().getAttribute('title')).toBe('common.removeFilterCondition');
    });

    it('deleting a nested member returns the selection to its parent group', async () => {
      await createWith({ properties: SCHEMA, root: seedDef });
      fixture.detectChanges();
      const groupId = topNode().members[1].id; // the nested OR group
      rowList()[3].click(); // a rating leaf inside the OR group
      fixture.detectChanges();
      toolbarButtons()[2].click(); // delete it
      fixture.detectChanges();
      // The parent group keeps the selection (the tree is not empty), and a
      // group kind arms all three again.
      expect(component().selectedId()).toBe(groupId);
      expect(disabledStates()).toEqual([false, false, false]);
    });
  });
});
