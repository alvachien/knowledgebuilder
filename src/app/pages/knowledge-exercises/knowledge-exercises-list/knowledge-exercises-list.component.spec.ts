import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDateFnsModule } from '@angular/material-date-fns-adapter';
import { Title } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import {
  TranslocoModule,
  TranslocoService,
  TRANSLOCO_TRANSPILER,
  TRANSLOCO_MISSING_HANDLER,
} from '@jsverse/transloco';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import type { KnowledgeExerciseFile, KnowledgeExerciseFileContent, LearningContent } from '../../../interfaces';
import { QuestionBankTypeEnum } from '../../../interfaces';
import { LearningContentService } from '../../../services/learning-content.service';
import { StorageService } from '../../../services/storage.service';
import { UIService } from '../../../services/ui.service';
import { FooterComponent } from '../../../shared/footer/footer';
import { MarkdownContentComponent } from '../../../shared/markdown-content';
import { AppPageTitle } from '../../page-title/page-title';

import {
  KnowledgeExercisesListComponent,
  KnowledgeExercisesPrintOptionsDialogComponent,
  KnowledgeExercisesSelectOptionsDialogComponent,
} from './knowledge-exercises-list.component';

// Stub class for the AppPageTitle service
class MockAppPageTitle {
  _title = '';
  _originalTitle = 'Knowledge Builder';

  get title(): string {
    return this._title;
  }

  set title(title: string) {
    this._title = title;
  }
}

function createMockTranslocoService() {
  const mock = {
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
  return mock;
}

describe('KnowledgeExercisesListComponent', () => {
  let component: KnowledgeExercisesListComponent;
  let fixture: ComponentFixture<KnowledgeExercisesListComponent>;
  let mockLearningContentService: any;
  let mockUiService: any;
  let mockRouter: any;

  const mockLearningContents: LearningContent[] = [
    { id: 1, categoryId: 6, nameChinese: 'test-file-1', nameEnglish: 'test-file-1', fileUrl: 'storage/knowledge-exercises/file1.json', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
    { id: 2, categoryId: 6, nameChinese: 'test-file-2', nameEnglish: 'test-file-2', fileUrl: 'storage/knowledge-exercises/file2.json', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  ];

  // Metadata from data.json (loaded via StorageService)
  const mockMetaFiles: KnowledgeExerciseFile[] = [
    { name: 'test-file-1', file: 'file1.json' },
    { name: 'test-file-2', file: 'file2.json', includeLatex: true },
  ];

  // Expected merged result after ngOnInit combines API + metadata
  const expectedAllFiles: KnowledgeExerciseFile[] = [
    { id: 1, name: 'test-file-1', file: 'storage/knowledge-exercises/file1.json', includeLatex: undefined },
    { id: 2, name: 'test-file-2', file: 'storage/knowledge-exercises/file2.json', includeLatex: true },
  ];

  const mockKnowledgeContent: KnowledgeExerciseFileContent[] = [
    {
      id: '1',
      itemType: QuestionBankTypeEnum.FillInTheBlank,
      question: 'Test question 1?',
      answer: 'answer1',
    },
    {
      id: '2',
      itemType: QuestionBankTypeEnum.MultipleChoice,
      question: 'Test question 2?',
      answer: 'answer2',
    },
  ];

  beforeEach(async () => {
    const storageSpy = {
      getKnowledgeExerciseFile: vi.fn().mockReturnValue(of(mockMetaFiles)),
      getKnowledgeExerciseFileContent: vi.fn(),
    };
    const learningContentSpy = {
      getKnowledgeBankContents: vi.fn(),
      getKnowledgeExerciseContent: vi.fn(),
      getStorageFileBaseUrl: vi.fn().mockReturnValue('https://api.test.com/api/Storage/knowledge-exercises/'),
      getStorageFileUrl: vi.fn((url: string) => `https://api.test.com/${url.replace('storage/', '')}`),
    };
    const uiSpy = { setSelectedExerciseItem: vi.fn() };
    const routerSpy = { navigate: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        RouterTestingModule,
        MatButtonModule,
        MatCheckboxModule,
        MatDialogModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatPaginatorModule,
        MatSelectModule,
        MatTableModule,
        MatToolbarModule,
        MatDividerModule,
        MatSnackBarModule,
        ReactiveFormsModule,
        FormsModule,
        FooterComponent,
        MarkdownContentComponent,
        TranslocoModule,
      ],
      providers: [
        { provide: StorageService, useValue: storageSpy },
        { provide: LearningContentService, useValue: learningContentSpy },
        { provide: UIService, useValue: uiSpy },
        { provide: Router, useValue: routerSpy },
        { provide: Title, useValue: { setTitle: vi.fn() } },
        { provide: AppPageTitle, useClass: MockAppPageTitle },
        { provide: TranslocoService, useValue: createMockTranslocoService() },
        { provide: TRANSLOCO_TRANSPILER, useValue: {} },
        { provide: TRANSLOCO_MISSING_HANDLER, useValue: {} },
      ],
    }).compileComponents();

    mockLearningContentService = TestBed.inject(LearningContentService) as any;
    mockUiService = TestBed.inject(UIService) as any;
    mockRouter = TestBed.inject(Router) as any;

    fixture = TestBed.createComponent(KnowledgeExercisesListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize component and load knowledge exercise files', () => {
      mockLearningContentService.getKnowledgeBankContents.mockReturnValue(of(mockLearningContents));

      component.ngOnInit();

      expect(mockLearningContentService.getKnowledgeBankContents).toHaveBeenCalled();
      expect(component.allFiles).toEqual(expectedAllFiles);
    });

    it('should handle error when loading knowledge exercise files', () => {
      vi.spyOn(console, 'error');
      mockLearningContentService.getKnowledgeBankContents.mockReturnValue(
        throwError(() => new Error('Error'))
      );

      component.ngOnInit();

      expect(mockLearningContentService.getKnowledgeBankContents).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('onFileSelectionChanged', () => {
    beforeEach(() => {
      // First populate the component by calling ngOnInit
      mockLearningContentService.getKnowledgeBankContents.mockReturnValue(of(mockLearningContents));
      component.ngOnInit();
    });

    it('should load knowledge content for selected file', () => {
      mockLearningContentService.getKnowledgeExerciseContent.mockReturnValue(of(mockKnowledgeContent));
      const event = { value: expectedAllFiles[0] } as any;

      component.onFileSelectionChanged(event);

      expect(mockLearningContentService.getKnowledgeExerciseContent).toHaveBeenCalledWith(
        'storage/knowledge-exercises/file1.json'
      );
      expect(component.dataSource.data).toEqual(mockKnowledgeContent);
    });

    it('should clear data when "None" is selected', () => {
      const event = { value: null } as any;

      component.onFileSelectionChanged(event);

      expect(component.dataSource.data).toEqual([]);
    });

    it('should handle error when loading knowledge content', () => {
      vi.spyOn(console, 'error');
      mockLearningContentService.getKnowledgeExerciseContent.mockReturnValue(
        throwError(() => new Error('Error'))
      );
      const event = { value: expectedAllFiles[0] } as any;

      component.onFileSelectionChanged(event);

      expect(mockLearningContentService.getKnowledgeExerciseContent).toHaveBeenCalledWith(
        'storage/knowledge-exercises/file1.json'
      );
      expect(console.error).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('selection methods', () => {
    beforeEach(() => {
      component.dataSource.data = mockKnowledgeContent;
    });

    it('should select all rows when not all are selected', () => {
      expect(component.isAllSelected()).toBe(false);

      component.toggleAllRows();

      expect(component.selection.selected.length).toBe(2);
      expect(component.isAllSelected()).toBe(true);
    });

    it('should clear selection when all are selected', () => {
      component.selection.select(...mockKnowledgeContent);
      expect(component.isAllSelected()).toBe(true);

      component.toggleAllRows();

      expect(component.selection.selected.length).toBe(0);
      expect(component.isAllSelected()).toBe(false);
    });

    it('should return correct item count', () => {
      component.dataSource.data = mockKnowledgeContent;

      const count = component.itemCount;

      expect(count).toBe(2);
    });
  });

  describe('applyFilter', () => {
    it('should apply filter to data source', () => {
      component.dataSource.data = mockKnowledgeContent.slice();
      component['originalData'] = mockKnowledgeContent.slice();
      const event = { target: { value: 'Test' } } as unknown as Event;

      component.applyFilter(event);

      expect(component.dataSource.data.length).toBe(2);
    });
  });

  describe('detail view methods', () => {
    beforeEach(() => {
      component.dataSource.data = mockKnowledgeContent;
    });

    it('should switch to detail view', () => {
      component.onShowDetail('1');

      expect(component.contentToDisplay).toBe(component.ContentToDisplay.Detail);
      expect(component.selectedElementIdx).toBe(0);
    });

    it('should go back to list view', () => {
      component.onBackToList();

      expect(component.contentToDisplay).toBe(component.ContentToDisplay.List);
      expect(component.showDetailAnswer).toBe(false);
      expect(component.showDetailHintOfAnswer).toBe(false);
    });

    it('should clear hintOfAnswerMarkdownStr when going back to list', () => {
      component.hintOfAnswerMarkdownStr = 'old hint';
      component.showDetailHintOfAnswer = true;

      component.onBackToList();

      expect(component.hintOfAnswerMarkdownStr).toEqual('');
      expect(component.showDetailHintOfAnswer).toBe(false);
    });

    it('should toggle answer visibility', () => {
      component.onToggleAnswer();

      expect(component.showDetailAnswer).toBe(true);

      component.onToggleAnswer();

      expect(component.showDetailAnswer).toBe(false);
    });

    it('should toggle hint visibility', () => {
      component.onToggleHintOfAnswer();

      expect(component.showDetailHintOfAnswer).toBe(true);

      component.onToggleHintOfAnswer();

      expect(component.showDetailHintOfAnswer).toBe(false);
    });

    it('should generate hint markdown when showing detail for composite type', () => {
      component.dataSource.data = [
        {
          id: 'rc-1',
          itemType: QuestionBankTypeEnum.ReadingComprehension,
          question: 'Passage',
          items: [
            {
              id: 'sub-1',
              itemType: QuestionBankTypeEnum.SingleChoice,
              question: '(1)',
              options: { A: 'A', B: 'B' },
              answer: 'A',
              hintofanswer: 'Hint text',
            },
          ],
        },
      ];
      component.onShowDetail('rc-1');

      expect(component.hintOfAnswerMarkdownStr).toContain('*1*');
      expect(component.hintOfAnswerMarkdownStr).toContain('Hint text');
    });

    it('should clear hintOfAnswerMarkdownStr when showing element with no hints', () => {
      component.dataSource.data = [
        {
          id: 'rc-1',
          itemType: QuestionBankTypeEnum.ReadingComprehension,
          question: 'Passage',
          items: [
            {
              id: 'sub-1',
              itemType: QuestionBankTypeEnum.SingleChoice,
              question: '(1)',
              options: { A: 'A', B: 'B' },
              answer: 'A',
            },
          ],
        },
      ];
      component.hintOfAnswerMarkdownStr = 'old hint';
      component.onShowDetail('rc-1');

      expect(component.hintOfAnswerMarkdownStr).toEqual('');
    });
  });

  describe('navigation methods', () => {
    beforeEach(() => {
      component.dataSource.data = mockKnowledgeContent;
      component.selectedElementIdx = 0;
    });

    it('should go to previous item', () => {
      component.selectedElementIdx = 1;

      component.onPreviousItem();

      expect(component.selectedElementIdx).toBe(0);
    });

    it('should go to next item', () => {
      component.onNextItem();

      expect(component.selectedElementIdx).toBe(1);
    });

    it('should reset hint state when navigating to previous item', () => {
      component.showDetailHintOfAnswer = true;
      component.hintOfAnswerMarkdownStr = 'hint';
      component.selectedElementIdx = 1;

      component.onPreviousItem();

      expect(component.showDetailHintOfAnswer).toBe(false);
      expect(component.hintOfAnswerMarkdownStr).toEqual('');
    });

    it('should reset hint state when navigating to next item', () => {
      component.showDetailHintOfAnswer = true;
      component.hintOfAnswerMarkdownStr = 'hint';

      component.onNextItem();

      expect(component.showDetailHintOfAnswer).toBe(false);
      expect(component.hintOfAnswerMarkdownStr).toEqual('');
    });
  });

  describe('onShowDetail edge cases', () => {
    beforeEach(() => {
      component.dataSource.data = mockKnowledgeContent;
    });

    it('should handle showing detail for non-existent element id', () => {
      component.onShowDetail('999');

      expect(component.contentToDisplay).toBe(component.ContentToDisplay.Detail);
      expect(component.selectedElementIdx).toBe(-1);
    });

    it('should set selected element when found', () => {
      vi.spyOn(component as any, 'setSelectedElement');

      component.onShowDetail('2');

      expect(component.contentToDisplay).toBe(component.ContentToDisplay.Detail);
      expect(component.selectedElementIdx).toBe(1);
      expect(component.setSelectedElement).toHaveBeenCalled();
    });
  });

  describe('onPreview and dialog interaction', () => {
    beforeEach(() => {
      component.dataSource.data = mockKnowledgeContent;
      component.selection.select(mockKnowledgeContent[0]);
      component.selectedFile = expectedAllFiles[0];
    });

    it('should open print options dialog with correct data', () => {
      const mockDialogRef = {
        afterClosed: () => of(undefined),
      };
      vi.spyOn(component.dialog, 'open').mockReturnValue(mockDialogRef as any);

      component.onPreview();

      expect(component.dialog.open).toHaveBeenCalledWith(
        KnowledgeExercisesPrintOptionsDialogComponent,
        expect.objectContaining({
          data: { defaultTitle: 'test-file-1' },
          width: '600px',
          height: '500px',
        })
      );
    });

    it('should update print settings when dialog returns result', () => {
      const mockResult = {
        formTitle: 'Test Form',
        printEntryDate: true,
        printScore: true,
        printAnswer: false,
        printHintOfAnswer: true,
        hideLabelOfQuestionType: [QuestionBankTypeEnum.MultipleChoice],
        shuffleOptionsInSelection: false,
      };
      const mockDialogRef = {
        afterClosed: () => of(mockResult),
      };
      vi.spyOn(component.dialog, 'open').mockReturnValue(mockDialogRef as any);
      vi.spyOn(component as any, 'onPreviewCore');

      component.onPreview();

      expect(component.printSetting.formTitle).toBe('Test Form');
      expect(component.printSetting.printEntryDate).toBe(true);
      expect(component.printSetting.printScore).toBe(true);
      expect(component.printSetting.printAnswer).toBe(false);
      expect(component.printSetting.printHintOfAnswer).toBe(true);
      expect(component.printSetting.hideLabelOfQuestionType).toEqual([
        QuestionBankTypeEnum.MultipleChoice,
      ]);
      expect(component.printSetting.shuffleOptionsInSelection).toBe(false);
    });

    it('should call onPreviewCore when dialog confirms', () => {
      const mockResult = {
        formTitle: 'Test',
        printEntryDate: false,
        printScore: false,
        printAnswer: false,
        printHintOfAnswer: false,
        hideLabelOfQuestionType: [],
        shuffleOptionsInSelection: true,
      };
      const mockDialogRef = {
        afterClosed: () => of(mockResult),
      };
      vi.spyOn(component.dialog, 'open').mockReturnValue(mockDialogRef as any);
      vi.spyOn(component as any, 'onPreviewCore');

      component.onPreview();

      expect(component['onPreviewCore']).toHaveBeenCalled();
    });

    it('should not update settings when dialog is cancelled', () => {
      const originalTitle = component.printSetting.formTitle;
      const mockDialogRef = {
        afterClosed: () => of(undefined),
      };
      vi.spyOn(component.dialog, 'open').mockReturnValue(mockDialogRef as any);
      vi.spyOn(component as any, 'onPreviewCore');

      component.onPreview();

      expect(component.printSetting.formTitle).toBe(originalTitle);
      expect(component['onPreviewCore']).not.toHaveBeenCalled();
    });
  });

  describe('onSelect and selection modes', () => {
    const mockContentWithIDs: KnowledgeExerciseFileContent[] = [
      {
        id: '10',
        itemType: QuestionBankTypeEnum.FillInTheBlank,
        question: 'Question 10?',
        answer: 'answer10',
        tags: ['math', 'algebra'],
      },
      {
        id: '20',
        itemType: QuestionBankTypeEnum.MultipleChoice,
        question: 'Question 20?',
        answer: 'answer20',
        tags: ['science', 'physics'],
      },
      {
        id: '30',
        itemType: QuestionBankTypeEnum.TrueFalse,
        question: 'Question 30?',
        answer: 'true',
        tags: ['MATH', 'geometry'],
      },
    ];

    beforeEach(() => {
      component.dataSource.data = mockContentWithIDs;
    });

    it('should open select options dialog', () => {
      const mockDialogRef = {
        afterClosed: () => of(undefined),
      };
      vi.spyOn(component.dialog, 'open').mockReturnValue(mockDialogRef as any);

      component.onSelect();

      expect(component.dialog.open).toHaveBeenCalledWith(
        KnowledgeExercisesSelectOptionsDialogComponent,
        expect.objectContaining({
          data: {},
          width: '600px',
          height: '560px',
        })
      );
    });

    // ByID mode tests
    it('should select items by comma-separated IDs in ByID mode', () => {
      const mockResult = {
        selectedSelectMode: 0, // ByID
        importIDs: '10,20',
        countOfItems: 0,
        filterOnTag: '',
      };
      const mockDialogRef = {
        afterClosed: () => of(mockResult),
      };
      vi.spyOn(component.dialog, 'open').mockReturnValue(mockDialogRef as any);

      component.onSelect();

      expect(component.selection.selected.length).toBe(2);
      const selectedIds = component.selection.selected.map(item => item.id);
      expect(selectedIds).toContain('10');
      expect(selectedIds).toContain('20');
    });

    it('should trim whitespace from IDs in ByID mode', () => {
      const mockResult = {
        selectedSelectMode: 0, // ByID
        importIDs: ' 10 , 30 ',
        countOfItems: 0,
        filterOnTag: '',
      };
      const mockDialogRef = {
        afterClosed: () => of(mockResult),
      };
      vi.spyOn(component.dialog, 'open').mockReturnValue(mockDialogRef as any);

      component.onSelect();

      expect(component.selection.selected.length).toBe(2);
      const selectedIds = component.selection.selected.map(item => item.id);
      expect(selectedIds).toContain('10');
      expect(selectedIds).toContain('30');
    });

    it('should handle invalid IDs gracefully', () => {
      const mockResult = {
        selectedSelectMode: 0, // ByID
        importIDs: '999,888',
        countOfItems: 0,
        filterOnTag: '',
      };
      const mockDialogRef = {
        afterClosed: () => of(mockResult),
      };
      vi.spyOn(component.dialog, 'open').mockReturnValue(mockDialogRef as any);

      component.onSelect();

      expect(component.selection.selected.length).toBe(0);
    });

    it('should clear previous selection before selecting by ID', () => {
      component.selection.select(mockContentWithIDs[0], mockContentWithIDs[1]);
      expect(component.selection.selected.length).toBe(2);

      const mockResult = {
        selectedSelectMode: 0, // ByID
        importIDs: '30',
        countOfItems: 0,
        filterOnTag: '',
      };
      const mockDialogRef = {
        afterClosed: () => of(mockResult),
      };
      vi.spyOn(component.dialog, 'open').mockReturnValue(mockDialogRef as any);

      component.onSelect();

      expect(component.selection.selected.length).toBe(1);
      expect(component.selection.selected[0].id).toBe('30');
    });

    // FreeSelection mode tests
    it('should randomly select specified count of items in FreeSelection mode', () => {
      const mockResult = {
        selectedSelectMode: 1, // FreeSelection
        importIDs: '',
        countOfItems: 2,
        filterOnTag: '',
      };
      const mockDialogRef = {
        afterClosed: () => of(mockResult),
      };
      vi.spyOn(component.dialog, 'open').mockReturnValue(mockDialogRef as any);

      component.onSelect();

      expect(component.selection.selected.length).toBe(2);
    });

    it('should filter by tag before random selection when tag specified', () => {
      const mockResult = {
        selectedSelectMode: 1, // FreeSelection
        importIDs: '',
        countOfItems: 1,
        filterOnTag: 'math',
      };
      const mockDialogRef = {
        afterClosed: () => of(mockResult),
      };
      vi.spyOn(component.dialog, 'open').mockReturnValue(mockDialogRef as any);

      component.onSelect();

      expect(component.selection.selected.length).toBe(1);
      // Should only select items with 'math' tag
      const selectedTags = component.selection.selected[0].tags || [];
      const hasMathTag = selectedTags.some(tag => tag.toLowerCase().includes('math'));
      expect(hasMathTag).toBe(true);
    });

    it('should handle tag filter case-insensitively', () => {
      const mockResult = {
        selectedSelectMode: 1, // FreeSelection
        importIDs: '',
        countOfItems: 2,
        filterOnTag: 'MATH',
      };
      const mockDialogRef = {
        afterClosed: () => of(mockResult),
      };
      vi.spyOn(component.dialog, 'open').mockReturnValue(mockDialogRef as any);

      component.onSelect();

      // Should find both 'math' and 'MATH' tags
      expect(component.selection.selected.length).toBe(2);
      component.selection.selected.forEach(item => {
        const tags = item.tags || [];
        const hasMathTag = tags.some(tag => tag.toLowerCase().includes('math'));
        expect(hasMathTag).toBe(true);
      });
    });

    it('should not exceed available items when selecting randomly', () => {
      const mockResult = {
        selectedSelectMode: 1, // FreeSelection
        importIDs: '',
        countOfItems: 100, // Request more than available
        filterOnTag: '',
      };
      const mockDialogRef = {
        afterClosed: () => of(mockResult),
      };
      vi.spyOn(component.dialog, 'open').mockReturnValue(mockDialogRef as any);

      component.onSelect();

      expect(component.selection.selected.length).toBe(3); // Only 3 items available
    });

    it('should handle empty result after tag filtering', () => {
      const mockResult = {
        selectedSelectMode: 1, // FreeSelection
        importIDs: '',
        countOfItems: 5,
        filterOnTag: 'nonexistent',
      };
      const mockDialogRef = {
        afterClosed: () => of(mockResult),
      };
      vi.spyOn(component.dialog, 'open').mockReturnValue(mockDialogRef as any);

      component.onSelect();

      expect(component.selection.selected.length).toBe(0);
    });

    it('should clear previous selection before free selection', () => {
      component.selection.select(mockContentWithIDs[0]);
      expect(component.selection.selected.length).toBe(1);

      const mockResult = {
        selectedSelectMode: 1, // FreeSelection
        importIDs: '',
        countOfItems: 2,
        filterOnTag: '',
      };
      const mockDialogRef = {
        afterClosed: () => of(mockResult),
      };
      vi.spyOn(component.dialog, 'open').mockReturnValue(mockDialogRef as any);

      component.onSelect();

      expect(component.selection.selected.length).toBe(2);
    });

    // Dialog cancellation
    it('should not change selection when dialog is cancelled', () => {
      component.selection.select(mockContentWithIDs[0]);
      const originalSelectionCount = component.selection.selected.length;

      const mockDialogRef = {
        afterClosed: () => of(undefined),
      };
      vi.spyOn(component.dialog, 'open').mockReturnValue(mockDialogRef as any);

      component.onSelect();

      expect(component.selection.selected.length).toBe(originalSelectionCount);
    });
  });

  describe('onPreviewCore', () => {
    const mockItemWithSubItems: KnowledgeExerciseFileContent = {
      id: '3',
      itemType: QuestionBankTypeEnum.ReadingComprehension,
      question: 'Reading passage',
      answer: 'N/A',
      items: [
        {
          id: '3-1',
          itemType: QuestionBankTypeEnum.MultipleChoice,
          question: 'Sub question 1?',
          answer: 'A',
        },
        {
          id: '3-2',
          itemType: QuestionBankTypeEnum.MultipleChoice,
          question: 'Sub question 2?',
          answer: 'B',
        },
      ],
    };

    beforeEach(() => {
      component.dataSource.data = [mockKnowledgeContent[0], mockItemWithSubItems];
      component.selectedFile = expectedAllFiles[0];
      component.printSetting = {
        formTitle: 'Test',
        printEntryDate: false,
        printScore: false,
        printAnswer: false,
        printHintOfAnswer: false,
        printID: true,
        hideLabelOfQuestionType: [],
        shuffleOptionsInSelection: false,
      };
    });

    it('should set order for selected items', () => {
      component.selection.select(mockKnowledgeContent[0], mockItemWithSubItems);

      component['onPreviewCore']();

      expect(component.selection.selected[0].order).toBe(1);
      expect(component.selection.selected[1].order).toBe(2);
    });

    it('should set order for sub-items when they exist', () => {
      component.selection.select(mockItemWithSubItems);

      component['onPreviewCore']();

      expect(mockItemWithSubItems.items![0].order).toBe(1);
      expect(mockItemWithSubItems.items![1].order).toBe(2);
    });

    it('should call uiService.setSelectedExerciseItem with correct parameters', () => {
      component.selection.select(mockKnowledgeContent[0]);

      component['onPreviewCore']();

      expect(mockUiService.setSelectedExerciseItem).toHaveBeenCalledWith(
        expect.any(Array),
        component.printSetting,
        false,
        undefined
      );
    });

    it('should navigate to displayv2 route', () => {
      component.selection.select(mockKnowledgeContent[0]);

      component['onPreviewCore']();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/knowledge/displayv2']);
    });

    it('should handle items without sub-items', () => {
      component.selection.select(mockKnowledgeContent[0]);

      expect(() => component['onPreviewCore']()).not.toThrow();

      expect(component.selection.selected[0].order).toBe(1);
    });

    it('should use includeLatex flag from file metadata', () => {
      // expectedAllFiles[1] has includeLatex: true (from mockMetaFiles)
      component.selectedFile = expectedAllFiles[1];
      component.selection.select(mockKnowledgeContent[0]);

      component['onPreviewCore']();

      expect(mockUiService.setSelectedExerciseItem).toHaveBeenCalledWith(
        expect.any(Array),
        component.printSetting,
        true,
        undefined
      );
    });
  });
});

describe('KnowledgeExercisesPrintOptionsDialogComponent', () => {
  let component: KnowledgeExercisesPrintOptionsDialogComponent;
  let fixture: ComponentFixture<KnowledgeExercisesPrintOptionsDialogComponent>;
  let mockDialogRef: any;
  let mockSnackBar: any;

  beforeEach(async () => {
    const dialogRefSpy = { close: vi.fn() };
    const snackBarSpy = { open: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [
        MatFormFieldModule,
        FormsModule,
        MatInputModule,
        MatCheckboxModule,
        MatButtonModule,
        MatDialogModule,
        MatSelectModule,
        MatRadioModule,
        MatDatepickerModule,
        MatDateFnsModule,
        MatSnackBarModule,
        TranslocoModule,
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { defaultTitle: 'Test Title' } },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: TranslocoService, useValue: createMockTranslocoService() },
        { provide: TRANSLOCO_TRANSPILER, useValue: {} },
        { provide: TRANSLOCO_MISSING_HANDLER, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(KnowledgeExercisesPrintOptionsDialogComponent);
    component = fixture.componentInstance;
    mockDialogRef = TestBed.inject(MatDialogRef) as any;
    mockSnackBar = TestBed.inject(MatSnackBar) as any;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default title', () => {
    expect(component.formTitle()).toBe('Test Title');
  });

  it('should close dialog without data when onNoClick called', () => {
    component.onNoClick();

    expect(mockDialogRef.close).toHaveBeenCalledWith();
  });

  it('should show error when form title is empty on submit', () => {
    component.formTitle.set('');

    component.onYesClick();

    expect(mockSnackBar.open).toHaveBeenCalledWith('required_field', 'close', {
      duration: 3000,
    });
    expect(mockDialogRef.close).not.toHaveBeenCalled();
  });

  it('should show error when form title is whitespace only', () => {
    component.formTitle.set('   ');

    component.onYesClick();

    expect(mockSnackBar.open).toHaveBeenCalledWith('required_field', 'close', {
      duration: 3000,
    });
    expect(mockDialogRef.close).not.toHaveBeenCalled();
  });

  it('should close with print options data when form is valid', () => {
    component.formTitle.set('Valid Title');
    component.printEntryDate.set(true);
    component.printScore.set(false);

    component.onYesClick();

    expect(mockDialogRef.close).toHaveBeenCalledWith(
      expect.objectContaining({
        formTitle: 'Valid Title',
        printEntryDate: true,
        printScore: false,
      })
    );
  });

  it('should include all form fields in close data', () => {
    component.formTitle.set('Complete Form');
    component.printEntryDate.set(true);
    component.printScore.set(false);
    component.printAnswer.set(true);
    component.printHintOfAnswer.set(false);
    component.printID.set(true);
    component.hideLabelOfQuestionType.set(['MultipleChoice'] as any);
    component.shuffleOptionsInSelection.set(true);

    component.onYesClick();

    expect(mockDialogRef.close).toHaveBeenCalledWith({
      formTitle: 'Complete Form',
      printEntryDate: true,
      printScore: false,
      printAnswer: true,
      printHintOfAnswer: false,
      printID: true,
      hideLabelOfQuestionType: ['MultipleChoice'],
      shuffleOptionsInSelection: true,
    });
  });

  it('should handle hideLabelOfQuestionType selection', () => {
    component.formTitle.set('Test');
    component.hideLabelOfQuestionType.set(['MultipleChoice', 'FillInTheBlank'] as any);

    component.onYesClick();

    const closeArg = mockDialogRef.close.mock.lastCall?.[0];
    expect(closeArg.hideLabelOfQuestionType).toEqual(['MultipleChoice', 'FillInTheBlank']);
  });

  it('should handle shuffleOptionsInSelection toggle', () => {
    component.formTitle.set('Test');
    component.shuffleOptionsInSelection.set(false);

    component.onYesClick();

    const closeArg = mockDialogRef.close.mock.lastCall?.[0];
    expect(closeArg.shuffleOptionsInSelection).toBe(false);
  });
});

describe('KnowledgeExercisesSelectOptionsDialogComponent', () => {
  let component: KnowledgeExercisesSelectOptionsDialogComponent;
  let fixture: ComponentFixture<KnowledgeExercisesSelectOptionsDialogComponent>;
  let mockDialogRef: any;

  beforeEach(async () => {
    const dialogRefSpy = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [
        MatFormFieldModule,
        MatInputModule,
        MatCheckboxModule,
        MatButtonModule,
        MatDialogModule,
        MatSelectModule,
        MatDatepickerModule,
        MatDateFnsModule,
        MatRadioModule,
        TranslocoModule,
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: TranslocoService, useValue: createMockTranslocoService() },
        { provide: TRANSLOCO_TRANSPILER, useValue: {} },
        { provide: TRANSLOCO_MISSING_HANDLER, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(KnowledgeExercisesSelectOptionsDialogComponent);
    component = fixture.componentInstance;
    mockDialogRef = TestBed.inject(MatDialogRef) as any;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return correct form validation status', () => {
    // Test for ByID mode with empty IDs
    component.selectedSelectMode.set(0); // ByID
    component.importIDs.set('');

    expect(component.isFormInvalid).toBe(true);

    // Test for ByID mode with non-empty IDs
    component.importIDs.set('1,2,3');

    expect(component.isFormInvalid).toBe(false);

    // Test for FreeSelection mode with count <= 0
    component.selectedSelectMode.set(1); // FreeSelection
    component.countOfItems.set(0);

    expect(component.isFormInvalid).toBe(true);

    // Test for FreeSelection mode with count > 0
    component.countOfItems.set(5);

    expect(component.isFormInvalid).toBe(false);
  });

  it('should close dialog without data when onNoClick called', () => {
    component.onNoClick();

    expect(mockDialogRef.close).toHaveBeenCalledWith();
  });

  it('should return true for isSelectByID when ByID mode selected', () => {
    component.selectedSelectMode.set(0); // ByID

    expect(component.isSelectByID).toBe(true);
  });

  it('should return false for isSelectByID when FreeSelection mode selected', () => {
    component.selectedSelectMode.set(1); // FreeSelection

    expect(component.isSelectByID).toBe(false);
  });

  it('should return true for isSelectByFreeSelection when FreeSelection mode selected', () => {
    component.selectedSelectMode.set(1); // FreeSelection

    expect(component.isSelectByFreeSelection).toBe(true);
  });

  it('should return false for isSelectByFreeSelection when ByID mode selected', () => {
    component.selectedSelectMode.set(0); // ByID

    expect(component.isSelectByFreeSelection).toBe(false);
  });

  it('should close with selection options when valid', () => {
    component.selectedSelectMode.set(0); // ByID
    component.importIDs.set('1,2,3');
    component.countOfItems.set(5);
    component.filterOnTag.set('math');

    component.onYesClick();

    expect(mockDialogRef.close).toHaveBeenCalledWith({
      selectedSelectMode: 0,
      importIDs: '1,2,3',
      countOfItems: 5,
      filterOnTag: 'math',
    });
  });

  it('should include all form fields in close data', () => {
    component.selectedSelectMode.set(1); // FreeSelection
    component.importIDs.set('');
    component.countOfItems.set(10);
    component.filterOnTag.set('science');

    component.onYesClick();

    expect(mockDialogRef.close).toHaveBeenCalledWith({
      selectedSelectMode: 1,
      importIDs: '',
      countOfItems: 10,
      filterOnTag: 'science',
    });
  });

  it('should handle whitespace in importIDs', () => {
    component.selectedSelectMode.set(0); // ByID
    component.importIDs.set('  1 , 2 , 3  ');

    component.onYesClick();

    const closeArg = mockDialogRef.close.mock.lastCall?.[0];
    expect(closeArg.importIDs).toBe('  1 , 2 , 3  ');
  });
});
