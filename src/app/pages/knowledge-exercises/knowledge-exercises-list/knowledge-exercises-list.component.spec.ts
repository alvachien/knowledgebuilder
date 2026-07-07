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

import type { KnowledgeExerciseFileContent, LearningContent } from '../../../interfaces';
import { QuestionBankTypeEnum, RatingOperatorEnum } from '../../../interfaces';
import { LearningContentService } from '../../../services/learning-content.service';
import { UIService } from '../../../services/ui.service';
import { FooterComponent } from '../../../shared/footer/footer';
import { MarkdownContentComponent } from '../../../shared/markdown-content';
import { AppPageTitle } from '../../page-title/page-title';

import {
  KnowledgeExercisesListComponent,
  KnowledgeExercisesPrintOptionsDialogComponent,
  KnowledgeSelectByCountDialogComponent,
  KnowledgeSelectByIDDialogComponent,
  KnowledgeSelectFreeDialogComponent,
  KnowledgeSelectByRatingDialogComponent,
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
    { id: 2, categoryId: 6, nameChinese: 'test-file-2', nameEnglish: 'test-file-2', fileUrl: 'storage/knowledge-exercises/file2.json', includeLatex: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
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
      expect(component.allFiles).toEqual(mockLearningContents);
    });

    it('should mark the OnPush view for check after the file list arrives (no click needed)', () => {
      // Regression: the file list lands in an async subscribe callback (not a
      // template event, not an async pipe). With ChangeDetectionStrategy.OnPush
      // the view is not marked dirty automatically, so the files dropdown stayed
      // empty until a later DOM event triggered detection. The component must
      // call markForCheck() once the list is ready.
      mockLearningContentService.getKnowledgeBankContents.mockReturnValue(of(mockLearningContents));
      const markForCheckSpy = vi.spyOn(component['cdr'], 'markForCheck');
      markForCheckSpy.mockClear();

      component.ngOnInit();

      expect(component.allFiles).toEqual(mockLearningContents);
      expect(markForCheckSpy).toHaveBeenCalled();
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
      const event = { value: mockLearningContents[0] } as any;

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
      const event = { value: mockLearningContents[0] } as any;

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
      component.selectedFile = mockLearningContents[0];
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

  describe('selection menu methods', () => {
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

    describe('onSelectByCount', () => {
      it('should open the By Count dialog', () => {
        const mockDialogRef = { afterClosed: () => of(undefined) };
        vi.spyOn(component.dialog, 'open').mockReturnValue(mockDialogRef as any);

        component.onSelectByCount();

        expect(component.dialog.open).toHaveBeenCalledWith(
          KnowledgeSelectByCountDialogComponent,
          expect.objectContaining({ data: {}, width: '400px' })
        );
      });

      it('should select the requested count from the start by default', () => {
        const mockDialogRef = {
          afterClosed: () => of({ countOfItems: 2, countOfOffset: 0 }),
        };
        vi.spyOn(component.dialog, 'open').mockReturnValue(mockDialogRef as any);

        component.onSelectByCount();

        expect(component.selection.selected.length).toBe(2);
        expect(component.selection.selected[0].id).toBe('10');
        expect(component.selection.selected[1].id).toBe('20');
      });

      it('should respect the offset', () => {
        const mockDialogRef = {
          afterClosed: () => of({ countOfItems: 1, countOfOffset: 1 }),
        };
        vi.spyOn(component.dialog, 'open').mockReturnValue(mockDialogRef as any);

        component.onSelectByCount();

        expect(component.selection.selected.length).toBe(1);
        expect(component.selection.selected[0].id).toBe('20');
      });

      it('should clear the previous selection before applying the new count', () => {
        component.selection.select(mockContentWithIDs[0]);
        const mockDialogRef = {
          afterClosed: () => of({ countOfItems: 1, countOfOffset: 2 }),
        };
        vi.spyOn(component.dialog, 'open').mockReturnValue(mockDialogRef as any);

        component.onSelectByCount();

        expect(component.selection.selected.length).toBe(1);
        expect(component.selection.selected[0].id).toBe('30');
      });

      it('should mark the OnPush view for check after applying the count selection', () => {
        const markForCheckSpy = vi.spyOn(component['cdr'], 'markForCheck');
        markForCheckSpy.mockClear();
        const mockDialogRef = {
          afterClosed: () => of({ countOfItems: 1, countOfOffset: 0 }),
        };
        vi.spyOn(component.dialog, 'open').mockReturnValue(mockDialogRef as any);

        component.onSelectByCount();

        expect(markForCheckSpy).toHaveBeenCalled();
      });

      it('should not change selection when the dialog is cancelled', () => {
        component.selection.select(mockContentWithIDs[0]);
        const before = component.selection.selected.length;
        const mockDialogRef = { afterClosed: () => of(undefined) };
        vi.spyOn(component.dialog, 'open').mockReturnValue(mockDialogRef as any);

        component.onSelectByCount();

        expect(component.selection.selected.length).toBe(before);
      });
    });

    describe('onSelectByID', () => {
      it('should open the By ID dialog', () => {
        const mockDialogRef = { afterClosed: () => of(undefined) };
        vi.spyOn(component.dialog, 'open').mockReturnValue(mockDialogRef as any);

        component.onSelectByID();

        expect(component.dialog.open).toHaveBeenCalledWith(
          KnowledgeSelectByIDDialogComponent,
          expect.objectContaining({ data: {}, width: '500px' })
        );
      });

      it('should select items by comma-separated IDs', () => {
        const mockDialogRef = { afterClosed: () => of({ importIDs: '10,20' }) };
        vi.spyOn(component.dialog, 'open').mockReturnValue(mockDialogRef as any);

        component.onSelectByID();

        expect(component.selection.selected.length).toBe(2);
        const ids = component.selection.selected.map(i => i.id);
        expect(ids).toContain('10');
        expect(ids).toContain('20');
      });

      it('should trim whitespace around IDs', () => {
        const mockDialogRef = { afterClosed: () => of({ importIDs: ' 10 , 30 ' }) };
        vi.spyOn(component.dialog, 'open').mockReturnValue(mockDialogRef as any);

        component.onSelectByID();

        expect(component.selection.selected.length).toBe(2);
        const ids = component.selection.selected.map(i => i.id);
        expect(ids).toContain('10');
        expect(ids).toContain('30');
      });

      it('should handle non-matching IDs gracefully', () => {
        const mockDialogRef = { afterClosed: () => of({ importIDs: '999,888' }) };
        vi.spyOn(component.dialog, 'open').mockReturnValue(mockDialogRef as any);

        component.onSelectByID();

        expect(component.selection.selected.length).toBe(0);
      });

      it('should clear the previous selection before selecting by ID', () => {
        component.selection.select(mockContentWithIDs[0], mockContentWithIDs[1]);
        const mockDialogRef = { afterClosed: () => of({ importIDs: '30' }) };
        vi.spyOn(component.dialog, 'open').mockReturnValue(mockDialogRef as any);

        component.onSelectByID();

        expect(component.selection.selected.length).toBe(1);
        expect(component.selection.selected[0].id).toBe('30');
      });

      it('should mark the OnPush view for check after applying the ID selection', () => {
        const markForCheckSpy = vi.spyOn(component['cdr'], 'markForCheck');
        markForCheckSpy.mockClear();
        const mockDialogRef = { afterClosed: () => of({ importIDs: '10' }) };
        vi.spyOn(component.dialog, 'open').mockReturnValue(mockDialogRef as any);

        component.onSelectByID();

        expect(markForCheckSpy).toHaveBeenCalled();
      });

      it('should not change selection when the dialog is cancelled', () => {
        component.selection.select(mockContentWithIDs[0]);
        const before = component.selection.selected.length;
        const mockDialogRef = { afterClosed: () => of(undefined) };
        vi.spyOn(component.dialog, 'open').mockReturnValue(mockDialogRef as any);

        component.onSelectByID();

        expect(component.selection.selected.length).toBe(before);
      });
    });

    describe('onSelectFreeSelection', () => {
      it('should open the Free Selection dialog', () => {
        const mockDialogRef = { afterClosed: () => of(undefined) };
        vi.spyOn(component.dialog, 'open').mockReturnValue(mockDialogRef as any);

        component.onSelectFreeSelection();

        expect(component.dialog.open).toHaveBeenCalledWith(
          KnowledgeSelectFreeDialogComponent,
          expect.objectContaining({ data: {}, width: '400px' })
        );
      });

      it('should randomly select the requested count of items', () => {
        const mockDialogRef = { afterClosed: () => of({ countOfItems: 2, filterOnTag: '' }) };
        vi.spyOn(component.dialog, 'open').mockReturnValue(mockDialogRef as any);

        component.onSelectFreeSelection();

        expect(component.selection.selected.length).toBe(2);
      });

      it('should filter by tag before random selection when a tag is specified', () => {
        const mockDialogRef = { afterClosed: () => of({ countOfItems: 1, filterOnTag: 'math' }) };
        vi.spyOn(component.dialog, 'open').mockReturnValue(mockDialogRef as any);

        component.onSelectFreeSelection();

        expect(component.selection.selected.length).toBe(1);
        const tags = component.selection.selected[0].tags || [];
        expect(tags.some(tag => tag.toLowerCase().includes('math'))).toBe(true);
      });

      it('should handle the tag filter case-insensitively', () => {
        const mockDialogRef = { afterClosed: () => of({ countOfItems: 2, filterOnTag: 'MATH' }) };
        vi.spyOn(component.dialog, 'open').mockReturnValue(mockDialogRef as any);

        component.onSelectFreeSelection();

        expect(component.selection.selected.length).toBe(2);
        component.selection.selected.forEach(item => {
          const tags = item.tags || [];
          expect(tags.some(tag => tag.toLowerCase().includes('math'))).toBe(true);
        });
      });

      it('should not exceed available items when requesting more than present', () => {
        const mockDialogRef = { afterClosed: () => of({ countOfItems: 100, filterOnTag: '' }) };
        vi.spyOn(component.dialog, 'open').mockReturnValue(mockDialogRef as any);

        component.onSelectFreeSelection();

        expect(component.selection.selected.length).toBe(3);
      });

      it('should select nothing when the tag filter matches no items', () => {
        const mockDialogRef = { afterClosed: () => of({ countOfItems: 5, filterOnTag: 'nonexistent' }) };
        vi.spyOn(component.dialog, 'open').mockReturnValue(mockDialogRef as any);

        component.onSelectFreeSelection();

        expect(component.selection.selected.length).toBe(0);
      });

      it('should clear the previous selection before free selection', () => {
        component.selection.select(mockContentWithIDs[0]);
        const mockDialogRef = { afterClosed: () => of({ countOfItems: 2, filterOnTag: '' }) };
        vi.spyOn(component.dialog, 'open').mockReturnValue(mockDialogRef as any);

        component.onSelectFreeSelection();

        expect(component.selection.selected.length).toBe(2);
      });

      it('should mark the OnPush view for check after applying the free selection', () => {
        const markForCheckSpy = vi.spyOn(component['cdr'], 'markForCheck');
        markForCheckSpy.mockClear();
        const mockDialogRef = { afterClosed: () => of({ countOfItems: 2, filterOnTag: '' }) };
        vi.spyOn(component.dialog, 'open').mockReturnValue(mockDialogRef as any);

        component.onSelectFreeSelection();

        expect(markForCheckSpy).toHaveBeenCalled();
      });

      it('should not change selection when the dialog is cancelled', () => {
        component.selection.select(mockContentWithIDs[0]);
        const before = component.selection.selected.length;
        const mockDialogRef = { afterClosed: () => of(undefined) };
        vi.spyOn(component.dialog, 'open').mockReturnValue(mockDialogRef as any);

        component.onSelectFreeSelection();

        expect(component.selection.selected.length).toBe(before);
      });
    });

    describe('onSelectByRating', () => {
      beforeEach(() => {
        // ratings: id10=5, id20=3, id30=0 (unrated). getRating() parses the
        // string id to a number, so the map is keyed by numeric id.
        (component as any).contentRatingMap.set(10, 5);
        (component as any).contentRatingMap.set(20, 3);
        (component as any).contentRatingMap.set(30, 0);
      });

      it('should open the By Rating dialog', () => {
        const mockDialogRef = { afterClosed: () => of(undefined) };
        vi.spyOn(component.dialog, 'open').mockReturnValue(mockDialogRef as any);

        component.onSelectByRating();

        expect(component.dialog.open).toHaveBeenCalledWith(
          KnowledgeSelectByRatingDialogComponent,
          expect.objectContaining({ data: {}, width: '400px' })
        );
      });

      it('should select items with rating equals 5', () => {
        const mockDialogRef = {
          afterClosed: () => of({ ratingOperator: RatingOperatorEnum.Equals, ratingValue: 5 }),
        };
        vi.spyOn(component.dialog, 'open').mockReturnValue(mockDialogRef as any);

        component.onSelectByRating();

        expect(component.selection.selected.length).toBe(1);
        expect(component.selection.selected[0].id).toBe('10');
      });

      it('should select items with rating greater than 3', () => {
        const mockDialogRef = {
          afterClosed: () => of({ ratingOperator: RatingOperatorEnum.GreaterThan, ratingValue: 3 }),
        };
        vi.spyOn(component.dialog, 'open').mockReturnValue(mockDialogRef as any);

        component.onSelectByRating();

        expect(component.selection.selected.length).toBe(1);
        expect(component.selection.selected[0].id).toBe('10');
      });

      it('should select items with rating larger or equals 3', () => {
        const mockDialogRef = {
          afterClosed: () => of({ ratingOperator: RatingOperatorEnum.LargerOrEquals, ratingValue: 3 }),
        };
        vi.spyOn(component.dialog, 'open').mockReturnValue(mockDialogRef as any);

        component.onSelectByRating();

        expect(component.selection.selected.length).toBe(2);
        expect(component.selection.selected.some(i => i.id === '10')).toBe(true);
        expect(component.selection.selected.some(i => i.id === '20')).toBe(true);
      });

      it('should select rated items below the value, excluding unrated (0)', () => {
        // ratings: id10=5, id20=3, id30=0. LessThan 4 → only id20 (rating 3);
        // id30 (unrated, 0) is deliberately excluded (covered by HasNone).
        const mockDialogRef = {
          afterClosed: () => of({ ratingOperator: RatingOperatorEnum.LessThan, ratingValue: 4 }),
        };
        vi.spyOn(component.dialog, 'open').mockReturnValue(mockDialogRef as any);

        component.onSelectByRating();

        expect(component.selection.selected.length).toBe(1);
        expect(component.selection.selected[0].id).toBe('20');
      });

      it('should select nothing when no rated item is below the value', () => {
        const mockDialogRef = {
          afterClosed: () => of({ ratingOperator: RatingOperatorEnum.LessThan, ratingValue: 2 }),
        };
        vi.spyOn(component.dialog, 'open').mockReturnValue(mockDialogRef as any);

        component.onSelectByRating();

        expect(component.selection.selected.length).toBe(0);
      });

      it('should select items with rating less or equals 3, excluding unrated', () => {
        const mockDialogRef = {
          afterClosed: () => of({ ratingOperator: RatingOperatorEnum.LessOrEquals, ratingValue: 3 }),
        };
        vi.spyOn(component.dialog, 'open').mockReturnValue(mockDialogRef as any);

        component.onSelectByRating();

        expect(component.selection.selected.length).toBe(1);
        expect(component.selection.selected[0].id).toBe('20');
      });

      it('should select nothing for less or equals when no rated item is at or below the value', () => {
        const mockDialogRef = {
          afterClosed: () => of({ ratingOperator: RatingOperatorEnum.LessOrEquals, ratingValue: 2 }),
        };
        vi.spyOn(component.dialog, 'open').mockReturnValue(mockDialogRef as any);

        component.onSelectByRating();

        expect(component.selection.selected.length).toBe(0);
      });

      it('should select items with any rating', () => {
        const mockDialogRef = {
          afterClosed: () => of({ ratingOperator: RatingOperatorEnum.HasAny }),
        };
        vi.spyOn(component.dialog, 'open').mockReturnValue(mockDialogRef as any);

        component.onSelectByRating();

        expect(component.selection.selected.length).toBe(2);
      });

      it('should select items with no rating', () => {
        const mockDialogRef = {
          afterClosed: () => of({ ratingOperator: RatingOperatorEnum.HasNone }),
        };
        vi.spyOn(component.dialog, 'open').mockReturnValue(mockDialogRef as any);

        component.onSelectByRating();

        expect(component.selection.selected.length).toBe(1);
        expect(component.selection.selected[0].id).toBe('30');
      });

      it('should clear the previous selection before applying the rating match', () => {
        component.selection.select(mockContentWithIDs[0]);
        const mockDialogRef = {
          afterClosed: () => of({ ratingOperator: RatingOperatorEnum.HasNone }),
        };
        vi.spyOn(component.dialog, 'open').mockReturnValue(mockDialogRef as any);

        component.onSelectByRating();

        expect(component.selection.selected.length).toBe(1);
        expect(component.selection.selected[0].id).toBe('30');
      });

      it('should not change selection when the dialog is cancelled', () => {
        component.selection.select(mockContentWithIDs[0]);
        const before = component.selection.selected.length;
        const mockDialogRef = { afterClosed: () => of(undefined) };
        vi.spyOn(component.dialog, 'open').mockReturnValue(mockDialogRef as any);

        component.onSelectByRating();

        expect(component.selection.selected.length).toBe(before);
      });

      it('should mark the OnPush view for check after applying the rating selection', () => {
        const markForCheckSpy = vi.spyOn(component['cdr'], 'markForCheck');
        markForCheckSpy.mockClear();
        const mockDialogRef = {
          afterClosed: () => of({ ratingOperator: RatingOperatorEnum.HasAny }),
        };
        vi.spyOn(component.dialog, 'open').mockReturnValue(mockDialogRef as any);

        component.onSelectByRating();

        expect(markForCheckSpy).toHaveBeenCalled();
      });
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
      component.selectedFile = mockLearningContents[0];
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
      // mockLearningContents[1] has includeLatex: true (from mockMetaFiles)
      component.selectedFile = mockLearningContents[1];
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

describe('KnowledgeSelectByCountDialogComponent', () => {
  let component: KnowledgeSelectByCountDialogComponent;
  let fixture: ComponentFixture<KnowledgeSelectByCountDialogComponent>;
  let mockDialogRef: any;

  beforeEach(async () => {
    const dialogRefSpy = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [TranslocoModule],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: TranslocoService, useValue: createMockTranslocoService() },
        { provide: TRANSLOCO_TRANSPILER, useValue: {} },
        { provide: TRANSLOCO_MISSING_HANDLER, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(KnowledgeSelectByCountDialogComponent);
    component = fixture.componentInstance;
    mockDialogRef = TestBed.inject(MatDialogRef) as any;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default count and offset', () => {
    expect(component.countOfItems()).toBe(20);
    expect(component.countOfOffset()).toBe(0);
  });

  it('should close dialog without data on cancel', () => {
    component.onNoClick();
    expect(mockDialogRef.close).toHaveBeenCalledWith();
  });

  it('should close with count and offset on confirm', () => {
    component.countOfItems.set(15);
    component.countOfOffset.set(5);
    component.onYesClick();

    expect(mockDialogRef.close).toHaveBeenCalledWith({
      countOfItems: 15,
      countOfOffset: 5,
    });
  });

  it('isFormInvalid should be true when count is non-positive', () => {
    component.countOfItems.set(0);
    expect(component.isFormInvalid).toBe(true);
  });

  it('isFormInvalid should be false when count is positive and offset is non-negative', () => {
    component.countOfItems.set(10);
    component.countOfOffset.set(0);
    expect(component.isFormInvalid).toBe(false);
  });

  it('isFormInvalid should be true when offset is negative', () => {
    component.countOfItems.set(10);
    component.countOfOffset.set(-1);
    expect(component.isFormInvalid).toBe(true);
  });
});

describe('KnowledgeSelectByIDDialogComponent', () => {
  let component: KnowledgeSelectByIDDialogComponent;
  let fixture: ComponentFixture<KnowledgeSelectByIDDialogComponent>;
  let mockDialogRef: any;

  beforeEach(async () => {
    const dialogRefSpy = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [TranslocoModule],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: TranslocoService, useValue: createMockTranslocoService() },
        { provide: TRANSLOCO_TRANSPILER, useValue: {} },
        { provide: TRANSLOCO_MISSING_HANDLER, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(KnowledgeSelectByIDDialogComponent);
    component = fixture.componentInstance;
    mockDialogRef = TestBed.inject(MatDialogRef) as any;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty importIDs', () => {
    expect(component.importIDs()).toBe('');
  });

  it('should close dialog without data on cancel', () => {
    component.onNoClick();
    expect(mockDialogRef.close).toHaveBeenCalledWith();
  });

  it('should close with importIDs on confirm', () => {
    component.importIDs.set('1,2,3');
    component.onYesClick();

    expect(mockDialogRef.close).toHaveBeenCalledWith({
      importIDs: '1,2,3',
    });
  });

  it('isFormInvalid should be true when importIDs is empty or whitespace', () => {
    component.importIDs.set('');
    expect(component.isFormInvalid).toBe(true);

    component.importIDs.set('   ');
    expect(component.isFormInvalid).toBe(true);
  });

  it('isFormInvalid should be false when importIDs has content', () => {
    component.importIDs.set('1,2,3');
    expect(component.isFormInvalid).toBe(false);
  });
});

describe('KnowledgeSelectFreeDialogComponent', () => {
  let component: KnowledgeSelectFreeDialogComponent;
  let fixture: ComponentFixture<KnowledgeSelectFreeDialogComponent>;
  let mockDialogRef: any;

  beforeEach(async () => {
    const dialogRefSpy = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [TranslocoModule],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: TranslocoService, useValue: createMockTranslocoService() },
        { provide: TRANSLOCO_TRANSPILER, useValue: {} },
        { provide: TRANSLOCO_MISSING_HANDLER, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(KnowledgeSelectFreeDialogComponent);
    component = fixture.componentInstance;
    mockDialogRef = TestBed.inject(MatDialogRef) as any;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default count and empty tag', () => {
    expect(component.countOfItems()).toBe(20);
    expect(component.filterOnTag()).toBe('');
  });

  it('should close dialog without data on cancel', () => {
    component.onNoClick();
    expect(mockDialogRef.close).toHaveBeenCalledWith();
  });

  it('should close with count and tag on confirm', () => {
    component.countOfItems.set(15);
    component.filterOnTag.set('math');
    component.onYesClick();

    expect(mockDialogRef.close).toHaveBeenCalledWith({
      countOfItems: 15,
      filterOnTag: 'math',
    });
  });

  it('isFormInvalid should be true when count is non-positive', () => {
    component.countOfItems.set(0);
    expect(component.isFormInvalid).toBe(true);
  });

  it('isFormInvalid should be false when count is positive', () => {
    component.countOfItems.set(5);
    expect(component.isFormInvalid).toBe(false);
  });
});

describe('KnowledgeSelectByRatingDialogComponent', () => {
  let component: KnowledgeSelectByRatingDialogComponent;
  let fixture: ComponentFixture<KnowledgeSelectByRatingDialogComponent>;
  let mockDialogRef: any;

  beforeEach(async () => {
    const dialogRefSpy = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [TranslocoModule],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: TranslocoService, useValue: createMockTranslocoService() },
        { provide: TRANSLOCO_TRANSPILER, useValue: {} },
        { provide: TRANSLOCO_MISSING_HANDLER, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(KnowledgeSelectByRatingDialogComponent);
    component = fixture.componentInstance;
    mockDialogRef = TestBed.inject(MatDialogRef) as any;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default operator and value', () => {
    expect(component.ratingOperator()).toBe(RatingOperatorEnum.Equals);
    expect(component.ratingValue()).toBe(3);
  });

  it('should close dialog without data on cancel', () => {
    component.onNoClick();
    expect(mockDialogRef.close).toHaveBeenCalledWith();
  });

  it('should close with operator and value on confirm', () => {
    component.ratingOperator.set(RatingOperatorEnum.GreaterThan);
    component.ratingValue.set(3);
    component.onYesClick();

    expect(mockDialogRef.close).toHaveBeenCalledWith({
      ratingOperator: RatingOperatorEnum.GreaterThan,
      ratingValue: 3,
    });
  });

  it('isValueDisabled should return true when HasAny operator is selected', () => {
    component.ratingOperator.set(RatingOperatorEnum.HasAny);
    expect(component.isValueDisabled).toBe(true);
  });

  it('isValueDisabled should return true when HasNone operator is selected', () => {
    component.ratingOperator.set(RatingOperatorEnum.HasNone);
    expect(component.isValueDisabled).toBe(true);
  });

  it('isValueDisabled should return false when Equals operator is selected', () => {
    component.ratingOperator.set(RatingOperatorEnum.Equals);
    expect(component.isValueDisabled).toBe(false);
  });

  it('ratingOperators should include all seven operators', () => {
    const values = component.ratingOperators.map(op => op.value);
    expect(values).toContain(RatingOperatorEnum.Equals);
    expect(values).toContain(RatingOperatorEnum.GreaterThan);
    expect(values).toContain(RatingOperatorEnum.LargerOrEquals);
    expect(values).toContain(RatingOperatorEnum.LessThan);
    expect(values).toContain(RatingOperatorEnum.LessOrEquals);
    expect(values).toContain(RatingOperatorEnum.HasAny);
    expect(values).toContain(RatingOperatorEnum.HasNone);
    expect(component.ratingOperators.length).toBe(7);
  });
});
