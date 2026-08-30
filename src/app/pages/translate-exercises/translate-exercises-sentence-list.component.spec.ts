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

import type { LearnEnglishSentFileItem, LearningContent } from '../../interfaces';
import { UserCodeService } from '../../services';

import { TranslateExercisesSentenceListComponent } from './translate-exercises-sentence-list.component';

const emptyRoot: IFilterDefinition = { join: FilterJoinType.AND, conditions: [] };

const mockFiles: LearningContent[] = [
  { id: 1, categoryId: 2, nameEnglish: 'File1', nameChinese: '文件一', fileUrl: 'data/file1.json' },
];

const mockSentences: LearnEnglishSentFileItem[] = [
  { id: '1', ensent: 'Hello world', cnsent: '你好世界', enwords: ['hello'] },
  { id: '2', ensent: 'Good morning', cnsent: '早上好', enwords: ['good'] },
];

describe('TranslateExercisesSentenceListComponent', () => {
  let component: TranslateExercisesSentenceListComponent;
  let fixture: ComponentFixture<TranslateExercisesSentenceListComponent>;
  let dataSource: MatTableDataSource<LearnEnglishSentFileItem>;
  let selection: SelectionModel<LearnEnglishSentFileItem>;

  beforeEach(async () => {
    dataSource = new MatTableDataSource<LearnEnglishSentFileItem>();
    dataSource.data = mockSentences.slice();
    selection = new SelectionModel<LearnEnglishSentFileItem>(true, []);

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
      imports: [TranslateExercisesSentenceListComponent, NoopAnimationsModule],
      providers: [
        { provide: UserCodeService, useValue: { isUserCodeEntered: true } },
        { provide: TranslocoService, useValue: mockTranslocoService },
        { provide: TRANSLOCO_TRANSPILER, useValue: {} },
        { provide: TRANSLOCO_MISSING_HANDLER, useValue: {} },
        { provide: TRANSLOCO_INTERCEPTOR, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TranslateExercisesSentenceListComponent);
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
      'ensent',
      'ai',
      'enwords',
      'cnsent',
      'explaination',
      'extraInfo',
      'rating',
    ]);
  });

  it('should resolve sentence ratings through the rating item key', () => {
    fixture.componentRef.setInput('contentRatings', new Map([[2, 4]]));

    expect(component.getRating('2')).toBe(4);
    expect(component.getRating(undefined)).toBe(0);
  });

  it('should count visible rows from the filter', () => {
    expect(component.visibleRowCount).toBe(2);

    dataSource.filter = 'hello';
    expect(component.visibleRowCount).toBe(1);
  });

  it('isAllSelected should compare against visible rows only', () => {
    selection.select(mockSentences[0]);
    dataSource.filter = 'hello';
    fixture.detectChanges();

    expect(component.isAllSelected()).toBe(true);
  });

  it('isAllSelected should be false when a visible row is missing from the selection', () => {
    selection.select(mockSentences[0]);

    expect(component.isAllSelected()).toBe(false);
  });

  it('should seed the selection count on init and track changes', () => {
    selection.select(mockSentences[0]);
    fixture.detectChanges();
    expect(component.selectionCount()).toBe(1);

    selection.select(mockSentences[1]);
    expect(component.selectionCount()).toBe(2);
  });

  it('should seed the free text box from the applied filter', () => {
    fixture.componentRef.setInput('appliedFreeText', 'morning');

    fixture.detectChanges();

    expect(component.freeText).toBe('morning');
  });

  it('should emit free text changes live', () => {
    fixture.detectChanges();
    const emitted: string[] = [];
    component.freeTextChanged.subscribe(v => emitted.push(v));

    component.freeText = 'hello';
    component.onFreeTextChanged();

    expect(emitted).toEqual(['hello']);
  });

  it('should show a New label when no filter is active', () => {
    expect(component.hasFilter).toBe(false);
    expect(component.filterMenuLabel).toBe('filterNew');
  });

  it('should summarize active text conditions with word labels', () => {
    fixture.componentRef.setInput('filterDefinition', {
      join: FilterJoinType.AND,
      conditions: [{ property: 'ensent', operation: FilterOperation.Contains, lowValue: 'hello' }],
    });

    expect(component.hasFilter).toBe(true);
    expect(component.filterMenuLabel).toContain('english');
    expect(component.filterMenuLabel).toContain('opContains');
    expect(component.filterMenuLabel).toContain('hello');
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

  it('should render nested groups parenthesized with join words', () => {
    fixture.componentRef.setInput('filterDefinition', {
      join: FilterJoinType.AND,
      conditions: [
        {
          join: FilterJoinType.OR,
          conditions: [
            { property: 'rating', operation: FilterOperation.GreaterOrEqual, lowValue: 4 },
            { property: 'rating', operation: FilterOperation.Equal, lowValue: 0 },
          ],
        },
      ],
    });

    const label = component.filterMenuLabel;
    expect(label).toContain('joinOr');
    expect(label).toContain('(');
    expect(label).toContain('>=');
  });
});
