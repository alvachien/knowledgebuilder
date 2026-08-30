import { provideHttpClient } from '@angular/common/http';
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


import type { FilterDialogData, FilterableProperty } from './filter-dialog-model';
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
  emit: (property: string): IFilterCondition => ({ property, operation: FilterOperation.Contains, lowValue: ' ' }),
  recognize: (c: IFilterCondition): boolean => c.operation === FilterOperation.Contains && c.lowValue === ' ',
};

const SCHEMA: FilterableProperty[] = [
  { key: 'enword', labelKey: 'test.word', kind: 'string', customOperators: [IS_PHRASE],
    prepareValue: v => String(v).trim().toLowerCase() },
  { key: 'rating', labelKey: 'test.rating', kind: 'number' },
  { key: 'color', labelKey: 'test.color', kind: 'enum', enumValues: COLOR_VALUES,
    choices: [
      { value: 'red', labelKey: 'test.red' },
      { value: 'blue', labelKey: 'test.blue' },
    ] },
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
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(SharedFilterDialogComponent);
  }

  const component = () => fixture.componentInstance;
  const rootNode = () => component().root();
  const rows = () => fixture.nativeElement.querySelectorAll('.fdlg-node-row');
  const toolbarButtons = () =>
    fixture.nativeElement.querySelectorAll('.fdlg-tree-toolbar button') as NodeListOf<HTMLButtonElement>;
  const actionButtons = () =>
    fixture.nativeElement.querySelectorAll('mat-dialog-actions button') as NodeListOf<HTMLButtonElement>;

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
    const option = Array.from(document.querySelectorAll<HTMLElement>('mat-option')).find(
      o => o.textContent?.includes(optionText)
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
    it('seeds the tree: rows, labels and the root selected in the detail pane', async () => {
      await createWith({ properties: SCHEMA, root: seedDef });
      fixture.detectChanges();

      // The seed has root(1) + enword leaf(1) + group(1) + two rating leaves(2) = 5 rows.
      expect(rows().length).toBe(5);
      const host: HTMLElement = fixture.nativeElement;
      const labels = Array.from(host.querySelectorAll<HTMLElement>('.fdlg-node-label'));
      // Row order: [0] root group, [1] enword leaf, [2] OR group, [3]+[4] its leaves.
      expect(labels[0].textContent).toContain('common.filterGroup (common.joinAnd)');
      expect(labels[1].textContent).toContain('test.word common.opContains app');
      expect(labels[2].textContent?.trim()).toContain('(common.joinOr)');
      // Root selected initially -> group editor (join select) shows.
      expect(fixture.nativeElement.querySelector('.fdlg-join')).toBeTruthy();
    });

    it('re-renders the tree after toolbar inserts (reference trackBy guard)', async () => {
      await createWith({ properties: SCHEMA, root: seedDef });
      fixture.detectChanges();
      expect(rows().length).toBe(5);

      toolbarButtons()[0].click(); // +cond
      fixture.detectChanges();
      expect(rows().length).toBe(6);

      toolbarButtons()[1].click(); // +group (root still reachable via the new leaf's parent)
      fixture.detectChanges();
      expect(rows().length).toBe(8); // group node + its default row
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
      const wordRow: NodeListOf<HTMLElement> = rows();
      wordRow[1].click(); // enword leaf
      fixture.detectChanges();

      choose('.fdlg-property', 'test.rating');

      const leaf = rootNode().members[0];
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
      const wordRow: NodeListOf<HTMLElement> = rows();
      wordRow[1].click(); // first rating leaf
      fixture.detectChanges();

      choose('.fdlg-operator', 'common.opBetween');
      const bounds = fixture.nativeElement.querySelectorAll('.fdlg-between-bound input');
      expect(bounds.length).toBe(2);
      typeInto(bounds[0], '1');
      typeInto(bounds[1], '5');

      const leaf = rootNode().members[0];
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
            { property: 'color', operation: FilterOperation.Equal, lowValue: 'red', enumValues: COLOR_VALUES },
            { property: 'rating', operation: FilterOperation.Equal, lowValue: 4 },
          ],
        },
      });
      fixture.detectChanges();
      const firstRow: NodeListOf<HTMLElement> = rows();
      firstRow[1].click(); // the enum leaf
      fixture.detectChanges();

      const checkboxes: NodeListOf<HTMLInputElement> = fixture.nativeElement.querySelectorAll('.fdlg-choices input[type=checkbox]');
      expect(checkboxes.length).toBe(2);
      expect((checkboxes[0]).checked).toBe(true); // 'red' seeded

      // Check 'blue' too — the leaf now holds a two-value selection.
      checkboxes[1].click();
      fixture.detectChanges();
      const leaf = rootNode().members[0];
      expect('choices' in leaf ? leaf.choices : []).toEqual(['red', 'blue']);

      component().onSubmit();
      const arg = closeSpy.mock.calls[0][0] as { root: IFilterDefinition };
      const group = arg.root.conditions[0] as IFilterDefinition;
      expect(group.join).toBe(FilterJoinType.OR);
      expect((group.conditions as IFilterCondition[]).map(c => c.lowValue)).toEqual(['red', 'blue']);
      expect((group.conditions as IFilterCondition[])[0].enumValues).toBe(COLOR_VALUES);
    });

    it('custom operator hides the value editor and stays submittable', async () => {
      await createWith({ properties: SCHEMA, root: seedDef });
      fixture.detectChanges();
      const firstRow: NodeListOf<HTMLElement> = rows();
      firstRow[1].click(); // enword leaf (has the custom op)
      fixture.detectChanges();

      choose('.fdlg-operator', 'test.opIsPhrase');

      expect(fixture.nativeElement.querySelector('.fdlg-text input')).toBeNull();
      const leaf = rootNode().members[0];
      expect('operator' in leaf ? leaf.operator : '').toBe('isPhrase');
      expect(component().canSubmit()).toBe(true); // valueless -> never missing
    });

    it('edits flow through the root signal (ancestor objects are replaced)', async () => {
      await createWith({ properties: SCHEMA, root: seedDef });
      const before = rootNode();
      const groupBefore = before.members[1];
      expect('members' in groupBefore).toBe(true);

      component().onJoinChange((groupBefore as { id: number }).id, FilterJoinType.AND);
      expect(rootNode()).not.toBe(before);
      const groupAfter = rootNode().members[1];
      expect(groupAfter).not.toBe(groupBefore);
      expect('join' in groupAfter ? groupAfter.join : '').toBe(FilterJoinType.AND);
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
      (rows() as NodeListOf<HTMLElement>)[1].click();
      fixture.detectChanges();
      const input: HTMLInputElement = fixture.nativeElement.querySelector('.fdlg-text input');
      typeInto(input, '   ');
      expect(submit.disabled).toBe(true);
      expect(fixture.nativeElement.querySelector('.fdlg-error').textContent).toContain('common.filterNeedsValue');
    });

    it('an empty nested group is flagged and blocks submit; the root is exempt', async () => {
      await createWith({
        properties: SCHEMA,
        root: { join: FilterJoinType.AND, conditions: [{ property: 'rating', operation: FilterOperation.Equal, lowValue: 2 }] },
      });
      fixture.detectChanges();

      // Insert a group (starts with one row, so it is already invalid).
      toolbarButtons()[1].click();
      fixture.detectChanges();
      expect(actionButtons()[1].disabled).toBe(true);
      expect(fixture.nativeElement.querySelector('.fdlg-node-invalid')).toBeTruthy();
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

    it('the depth cap disables +group below the configured maximum', async () => {
      await createWith({ properties: SCHEMA, root: seedDef, maxDepth: 2 });
      fixture.detectChanges();
      // Select the nested group (level 2): inserting another group would exceed the cap.
      const firstRow: NodeListOf<HTMLElement> = rows();
      firstRow[2].click();
      fixture.detectChanges();
      expect(component().canInsertGroup()).toBe(false);
      expect(toolbarButtons()[1].disabled).toBe(true);
    });
  });
});
