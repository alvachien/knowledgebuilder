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

import type { LearnChineseFileItem, LearningContent } from '../../interfaces';

import { ChineseExercisesListComponent } from './chinese-exercises-list.component';

const emptyRoot: IFilterDefinition = { join: FilterJoinType.AND, conditions: [] };

const mockFiles: LearningContent[] = [
  { id: 1, categoryId: 4, nameEnglish: 'File1', nameChinese: '文件一', fileUrl: 'data/file1.json' },
];

const mockItems: LearnChineseFileItem[] = [
  { id: 1, subject: '静夜思', author: '李白', content: '床前明月光' },
  { id: 2, subject: '春晓', author: '孟浩然', content: '春眠不觉晓' },
];

describe('ChineseExercisesListComponent', () => {
  let component: ChineseExercisesListComponent;
  let fixture: ComponentFixture<ChineseExercisesListComponent>;
  let dataSource: MatTableDataSource<LearnChineseFileItem>;
  let selection: SelectionModel<LearnChineseFileItem>;

  beforeEach(async () => {
    dataSource = new MatTableDataSource<LearnChineseFileItem>();
    dataSource.data = mockItems.slice();
    selection = new SelectionModel<LearnChineseFileItem>(true, []);

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
      imports: [ChineseExercisesListComponent, NoopAnimationsModule],
      providers: [
        { provide: TranslocoService, useValue: mockTranslocoService },
        { provide: TRANSLOCO_TRANSPILER, useValue: {} },
        { provide: TRANSLOCO_MISSING_HANDLER, useValue: {} },
        { provide: TRANSLOCO_INTERCEPTOR, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ChineseExercisesListComponent);
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
      'subject',
      'author',
      'content',
      'source',
      'rating',
    ]);
  });

  it('should count visible rows from the filter', () => {
    expect(component.visibleRowCount).toBe(2);

    dataSource.filter = '春晓';
    expect(component.visibleRowCount).toBe(1);
  });

  it('isAllSelected should compare against visible rows only', () => {
    // The filter hides mockItems[0]; only the visible row's state counts.
    selection.select(mockItems[0]);
    selection.select(mockItems[1]);
    dataSource.filter = '春晓';
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
    fixture.componentRef.setInput('appliedFreeText', '春晓');

    fixture.detectChanges();

    expect(component.freeText).toBe('春晓');
  });

  it('should emit free text changes live', () => {
    fixture.detectChanges();
    const emitted: string[] = [];
    component.freeTextChanged.subscribe(v => emitted.push(v));

    component.freeText = '春晓';
    component.onFreeTextChanged();

    expect(emitted).toEqual(['春晓']);
  });

  it('should show a New label when no filter is active', () => {
    expect(component.hasFilter).toBe(false);
    expect(component.filterMenuLabel).toBe('filterNew');
  });

  it('should summarize active text conditions with word labels', () => {
    fixture.componentRef.setInput('filterDefinition', {
      join: FilterJoinType.AND,
      conditions: [{ property: 'subject', operation: FilterOperation.Contains, lowValue: '静夜' }],
    });

    expect(component.hasFilter).toBe(true);
    expect(component.filterMenuLabel).toContain('subject');
    expect(component.filterMenuLabel).toContain('opContains');
    expect(component.filterMenuLabel).toContain('静夜');
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

  it('should strip @ markers from v2 display content', () => {
    const v2Item: LearnChineseFileItem = {
      id: 3,
      subject: ' poem',
      content: 'full text',
      contentlength: 2,
      content1: 'first @line',
      content2: 'second @line',
    };

    // Version 2 file: '@' cloze markers are hidden.
    fixture.componentRef.setInput('selectedFile', { ...mockFiles[0], version: 2 });
    expect(component.getDisplayContentText(v2Item)).toBe('first line\nsecond line');

    // Version 1 file: markers are kept.
    fixture.componentRef.setInput('selectedFile', mockFiles[0]);
    expect(component.getDisplayContentText(v2Item)).toBe('first @line\nsecond @line');
  });

  it('should resolve ratings by numeric item id', () => {
    fixture.componentRef.setInput('contentRatings', new Map([[2, 4]]));

    expect(component.getRating(2)).toBe(4);
    expect(component.getRating(undefined)).toBe(0);
  });
});
