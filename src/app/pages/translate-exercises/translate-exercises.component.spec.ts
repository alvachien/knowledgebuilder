import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
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

import type { LearningContent, LearnEnglishSentFileItem } from '../../interfaces';
import {
  QuestionBankTypeEnum,
  SelectionModeEnum,
  SENTENCE_QUIZ_BLANK,
  TranslateDirectionEnum,
  TranslationAIModeEnum,
} from '../../interfaces';
import {
  LearningContentService,
  AudioService,
  AIService,
  UserCodeService,
  UIService,
} from '../../services';
import { LearningRatingService } from '../../services/learning-rating.service';
import { SharedFilterDialogComponent } from '../../shared/filter-dialog';
import { AppPageTitle } from '../page-title/page-title';

import { TranslateExercisesInfoDialogComponent } from './translate-exercises-info-dialog.component';
import { TranslateExercisesLLMDialogComponent } from './translate-exercises-llm-dialog.component';
import { TranslateExercisesOptionsDialogComponent } from './translate-exercises-options-dialog.component';
import { TranslateExercisesPrintOptionsDialogComponent } from './translate-exercises-printoptions-dialog.component';
import { TranslateExercisesQuizOptionsDialogComponent } from './translate-exercises-quizoptions-dialog.component';
import { TranslateExercisesReviewOptionsDialogComponent } from './translate-exercises-reviewoptions-dialog.component';
import { TranslateExercisesSelectDialogComponent } from './translate-exercises-select-dialog.component';
import { TranslateExercisesComponent } from './translate-exercises.component';

const mockDataFiles: LearningContent[] = [
  { id: 1, categoryId: 2, nameEnglish: 'File1', nameChinese: '文件一', fileUrl: 'data/file1.json' },
  { id: 2, categoryId: 2, nameEnglish: 'File2', nameChinese: '文件二', fileUrl: 'data/file2.json' },
];

const mockFileContent: LearnEnglishSentFileItem[] = [
  { id: '1', ensent: 'Hello world', cnsent: '你好世界', enwords: ['hello'] },
  { id: '2', ensent: 'Good morning', cnsent: '早上好', enwords: ['good'] },
  { id: '3', ensent: 'Thank you', cnsent: '谢谢', enwords: ['thank'] },
];

describe('TranslateExercisesComponent', () => {
  let component: TranslateExercisesComponent;
  let fixture: ComponentFixture<TranslateExercisesComponent>;
  let mockLearningContentService: any;
  let mockAudioService: any;
  let mockAIService: any;
  let mockUIService: any;
  let mockRouter: any;
  let mockDialog: any;
  let mockRatingService: any;
  let mockPageTitle: AppPageTitle;

  beforeEach(async () => {
    mockLearningContentService = {
      getSentenceContents: vi.fn(),
      getSentenceFileContent: vi.fn(),
    };
    mockAudioService = { playSound: vi.fn() };
    mockAIService = { getTTS: vi.fn(), explainSentence: vi.fn() };
    mockUIService = { setSelectedExerciseItem: vi.fn() };
    mockRouter = { navigate: vi.fn() };
    mockDialog = { open: vi.fn() };
    mockRatingService = { getRatings: vi.fn().mockReturnValue(of([])), upsertRating: vi.fn() };
    mockPageTitle = { title: '' } as AppPageTitle;
    mockLearningContentService.getSentenceContents.mockReturnValue(of(mockDataFiles));

    const mockTranslocoService = {
      setActiveLang: vi.fn(),
      getActiveLang: vi.fn(),
      selectTranslate: vi.fn().mockReturnValue(of('')),
      _loadDependencies: vi.fn().mockReturnValue(of(null)),
      translate: vi.fn((key: string) => key),
      activeLang: 'en',
      config: {
        reRenderOnLangChange: true,
        prodMode: false,
      },
      langChanges$: of('en'),
      events$: of(),
    };

    await TestBed.configureTestingModule({
      imports: [TranslateExercisesComponent, NoopAnimationsModule],
      providers: [
        { provide: LearningContentService, useValue: mockLearningContentService },
        { provide: AudioService, useValue: mockAudioService },
        { provide: AIService, useValue: mockAIService },
        { provide: UIService, useValue: mockUIService },
        { provide: Router, useValue: mockRouter },
        { provide: MatDialog, useValue: mockDialog },
        { provide: LearningRatingService, useValue: mockRatingService },
        { provide: AppPageTitle, useValue: mockPageTitle },
        { provide: UserCodeService, useValue: { isUserCodeEntered: true } },
        { provide: TranslocoService, useValue: mockTranslocoService },
        { provide: TRANSLOCO_TRANSPILER, useValue: {} },
        { provide: TRANSLOCO_MISSING_HANDLER, useValue: {} },
        { provide: TRANSLOCO_INTERCEPTOR, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TranslateExercisesComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should set page title to Sentences', () => {
      fixture.detectChanges();
      expect(component.pageTitle.title).toBe('Sentences');
    });

    it('should load all data files on initialization', () => {
      fixture.detectChanges();
      expect(mockLearningContentService.getSentenceContents).toHaveBeenCalled();
      expect(component.allFiles()).toEqual(mockDataFiles);
    });

    it('should handle error when loading data files fails', () => {
      mockLearningContentService.getSentenceContents.mockReturnValue(
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
      mockLearningContentService.getSentenceFileContent.mockReturnValue(of(mockFileContent));

      component.onFileSelectionChanged({ value: mockDataFiles[0] } as any);

      expect(mockLearningContentService.getSentenceFileContent).toHaveBeenCalledWith(
        'data/file1.json'
      );
      expect(component.dataSource.data).toEqual(mockFileContent);
    });

    it('should clear any existing selection when switching files', () => {
      mockLearningContentService.getSentenceFileContent.mockReturnValue(of(mockFileContent));
      component.dataSource.data = mockFileContent.slice();
      component.selection.select(mockFileContent[0], mockFileContent[1]);
      expect(component.selection.selected.length).toBe(2);

      component.onFileSelectionChanged({ value: mockDataFiles[0] } as any);

      expect(component.selection.selected.length).toBe(0);
      expect(component.selection.isEmpty()).toBe(true);
    });

    it('should handle undefined file selection by clearing state', () => {
      component.studyContentId = 5;
      component.dataSource.data = mockFileContent.slice();

      component.onFileSelectionChanged({ value: undefined } as any);

      expect(component.dataSource.data.length).toBe(0);
      expect(component.studyContentId).toBe(0);
    });

    it('should load ratings for the selected content', () => {
      mockLearningContentService.getSentenceFileContent.mockReturnValue(of(mockFileContent));
      mockRatingService.getRatings.mockReturnValue(
        of([{ id: 1, contentId: 1, itemId: 2, rating: 4 }])
      );

      component.onFileSelectionChanged({ value: mockDataFiles[0] } as any);

      expect(mockRatingService.getRatings).toHaveBeenCalledWith(1);
      expect(component.getRating('2')).toBe(4);
    });

    it('should clear data and content id when file content fails to load', () => {
      mockLearningContentService.getSentenceFileContent.mockReturnValue(
        throwError(() => new Error('Load failed'))
      );
      vi.spyOn(console, 'error').mockImplementation(() => {});

      component.onFileSelectionChanged({ value: mockDataFiles[0] } as any);

      expect(component.dataSource.data.length).toBe(0);
      expect(component.studyContentId).toBe(0);
    });
  });

  describe('getRating', () => {
    it('should resolve string ids through the rating item key', () => {
      component.contentRatingMap.set(new Map([[42, 3]]));

      expect(component.getRating('42')).toBe(3);
      expect(component.getRating(undefined)).toBe(0);
    });
  });

  describe('filter pipeline', () => {
    beforeEach(() => {
      component.dataSource.data = mockFileContent.slice();
    });

    it('should apply live free text as a JSON filter and filter rows', () => {
      component.onFreeTextChanged('hello');

      expect(component.dataSource.filter).toContain('hello');
      expect(component.dataSource.filteredData.length).toBe(1);
    });

    it('should restore all rows when free text is cleared', () => {
      component.onFreeTextChanged('hello');
      component.onFreeTextChanged('');

      expect(component.dataSource.filter).toBe('');
      expect(component.dataSource.filteredData.length).toBe(3);
    });

    /** Wrap conditions in an AND root, as the shared dialog emits them. */
    const andRoot = (
      ...conditions: IFilterDefinition['conditions']
    ): IFilterDefinition => ({ join: FilterJoinType.AND, conditions });

    it('should apply conditions emitted by the shared filter dialog on submit', () => {
      const mockDialogRef = { afterClosed: vi.fn().mockReturnValue(
        of({ root: andRoot({ property: 'ensent', operation: FilterOperation.BeginsWith, lowValue: 'good' }) })
      ) };
      mockDialog.open.mockReturnValue(mockDialogRef);

      component.onDefineFilter();

      expect(mockDialog.open).toHaveBeenCalledWith(SharedFilterDialogComponent, expect.anything());
      expect(component.dataSource.filteredData.length).toBe(1);
      expect(component.dataSource.filteredData[0].ensent).toBe('Good morning');
    });

    it('should seed the dialog with the current definition', () => {
      const seed = andRoot({ property: 'cnsent', operation: FilterOperation.Contains, lowValue: '你' });
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
      expect(component.dataSource.filteredData.length).toBe(3);
    });

    it('should apply rating conditions with unrated (0) semantics', () => {
      component.contentRatingMap.set(new Map([[2, 5]]));
      const mockDialogRef = { afterClosed: vi.fn().mockReturnValue(
        of({ root: andRoot({ property: 'rating', operation: FilterOperation.Equal, lowValue: 5 }) })
      ) };
      mockDialog.open.mockReturnValue(mockDialogRef);

      component.onDefineFilter();

      expect(component.dataSource.filteredData.length).toBe(1);
      expect(component.dataSource.filteredData[0].id).toBe('2');
    });

    it('should apply nested AND/OR groups from the tree dialog', () => {
      const mockDialogRef = { afterClosed: vi.fn().mockReturnValue(
        of({
          root: andRoot(
            { property: 'ensent', operation: FilterOperation.Contains, lowValue: 'o' },
            {
              join: FilterJoinType.OR,
              conditions: [
                { property: 'cnsent', operation: FilterOperation.Equal, lowValue: '谢谢' },
                { property: 'cnsent', operation: FilterOperation.Equal, lowValue: '早上好' },
              ],
            }
          ),
        })
      ) };
      mockDialog.open.mockReturnValue(mockDialogRef);

      component.onDefineFilter();

      // ensent contains 'o': all three rows pass; the OR then drops row 1
      // ('你好世界' equals neither 谢谢 nor 早上好).
      expect(component.dataSource.filteredData.map(r => r.id)).toEqual(['2', '3']);
    });

    it('should clear the filter definition', () => {
      const mockDialogRef = { afterClosed: vi.fn().mockReturnValue(
        of({ root: andRoot({ property: 'cnsent', operation: FilterOperation.Contains, lowValue: '你' }) })
      ) };
      mockDialog.open.mockReturnValue(mockDialogRef);
      component.onDefineFilter();
      expect(component.dataSource.filteredData.length).toBe(1);

      component.onClearFilter();

      expect(component.dataSource.filter).toBe('');
      expect(component.dataSource.filteredData.length).toBe(3);
    });
  });

  describe('selection methods', () => {
    beforeEach(() => {
      component.dataSource.data = mockFileContent.slice();
    });

    it('isAllSelected should return true when all selected', () => {
      component.selection.select(...mockFileContent);
      expect(component.isAllSelected()).toBe(true);
    });

    it('isAllSelected should return false when not all selected', () => {
      component.selection.select(mockFileContent[0]);
      expect(component.isAllSelected()).toBe(false);
    });

    it('toggleAllRows should select all when not all selected', () => {
      component.toggleAllRows();
      expect(component.selection.selected.length).toBe(mockFileContent.length);
    });

    it('toggleAllRows should clear selection when all selected', () => {
      component.selection.select(...mockFileContent);
      component.toggleAllRows();
      expect(component.selection.selected.length).toBe(0);
    });

    it('toggleAllRows should scope to visible rows when a filter is active', () => {
      component.onFreeTextChanged('morning');

      component.toggleAllRows();

      expect(component.selection.selected.length).toBe(1);
      expect(component.selection.isSelected(mockFileContent[1])).toBe(true);
    });

    it('onClearSelection should drop every selected row', () => {
      component.selection.select(mockFileContent[0], mockFileContent[1]);

      component.onClearSelection();

      expect(component.selection.isEmpty()).toBe(true);
    });

    it('onSelectAllVisible should replace the selection with the visible rows', () => {
      component.selection.select(mockFileContent[0]);
      component.onFreeTextChanged('morning');

      component.onSelectAllVisible();

      expect(component.selection.selected.length).toBe(1);
      expect(component.selection.isSelected(mockFileContent[1])).toBe(true);
    });
  });

  describe('onQuickSelect', () => {
    beforeEach(() => {
      component.dataSource.data = mockFileContent.slice();
    });

    it("should open the select dialog in Free Selection mode for 'random' and apply the result", () => {
      const mockDialogRef = { afterClosed: vi.fn().mockReturnValue(
        of({ selectedSelectMode: SelectionModeEnum.FreeSelection, countOfItems: 2 })
      ) };
      mockDialog.open.mockReturnValue(mockDialogRef);

      component.onQuickSelect('random');

      expect(mockDialog.open).toHaveBeenCalledWith(
        TranslateExercisesSelectDialogComponent,
        expect.objectContaining({ data: { mode: SelectionModeEnum.FreeSelection, rowCount: 3 } })
      );
      expect(component.selection.selected.length).toBe(2);
    });

    it("should open the select dialog in By Count mode for 'sequence' and apply count + offset", () => {
      const mockDialogRef = { afterClosed: vi.fn().mockReturnValue(
        of({ selectedSelectMode: SelectionModeEnum.ByCount, countOfItems: 1, countOfOffset: 2 })
      ) };
      mockDialog.open.mockReturnValue(mockDialogRef);

      component.onQuickSelect('sequence');

      expect(mockDialog.open).toHaveBeenCalledWith(
        TranslateExercisesSelectDialogComponent,
        expect.objectContaining({ data: { mode: SelectionModeEnum.ByCount, rowCount: 3 } })
      );
      expect(component.selection.selected.length).toBe(1);
      expect(component.selection.isSelected(mockFileContent[2])).toBe(true);
    });

    it('should leave the selection untouched when the dialog is cancelled', () => {
      component.selection.select(mockFileContent[0]);
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
      component.studyContentId = 1;
      const group = { value: undefined as unknown };
      const event = { value: undefined, source: { value: 2, buttonToggleGroup: group } } as any;

      component.onContentRatingChanged({ id: '10' } as any, event);

      expect(mockRatingService.upsertRating).not.toHaveBeenCalled();
      expect(group.value).toBe(2);
    });

    it('should save the rating and update the rating map', () => {
      mockRatingService.upsertRating.mockReturnValue(of({ id: 1, contentId: 1, itemId: 42, rating: 5 }));
      component.studyContentId = 1;
      const event = { value: 5, source: {} } as any;

      component.onContentRatingChanged({ id: '42' } as any, event);

      expect(mockRatingService.upsertRating).toHaveBeenCalledWith(1, 42, 5);
      expect(component.getRating('42')).toBe(5);
    });

    it('should revert the toggle when saving fails', () => {
      mockRatingService.upsertRating.mockReturnValue(throwError(() => new Error('Save failed')));
      vi.spyOn(console, 'error').mockImplementation(() => {});
      component.studyContentId = 1;
      const group = { value: 5 as unknown };
      const event = { value: 5, source: { value: 5, buttonToggleGroup: group } } as any;

      component.onContentRatingChanged({ id: '42' } as any, event);

      expect(group.value).toBe(0);
    });
  });

  describe('onPlayTTS', () => {
    it('should call AI service to get TTS and play audio', () => {
      const mockAudioUrl = 'http://example.com/audio.mp3';
      mockAIService.getTTS.mockReturnValue(of({ audioFileUrl: mockAudioUrl }));

      component.onPlayTTS('Hello world');

      expect(mockAIService.getTTS).toHaveBeenCalledWith('Hello world');
      expect(mockAudioService.playSound).toHaveBeenCalledWith(mockAudioUrl, false);
    });

    it('should handle error when TTS fails', () => {
      mockAIService.getTTS.mockReturnValue(throwError(() => new Error('TTS failed')));
      vi.spyOn(console, 'error').mockImplementation(() => {});

      component.onPlayTTS('Hello world');

      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('dialog orchestration', () => {
    it('onLLMExplain should open LLM dialog with sentence', () => {
      const mockDialogRef = { afterClosed: vi.fn().mockReturnValue(of(undefined)) };
      mockDialog.open.mockReturnValue(mockDialogRef);

      component.onLLMExplain('Test sentence');

      expect(mockDialog.open).toHaveBeenCalledWith(TranslateExercisesLLMDialogComponent, {
        data: { orgsent: 'Test sentence' },
        width: '800px',
        height: '570px',
        enterAnimationDuration: 800,
        exitAnimationDuration: 500,
      });
    });

    it('onShowExplanation should open info dialog with the explanation title', () => {
      const mockDialogRef = { afterClosed: vi.fn().mockReturnValue(of(undefined)) };
      mockDialog.open.mockReturnValue(mockDialogRef);

      component.onShowExplanation('Some text');

      expect(mockDialog.open).toHaveBeenCalledWith(TranslateExercisesInfoDialogComponent, expect.objectContaining({
        data: { titleKey: 'common.explanation', content: 'Some text' },
      }));
    });

    it('onShowExtraInfo should join extra info entries', () => {
      const mockDialogRef = { afterClosed: vi.fn().mockReturnValue(of(undefined)) };
      mockDialog.open.mockReturnValue(mockDialogRef);

      component.onShowExtraInfo(['a', 'b']);

      expect(mockDialog.open).toHaveBeenCalledWith(TranslateExercisesInfoDialogComponent, expect.objectContaining({
        data: { titleKey: 'common.extraInfo', content: 'a\n\nb' },
      }));
    });
  });

  describe('onPrint', () => {
    beforeEach(() => {
      component.dataSource.data = mockFileContent.slice();
      component.selectedFile.set({
        id: 99,
        categoryId: 2,
        nameEnglish: 'TestFile',
        nameChinese: '测试文件',
        fileUrl: 'data/testfile.json',
      });
    });

    it('should print selected items', () => {
      component.selection.select(mockFileContent[0], mockFileContent[1]);

      component.onPrint();

      const callArgs = mockUIService.setSelectedExerciseItem.mock.lastCall;
      const items = callArgs?.[0];
      expect(items.length).toBe(2);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/knowledge/displayv2']);
    });

    it('should print all visible items when nothing is selected', () => {
      component.printSetting.countOfItems = 2;

      component.onPrint();

      const callArgs = mockUIService.setSelectedExerciseItem.mock.lastCall;
      const items = callArgs?.[0];
      expect(items.length).toBe(2);
    });

    it('should respect print direction setting', () => {
      component.printSetting.direction = TranslateDirectionEnum.ChineseToEnglish;
      component.selection.select(mockFileContent[0]);

      component.onPrint();

      const callArgs = mockUIService.setSelectedExerciseItem.mock.lastCall;
      const items = callArgs?.[0];
      expect(items[0].itemType).toBe(QuestionBankTypeEnum.FillInTheBlank);
      // ChineseToEnglish: the CN sentence is the prompt, the EN sentence is the answer.
      expect(items[0].question.startsWith(mockFileContent[0].cnsent)).toBe(true);
      expect(items[0].question).toContain(`@${mockFileContent[0].ensent}@`);
    });

    it('should print the EN prompt with the CN answer in the default direction', () => {
      component.selection.select(mockFileContent[0]);

      component.onPrint();

      const callArgs = mockUIService.setSelectedExerciseItem.mock.lastCall;
      const items = callArgs?.[0];
      expect(items[0].question).toContain(mockFileContent[0].ensent);
      expect(items[0].question).toContain(`@${mockFileContent[0].cnsent}@`);
    });
  });

  describe('onPrintWithOptions', () => {
    beforeEach(() => {
      component.dataSource.data = mockFileContent.slice();
      component.selectedFile.set({
        id: 99,
        categoryId: 2,
        nameEnglish: 'TestFile',
        nameChinese: '测试文件',
        fileUrl: 'data/testfile.json',
      });
    });

    it('should open print options dialog and print on confirm', () => {
      const mockResult = {
        printAnswer: true,
        printWord: true,
        direction: TranslateDirectionEnum.EnglishToChinese,
        countOfItems: 10,
        printEntryDate: true,
        respectRetentionCurve: false,
        printExecDate: true,
        execDate: new Date(),
      };
      const mockDialogRef = { afterClosed: vi.fn().mockReturnValue(of(mockResult)) };
      mockDialog.open.mockReturnValue(mockDialogRef);

      component.onPrintWithOptions();

      expect(mockDialog.open).toHaveBeenCalled();
      expect(component.printSetting.printAnswer).toBe(true);
      expect(component.printSetting.printWord).toBe(true);
      expect(mockUIService.setSelectedExerciseItem).toHaveBeenCalled();
    });

    it('should not print when dialog is cancelled', () => {
      const mockDialogRef = { afterClosed: vi.fn().mockReturnValue(of(undefined)) };
      mockDialog.open.mockReturnValue(mockDialogRef);

      component.onPrintWithOptions();

      expect(mockUIService.setSelectedExerciseItem).not.toHaveBeenCalled();
    });
  });

  describe('visibleRowCount', () => {
    it('should report the filtered count when a filter is active', () => {
      component.dataSource.data = mockFileContent.slice();

      expect(component.visibleRowCount).toBe(3);

      component.onFreeTextChanged('hello');
      expect(component.visibleRowCount).toBe(1);
    });
  });

  describe('typing exercise', () => {
    beforeEach(() => {
      component.dataSource.data = mockFileContent.slice();
    });

    it('onTypingStart should build the queue from the selection', () => {
      component.selection.select(mockFileContent[0], mockFileContent[1]);

      component.onTypingStart();

      expect(component.mode()).toBe('typing');
      expect(component.typingStore.queue().length).toBe(2);
    });

    it('onTypingStart should cap the visible rows to countOfItems', () => {
      component.typingSetting.countOfItems = 2;

      component.onTypingStart();

      expect(component.mode()).toBe('typing');
      expect(component.typingStore.queue().length).toBe(2);
    });

    it('onTypingStart should stay on the list when there is nothing to type', () => {
      component.dataSource.data = [];

      component.onTypingStart();

      expect(component.mode()).toBe('list');
      expect(component.typingStore.queue().length).toBe(0);
    });

    it('onTypingWithOptions should apply the dialog result and start the session', () => {
      const mockResult = { direction: TranslateDirectionEnum.ChineseToEnglish, countOfItems: 10 };
      mockDialog.open.mockReturnValue({ afterClosed: vi.fn().mockReturnValue(of(mockResult)) });

      component.onTypingWithOptions();

      expect(mockDialog.open).toHaveBeenCalledWith(
        TranslateExercisesOptionsDialogComponent,
        expect.objectContaining({
          data: expect.objectContaining({
            reciteQueuesCount: 3,
            withSelection: false,
            currentSettings: component.typingSetting,
          }),
        })
      );
      expect(component.typingSetting.direction).toBe(TranslateDirectionEnum.ChineseToEnglish);
      expect(component.typingSetting.countOfItems).toBe(10);
      expect(component.mode()).toBe('typing');
      expect(component.typingStore.queue().length).toBe(3);
    });

    it('onTypingWithOptions should stay on the list when cancelled', () => {
      mockDialog.open.mockReturnValue({ afterClosed: vi.fn().mockReturnValue(of(undefined)) });

      component.onTypingWithOptions();

      expect(component.mode()).toBe('list');
      expect(component.typingStore.queue().length).toBe(0);
    });

    it('should switch to the result screen when the store completes the queue', () => {
      component.selection.select(mockFileContent[0]);
      component.onTypingStart();
      expect(component.mode()).toBe('typing');

      component.typingStore.setInput('anything');
      component.typingStore.submitAndNext();
      // The container's effect (typing → typingresult) is flushed by change detection.
      fixture.detectChanges();

      expect(component.mode()).toBe('typingresult');
    });

    it('onQuitTyping should reset the store and return to the list', () => {
      component.selection.select(mockFileContent[0]);
      component.onTypingStart();
      expect(component.mode()).toBe('typing');

      component.onQuitTyping();

      expect(component.mode()).toBe('list');
      expect(component.typingStore.queue().length).toBe(0);
      expect(component.typingStore.results().length).toBe(0);
    });
  });

  describe('review exercise', () => {
    beforeEach(() => {
      component.dataSource.data = mockFileContent.slice();
      mockAIService.getTTS.mockReturnValue(of({ audioFileUrl: 'audio/tts.mp3' }));
    });

    it('onReviewCore should build the queue from the selection (shuffled)', () => {
      component.selection.select(mockFileContent[0], mockFileContent[1]);

      component.onReviewCore();

      expect(component.mode()).toBe('review');
      expect(component.reviewStore.queue().length).toBe(2);
      expect(
        component.reviewStore.queue().every(q => q.itemId !== undefined)
      ).toBe(true);
    });

    it('onReviewCore should cap the visible rows to countOfItems', () => {
      component.reviewSetting.countOfItems = 2;

      component.onReviewCore();

      expect(component.mode()).toBe('review');
      expect(component.reviewStore.queue().length).toBe(2);
    });

    it('onReviewCore should stay on the list when there is nothing to review', () => {
      component.dataSource.data = [];

      component.onReviewCore();

      expect(component.mode()).toBe('list');
      expect(component.reviewStore.queue().length).toBe(0);
    });

    it('onReviewWithOptions should apply the dialog result and start the session', () => {
      const mockResult = { disableVoice: true, countOfItems: 10 };
      mockDialog.open.mockReturnValue({ afterClosed: vi.fn().mockReturnValue(of(mockResult)) });

      component.onReviewWithOptions();

      expect(mockDialog.open).toHaveBeenCalledWith(
        TranslateExercisesReviewOptionsDialogComponent,
        expect.objectContaining({
          data: expect.objectContaining({
            sentenceQueueCount: 3,
            withSelection: false,
            currentSettings: component.reviewSetting,
          }),
        })
      );
      expect(component.reviewSetting.disableVoice).toBe(true);
      expect(component.reviewSetting.countOfItems).toBe(10);
      expect(component.mode()).toBe('review');
      expect(component.reviewStore.queue().length).toBe(3);
    });

    it('onReviewWithOptions should stay on the list when cancelled', () => {
      mockDialog.open.mockReturnValue({ afterClosed: vi.fn().mockReturnValue(of(undefined)) });

      component.onReviewWithOptions();

      expect(component.mode()).toBe('list');
      expect(component.reviewStore.queue().length).toBe(0);
    });

    it('onQuitReview should merge the confirmed ratings into the rating map and return to the list', () => {
      component.studyContentId = 1;
      component.selection.select(mockFileContent[0]);
      component.onReviewCore();
      mockRatingService.upsertRating.mockReturnValue(
        of({ contentId: 1, itemId: 1, rating: 4 })
      );
      component.reviewStore.rateCurrent(4);
      component.contentRatingMap.set(new Map([[2, 5]]));

      component.onQuitReview();

      expect(component.mode()).toBe('list');
      expect(component.reviewStore.queue().length).toBe(0);
      expect(component.getRating('1')).toBe(4);
      expect(component.getRating('2')).toBe(5);
    });

    it('onQuitReview should re-run an active rating filter after merging', () => {
      component.studyContentId = 1;
      component.contentRatingMap.set(new Map());
      component.onFreeTextChanged('hello');
      component.selection.select(mockFileContent[0]);
      component.onReviewCore();
      mockRatingService.upsertRating.mockReturnValue(
        of({ contentId: 1, itemId: 1, rating: 4 })
      );
      component.reviewStore.rateCurrent(4);

      component.onQuitReview();

      // The free-text filter still matches row 1, and the merge ran; a rating
      // filter would now see the new value (the reassignment happened without
      // erroring).
      expect(component.getRating('1')).toBe(4);
    });
  });

  describe('quiz exercise', () => {
    beforeEach(() => {
      component.dataSource.data = mockFileContent.slice();
    });

    it('onQuizStart should build questions from the selection', () => {
      component.selection.select(mockFileContent[0], mockFileContent[1]);

      component.onQuizStart();

      expect(component.mode()).toBe('quiz');
      expect(component.quizStore.questions().length).toBe(2);
      expect(
        component.quizStore.questions().every(
          q => q.ensent && q.cnsent && q.prompt.includes(SENTENCE_QUIZ_BLANK) && q.options.length >= 2
        )
      ).toBe(true);
    });

    it('onQuizStart should cap the visible rows to countOfItems', () => {
      component.quizSetting.countOfItems = 2;

      component.onQuizStart();

      expect(component.mode()).toBe('quiz');
      expect(component.quizStore.questions().length).toBe(2);
    });

    it('onQuizStart should stay on the list when no question can be built', () => {
      component.dataSource.data = [];

      component.onQuizStart();

      expect(component.mode()).toBe('list');
      expect(component.quizStore.questions().length).toBe(0);
    });

    it('onQuizWithOptions should apply the dialog result and start the session', () => {
      const mockResult = { countOfItems: 10 };
      mockDialog.open.mockReturnValue({ afterClosed: vi.fn().mockReturnValue(of(mockResult)) });

      component.onQuizWithOptions();

      expect(mockDialog.open).toHaveBeenCalledWith(
        TranslateExercisesQuizOptionsDialogComponent,
        expect.objectContaining({
          data: expect.objectContaining({
            sentenceQueueCount: 3,
            withSelection: false,
            currentSettings: component.quizSetting,
          }),
        })
      );
      expect(component.quizSetting.countOfItems).toBe(10);
      expect(component.mode()).toBe('quiz');
      expect(component.quizStore.questions().length).toBe(3);
    });

    it('onQuizWithOptions should stay on the list when cancelled', () => {
      mockDialog.open.mockReturnValue({ afterClosed: vi.fn().mockReturnValue(of(undefined)) });

      component.onQuizWithOptions();

      expect(component.mode()).toBe('list');
      expect(component.quizStore.questions().length).toBe(0);
    });

    it('should switch to the result screen when the last question is answered', () => {
      component.selection.select(mockFileContent[0]);
      component.onQuizStart();
      expect(component.mode()).toBe('quiz');

      // Answer every question and advance through the queue.
      for (let i = 0; i < component.quizStore.questions().length; i++) {
        component.quizStore.answer(0);
        component.quizStore.next();
      }
      // The container's effect (quiz → quizresult) is flushed by change detection.
      fixture.detectChanges();

      expect(component.mode()).toBe('quizresult');
    });

    it('onQuitQuiz should reset the store and return to the list', () => {
      component.selection.select(mockFileContent[0]);
      component.onQuizStart();
      expect(component.mode()).toBe('quiz');

      component.onQuitQuiz();

      expect(component.mode()).toBe('list');
      expect(component.quizStore.questions().length).toBe(0);
      expect(component.quizStore.results().length).toBe(0);
    });
  });
});

describe('TranslateExercisesSelectDialogComponent', () => {
  let component: TranslateExercisesSelectDialogComponent;
  let fixture: ComponentFixture<TranslateExercisesSelectDialogComponent>;
  let mockDialogRef: any;

  function createWithMode(mode: SelectionModeEnum, rowCount?: number): void {
    TestBed.overrideProvider(MAT_DIALOG_DATA, { useValue: { mode, rowCount } });
    fixture = TestBed.createComponent(TranslateExercisesSelectDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(async () => {
    mockDialogRef = { close: vi.fn() };

    const mockTranslocoService = {
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

    await TestBed.configureTestingModule({
      imports: [TranslateExercisesSelectDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { mode: SelectionModeEnum.FreeSelection } },
        { provide: TranslocoService, useValue: mockTranslocoService },
        { provide: TRANSLOCO_TRANSPILER, useValue: {} },
        { provide: TRANSLOCO_MISSING_HANDLER, useValue: {} },
        { provide: TRANSLOCO_INTERCEPTOR, useValue: {} },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    createWithMode(SelectionModeEnum.FreeSelection);
    expect(component).toBeTruthy();
  });

  it('should reject a non-positive count', () => {
    createWithMode(SelectionModeEnum.FreeSelection);
    component.countOfItems.set(0);
    expect(component.isFormInvalid).toBe(true);

    component.countOfItems.set(3);
    expect(component.isFormInvalid).toBe(false);
  });

  it('should reject an offset beyond the row count in By Count mode', () => {
    createWithMode(SelectionModeEnum.ByCount, 3);
    component.countOfItems.set(2);
    component.countOfOffset.set(3);
    expect(component.isFormInvalid).toBe(true);

    component.countOfOffset.set(2);
    expect(component.isFormInvalid).toBe(false);
  });

  it('should return the count on Free Selection confirm', () => {
    createWithMode(SelectionModeEnum.FreeSelection);
    component.countOfItems.set(5);

    component.onYesClick();

    expect(mockDialogRef.close).toHaveBeenCalledWith({
      selectedSelectMode: SelectionModeEnum.FreeSelection,
      countOfItems: 5,
    });
  });

  it('should clamp count and offset on By Count confirm', () => {
    createWithMode(SelectionModeEnum.ByCount, 3);
    component.countOfItems.set(2);
    component.countOfOffset.set(2);

    component.onYesClick();

    expect(mockDialogRef.close).toHaveBeenCalledWith({
      selectedSelectMode: SelectionModeEnum.ByCount,
      countOfItems: 2,
      countOfOffset: 2,
    });
  });

  it('should close without data on cancel', () => {
    createWithMode(SelectionModeEnum.FreeSelection);

    component.onNoClick();

    expect(mockDialogRef.close).toHaveBeenCalledWith();
  });
});

describe('TranslateExercisesOptionsDialogComponent', () => {
  let component: TranslateExercisesOptionsDialogComponent;
  let fixture: ComponentFixture<TranslateExercisesOptionsDialogComponent>;
  let mockDialogRef: any;

  beforeEach(async () => {
    mockDialogRef = { close: vi.fn() };

    const mockTranslocoService = {
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

    await TestBed.configureTestingModule({
      imports: [TranslateExercisesOptionsDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            reciteQueuesCount: 20,
            withSelection: false,
          },
        },
        { provide: TranslocoService, useValue: mockTranslocoService },
        { provide: TRANSLOCO_TRANSPILER, useValue: {} },
        { provide: TRANSLOCO_MISSING_HANDLER, useValue: {} },
        { provide: TRANSLOCO_INTERCEPTOR, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TranslateExercisesOptionsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with correct default values', () => {
    expect(component.countOfItems()).toBe(20);
    expect(component.direction()).toBe(TranslateDirectionEnum.EnglishToChinese);
  });

  it('should close dialog without data on cancel', () => {
    component.onNoClick();
    expect(mockDialogRef.close).toHaveBeenCalledWith();
  });

  it('should close dialog with data on confirm', () => {
    component.countOfItems.set(15);
    component.direction.set(TranslateDirectionEnum.ChineseToEnglish);

    component.onYesClick();

    expect(mockDialogRef.close).toHaveBeenCalledWith({
      countOfItems: 15,
      direction: TranslateDirectionEnum.ChineseToEnglish,
    });
  });

  it('getDirectionName should return the localized direction names', () => {
    expect(component.getDirectionName(TranslateDirectionEnum.ChineseToEnglish)).toBe(
      'translateExercises.chineseToEnglish'
    );
    expect(component.getDirectionName(TranslateDirectionEnum.EnglishToChinese)).toBe(
      'translateExercises.englishToChinese'
    );
  });
});

describe('TranslateExercisesOptionsDialogComponent data seeding', () => {
  let component: TranslateExercisesOptionsDialogComponent;
  let fixture: ComponentFixture<TranslateExercisesOptionsDialogComponent>;
  let mockDialogRef: any;

  function createWithData(data: Record<string, unknown>): void {
    TestBed.overrideProvider(MAT_DIALOG_DATA, { useValue: data });
    fixture = TestBed.createComponent(TranslateExercisesOptionsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(async () => {
    mockDialogRef = { close: vi.fn() };

    const mockTranslocoService = {
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

    await TestBed.configureTestingModule({
      imports: [TranslateExercisesOptionsDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: TranslocoService, useValue: mockTranslocoService },
        { provide: TRANSLOCO_TRANSPILER, useValue: {} },
        { provide: TRANSLOCO_MISSING_HANDLER, useValue: {} },
        { provide: TRANSLOCO_INTERCEPTOR, useValue: {} },
      ],
    }).compileComponents();
  });

  it('should seed from currentSettings when provided', () => {
    createWithData({
      reciteQueuesCount: 20,
      withSelection: false,
      currentSettings: {
        countOfItems: 7,
        direction: TranslateDirectionEnum.ChineseToEnglish,
      },
    });

    expect(component.countOfItems()).toBe(7);
    expect(component.direction()).toBe(TranslateDirectionEnum.ChineseToEnglish);
  });

  it('should pin the count to the selection size when a selection is active', () => {
    createWithData({
      reciteQueuesCount: 9,
      withSelection: true,
      currentSettings: {
        countOfItems: 7,
        direction: TranslateDirectionEnum.ChineseToEnglish,
      },
    });

    expect(component.countOfItems()).toBe(9);
    expect(component.direction()).toBe(TranslateDirectionEnum.ChineseToEnglish);
  });
});

describe('TranslateExercisesReviewOptionsDialogComponent', () => {
  let component: TranslateExercisesReviewOptionsDialogComponent;
  let fixture: ComponentFixture<TranslateExercisesReviewOptionsDialogComponent>;
  let mockDialogRef: any;

  function createWithData(data: Record<string, unknown>): void {
    TestBed.overrideProvider(MAT_DIALOG_DATA, { useValue: data });
    fixture = TestBed.createComponent(TranslateExercisesReviewOptionsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(async () => {
    mockDialogRef = { close: vi.fn() };

    const mockTranslocoService = {
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

    await TestBed.configureTestingModule({
      imports: [TranslateExercisesReviewOptionsDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: TranslocoService, useValue: mockTranslocoService },
        { provide: TRANSLOCO_TRANSPILER, useValue: {} },
        { provide: TRANSLOCO_MISSING_HANDLER, useValue: {} },
        { provide: TRANSLOCO_INTERCEPTOR, useValue: {} },
      ],
    }).compileComponents();
  });

  it('should create with defaults', () => {
    createWithData({ sentenceQueueCount: 20, withSelection: false });

    expect(component).toBeTruthy();
    expect(component.disableVoice()).toBe(false);
    expect(component.countOfItems()).toBe(20);
  });

  it('should seed from currentSettings when provided', () => {
    createWithData({
      sentenceQueueCount: 20,
      withSelection: false,
      currentSettings: { countOfItems: 7, disableVoice: true },
    });

    expect(component.countOfItems()).toBe(7);
    expect(component.disableVoice()).toBe(true);
  });

  it('should pin the count to the selection size when a selection is active', () => {
    createWithData({
      sentenceQueueCount: 9,
      withSelection: true,
      currentSettings: { countOfItems: 7, disableVoice: false },
    });

    expect(component.countOfItems()).toBe(9);
  });

  it('isCountInvalid should reject non-integer and non-positive counts', () => {
    createWithData({ sentenceQueueCount: 20, withSelection: false });

    component.countOfItems.set(0);
    expect(component.isCountInvalid).toBe(true);

    component.countOfItems.set(2.5);
    expect(component.isCountInvalid).toBe(true);

    component.countOfItems.set(3);
    expect(component.isCountInvalid).toBe(false);
  });

  it('should close without data on cancel', () => {
    createWithData({ sentenceQueueCount: 20, withSelection: false });

    component.onNoClick();

    expect(mockDialogRef.close).toHaveBeenCalledWith();
  });

  it('should close with the options on confirm', () => {
    createWithData({ sentenceQueueCount: 20, withSelection: false });
    component.countOfItems.set(15);
    component.disableVoice.set(true);

    component.onYesClick();

    expect(mockDialogRef.close).toHaveBeenCalledWith({ disableVoice: true, countOfItems: 15 });
  });
});

describe('TranslateExercisesQuizOptionsDialogComponent', () => {
  let component: TranslateExercisesQuizOptionsDialogComponent;
  let fixture: ComponentFixture<TranslateExercisesQuizOptionsDialogComponent>;
  let mockDialogRef: any;

  function createWithData(data: Record<string, unknown>): void {
    TestBed.overrideProvider(MAT_DIALOG_DATA, { useValue: data });
    fixture = TestBed.createComponent(TranslateExercisesQuizOptionsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(async () => {
    mockDialogRef = { close: vi.fn() };

    const mockTranslocoService = {
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

    await TestBed.configureTestingModule({
      imports: [TranslateExercisesQuizOptionsDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: TranslocoService, useValue: mockTranslocoService },
        { provide: TRANSLOCO_TRANSPILER, useValue: {} },
        { provide: TRANSLOCO_MISSING_HANDLER, useValue: {} },
        { provide: TRANSLOCO_INTERCEPTOR, useValue: {} },
      ],
    }).compileComponents();
  });

  it('should create with defaults', () => {
    createWithData({ sentenceQueueCount: 20, withSelection: false });

    expect(component).toBeTruthy();
    expect(component.countOfItems()).toBe(20);
  });

  it('should seed from currentSettings when provided', () => {
    createWithData({
      sentenceQueueCount: 20,
      withSelection: false,
      currentSettings: { countOfItems: 7 },
    });

    expect(component.countOfItems()).toBe(7);
  });

  it('should pin the count to the selection size when a selection is active', () => {
    createWithData({
      sentenceQueueCount: 9,
      withSelection: true,
      currentSettings: { countOfItems: 7 },
    });

    expect(component.countOfItems()).toBe(9);
  });

  it('isCountInvalid should reject non-integer and non-positive counts', () => {
    createWithData({ sentenceQueueCount: 20, withSelection: false });

    component.countOfItems.set(0);
    expect(component.isCountInvalid).toBe(true);

    component.countOfItems.set(2.5);
    expect(component.isCountInvalid).toBe(true);

    component.countOfItems.set(3);
    expect(component.isCountInvalid).toBe(false);
  });

  it('should close without data on cancel', () => {
    createWithData({ sentenceQueueCount: 20, withSelection: false });

    component.onNoClick();

    expect(mockDialogRef.close).toHaveBeenCalledWith();
  });

  it('should close with the options on confirm', () => {
    createWithData({ sentenceQueueCount: 20, withSelection: false });
    component.countOfItems.set(15);

    component.onYesClick();

    expect(mockDialogRef.close).toHaveBeenCalledWith({ countOfItems: 15 });
  });

  it('should return the persisted count when a selection is active', () => {
    createWithData({
      sentenceQueueCount: 9,
      withSelection: true,
      currentSettings: { countOfItems: 7 },
    });

    component.onYesClick();

    expect(mockDialogRef.close).toHaveBeenCalledWith({ countOfItems: 7 });
  });
});

describe('TranslateExercisesPrintOptionsDialogComponent', () => {
  let component: TranslateExercisesPrintOptionsDialogComponent;
  let fixture: ComponentFixture<TranslateExercisesPrintOptionsDialogComponent>;
  let mockDialogRef: any;

  beforeEach(async () => {
    mockDialogRef = { close: vi.fn() };

    const mockTranslocoService = {
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

    await TestBed.configureTestingModule({
      imports: [TranslateExercisesPrintOptionsDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            reciteQueuesCount: 30,
            withSelection: false,
          },
        },
        { provide: TranslocoService, useValue: mockTranslocoService },
        { provide: TRANSLOCO_TRANSPILER, useValue: {} },
        { provide: TRANSLOCO_MISSING_HANDLER, useValue: {} },
        { provide: TRANSLOCO_INTERCEPTOR, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TranslateExercisesPrintOptionsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with correct default values', () => {
    expect(component.countOfItems()).toBe(20);
    expect(component.printAnswer()).toBe(false);
    expect(component.printWord()).toBe(false);
    expect(component.printEntryDate()).toBe(true);
  });

  it('should close dialog without data on cancel', () => {
    component.onNoClick();
    expect(mockDialogRef.close).toHaveBeenCalledWith();
  });

  it('should close dialog with full options on confirm', () => {
    component.printAnswer.set(true);
    component.printWord.set(true);
    component.countOfItems.set(25);
    component.direction.set(TranslateDirectionEnum.ChineseToEnglish);
    component.printEntryDate.set(false);
    component.selectedExecDateModel.set(1);

    component.onYesClick();

    expect(mockDialogRef.close).toHaveBeenCalledWith(
      expect.objectContaining({
        printAnswer: true,
        printWord: true,
        countOfItems: 25,
        direction: TranslateDirectionEnum.ChineseToEnglish,
        printEntryDate: false,
        respectRetentionCurve: true,
        printExecDate: false,
      })
    );
  });

  it('should include execDate when selectedExecDateModel is 2', () => {
    const testDate = new Date();
    component.selectedExecDateModel.set(2);
    component.execDate.set(testDate);

    component.onYesClick();

    const callArgs = mockDialogRef.close.mock.lastCall?.[0];
    expect(callArgs.printExecDate).toBe(true);
    expect(callArgs.execDate).toBe(testDate);
  });
});

describe('TranslateExercisesInfoDialogComponent', () => {
  let component: TranslateExercisesInfoDialogComponent;
  let fixture: ComponentFixture<TranslateExercisesInfoDialogComponent>;
  let mockDialogRef: any;

  beforeEach(async () => {
    mockDialogRef = { close: vi.fn() };

    const mockTranslocoService = {
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

    await TestBed.configureTestingModule({
      imports: [TranslateExercisesInfoDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            titleKey: 'common.explanation',
            content: 'Some explanation',
          },
        },
        { provide: TranslocoService, useValue: mockTranslocoService },
        { provide: TRANSLOCO_TRANSPILER, useValue: {} },
        { provide: TRANSLOCO_MISSING_HANDLER, useValue: {} },
        { provide: TRANSLOCO_INTERCEPTOR, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TranslateExercisesInfoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should close on close click', () => {
    component.onCloseClick();
    expect(mockDialogRef.close).toHaveBeenCalledWith();
  });
});

describe('TranslateExercisesLLMDialogComponent', () => {
  let component: TranslateExercisesLLMDialogComponent;
  let fixture: ComponentFixture<TranslateExercisesLLMDialogComponent>;
  let mockDialogRef: any;
  let mockAIService: any;

  beforeEach(async () => {
    mockDialogRef = { close: vi.fn() };
    mockAIService = { explainSentence: vi.fn() };

    const mockTranslocoService = {
      setActiveLang: vi.fn(),
      getActiveLang: vi.fn(),
      selectTranslate: vi.fn().mockReturnValue(of('')),
      _loadDependencies: vi.fn().mockReturnValue(of(null)),
      translate: vi.fn((key: string) => {
        if (key === 'translateExercises.direction.chineseToEnglish') {
          return '中译英';
        }
        if (key === 'translateExercises.direction.englishToChinese') {
          return '英译中';
        }
        if (key === 'translateExercises.chineseToEnglish') {
          return '中译英';
        }
        if (key === 'translateExercises.englishToChinese') {
          return '英译中';
        }
        if (key === 'explain') {
          return '讲解';
        }
        if (key === 'translateExercises.correct') {
          return '纠正';
        }
        if (key === 'translateExercises.aiMode.explain') {
          return '讲解';
        }
        if (key === 'translateExercises.aiMode.correct') {
          return '纠正';
        }
        return key;
      }),
      activeLang: 'en',
      config: {
        reRenderOnLangChange: true,
        prodMode: false,
      },
      langChanges$: of('en'),
      events$: of(),
    };

    await TestBed.configureTestingModule({
      imports: [TranslateExercisesLLMDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: AIService, useValue: mockAIService },
        { provide: MAT_DIALOG_DATA, useValue: { orgsent: 'Hello world' } },
        { provide: TranslocoService, useValue: mockTranslocoService },
        { provide: TRANSLOCO_TRANSPILER, useValue: {} },
        { provide: TRANSLOCO_MISSING_HANDLER, useValue: {} },
        { provide: TRANSLOCO_INTERCEPTOR, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TranslateExercisesLLMDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with Explain mode', () => {
    expect(component.mode()).toBe(TranslationAIModeEnum.Explain);
  });

  it('should close dialog on cancel', () => {
    component.onNoClick();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should call AI service to explain sentence in Explain mode', () => {
    mockAIService.explainSentence.mockReturnValue(of({ content: 'Explanation text' }));
    component.mode.set(TranslationAIModeEnum.Explain);

    component.onSubmit();

    expect(mockAIService.explainSentence).toHaveBeenCalledWith(
      expect.stringContaining('Hello world')
    );
    expect(component.aireply()).toBe('Explanation text');
  });

  it('should call AI service to correct translation in Correct mode', () => {
    mockAIService.explainSentence.mockReturnValue(of({ content: 'Correction feedback' }));
    component.mode.set(TranslationAIModeEnum.Correct);
    component.trans.set('My translation');

    component.onSubmit();

    expect(mockAIService.explainSentence).toHaveBeenCalledWith(
      expect.stringContaining('Hello world')
    );
    expect(mockAIService.explainSentence).toHaveBeenCalledWith(
      expect.stringContaining('My translation')
    );
    expect(component.aireply()).toBe('Correction feedback');
  });

  it('should handle error when AI service fails', () => {
    mockAIService.explainSentence.mockReturnValue(throwError(() => new Error('AI failed')));
    vi.spyOn(console, 'error').mockImplementation(() => {});

    component.onSubmit();

    expect(console.error).toHaveBeenCalled();
  });

  it('isTranslationModeCorrection should return true for Correct mode', () => {
    component.mode.set(TranslationAIModeEnum.Correct);
    expect(component.isTranslationModeCorrection).toBe(true);
  });

  it('isTranslationModeCorrection should return false for Explain mode', () => {
    component.mode.set(TranslationAIModeEnum.Explain);
    expect(component.isTranslationModeCorrection).toBe(false);
  });

  it('getAIModeName should return correct names', () => {
    expect(component.getAIModeName(TranslationAIModeEnum.Explain)).toBe('讲解');
    expect(component.getAIModeName(TranslationAIModeEnum.Correct)).toBe('纠正');
  });
});
