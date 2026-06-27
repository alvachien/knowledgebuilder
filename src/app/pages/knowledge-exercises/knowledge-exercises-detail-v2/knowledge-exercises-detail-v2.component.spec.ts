import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NgxPrintModule } from 'ngx-print';
import { vi } from 'vitest';

import type { KnowledgeExercisePrintOption } from '../../../interfaces';
import { QuestionBankItemSingleChoice, QuestionBankItemFillInTheBlank } from '../../../interfaces';
import { StorageService, UIService } from '../../../services';
import { MarkdownContentComponent } from '../../../shared/markdown-content';

import { KnowledgeExercisesDetailV2Component } from './knowledge-exercises-detail-v2.component';

describe('KnowledgeExercisesDetailV2Component', () => {
  let component: KnowledgeExercisesDetailV2Component;
  let fixture: ComponentFixture<KnowledgeExercisesDetailV2Component>;
  let mockUIService: any;

  const mockQuestion = new QuestionBankItemSingleChoice({
    id: '1',
    order: 1,
    question: 'Test Question',
    options: { A: 'Option A', B: 'Option B' },
    answer: 'A',
  });

  const mockFillInTheBlankQuestion = new QuestionBankItemFillInTheBlank({
    id: '2',
    order: 2,
    question: 'Fill in the _____',
    answer: 'blank',
  });

  const mockPrintSetting: KnowledgeExercisePrintOption = {
    formTitle: 'Test Exercise',
    printScore: true,
    hideLabelOfQuestionType: [],
    printAnswer: true,
    printEntryDate: false,
    printID: false,
    printHintOfAnswer: false,
  };

  beforeEach(async () => {
    const uiSpy = { someMethod: vi.fn() };
    const storageSpy = { someMethod: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [
        MatToolbarModule,
        MatIconModule,
        MatButtonModule,
        MatSlideToggleModule,
        NgxPrintModule,
        MarkdownContentComponent,
        KnowledgeExercisesDetailV2Component,
      ],
      providers: [
        { provide: UIService, useValue: uiSpy },
        { provide: StorageService, useValue: storageSpy },
      ],
    }).compileComponents();

    mockUIService = TestBed.inject(UIService) as any;
    TestBed.inject(StorageService);

    fixture = TestBed.createComponent(KnowledgeExercisesDetailV2Component);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize with questions from UIService', () => {
      const mockQuestions = [mockQuestion];
      Object.defineProperty(mockUIService, 'ExerciseItems', {
        value: mockQuestions,
        enumerable: true,
      });

      component.ngOnInit();

      expect(component.questions).toEqual(mockQuestions);
    });

    it('should initialize with print setting from UIService', () => {
      Object.defineProperty(mockUIService, 'ExercisePrintSetting', {
        value: mockPrintSetting,
        enumerable: true,
      });
      Object.defineProperty(mockUIService, 'IncludeLatex', {
        value: true,
        enumerable: true,
      });

      component.ngOnInit();

      expect(component.printSetting).toEqual(mockPrintSetting);
      expect(component.includeLatex).toBe(true);
    });

    it('should initialize with includeLatex false when not specified', () => {
      Object.defineProperty(mockUIService, 'IncludeLatex', {
        value: false,
        enumerable: true,
      });

      component.ngOnInit();

      expect(component.includeLatex).toBe(false);
    });
  });

  describe('ngAfterViewInit', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should construct markdown string with questions when printAnswer is false', () => {
      const printSettingWithoutAnswers = { ...mockPrintSetting, printAnswer: false };

      Object.defineProperty(mockUIService, 'ExerciseItems', {
        value: [mockQuestion],
        enumerable: true,
      });
      Object.defineProperty(mockUIService, 'ExercisePrintSetting', {
        value: printSettingWithoutAnswers,
        enumerable: true,
      });
      Object.defineProperty(mockUIService, 'IncludeLatex', {
        value: false,
        enumerable: true,
      });

      component.ngOnInit();
      fixture.detectChanges();
      component.ngAfterViewInit();

      vi.advanceTimersByTime(1);

      expect(component.markdownStr).toContain('Test Exercise');
      expect(component.markdownAdditionStr).toBe('');
    });

    it('should construct markdown string with answers when printAnswer is true', () => {
      Object.defineProperty(mockUIService, 'ExerciseItems', {
        value: [mockQuestion],
        enumerable: true,
      });
      Object.defineProperty(mockUIService, 'ExercisePrintSetting', {
        value: mockPrintSetting,
        enumerable: true,
      });
      Object.defineProperty(mockUIService, 'IncludeLatex', {
        value: false,
        enumerable: true,
      });

      component.ngOnInit();
      fixture.detectChanges();
      component.ngAfterViewInit();

      vi.advanceTimersByTime(1);

      expect(component.markdownStr).toContain('Test Exercise');
      expect(component.markdownAdditionStr).toContain('Test Exercise');
    });

    it('should format markdown string with printScore when enabled', () => {
      const printSettingWithScore = { ...mockPrintSetting, printScore: true, printAnswer: false };

      Object.defineProperty(mockUIService, 'ExerciseItems', {
        value: [mockQuestion],
        enumerable: true,
      });
      Object.defineProperty(mockUIService, 'ExercisePrintSetting', {
        value: printSettingWithScore,
        enumerable: true,
      });
      Object.defineProperty(mockUIService, 'IncludeLatex', {
        value: false,
        enumerable: true,
      });

      component.ngOnInit();
      fixture.detectChanges();
      component.ngAfterViewInit();

      vi.advanceTimersByTime(1);

      expect(component.markdownStr).toContain('Date:');
      expect(component.markdownStr).toContain('Score:');
    });

    it('should not include score fields when printScore is false', () => {
      const printSettingWithoutScore = {
        ...mockPrintSetting,
        printScore: false,
        printAnswer: false,
      };

      Object.defineProperty(mockUIService, 'ExerciseItems', {
        value: [mockQuestion],
        enumerable: true,
      });
      Object.defineProperty(mockUIService, 'ExercisePrintSetting', {
        value: printSettingWithoutScore,
        enumerable: true,
      });
      Object.defineProperty(mockUIService, 'IncludeLatex', {
        value: false,
        enumerable: true,
      });

      component.ngOnInit();
      fixture.detectChanges();
      component.ngAfterViewInit();

      vi.advanceTimersByTime(1);

      expect(component.markdownStr).not.toContain('Date:');
      expect(component.markdownStr).not.toContain('Score:');
    });

    it('should process multiple questions', () => {
      const multipleQuestions = [mockQuestion, mockFillInTheBlankQuestion];

      Object.defineProperty(mockUIService, 'ExerciseItems', {
        value: multipleQuestions,
        enumerable: true,
      });
      Object.defineProperty(mockUIService, 'ExercisePrintSetting', {
        value: { ...mockPrintSetting, printAnswer: false },
        enumerable: true,
      });
      Object.defineProperty(mockUIService, 'IncludeLatex', {
        value: false,
        enumerable: true,
      });

      component.ngOnInit();
      fixture.detectChanges();
      component.ngAfterViewInit();

      vi.advanceTimersByTime(1);

      expect(component.questions.length).toBe(2);
      expect(component.markdownStr).toContain('Test Exercise');
    });
  });

  describe('template rendering', () => {
    it('should render toolbar with correct title', () => {
      Object.defineProperty(mockUIService, 'ExerciseItems', {
        value: [mockQuestion],
        enumerable: true,
      });
      Object.defineProperty(mockUIService, 'ExercisePrintSetting', {
        value: mockPrintSetting,
        enumerable: true,
      });
      Object.defineProperty(mockUIService, 'IncludeLatex', {
        value: false,
        enumerable: true,
      });

      component.ngOnInit();
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const toolbarTitle = compiled.querySelector('h5');
      expect(toolbarTitle.textContent).toContain('Knowledge Bank - Exericse Detail, Version 2');
    });
  });
});
