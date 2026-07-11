import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NgxPrintModule } from 'ngx-print';
import { vi } from 'vitest';

import type { KnowledgeExercisePrintOption } from '../../../interfaces';
import { QuestionBankItemSingleChoice, QuestionBankItemFillInTheBlank } from '../../../interfaces';
import { UIService } from '../../../services';
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
      ],
    }).compileComponents();

    mockUIService = TestBed.inject(UIService) as any;

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

    it('should join answer items with a line break when answerLineBreakPerItem is true', () => {
      Object.defineProperty(mockUIService, 'ExerciseItems', {
        value: [mockQuestion, mockFillInTheBlankQuestion],
        enumerable: true,
      });
      Object.defineProperty(mockUIService, 'ExercisePrintSetting', {
        value: { ...mockPrintSetting, printAnswer: true, answerLineBreakPerItem: true },
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

      // Each item's answer starts on its own line; no inline em-space joiner.
      expect(component.markdownAdditionStr).toContain('\n*2*');
      expect(component.markdownAdditionStr).not.toContain('&emsp;');
    });

    it('should join answer items inline with em-space when answerLineBreakPerItem is off', () => {
      Object.defineProperty(mockUIService, 'ExerciseItems', {
        value: [mockQuestion, mockFillInTheBlankQuestion],
        enumerable: true,
      });
      Object.defineProperty(mockUIService, 'ExercisePrintSetting', {
        value: { ...mockPrintSetting, printAnswer: true, answerLineBreakPerItem: false },
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

      // Legacy behavior: items run together with an inline em-space joiner.
      expect(component.markdownAdditionStr).toContain('&emsp;*2*');
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

    it('should mark the OnPush view for check after building markdown (no Print click needed)', () => {
      // Regression: the markdown is built inside a deferred setTimeout. With
      // ChangeDetectionStrategy.OnPush, the view would not re-render to push
      // the new strings into <app-markdown-content> until a DOM event (e.g.
      // clicking Print) triggered detection — leaving the page blank on
      // arrival. The component must call markForCheck() once the strings are
      // ready.
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

      const markForCheckSpy = vi.spyOn(component['cdr'], 'markForCheck');
      markForCheckSpy.mockClear();

      component.ngAfterViewInit();
      // Before the deferred callback runs, markForCheck has not been driven by
      // the markdown-build (the bare setTimeout pre-fix variant never called it).
      expect(markForCheckSpy).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);

      // After the deferred markdown-build, the OnPush view must be marked dirty
      // so the new strings reach <app-markdown-content> without a user event.
      expect(markForCheckSpy).toHaveBeenCalled();
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

    it('should push the built markdown into <app-markdown-content> on init (no Print click)', () => {
      // Regression for the blank-until-Print-click bug: after navigation the
      // page must render its content immediately. We drive the full lifecycle
      // (ngOnInit -> ngAfterViewInit -> timer -> detectChanges) and confirm the
      // markdown string actually reaches the child MarkdownContentComponent.
      vi.useFakeTimers();
      try {
        Object.defineProperty(mockUIService, 'ExerciseItems', {
        value: [mockQuestion],
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
      fixture.detectChanges();

      const markdownEl = fixture.nativeElement.querySelector('app-markdown-content');
      expect(markdownEl).toBeTruthy();
      const markdownDebug = fixture.debugElement.query(By.css('app-markdown-content'));
      const markdownCmp = markdownDebug.componentInstance as { markdown: string };
      expect(markdownCmp.markdown).toBe(component.markdownStr);
      expect(markdownCmp.markdown).toContain('Test Exercise');
      } finally {
        vi.useRealTimers();
      }
    });
  });
});
