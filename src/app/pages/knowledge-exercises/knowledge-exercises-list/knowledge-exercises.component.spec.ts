import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import {
  TranslocoService,
  TRANSLOCO_TRANSPILER,
  TRANSLOCO_MISSING_HANDLER,
  TRANSLOCO_INTERCEPTOR,
} from '@jsverse/transloco';
import { FilterJoinType, FilterOperation, type IFilterDefinition } from 'actslib';
import { Subject, of, throwError } from 'rxjs';
import { vi } from 'vitest';

import type { KnowledgeExerciseFileContent, LearningContent } from '../../../interfaces';
import {
  QuestionBankTypeEnum,
  SelectionModeEnum,
} from '../../../interfaces';
import { LearningContentService, UIService } from '../../../services';
import { LearningRatingService } from '../../../services/learning-rating.service';
import { SharedFilterDialogComponent } from '../../../shared/filter-dialog';
import { AppPageTitle } from '../../page-title/page-title';

import { KnowledgeExercisesPrintOptionsDialogComponent } from './knowledge-exercises-printoptions-dialog.component';
import { KnowledgeExercisesSelectDialogComponent } from './knowledge-exercises-select-dialog.component';
import { KnowledgeExercisesComponent } from './knowledge-exercises.component';

const mockLearningContents: LearningContent[] = [
  { id: 1, categoryId: 6, nameEnglish: 'File1', nameChinese: '文件一', fileUrl: 'data/file1.json' },
  { id: 2, categoryId: 6, nameEnglish: 'File2', nameChinese: '文件二', fileUrl: 'data/file2.json' },
];

const mockItems: KnowledgeExerciseFileContent[] = [
  {
    id: '1',
    order: 1,
    itemType: QuestionBankTypeEnum.SingleChoice,
    question: 'What is 1+1?',
    options: { A: '1', B: '2', C: '3', D: '4' },
    answer: 'B',
    tags: ['math'],
    itemTypeString: '单选题',
    hasAnswer: true,
    difficulty: 2,
    suggestedCompletionTime: 5,
  },
  {
    id: '2',
    order: 2,
    itemType: QuestionBankTypeEnum.TrueFalse,
    question: 'The sky is blue',
    answer: '1',
    itemTypeString: '判断题',
    hasAnswer: true,
    extraInfo: ['Background note'],
  },
];

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

describe('KnowledgeExercisesComponent', () => {
  let component: KnowledgeExercisesComponent;
  let fixture: ComponentFixture<KnowledgeExercisesComponent>;
  let mockLearningContentService: any;
  let mockUIService: any;
  let mockRouter: any;
  let mockDialog: any;
  let mockRatingService: any;

  beforeEach(async () => {
    mockLearningContentService = {
      getKnowledgeBankContents: vi.fn().mockReturnValue(of(mockLearningContents)),
      getKnowledgeExerciseContent: vi.fn(),
      getStorageFileBaseUrl: vi.fn().mockReturnValue('https://test/api/Storage/knowledge-exercises/'),
    };
    mockUIService = { setSelectedExerciseItem: vi.fn() };
    mockRouter = { navigate: vi.fn() };
    mockDialog = { open: vi.fn() };
    mockRatingService = { getRatings: vi.fn().mockReturnValue(of([])), upsertRating: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [KnowledgeExercisesComponent, NoopAnimationsModule],
      providers: [
        { provide: LearningContentService, useValue: mockLearningContentService },
        { provide: UIService, useValue: mockUIService },
        { provide: Router, useValue: mockRouter },
        { provide: MatDialog, useValue: mockDialog },
        { provide: LearningRatingService, useValue: mockRatingService },
        { provide: AppPageTitle, useValue: { title: '' } as AppPageTitle },
        { provide: TranslocoService, useValue: mockTranslocoService() },
        { provide: TRANSLOCO_TRANSPILER, useValue: {} },
        { provide: TRANSLOCO_MISSING_HANDLER, useValue: {} },
        { provide: TRANSLOCO_INTERCEPTOR, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(KnowledgeExercisesComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should set page title to Exercises', () => {
      fixture.detectChanges();
      expect(component.pageTitle.title).toBe('Exercises');
    });

    it('should load all data files on initialization', () => {
      fixture.detectChanges();
      expect(mockLearningContentService.getKnowledgeBankContents).toHaveBeenCalled();
      expect(component.allFiles()).toEqual(mockLearningContents);
      expect(component.isLoadingContents()).toBe(false);
    });

    it('should handle error when loading data files fails', () => {
      mockLearningContentService.getKnowledgeBankContents.mockReturnValue(
        throwError(() => new Error('Load failed'))
      );
      vi.spyOn(console, 'error').mockImplementation(() => {});

      fixture.detectChanges();

      expect(console.error).toHaveBeenCalled();
      expect(component.isLoadingContents()).toBe(false);
    });
  });

  describe('onFileSelectionChanged', () => {
    it('should load file content when file is selected', () => {
      mockLearningContentService.getKnowledgeExerciseContent.mockReturnValue(of(mockItems));

      component.onFileSelectionChanged({ value: mockLearningContents[0] } as any);

      expect(mockLearningContentService.getKnowledgeExerciseContent).toHaveBeenCalledWith('data/file1.json');
      expect(component.dataSource.data).toEqual(mockItems);
    });

    it('should compute the image base url for the selected file', () => {
      mockLearningContentService.getKnowledgeExerciseContent.mockReturnValue(of(mockItems));

      component.onFileSelectionChanged({ value: mockLearningContents[0] } as any);

      expect(component.currentImageBaseUrl).toBe('https://test/api/Storage/knowledge-exercises/');
    });

    it('should clear any existing selection when switching files', () => {
      mockLearningContentService.getKnowledgeExerciseContent.mockReturnValue(of(mockItems));
      component.dataSource.data = mockItems.slice();
      component.selection.select(mockItems[0]);
      expect(component.selection.selected.length).toBe(1);

      component.onFileSelectionChanged({ value: mockLearningContents[0] } as any);

      expect(component.selection.isEmpty()).toBe(true);
    });

    it('should handle undefined file selection by clearing state', () => {
      component.studyContentId = 5;
      component.dataSource.data = mockItems.slice();

      component.onFileSelectionChanged({ value: undefined } as any);

      expect(component.dataSource.data.length).toBe(0);
      expect(component.studyContentId).toBe(0);
    });

    it('should load ratings for the selected content and force a re-filter', () => {
      mockLearningContentService.getKnowledgeExerciseContent.mockReturnValue(of(mockItems));
      mockRatingService.getRatings.mockReturnValue(
        of([{ id: 1, contentId: 1, itemId: 2, rating: 4 }])
      );
      component.onFreeTextChanged('sky');

      component.onFileSelectionChanged({ value: mockLearningContents[0] } as any);

      expect(mockRatingService.getRatings).toHaveBeenCalledWith(1);
      expect(component.getRating('2')).toBe(4);
      // The filter re-runs after ratings arrive: the row still matches the
      // free text and nothing else.
      expect(component.dataSource.filteredData.length).toBe(1);
    });

    it('should clear data and content id when file content fails to load', () => {
      mockLearningContentService.getKnowledgeExerciseContent.mockReturnValue(
        throwError(() => new Error('Load failed'))
      );
      vi.spyOn(console, 'error').mockImplementation(() => {});

      component.onFileSelectionChanged({ value: mockLearningContents[0] } as any);

      expect(component.dataSource.data.length).toBe(0);
      expect(component.studyContentId).toBe(0);
    });

    it('should ignore stale content loads after a rapid file switch', () => {
      // First selection: a controllable observable that emits when we decide.
      const firstLoad$ = new Subject<KnowledgeExerciseFileContent[]>();
      mockLearningContentService.getKnowledgeExerciseContent
        .mockReturnValueOnce(firstLoad$.asObservable())
        .mockReturnValueOnce(of(mockItems));

      component.onFileSelectionChanged({ value: mockLearningContents[0] } as any);
      component.onFileSelectionChanged({ value: mockLearningContents[1] } as any);
      // The stale load resolves after the second selection has won.
      firstLoad$.next([mockItems[0]]);

      expect(component.dataSource.data).toEqual(mockItems);
    });

    it('should ignore rating clicks on stale rows while the new file is loading', () => {
      component.studyContentId = 99; // previously loaded file
      const content$ = new Subject<KnowledgeExerciseFileContent[]>();
      mockLearningContentService.getKnowledgeExerciseContent.mockReturnValue(content$);
      const event: any = {
        value: 3,
        source: { value: undefined, buttonToggleGroup: { value: 3 } },
      };

      component.onFileSelectionChanged({ value: mockLearningContents[0] } as any);

      // The old file's rows are still on screen: rating writes are disabled
      // so a click cannot upsert (newContentId, oldItemId).
      expect(component.studyContentId).toBe(0);
      component.onContentRatingChanged(mockItems[0], event);
      expect(mockRatingService.upsertRating).not.toHaveBeenCalled();

      // Once the new rows are displayed, rating is allowed again.
      content$.next(mockItems);
      expect(component.studyContentId).toBe(1);
    });

    it('should keep locally applied ratings when a stale getRatings response lands', () => {
      const content$ = new Subject<KnowledgeExerciseFileContent[]>();
      const ratings$ = new Subject<{ itemId: number; rating: number }[]>();
      mockLearningContentService.getKnowledgeExerciseContent.mockReturnValue(content$);
      mockRatingService.getRatings.mockReturnValue(ratings$);
      // The upsert stays in flight (never completes in this test).
      mockRatingService.upsertRating.mockReturnValue(new Subject());

      component.onFileSelectionChanged({ value: mockLearningContents[0] } as any);
      content$.next(mockItems);

      const event: any = {
        value: 4,
        source: { value: undefined, buttonToggleGroup: { value: 4 } },
      };
      component.onContentRatingChanged(mockItems[0], event);
      expect(mockRatingService.upsertRating).toHaveBeenCalledWith(1, 1, 4);

      // A server snapshot computed *before* the click arrives late and empty.
      ratings$.next([]);

      // The in-flight rating survives the map rebuild instead of visually
      // reverting to the stale server state.
      expect(component.getRating('1')).toBe(4);
    });
  });

  describe('filter pipeline', () => {
    beforeEach(() => {
      component.dataSource.data = mockItems.slice();
    });

    it('should apply live free text as a JSON filter and filter rows', () => {
      component.onFreeTextChanged('sky');

      expect(component.dataSource.filter).toContain('sky');
      expect(component.dataSource.filteredData.length).toBe(1);
    });

    it('should match every whitespace-separated term (AND semantics)', () => {
      component.onFreeTextChanged('sky blue');
      expect(component.dataSource.filteredData.length).toBe(1);

      component.onFreeTextChanged('sky missing');
      expect(component.dataSource.filteredData.length).toBe(0);
    });

    it('should restore all rows when free text is cleared', () => {
      component.onFreeTextChanged('sky');
      component.onFreeTextChanged('');

      expect(component.dataSource.filter).toBe('');
      expect(component.dataSource.filteredData.length).toBe(2);
    });

    /** Wrap conditions in an AND root, as the shared dialog emits them. */
    const andRoot = (
      ...conditions: IFilterDefinition['conditions']
    ): IFilterDefinition => ({ join: FilterJoinType.AND, conditions });

    it('should apply conditions emitted by the shared filter dialog on submit', () => {
      const mockDialogRef = { afterClosed: vi.fn().mockReturnValue(
        of({ root: andRoot({ property: 'tags', operation: FilterOperation.Contains, lowValue: 'math' }) })
      ) };
      mockDialog.open.mockReturnValue(mockDialogRef);

      component.onDefineFilter();

      expect(mockDialog.open).toHaveBeenCalledWith(SharedFilterDialogComponent, expect.anything());
      expect(component.dataSource.filteredData.length).toBe(1);
      expect(component.dataSource.filteredData[0].id).toBe('1');
    });

    it('should seed the dialog with the current definition', () => {
      const seed = andRoot({ property: 'id', operation: FilterOperation.Equal, lowValue: '1' });
      component.filterDefinition.set(seed);
      const mockDialogRef = { afterClosed: vi.fn().mockReturnValue(of(undefined)) };
      mockDialog.open.mockReturnValue(mockDialogRef);

      component.onDefineFilter();

      expect(mockDialog.open).toHaveBeenCalledWith(
        SharedFilterDialogComponent,
        expect.objectContaining({
          data: expect.objectContaining({ root: seed }),
        })
      );
    });

    it('should leave the filter untouched when the dialog is cancelled', () => {
      const mockDialogRef = { afterClosed: vi.fn().mockReturnValue(of(undefined)) };
      mockDialog.open.mockReturnValue(mockDialogRef);

      component.onDefineFilter();

      expect(component.dataSource.filter).toBe('');
      expect(component.dataSource.filteredData.length).toBe(2);
    });

    it('should apply the itemType OR-of-Equal group from the enum multi-select', () => {
      const mockDialogRef = { afterClosed: vi.fn().mockReturnValue(
        of({
          root: andRoot({
            join: FilterJoinType.OR,
            conditions: [
              { property: 'itemType', operation: FilterOperation.Equal, lowValue: QuestionBankTypeEnum.TrueFalse, enumValues: QuestionBankTypeEnum },
              { property: 'itemType', operation: FilterOperation.Equal, lowValue: QuestionBankTypeEnum.Essay, enumValues: QuestionBankTypeEnum },
            ],
          }),
        })
      ) };
      mockDialog.open.mockReturnValue(mockDialogRef);

      component.onDefineFilter();

      // Only the TrueFalse row matches; Essay matches nothing here.
      expect(component.dataSource.filteredData.length).toBe(1);
      expect(component.dataSource.filteredData[0].id).toBe('2');
    });

    it('should apply rating conditions with unrated (0) semantics', () => {
      component.contentRatingMap.set(new Map([[2, 5]]));
      const mockDialogRef = { afterClosed: vi.fn().mockReturnValue(
        of({ root: andRoot({ property: 'rating', operation: FilterOperation.LessThan, lowValue: 1 }) })
      ) };
      mockDialog.open.mockReturnValue(mockDialogRef);

      component.onDefineFilter();

      // Only the unrated row (rating 0 < 1) survives.
      expect(component.dataSource.filteredData.length).toBe(1);
      expect(component.dataSource.filteredData[0].id).toBe('1');
    });

    it('should clear all conditions', () => {
      component.contentRatingMap.set(new Map([[2, 5]]));
      const mockDialogRef = { afterClosed: vi.fn().mockReturnValue(
        of({
          root: andRoot(
            { property: 'tags', operation: FilterOperation.Contains, lowValue: 'math' },
            { property: 'rating', operation: FilterOperation.LessThan, lowValue: 1 }
          ),
        })
      ) };
      mockDialog.open.mockReturnValue(mockDialogRef);
      component.onDefineFilter();
      expect(component.dataSource.filteredData.length).toBe(1);

      component.onClearFilter();

      expect(component.dataSource.filter).toBe('');
      expect(component.dataSource.filteredData.length).toBe(2);
    });
  });

  describe('selection methods', () => {
    beforeEach(() => {
      component.dataSource.data = mockItems.slice();
    });

    it('isAllSelected should return true when all visible rows are selected', () => {
      component.selection.select(...mockItems);
      expect(component.isAllSelected()).toBe(true);
    });

    it('isAllSelected should return false when not all selected', () => {
      component.selection.select(mockItems[0]);
      expect(component.isAllSelected()).toBe(false);
    });

    it('toggleAllRows should select all when not all selected', () => {
      component.toggleAllRows();
      expect(component.selection.selected.length).toBe(mockItems.length);
    });

    it('toggleAllRows should clear selection when all selected', () => {
      component.selection.select(...mockItems);
      component.toggleAllRows();
      expect(component.selection.selected.length).toBe(0);
    });

    it('toggleAllRows should scope to visible rows when a filter is active', () => {
      component.onFreeTextChanged('sky');

      component.toggleAllRows();

      expect(component.selection.selected.length).toBe(1);
      expect(component.selection.isSelected(mockItems[1])).toBe(true);
    });

    it('onClearSelection should drop every selected row', () => {
      component.selection.select(mockItems[0], mockItems[1]);

      component.onClearSelection();

      expect(component.selection.isEmpty()).toBe(true);
    });

    it('onSelectAllVisible should replace the selection with the visible rows', () => {
      component.selection.select(mockItems[0]);
      component.onFreeTextChanged('sky');

      component.onSelectAllVisible();

      expect(component.selection.selected.length).toBe(1);
      expect(component.selection.isSelected(mockItems[1])).toBe(true);
    });
  });

  describe('onQuickSelect', () => {
    beforeEach(() => {
      component.dataSource.data = mockItems.slice();
    });

    it("should open the select dialog in Free Selection mode for 'random' and apply the result", () => {
      const mockDialogRef = { afterClosed: vi.fn().mockReturnValue(
        of({ selectedSelectMode: SelectionModeEnum.FreeSelection, countOfItems: 1 })
      ) };
      mockDialog.open.mockReturnValue(mockDialogRef);

      component.onQuickSelect('random');

      expect(mockDialog.open).toHaveBeenCalledWith(
        KnowledgeExercisesSelectDialogComponent,
        expect.objectContaining({
          data: expect.objectContaining({ mode: SelectionModeEnum.FreeSelection, rowCount: 2 }),
        })
      );
      expect(component.selection.selected.length).toBe(1);
    });

    it("should open the select dialog in By Count mode for 'sequence' and apply count + offset", () => {
      const mockDialogRef = { afterClosed: vi.fn().mockReturnValue(
        of({ selectedSelectMode: SelectionModeEnum.ByCount, countOfItems: 1, countOfOffset: 1 })
      ) };
      mockDialog.open.mockReturnValue(mockDialogRef);

      component.onQuickSelect('sequence');

      expect(mockDialog.open).toHaveBeenCalledWith(
        KnowledgeExercisesSelectDialogComponent,
        expect.objectContaining({
          data: expect.objectContaining({ mode: SelectionModeEnum.ByCount, rowCount: 2 }),
        })
      );
      expect(component.selection.selected.length).toBe(1);
      expect(component.selection.isSelected(mockItems[1])).toBe(true);
    });

    it("should select matching ids for 'ids' and ignore non-matching tokens", () => {
      const mockDialogRef = { afterClosed: vi.fn().mockReturnValue(
        of({ selectedSelectMode: SelectionModeEnum.ByID, importIDs: '2, 99' })
      ) };
      mockDialog.open.mockReturnValue(mockDialogRef);

      component.onQuickSelect('ids');

      expect(component.selection.selected.length).toBe(1);
      expect(component.selection.isSelected(mockItems[1])).toBe(true);
    });

    it("should leave the selection untouched for 'ids' when no token matches", () => {
      component.selection.select(mockItems[0]);
      const mockDialogRef = { afterClosed: vi.fn().mockReturnValue(
        of({ selectedSelectMode: SelectionModeEnum.ByID, importIDs: '98, 99' })
      ) };
      mockDialog.open.mockReturnValue(mockDialogRef);

      component.onQuickSelect('ids');

      expect(component.selection.selected.length).toBe(1);
      expect(component.selection.isSelected(mockItems[0])).toBe(true);
    });

    it('should leave the selection untouched when the dialog is cancelled', () => {
      component.selection.select(mockItems[0]);
      const mockDialogRef = { afterClosed: vi.fn().mockReturnValue(of(undefined)) };
      mockDialog.open.mockReturnValue(mockDialogRef);

      component.onQuickSelect('random');

      expect(component.selection.selected.length).toBe(1);
    });
  });

  describe('onContentRatingChanged', () => {
    it('should not save and should restore the previous selection when the toggle is deselected', () => {
      // Clicking the active toggle in a mat-button-toggle-group deselects it,
      // emitting change with value undefined.
      component.contentRatingMap.set(new Map([[1, 3]]));
      const event: any = {
        value: undefined,
        source: { value: 3, buttonToggleGroup: { value: undefined } },
      };

      component.onContentRatingChanged(mockItems[0], event);

      expect(mockRatingService.upsertRating).not.toHaveBeenCalled();
      expect(event.source.buttonToggleGroup.value).toBe(3);
    });

    it('should save the rating and update the map', () => {
      mockLearningContentService.getKnowledgeExerciseContent.mockReturnValue(of(mockItems));
      component.onFileSelectionChanged({ value: mockLearningContents[0] } as any);
      mockRatingService.upsertRating.mockReturnValue(
        of({ id: 9, contentId: 1, itemId: 1, rating: 5 })
      );
      const event: any = {
        value: 5,
        source: { value: undefined, buttonToggleGroup: { value: 5 } },
      };

      component.onContentRatingChanged(mockItems[0], event);

      expect(mockRatingService.upsertRating).toHaveBeenCalledWith(1, 1, 5);
      expect(component.getRating('1')).toBe(5);
    });

    it('should not save without a selected file content', () => {
      const event: any = {
        value: 4,
        source: { value: undefined, buttonToggleGroup: { value: 4 } },
      };

      component.onContentRatingChanged(mockItems[0], event);

      expect(mockRatingService.upsertRating).not.toHaveBeenCalled();
    });

    it('should revert the toggle when the save fails', () => {
      mockLearningContentService.getKnowledgeExerciseContent.mockReturnValue(of(mockItems));
      component.onFileSelectionChanged({ value: mockLearningContents[0] } as any);
      mockRatingService.upsertRating.mockReturnValue(
        throwError(() => new Error('Save failed'))
      );
      vi.spyOn(console, 'error').mockImplementation(() => {});
      const event: any = {
        value: 5,
        source: { value: undefined, buttonToggleGroup: { value: 5 } },
      };

      component.onContentRatingChanged(mockItems[0], event);

      expect(event.source.buttonToggleGroup.value).toBe(0);
      expect(component.getRating('1')).toBe(0);
    });
  });

  describe('onPreviewWithOptions (print)', () => {
    beforeEach(() => {
      component.dataSource.data = mockItems.slice();
    });

    it('should open print options dialog with the file name as default title', () => {
      component.selectedFile.set(mockLearningContents[0]);
      const mockDialogRef = { afterClosed: () => of(undefined) };
      mockDialog.open.mockReturnValue(mockDialogRef);

      component.onPreviewWithOptions();

      expect(mockDialog.open).toHaveBeenCalledWith(
        KnowledgeExercisesPrintOptionsDialogComponent,
        expect.objectContaining({
          data: { defaultTitle: '文件一' },
          width: '600px',
        })
      );
    });

    it('should store settings and print the selection when dialog returns result', () => {
      component.selection.select(mockItems[0]);
      const mockResult = {
        formTitle: 'Test',
        printEntryDate: true,
        printScore: true,
        printAnswer: true,
        printHintOfAnswer: true,
        printID: true,
        hideLabelOfQuestionType: [],
        shuffleOptionsInSelection: false,
      };
      const mockDialogRef = { afterClosed: () => of(mockResult) };
      mockDialog.open.mockReturnValue(mockDialogRef);

      component.onPreviewWithOptions();

      expect(component.printSetting.formTitle).toBe('Test');
      expect(component.printSetting.printAnswer).toBe(true);
      expect(component.printSetting.shuffleOptionsInSelection).toBe(false);
      expect(mockUIService.setSelectedExerciseItem).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/knowledge/displayv2']);
    });

    it('should not print when dialog is cancelled', () => {
      const mockDialogRef = { afterClosed: () => of(undefined) };
      mockDialog.open.mockReturnValue(mockDialogRef);

      component.onPreviewWithOptions();

      expect(mockUIService.setSelectedExerciseItem).not.toHaveBeenCalled();
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should print only the selected rows (selection-gated)', () => {
      component.selection.select(mockItems[1]);
      const mockDialogRef = { afterClosed: () => of({
        formTitle: 'T', printEntryDate: false, printScore: false, printAnswer: false,
        printHintOfAnswer: false, printID: true, hideLabelOfQuestionType: [], shuffleOptionsInSelection: true,
      }) };
      mockDialog.open.mockReturnValue(mockDialogRef);

      component.onPreviewWithOptions();

      const callArgs = mockUIService.setSelectedExerciseItem.mock.lastCall;
      expect(callArgs?.[0].length).toBe(1);
      expect(callArgs?.[0][0].id).toBe('2');
      expect(callArgs?.[0][0].order).toBe(1);
    });

    it('should renumber copies and leave the cached source rows untouched', () => {
      component.selection.select(mockItems[1]); // original order 2 → printed as 1
      const mockDialogRef = { afterClosed: () => of({
        formTitle: 'T', printEntryDate: false, printScore: false, printAnswer: false,
        printHintOfAnswer: false, printID: true, hideLabelOfQuestionType: [], shuffleOptionsInSelection: true,
      }) };
      mockDialog.open.mockReturnValue(mockDialogRef);

      component.onPreviewWithOptions();

      const printed = mockUIService.setSelectedExerciseItem.mock.lastCall?.[0];
      expect(printed[0]).not.toBe(mockItems[1]); // a copy, not the cached row
      expect(printed[0].order).toBe(1);
      // The LearningContentService-cached objects keep their original order.
      expect(mockItems[1].order).toBe(2);
    });
  });

  describe('detail / extra info screens', () => {
    beforeEach(() => {
      component.dataSource.data = mockItems.slice();
    });

    it('onShowDetail should switch to the detail view for the matching id', () => {
      component.onShowDetail('1');

      expect(component.mode()).toBe('detail');
      expect(component.selectedElement?.id).toBe('1');
      expect(component.markdownStr.length).toBeGreaterThan(0);
    });

    it('onShowDetail should keep the list when the id is not visible', () => {
      component.onShowDetail('nope');

      expect(component.mode()).toBe('list');
    });

    it('onShowExtraInfo should switch to the extra info view', () => {
      component.onShowExtraInfo('2');

      expect(component.mode()).toBe('extrainfo');
      expect(component.getExtraInfoMarkdown()).toContain('Background note');
    });

    it('onNextItem/onPreviousItem should move within the visible rows', () => {
      component.onShowDetail('1');

      component.onNextItem();
      expect(component.selectedElement?.id).toBe('2');
      expect(component.selectedElementIdx).toBe(1);

      component.onPreviousItem();
      expect(component.selectedElement?.id).toBe('1');
      expect(component.selectedElementIdx).toBe(0);
    });

    it("onNextItem/onPreviousItem should hide the previous item's answer panel", () => {
      component.onShowDetail('1');
      component.onToggleAnswer();
      expect(component.showDetailAnswer).toBe(true);

      component.onNextItem();
      expect(component.showDetailAnswer).toBe(false);

      component.onToggleAnswer();
      component.onPreviousItem();
      expect(component.showDetailAnswer).toBe(false);
    });

    it('should keep the list screen mounted (hidden) during detail visits', () => {
      fixture.detectChanges();
      const listEl = () =>
        fixture.nativeElement.querySelector('app-knowledge-exercises-list') as HTMLElement;
      expect(listEl()).toBeTruthy();
      expect(listEl().hidden).toBe(false);

      component.onShowDetail('1');
      fixture.detectChanges();
      // Not destroyed: the paginator page and sort state survive the trip.
      expect(listEl()).toBeTruthy();
      expect(listEl().hidden).toBe(true);

      component.onBackToList();
      fixture.detectChanges();
      expect(listEl().hidden).toBe(false);
    });

    it('onBackToList should return to the list and reset toggles', () => {
      component.onShowDetail('1');
      component.onToggleAnswer();
      component.onToggleHintOfAnswer();
      expect(component.showDetailAnswer).toBe(true);

      component.onBackToList();

      expect(component.mode()).toBe('list');
      expect(component.showDetailAnswer).toBe(false);
      expect(component.showDetailHintOfAnswer).toBe(false);
    });
  });

  describe('visibleRowCount', () => {
    it('should reflect the filtered count when a filter is active', () => {
      component.dataSource.data = mockItems.slice();
      expect(component.visibleRowCount).toBe(2);

      component.onFreeTextChanged('sky');
      expect(component.visibleRowCount).toBe(1);
    });
  });
});
