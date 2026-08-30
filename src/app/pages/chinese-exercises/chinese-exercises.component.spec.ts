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
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';


import type { LearnChineseFileItem, LearningContent } from '../../interfaces';
import {
  QuestionBankItemLevelEnum,
  SelectionModeEnum,
} from '../../interfaces';
import { LearningContentService, UIService } from '../../services';
import { LearningRatingService } from '../../services/learning-rating.service';
import { SharedFilterDialogComponent } from '../../shared/filter-dialog';
import { AppPageTitle } from '../page-title/page-title';

import { ChineseExercisesOptionsDialogComponent } from './chinese-exercises-options-dialog.component';
import { ChineseExercisesPrintOptionsDialogComponent } from './chinese-exercises-printoptions-dialog.component';
import { ChineseExercisesSelectDialogComponent } from './chinese-exercises-select-dialog.component';
import { ChineseExercisesComponent } from './chinese-exercises.component';

const mockLearningContents: LearningContent[] = [
  { id: 1, categoryId: 4, nameEnglish: 'File1', nameChinese: '文件一', fileUrl: 'data/file1.json' },
  { id: 2, categoryId: 4, nameEnglish: 'File2', nameChinese: '文件二', fileUrl: 'data/file2.json' },
];

const mockLearnChineseFileItem: LearnChineseFileItem[] = [
  { id: 1, subject: '静夜思', author: '李白', content: '床前明月光' },
  { id: 2, subject: '春晓', author: '孟浩然', content: '春眠不觉晓' },
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

describe('ChineseExercisesComponent', () => {
  let component: ChineseExercisesComponent;
  let fixture: ComponentFixture<ChineseExercisesComponent>;
  let mockLearningContentService: any;
  let mockUIService: any;
  let mockRouter: any;
  let mockDialog: any;
  let mockRatingService: any;

  beforeEach(async () => {
    mockLearningContentService = {
      getChineseContents: vi.fn().mockReturnValue(of(mockLearningContents)),
      getChineseFileContent: vi.fn(),
    };
    mockUIService = { setSelectedExerciseItem: vi.fn() };
    mockRouter = { navigate: vi.fn() };
    mockDialog = { open: vi.fn() };
    mockRatingService = { getRatings: vi.fn().mockReturnValue(of([])), upsertRating: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ChineseExercisesComponent, NoopAnimationsModule],
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

    fixture = TestBed.createComponent(ChineseExercisesComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should set page title to Chinese', () => {
      fixture.detectChanges();
      expect(component.pageTitle.title).toBe('Chinese');
    });

    it('should load all data files on initialization', () => {
      fixture.detectChanges();
      expect(mockLearningContentService.getChineseContents).toHaveBeenCalled();
      expect(component.allFiles()).toEqual(mockLearningContents);
      expect(component.isLoadingContents()).toBe(false);
    });

    it('should handle error when loading data files fails', () => {
      mockLearningContentService.getChineseContents.mockReturnValue(
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
      mockLearningContentService.getChineseFileContent.mockReturnValue(of(mockLearnChineseFileItem));

      component.onFileSelectionChanged({ value: mockLearningContents[0] } as any);

      expect(mockLearningContentService.getChineseFileContent).toHaveBeenCalledWith('data/file1.json');
      expect(component.dataSource.data).toEqual(mockLearnChineseFileItem);
    });

    it('should clear any existing selection when switching files', () => {
      mockLearningContentService.getChineseFileContent.mockReturnValue(of(mockLearnChineseFileItem));
      component.dataSource.data = mockLearnChineseFileItem.slice();
      component.selection.select(mockLearnChineseFileItem[0]);
      expect(component.selection.selected.length).toBe(1);

      component.onFileSelectionChanged({ value: mockLearningContents[0] } as any);

      expect(component.selection.isEmpty()).toBe(true);
    });

    it('should handle undefined file selection by clearing state', () => {
      component.studyContentId = 5;
      component.dataSource.data = mockLearnChineseFileItem.slice();

      component.onFileSelectionChanged({ value: undefined } as any);

      expect(component.dataSource.data.length).toBe(0);
      expect(component.studyContentId).toBe(0);
    });

    it('should load ratings for the selected content and force a re-filter', () => {
      mockLearningContentService.getChineseFileContent.mockReturnValue(of(mockLearnChineseFileItem));
      mockRatingService.getRatings.mockReturnValue(
        of([{ id: 1, contentId: 1, itemId: 2, rating: 4 }])
      );
      component.onFreeTextChanged('春晓');

      component.onFileSelectionChanged({ value: mockLearningContents[0] } as any);

      expect(mockRatingService.getRatings).toHaveBeenCalledWith(1);
      expect(component.getRating(2)).toBe(4);
      // The rating filter re-runs after ratings arrive: the row still matches
      // the free text and nothing else.
      expect(component.dataSource.filteredData.length).toBe(1);
    });

    it('should clear data and content id when file content fails to load', () => {
      mockLearningContentService.getChineseFileContent.mockReturnValue(
        throwError(() => new Error('Load failed'))
      );
      vi.spyOn(console, 'error').mockImplementation(() => {});

      component.onFileSelectionChanged({ value: mockLearningContents[0] } as any);

      expect(component.dataSource.data.length).toBe(0);
      expect(component.studyContentId).toBe(0);
    });
  });

  describe('filter pipeline', () => {
    beforeEach(() => {
      component.dataSource.data = mockLearnChineseFileItem.slice();
    });

    it('should apply live free text as a JSON filter and filter rows', () => {
      component.onFreeTextChanged('春晓');

      expect(component.dataSource.filter).toContain('春晓');
      expect(component.dataSource.filteredData.length).toBe(1);
    });

    it('should restore all rows when free text is cleared', () => {
      component.onFreeTextChanged('春晓');
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
        of({ root: andRoot({ property: 'author', operation: FilterOperation.Equal, lowValue: '李白' }) })
      ) };
      mockDialog.open.mockReturnValue(mockDialogRef);

      component.onDefineFilter();

      expect(mockDialog.open).toHaveBeenCalledWith(SharedFilterDialogComponent, expect.anything());
      expect(component.dataSource.filteredData.length).toBe(1);
      expect(component.dataSource.filteredData[0].subject).toBe('静夜思');
    });

    it('should seed the dialog with the current definition', () => {
      const seed = andRoot({ property: 'subject', operation: FilterOperation.Contains, lowValue: '春' });
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

    it('should clear the filter definition', () => {
      const mockDialogRef = { afterClosed: vi.fn().mockReturnValue(
        of({ root: andRoot({ property: 'author', operation: FilterOperation.Equal, lowValue: '李白' }) })
      ) };
      mockDialog.open.mockReturnValue(mockDialogRef);
      component.onDefineFilter();
      expect(component.dataSource.filteredData.length).toBe(1);

      component.onClearFilter();

      expect(component.dataSource.filter).toBe('');
      expect(component.dataSource.filteredData.length).toBe(2);
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
      expect(component.dataSource.filteredData[0].id).toBe(1);
    });

    it('should apply nested AND/OR groups from the tree dialog', () => {
      component.contentRatingMap.set(new Map([[1, 1]]));
      const mockDialogRef = { afterClosed: vi.fn().mockReturnValue(
        of({
          root: andRoot(
            { property: 'subject', operation: FilterOperation.Contains, lowValue: '春晓' },
            {
              join: FilterJoinType.OR,
              conditions: [
                { property: 'author', operation: FilterOperation.Equal, lowValue: '孟浩然' },
                { property: 'rating', operation: FilterOperation.GreaterOrEqual, lowValue: 4 },
              ],
            }
          ),
        })
      ) };
      mockDialog.open.mockReturnValue(mockDialogRef);

      component.onDefineFilter();

      expect(component.dataSource.filteredData.length).toBe(1);
      expect(component.dataSource.filteredData[0].id).toBe(2);
    });
  });

  describe('selection methods', () => {
    beforeEach(() => {
      component.dataSource.data = mockLearnChineseFileItem.slice();
    });

    it('isAllSelected should return true when all selected', () => {
      component.selection.select(...mockLearnChineseFileItem);
      expect(component.isAllSelected()).toBe(true);
    });

    it('isAllSelected should return false when not all selected', () => {
      component.selection.select(mockLearnChineseFileItem[0]);
      expect(component.isAllSelected()).toBe(false);
    });

    it('toggleAllRows should select all when not all selected', () => {
      component.toggleAllRows();
      expect(component.selection.selected.length).toBe(mockLearnChineseFileItem.length);
    });

    it('toggleAllRows should clear selection when all selected', () => {
      component.selection.select(...mockLearnChineseFileItem);
      component.toggleAllRows();
      expect(component.selection.selected.length).toBe(0);
    });

    it('toggleAllRows should scope to visible rows when a filter is active', () => {
      component.onFreeTextChanged('春晓');

      component.toggleAllRows();

      expect(component.selection.selected.length).toBe(1);
      expect(component.selection.isSelected(mockLearnChineseFileItem[1])).toBe(true);
    });

    it('onClearSelection should drop every selected row', () => {
      component.selection.select(mockLearnChineseFileItem[0], mockLearnChineseFileItem[1]);

      component.onClearSelection();

      expect(component.selection.isEmpty()).toBe(true);
    });

    it('onSelectAllVisible should replace the selection with the visible rows', () => {
      component.selection.select(mockLearnChineseFileItem[0]);
      component.onFreeTextChanged('春晓');

      component.onSelectAllVisible();

      expect(component.selection.selected.length).toBe(1);
      expect(component.selection.isSelected(mockLearnChineseFileItem[1])).toBe(true);
    });
  });

  describe('onQuickSelect', () => {
    beforeEach(() => {
      component.dataSource.data = mockLearnChineseFileItem.slice();
    });

    it("should open the select dialog in Free Selection mode for 'random' and apply the result", () => {
      const mockDialogRef = { afterClosed: vi.fn().mockReturnValue(
        of({ selectedSelectMode: SelectionModeEnum.FreeSelection, countOfItems: 1 })
      ) };
      mockDialog.open.mockReturnValue(mockDialogRef);

      component.onQuickSelect('random');

      expect(mockDialog.open).toHaveBeenCalledWith(
        ChineseExercisesSelectDialogComponent,
        expect.objectContaining({ data: { mode: SelectionModeEnum.FreeSelection, rowCount: 2 } })
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
        ChineseExercisesSelectDialogComponent,
        expect.objectContaining({ data: { mode: SelectionModeEnum.ByCount, rowCount: 2 } })
      );
      expect(component.selection.selected.length).toBe(1);
      expect(component.selection.isSelected(mockLearnChineseFileItem[1])).toBe(true);
    });

    it('should leave the selection untouched when the dialog is cancelled', () => {
      component.selection.select(mockLearnChineseFileItem[0]);
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

      component.onContentRatingChanged(mockLearnChineseFileItem[0], event);

      expect(mockRatingService.upsertRating).not.toHaveBeenCalled();
      expect(event.source.buttonToggleGroup.value).toBe(3);
    });

    it('should save the rating and update the map', () => {
      mockLearningContentService.getChineseFileContent.mockReturnValue(of(mockLearnChineseFileItem));
      component.onFileSelectionChanged({ value: mockLearningContents[0] } as any);
      mockRatingService.upsertRating.mockReturnValue(
        of({ id: 9, contentId: 1, itemId: 1, rating: 5 })
      );
      const event: any = {
        value: 5,
        source: { value: undefined, buttonToggleGroup: { value: 5 } },
      };

      component.onContentRatingChanged(mockLearnChineseFileItem[0], event);

      expect(mockRatingService.upsertRating).toHaveBeenCalledWith(1, 1, 5);
      expect(component.getRating(1)).toBe(5);
    });

    it('should not save without a selected file content', () => {
      const event: any = {
        value: 4,
        source: { value: undefined, buttonToggleGroup: { value: 4 } },
      };

      component.onContentRatingChanged(mockLearnChineseFileItem[0], event);

      expect(mockRatingService.upsertRating).not.toHaveBeenCalled();
    });

    it('should revert the toggle when the save fails', () => {
      mockLearningContentService.getChineseFileContent.mockReturnValue(of(mockLearnChineseFileItem));
      component.onFileSelectionChanged({ value: mockLearningContents[0] } as any);
      mockRatingService.upsertRating.mockReturnValue(
        throwError(() => new Error('Save failed'))
      );
      vi.spyOn(console, 'error').mockImplementation(() => {});
      const event: any = {
        value: 5,
        source: { value: undefined, buttonToggleGroup: { value: 5 } },
      };

      component.onContentRatingChanged(mockLearnChineseFileItem[0], event);

      expect(event.source.buttonToggleGroup.value).toBe(0);
      expect(component.getRating(1)).toBe(0);
    });
  });

  describe('onStartWithOptions', () => {
    beforeEach(() => {
      component.dataSource.data = mockLearnChineseFileItem.slice();
    });

    it('should open options dialog with selection-driven payload', () => {
      component.selection.select(mockLearnChineseFileItem[0]);
      const mockDialogRef = { afterClosed: () => of(undefined) };
      mockDialog.open.mockReturnValue(mockDialogRef);

      component.onStartWithOptions();

      expect(mockDialog.open).toHaveBeenCalledWith(
        ChineseExercisesOptionsDialogComponent,
        expect.objectContaining({
          data: {
            reciteContentCount: 1,
            disableCount: true,
            translationDisabled: undefined,
          },
          width: '500px',
          height: '360px',
        })
      );
    });

    it('should store settings and call onStart when dialog returns result', () => {
      const mockResult: any = {
        selectedLevel: QuestionBankItemLevelEnum.Medium,
        allowEmptyAnswer: true,
        countOfItems: 10,
      };
      const mockDialogRef = { afterClosed: () => of(mockResult) };
      mockDialog.open.mockReturnValue(mockDialogRef);
      const startSpy = vi.spyOn(component, 'onStart');

      component.onStartWithOptions();

      expect(component.setting.selectedLevel).toBe(QuestionBankItemLevelEnum.Medium);
      expect(component.setting.allowEmptyAnswer).toBe(true);
      expect(component.setting.countOfItems).toBe(10);
      expect(startSpy).toHaveBeenCalled();
    });

    it('should not call onStart when dialog is cancelled', () => {
      const mockDialogRef = { afterClosed: () => of(undefined) };
      mockDialog.open.mockReturnValue(mockDialogRef);
      const startSpy = vi.spyOn(component, 'onStart');

      component.onStartWithOptions();

      expect(startSpy).not.toHaveBeenCalled();
    });
  });

  describe('onPrintWithOptions', () => {
    beforeEach(() => {
      component.dataSource.data = mockLearnChineseFileItem.slice();
    });

    it('should open print options dialog with correct data', () => {
      const mockDialogRef = { afterClosed: () => of(undefined) };
      mockDialog.open.mockReturnValue(mockDialogRef);

      component.onPrintWithOptions();

      expect(mockDialog.open).toHaveBeenCalledWith(
        ChineseExercisesPrintOptionsDialogComponent,
        expect.objectContaining({
          data: {
            reciteContentCount: 2,
            disableCount: false,
            translationDisabled: undefined,
          },
          width: '600px',
          height: '560px',
        })
      );
    });

    it('should call onPrint when print dialog returns result', () => {
      const mockResult = {
        selectedLevel: QuestionBankItemLevelEnum.Hard,
        countOfItems: 15,
        printEntryDate: true,
        answerLineBreakPerItem: true,
        respectRetentionCurve: false,
        printExecDate: true,
        execDate: new Date(),
      };
      const mockDialogRef = { afterClosed: () => of(mockResult) };
      mockDialog.open.mockReturnValue(mockDialogRef);
      const printSpy = vi.spyOn(component, 'onPrint');

      component.onPrintWithOptions();

      expect(component.printSetting.selectedLevel).toBe(QuestionBankItemLevelEnum.Hard);
      expect(component.printSetting.countOfItems).toBe(15);
      expect(component.printSetting.printEntryDate).toBe(true);
      expect(component.printSetting.answerLineBreakPerItem).toBe(true);
      expect(component.printSetting.respectRetentionCurve).toBe(false);
      expect(printSpy).toHaveBeenCalled();
    });

    it('should not call onPrint when dialog is cancelled', () => {
      const mockDialogRef = { afterClosed: () => of(undefined) };
      mockDialog.open.mockReturnValue(mockDialogRef);
      const printSpy = vi.spyOn(component, 'onPrint');

      component.onPrintWithOptions();

      expect(printSpy).not.toHaveBeenCalled();
    });
  });

  describe('Print functionality', () => {
    beforeEach(() => {
      component.dataSource.data = [...mockLearnChineseFileItem];
      component.selectedFile.set(mockLearningContents[0]);
      component.printSetting = {
        selectedLevel: QuestionBankItemLevelEnum.Medium,
        countOfItems: 20,
        respectRetentionCurve: false,
        printEntryDate: true,
      };
    });

    it('should print with selected items', () => {
      component.selection.select(mockLearnChineseFileItem[0]);

      component.onPrint();

      expect(mockUIService.setSelectedExerciseItem).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/knowledge/displayv2']);
    });

    it('should print all visible items when none selected', () => {
      component.onPrint();

      const callArgs = mockUIService.setSelectedExerciseItem.mock.lastCall;
      expect(callArgs?.[0].length).toBe(2);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/knowledge/displayv2']);
    });

    it('should scope the print queue to the filtered rows when a filter is active', () => {
      component.onFreeTextChanged('春晓');

      component.onPrint();

      const callArgs = mockUIService.setSelectedExerciseItem.mock.lastCall;
      expect(callArgs?.[0].length).toBe(1);
    });

    it('should randomize and limit items when count exceeds setting', () => {
      // Add more items to exceed countOfItems
      const manyItems: LearnChineseFileItem[] = [];
      for (let i = 0; i < 30; i++) {
        manyItems.push({
          id: i + 1,
          subject: `Subject ${i}`,
          author: `Author ${i}`,
          content: `Content ${i}`,
        });
      }
      component.dataSource.data = manyItems;
      component.printSetting.countOfItems = 10;

      component.onPrint();

      const callArgs = mockUIService.setSelectedExerciseItem.mock.lastCall;
      expect(callArgs?.[0].length).toBe(10);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/knowledge/displayv2']);
    });

    it('should set order and id for print queues', () => {
      component.onPrint();

      const callArgs = mockUIService.setSelectedExerciseItem.mock.lastCall;
      const printQueues = callArgs?.[0];

      expect(printQueues[0].order).toBe(1);
      expect(printQueues[0].id).toBe('1');
      if (printQueues.length > 1) {
        expect(printQueues[1].order).toBe(2);
        expect(printQueues[1].id).toBe('2');
      }
    });

    it('should include file name in form title', () => {
      component.selectedFile.set({
        id: 99,
        categoryId: 4,
        nameChinese: 'Test File',
        nameEnglish: 'Test File',
        fileUrl: 'storage/learnchinese/test.json',
      });

      component.onPrint();

      const callArgs = mockUIService.setSelectedExerciseItem.mock.lastCall;
      const printSetting = callArgs?.[1];

      expect(printSetting?.formTitle).toContain('Test File');
    });

    it('should use default title when no file selected', () => {
      component.selectedFile.set(undefined);

      component.onPrint();

      const callArgs = mockUIService.setSelectedExerciseItem.mock.lastCall;
      const printSetting = callArgs?.[1];

      expect(printSetting?.formTitle).toContain('Chinese Exercises');
    });

    it('should forward answerLineBreakPerItem onto the exec print setting', () => {
      component.printSetting.answerLineBreakPerItem = true;

      component.onPrint();

      const callArgs = mockUIService.setSelectedExerciseItem.mock.lastCall;
      const printSetting = callArgs?.[1];

      expect(printSetting?.answerLineBreakPerItem).toBe(true);
    });
  });

  describe('visibleRowCount', () => {
    it('should reflect the filtered count when a filter is active', () => {
      component.dataSource.data = mockLearnChineseFileItem.slice();
      expect(component.visibleRowCount).toBe(2);

      component.onFreeTextChanged('春晓');
      expect(component.visibleRowCount).toBe(1);
    });
  });
});
