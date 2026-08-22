import { SelectionModel } from '@angular/cdk/collections';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import type { ComponentFixture} from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { MatTableDataSource } from '@angular/material/table';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslocoModule, TranslocoService, TRANSLOCO_TRANSPILER, TRANSLOCO_MISSING_HANDLER } from '@jsverse/transloco';
import { of } from 'rxjs';

import { RatingOperatorEnum } from '../../interfaces';
import type { LearnEnglishWordFileItem, LearningContent } from '../../interfaces';

import { VocabularyExercisesWordListComponent } from './vocabulary-exercises-word-list.component';

function mockTransloco() {
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
    fixture.componentRef.setInput('wordConditions', []);
    fixture.componentRef.setInput('ratingConditions', []);
    // Do NOT call detectChanges: class-logic tests only (getters read signal
    // inputs + the mock translate); rendering *transloco is unnecessary.
  });

  it('shows "New" for the Word menu when there are no active conditions', () => {
    expect(component.hasWordFilter).toBe(false);
    expect(component.wordMenuLabel).toBe('vocabularyExercises.filterNew');
  });

  it('builds a readable Word menu summary when conditions are active', () => {
    fixture.componentRef.setInput('wordConditions', [
      { operator: 'startsWith', text: 'a' },
      { operator: 'endsWith', text: 'ing' },
    ]);
    expect(component.hasWordFilter).toBe(true);
    // The mock translate returns the full i18n key verbatim (long), so the
    // 40-char ellipsizing kicks in. In the real app the short localized
    // labels ("Starts with a; ends with ing") fit without truncation.
    expect(component.wordMenuLabel).toContain('vocabularyExercises.wordOpStartsWith a');
    expect(component.wordMenuLabel.endsWith('…')).toBe(true);
  });

  it('treats blank-text conditions as no filter', () => {
    fixture.componentRef.setInput('wordConditions', [{ operator: 'contains', text: '   ' }]);
    expect(component.hasWordFilter).toBe(false);
    expect(component.wordMenuLabel).toBe('vocabularyExercises.filterNew');
  });

  it('treats a textless phrase condition as an active filter', () => {
    fixture.componentRef.setInput('wordConditions', [{ operator: 'isPhrase', text: '' }]);
    expect(component.hasWordFilter).toBe(true);
    expect(component.wordMenuLabel).toContain('vocabularyExercises.wordOpIsPhrase');
  });

  it('shows "New" for the Rating menu when empty and a symbol summary otherwise', () => {
    expect(component.hasRatingFilter).toBe(false);
    expect(component.ratingMenuLabel).toBe('vocabularyExercises.filterNew');
    fixture.componentRef.setInput('ratingConditions', [
      { operator: RatingOperatorEnum.LargerOrEquals, value: 3 },
    ]);
    expect(component.hasRatingFilter).toBe(true);
    expect(component.ratingMenuLabel).toBe('>=3');
  });

  it('emits freeTextChanged with the local freeText value', () => {
    const spy = vi.spyOn(component.freeTextChanged, 'emit');
    component.freeText = 'abc';
    component.onFreeTextChanged();
    expect(spy).toHaveBeenCalledWith('abc');
  });

  it('emits the quickSelect mode', () => {
    const spy = vi.spyOn(component.quickSelect, 'emit');
    component.quickSelect.emit('random');
    expect(spy).toHaveBeenCalledWith('random');
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

  describe('rating toggle disabling for temp content (L2)', () => {
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

    it('enables the rating toggles for persisted content (studyContentId > 0)', () => {
      setupRatingsEnabled(true);
      const buttons = Array.from(
        fixture.nativeElement.querySelectorAll('mat-button-toggle button')
      ) as HTMLButtonElement[];
      expect(buttons.length).toBe(5);
      buttons.forEach(btn => expect(btn.disabled).toBe(false));
    });

    it('disables the rating toggles for temp content (non-positive studyContentId)', () => {
      setupRatingsEnabled(false);
      // Disabling each toggle (rather than the group, whose [disabled] the
      // [ngModel] form control overrides via setDisabledState) prevents
      // clicking a phantom rating the server cannot persist.
      const buttons = Array.from(
        fixture.nativeElement.querySelectorAll('mat-button-toggle button')
      ) as HTMLButtonElement[];
      expect(buttons.length).toBe(5);
      buttons.forEach(btn => expect(btn.disabled).toBe(true));
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
