import { SelectionModel } from '@angular/cdk/collections';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import type { ComponentFixture} from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { MatTableDataSource } from '@angular/material/table';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslocoModule, TranslocoService, TRANSLOCO_TRANSPILER, TRANSLOCO_MISSING_HANDLER } from '@jsverse/transloco';
import { FilterJoinType, FilterOperation } from 'actslib';
import type { IFilterCondition, IFilterDefinition } from 'actslib';
import { of } from 'rxjs';

import { VOCABULARY_IS_PHRASE } from '../../interfaces';
import type { LearnEnglishWordFileItem, LearningContent } from '../../interfaces';

import { VocabularyExercisesWordListComponent } from './vocabulary-exercises-word-list.component';

// cond/andG/orG build the actslib definition the filter input now carries.
const cond = (property: string, operation: FilterOperation, lowValue: string | number): IFilterCondition => ({
  property,
  operation,
  lowValue,
});
const andG = (...conditions: Array<IFilterCondition | IFilterDefinition>): IFilterDefinition => ({
  join: FilterJoinType.AND,
  conditions,
});
const orG = (...conditions: Array<IFilterCondition | IFilterDefinition>): IFilterDefinition => ({
  join: FilterJoinType.OR,
  conditions,
});

function mockTransloco() {
  return {
    setActiveLang: vi.fn(),
    getActiveLang: vi.fn(),
    selectTranslate: vi.fn().mockReturnValue(of('')),
    _loadDependencies: vi.fn().mockReturnValue(of(null)),
    // Returns the key's last dot-segment as the "label": short enough that
    // the filter summary stays under the 40-char ellipsis, keeping the
    // summary assertions readable (single-segment keys pass through).
    translate: vi.fn((key: string) => key.split('.').pop() ?? key),
    activeLang: 'en',
    config: { reRenderOnLangChange: true, prodMode: false },
    langChanges$: of('en'),
    events$: of(),
  };
}

describe('VocabularyExercisesWordListComponent', () => {
  let fixture: ComponentFixture<VocabularyExercisesWordListComponent>;
  let component: VocabularyExercisesWordListComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VocabularyExercisesWordListComponent, TranslocoModule, NoopAnimationsModule],
      providers: [
        { provide: TranslocoService, useValue: mockTransloco() },
        { provide: TRANSLOCO_TRANSPILER, useValue: {} },
        { provide: TRANSLOCO_MISSING_HANDLER, useValue: {} },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(VocabularyExercisesWordListComponent);
    component = fixture.componentInstance;
    // Required signal inputs must be set before any read.
    fixture.componentRef.setInput('allFiles', [] as LearningContent[]);
    fixture.componentRef.setInput('selectedFile', undefined);
    fixture.componentRef.setInput('isLoadingContents', false);
    fixture.componentRef.setInput('dataSource', new MatTableDataSource<LearnEnglishWordFileItem>([]));
    fixture.componentRef.setInput('selection', new SelectionModel<LearnEnglishWordFileItem>(true, []));
    fixture.componentRef.setInput('contentRatings', new Map<number, number>());
    fixture.componentRef.setInput('filterDefinition', andG());
    // Do NOT call detectChanges: class-logic tests only (getters read signal
    // inputs + the mock translate); rendering *transloco is unnecessary.
  });

  it('shows "New" for the Filter menu when there are no active conditions', () => {
    expect(component.hasFilter).toBe(false);
    expect(component.filterMenuLabel).toBe('filterNew');
  });

  it('builds a readable Filter menu summary when conditions are active', () => {
    fixture.componentRef.setInput('filterDefinition', andG(cond('enword', FilterOperation.BeginsWith, 'a')));
    expect(component.hasFilter).toBe(true);
    expect(component.filterMenuLabel).toBe('word opStartsWith a');
  });

  it('labels cnword conditions with the Chinese field name', () => {
    fixture.componentRef.setInput('filterDefinition', andG(cond('cnword', FilterOperation.Contains, '苹果')));
    expect(component.filterMenuLabel).toBe('chinese opContains 苹果');
  });

  it('treats a textless phrase condition as an active filter', () => {
    fixture.componentRef.setInput('filterDefinition', andG(VOCABULARY_IS_PHRASE.emit('enword')));
    expect(component.hasFilter).toBe(true);
    expect(component.filterMenuLabel).toBe('word wordOpIsPhrase');
  });

  it('joins word and rating leaves with the group join word in one summary', () => {
    fixture.componentRef.setInput('filterDefinition', andG(
      cond('enword', FilterOperation.BeginsWith, 'a'),
      cond('rating', FilterOperation.GreaterOrEqual, 3),
    ));
    // Numeric properties render comparison operators as symbols; the join word
    // is translated (mock returns the key's last segment).
    expect(component.hasFilter).toBe(true);
    expect(component.filterMenuLabel).toBe('word opStartsWith a joinAnd rating >= 3');
  });

  it('shows the OR join word for an OR-joined group', () => {
    fixture.componentRef.setInput('filterDefinition', orG(
      cond('enword', FilterOperation.BeginsWith, 'a'),
      cond('rating', FilterOperation.Equal, 5),
    ));
    expect(component.filterMenuLabel).toBe('word opStartsWith a joinOr rating = 5');
  });

  it('wraps nested multi-member groups in parentheses in the menu summary', () => {
    fixture.componentRef.setInput('filterDefinition', orG(
      andG(
        cond('enword', FilterOperation.Equal, 'a'),
        cond('enword', FilterOperation.Equal, 'b'),
      ),
    ));
    expect(component.filterMenuLabel).toBe('(word opEqual a joinAnd word opEqual b)');
  });

  it('shows a rating-only summary when no vocabulary condition is active', () => {
    fixture.componentRef.setInput('filterDefinition', andG(cond('rating', FilterOperation.GreaterOrEqual, 3)));
    expect(component.hasFilter).toBe(true);
    expect(component.filterMenuLabel).toBe('rating >= 3');
  });

  it('emits freeTextChanged with the local freeText value', () => {
    const spy = vi.spyOn(component.freeTextChanged, 'emit');
    component.freeText = 'abc';
    component.onFreeTextChanged('abc');
    expect(spy).toHaveBeenCalledWith('abc');
  });

  it('suppresses free-text emission while an IME composition is in progress', () => {
    const spy = vi.spyOn(component.freeTextChanged, 'emit');
    component.onCompositionStart();
    component.onFreeTextChanged('pin');
    expect(spy).not.toHaveBeenCalled();

    component.onCompositionEnd('拼音');
    expect(spy).toHaveBeenCalledWith('拼音');
  });

  it('emits the quickSelect mode', () => {
    const spy = vi.spyOn(component.quickSelect, 'emit');
    component.quickSelect.emit('random');
    expect(spy).toHaveBeenCalledWith('random');
  });

  it('emits the clearSelection intent', () => {
    const spy = vi.spyOn(component.clearSelection, 'emit');
    component.clearSelection.emit();
    expect(spy).toHaveBeenCalled();
  });

  it('emits the dictation intent', () => {
    const spy = vi.spyOn(component.dictation, 'emit');
    component.dictation.emit();
    expect(spy).toHaveBeenCalled();
  });

  describe('free-text box seeding (M3)', () => {
    it('seeds the filter box from the applied free text when the list screen initializes', () => {
      fixture.componentRef.setInput('appliedFreeText', 'hello');

      component.ngOnInit();

      expect(component.freeText).toBe('hello');
    });

    it('starts with an empty box when no filter is applied', () => {
      component.ngOnInit();

      expect(component.freeText).toBe('');
    });
  });

  describe('selectionCount seeding (L1)', () => {
    const rows: LearnEnglishWordFileItem[] = [
      { id: 1, enword: 'hello', cnword: '你好' },
      { id: 2, enword: 'world', cnword: '世界' },
      { id: 3, enword: 'test', cnword: '测试' },
    ];

    it('seeds the count from the live selection on init (not 0 until the next change)', () => {
      // A screen re-created after a session inherits a SelectionModel with
      // rows already checked; selection.changed only fires on the NEXT change,
      // so the count must be seeded from the model on init.
      const selection = new SelectionModel<LearnEnglishWordFileItem>(true, [rows[0], rows[2]]);
      fixture.componentRef.setInput('selection', selection);

      component.ngOnInit();

      expect(component.selectionCount()).toBe(2);
    });

    it('still mirrors later selection changes after seeding', () => {
      const selection = new SelectionModel<LearnEnglishWordFileItem>(true, [rows[0]]);
      fixture.componentRef.setInput('selection', selection);
      component.ngOnInit();
      expect(component.selectionCount()).toBe(1);

      selection.select(rows[1]);
      expect(component.selectionCount()).toBe(2);

      selection.clear();
      expect(component.selectionCount()).toBe(0);
    });
  });

  describe('rating column visibility for temp content (L2)', () => {
    const rows: LearnEnglishWordFileItem[] = [
      { id: 1, enword: 'hello', cnword: '你好' },
    ];

    function setupRatingsEnabled(enabled: boolean): void {
      const dataSource = new MatTableDataSource<LearnEnglishWordFileItem>(rows.slice());
      fixture.componentRef.setInput('dataSource', dataSource);
      fixture.componentRef.setInput('contentRatings', new Map<number, number>([[1, 3]]));
      fixture.componentRef.setInput('ratingsEnabled', enabled);
      fixture.detectChanges();
    }

    // The mock TranslocoService returns the key verbatim, so the header cell
    // text is exactly 'rating'. (nativeElement is untyped here: pass an
    // explicit element type to the mapper rather than a selector generic.)
    const ratingHeaderCellCount = (): number =>
      Array.from(
        fixture.nativeElement.querySelectorAll('th'),
        (th: Element) => th.textContent?.trim() ?? ''
      ).filter(text => text === 'rating').length;
    const ratingToggleCount = (): number =>
      fixture.nativeElement.querySelectorAll('mat-button-toggle button').length;

    it('renders the rating column for persisted content (studyContentId > 0)', () => {
      setupRatingsEnabled(true);
      expect(ratingHeaderCellCount()).toBe(1);
      expect(component.displayedColumns).toContain('rating');
      expect(ratingToggleCount()).toBe(5);
    });

    it('hides the rating column entirely for temp content (non-positive studyContentId)', () => {
      // Temp uploads cannot persist ratings: no value is displayed and no
      // toggle can latch a phantom rating, so the whole column disappears.
      setupRatingsEnabled(false);
      expect(ratingHeaderCellCount()).toBe(0);
      expect(ratingToggleCount()).toBe(0);
      expect(component.displayedColumns).not.toContain('rating');
    });
  });

  describe('isAllSelected (header checkbox semantics, M1)', () => {
    const rows: LearnEnglishWordFileItem[] = [
      { id: 1, enword: 'hello', cnword: '你好' },
      { id: 2, enword: 'world', cnword: '世界' },
      { id: 3, enword: 'test', cnword: '测试' },
    ];

    // Filtered table: only 'test' is visible, mirroring the container's
    // free-text filter pipeline (JSON filter string + predicate).
    function setupFilteredTable(selectedRows: LearnEnglishWordFileItem[]): void {
      const dataSource = new MatTableDataSource<LearnEnglishWordFileItem>(rows.slice());
      dataSource.filterPredicate = (data: LearnEnglishWordFileItem) => data.enword === 'test';
      dataSource.filter = 'active';
      fixture.componentRef.setInput('dataSource', dataSource);
      fixture.componentRef.setInput(
        'selection',
        new SelectionModel<LearnEnglishWordFileItem>(true, selectedRows)
      );
    }

    it('is false when only rows hidden by the filter are selected', () => {
      // Selected count (1) equals visible count (1) — the old count-only
      // comparison reported "all selected" here.
      setupFilteredTable([rows[0]]);

      expect(component.isAllSelected()).toBe(false);
    });

    it('is true when every visible row is selected even if hidden rows are also selected', () => {
      setupFilteredTable([rows[0], rows[2]]);

      expect(component.isAllSelected()).toBe(true);
    });

    it('is false when the table has no visible rows', () => {
      setupFilteredTable([]);
      fixture.componentRef.setInput(
        'dataSource',
        new MatTableDataSource<LearnEnglishWordFileItem>([])
      );

      expect(component.isAllSelected()).toBe(false);
    });
  });
});
