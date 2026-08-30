import { SelectionModel } from '@angular/cdk/collections';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { MatTableDataSource } from '@angular/material/table';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
  TranslocoService,
  TRANSLOCO_TRANSPILER,
  TRANSLOCO_MISSING_HANDLER,
  TRANSLOCO_INTERCEPTOR,
} from '@jsverse/transloco';
import { FilterJoinType, FilterOperation, type IFilterDefinition } from 'actslib';
import { of } from 'rxjs';
import { vi } from 'vitest';

import type { KnowledgeExerciseFileContent, LearningContent } from '../../../interfaces';
import { QuestionBankTypeEnum } from '../../../interfaces';

import { KnowledgeExercisesListComponent } from './knowledge-exercises-list.component';

const emptyRoot: IFilterDefinition = { join: FilterJoinType.AND, conditions: [] };

const mockFiles: LearningContent[] = [
  { id: 1, categoryId: 6, nameEnglish: 'File1', nameChinese: '文件一', fileUrl: 'data/file1.json' },
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
  },
  {
    id: '2',
    order: 2,
    itemType: QuestionBankTypeEnum.TrueFalse,
    question: 'The sky is blue',
    answer: '1',
    itemTypeString: '判断题',
    hasAnswer: true,
  },
];

describe('KnowledgeExercisesListComponent', () => {
  let component: KnowledgeExercisesListComponent;
  let fixture: ComponentFixture<KnowledgeExercisesListComponent>;
  let dataSource: MatTableDataSource<KnowledgeExerciseFileContent>;
  let selection: SelectionModel<KnowledgeExerciseFileContent>;

  beforeEach(async () => {
    dataSource = new MatTableDataSource<KnowledgeExerciseFileContent>();
    dataSource.data = mockItems.slice();
    selection = new SelectionModel<KnowledgeExerciseFileContent>(true, []);

    const mockTranslocoService = {
      setActiveLang: vi.fn(),
      getActiveLang: vi.fn(),
      selectTranslate: vi.fn().mockReturnValue(of('')),
      _loadDependencies: vi.fn().mockReturnValue(of(null)),
      translate: vi.fn((key: string) => key.split('.').pop() ?? key),
      activeLang: 'en',
      config: { reRenderOnLangChange: true, prodMode: false },
      langChanges$: of('en'),
      events$: of(),
    };

    await TestBed.configureTestingModule({
      imports: [KnowledgeExercisesListComponent, NoopAnimationsModule],
      providers: [
        { provide: TranslocoService, useValue: mockTranslocoService },
        { provide: TRANSLOCO_TRANSPILER, useValue: {} },
        { provide: TRANSLOCO_MISSING_HANDLER, useValue: {} },
        { provide: TRANSLOCO_INTERCEPTOR, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(KnowledgeExercisesListComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('allFiles', mockFiles);
    fixture.componentRef.setInput('selectedFile', mockFiles[0]);
    fixture.componentRef.setInput('isLoadingContents', false);
    fixture.componentRef.setInput('dataSource', dataSource);
    fixture.componentRef.setInput('selection', selection);
    fixture.componentRef.setInput('contentRatings', new Map<number, number>());
    fixture.componentRef.setInput('filterDefinition', emptyRoot);
    fixture.componentRef.setInput('appliedFreeText', '');
  });

  it('should create and render the table', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should expose the full column set', () => {
    expect(component.displayedColumns).toEqual([
      'select',
      'id',
      'itemtype',
      'difficulty',
      'suggestedCompletionTime',
      'tags',
      'extraInfo',
      'rating',
    ]);
  });

  it('should count visible rows from the filter', () => {
    expect(component.visibleRowCount).toBe(2);

    dataSource.filter = 'sky';
    expect(component.visibleRowCount).toBe(1);
  });

  it('isAllSelected should compare against visible rows only', () => {
    // The filter hides mockItems[0]; only the visible row's state counts.
    selection.select(mockItems[0]);
    selection.select(mockItems[1]);
    dataSource.filter = 'sky';
    fixture.detectChanges();

    expect(component.isAllSelected()).toBe(true);
  });

  it('isAllSelected should be false when a visible row is missing from the selection', () => {
    selection.select(mockItems[0]);

    expect(component.isAllSelected()).toBe(false);
  });

  it('should seed the selection count on init and track changes', () => {
    selection.select(mockItems[0]);
    fixture.detectChanges();
    expect(component.selectionCount()).toBe(1);

    selection.select(mockItems[1]);
    expect(component.selectionCount()).toBe(2);
  });

  it('should seed the free text box from the applied filter', () => {
    fixture.componentRef.setInput('appliedFreeText', 'sky');

    fixture.detectChanges();

    expect(component.freeText).toBe('sky');
  });

  it('should emit free text changes live', () => {
    fixture.detectChanges();
    const emitted: string[] = [];
    component.freeTextChanged.subscribe(v => emitted.push(v));

    component.onFreeTextChanged('sky');

    expect(emitted).toEqual(['sky']);
  });

  it('should suppress live filtering during IME composition', () => {
    fixture.detectChanges();
    const emitted: string[] = [];
    component.freeTextChanged.subscribe(v => emitted.push(v));

    component.onCompositionStart();
    // Intermediate pinyin fragments fire input events; they must not filter.
    component.onFreeTextChanged('s');
    component.onFreeTextChanged('sk');
    expect(emitted).toEqual([]);

    // compositionend delivers the final text and reopens live filtering.
    component.onCompositionEnd('天空');
    expect(emitted).toEqual(['天空']);
    component.onFreeTextChanged('天空 x');
    expect(emitted).toEqual(['天空', '天空 x']);
  });

  it('should show a New label when no filter is active', () => {
    expect(component.hasFilter).toBe(false);
    expect(component.filterMenuLabel).toBe('filterNew');
  });

  it('should summarize text conditions with word labels', () => {
    fixture.componentRef.setInput('filterDefinition', {
      join: FilterJoinType.AND,
      conditions: [{ property: 'tags', operation: FilterOperation.Contains, lowValue: 'sky' }],
    });

    expect(component.hasFilter).toBe(true);
    expect(component.filterMenuLabel).toContain('sky');
    expect(component.filterMenuLabel).toContain('opContains');
  });

  it('should render an enum leaf with the choice label, not the member or an operator word', () => {
    // The enum leaf shows the table's Type description; the raw member value
    // and operator words must not appear.
    fixture.componentRef.setInput('filterDefinition', {
      join: FilterJoinType.AND,
      conditions: [
        {
          property: 'itemType',
          operation: FilterOperation.Equal,
          lowValue: QuestionBankTypeEnum.SingleChoice,
          enumValues: QuestionBankTypeEnum,
        },
      ],
    });

    const label = component.filterMenuLabel;
    expect(label).toContain('单选题');
    expect(label).not.toContain('SingleChoice');
    expect(label).not.toContain('opEqual');
  });

  it('should fold a multi-pick enum OR group into one type list', () => {
    fixture.componentRef.setInput('filterDefinition', {
      join: FilterJoinType.AND,
      conditions: [
        {
          join: FilterJoinType.OR,
          conditions: [
            { property: 'itemType', operation: FilterOperation.Equal, lowValue: QuestionBankTypeEnum.SingleChoice, enumValues: QuestionBankTypeEnum },
            { property: 'itemType', operation: FilterOperation.Equal, lowValue: QuestionBankTypeEnum.TrueFalse, enumValues: QuestionBankTypeEnum },
          ],
        },
      ],
    });

    expect(component.filterMenuLabel).toContain('单选题/判断题');
  });

  it('should summarize rating conditions with comparison symbols', () => {
    fixture.componentRef.setInput('filterDefinition', {
      join: FilterJoinType.AND,
      conditions: [{ property: 'rating', operation: FilterOperation.GreaterOrEqual, lowValue: 3 }],
    });

    expect(component.hasFilter).toBe(true);
    expect(component.filterMenuLabel).toContain('>=');
    expect(component.filterMenuLabel).toContain('3');
  });

  it('should resolve ratings by string item id', () => {
    fixture.componentRef.setInput('contentRatings', new Map([[2, 4]]));

    expect(component.getRating('2')).toBe(4);
    expect(component.getRating(undefined)).toBe(0);
  });
});
