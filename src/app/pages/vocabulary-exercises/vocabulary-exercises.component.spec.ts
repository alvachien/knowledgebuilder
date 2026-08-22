import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import {
  TranslocoModule,
  TranslocoService,
  TRANSLOCO_TRANSPILER,
  TRANSLOCO_MISSING_HANDLER,
} from '@jsverse/transloco';
import { of, Subject, throwError } from 'rxjs';
import { vi } from 'vitest';

import type { LearningContent, LearnEnglishWordFileItem, UserLearningRating } from '../../interfaces';
import { RatingOperatorEnum, SelectionModeEnum } from '../../interfaces';
import { AudioService, UIService, LearningContentService, LearningRatingService } from '../../services';
import { AppPageTitle } from '../page-title/page-title';

import { VocabularyExercisesQuizOptionsDialogComponent } from './vocabulary-exercises-quizoptions-dialog.component';
import { VocabularyExercisesReviewOptionsDialogComponent } from './vocabulary-exercises-reviewoptions-dialog.component';
import { VocabularySelectDialogComponent } from './vocabulary-exercises-select-dialog.component';
import { VocabularyExercisesSpellingOptionsDialogComponent } from './vocabulary-exercises-spellingoptions-dialog.component';
import { VocabularyExercisesWordListComponent } from './vocabulary-exercises-word-list.component';
import { VocabularyExercisesWorksheetOptionsDialogComponent } from './vocabulary-exercises-worksheetoptions-dialog.component';
import { VocabularyExercisesComponent } from './vocabulary-exercises.component';

const mockDataFiles: LearningContent[] = [
  { id: 1, categoryId: 1, nameEnglish: 'File1', nameChinese: '文件一', fileUrl: 'data/file1.json' },
  { id: 2, categoryId: 1, nameEnglish: 'File2', nameChinese: '文件二', fileUrl: 'data/file2.json' },
];

const mockWordContent: LearnEnglishWordFileItem[] = [
  { enword: 'hello', cnword: '你好' },
  { enword: 'world', cnword: '世界' },
  { enword: 'test', cnword: '测试' },
  { enword: 'apple pie', cnword: '苹果派' },
  { enword: 'banana', cnword: '香蕉' },
  { enword: 'cat', cnword: '猫' },
  { enword: 'dog', cnword: '狗' },
  { enword: 'elephant', cnword: '大象' },
];

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

describe('VocabularyExercisesComponent', () => {
  let component: VocabularyExercisesComponent;
  let fixture: ComponentFixture<VocabularyExercisesComponent>;
  let mockLearningContentService: any;
  let mockAudioService: any;
  let mockUIService: any;
  let mockRouter: any;
  let mockDialog: any;
  let mockPageTitle: AppPageTitle;
  let mockRatingService: any;

  beforeEach(async () => {
    mockLearningContentService = {
      getVocabularyContents: vi.fn(),
      getVocabularyWordContent: vi.fn(),
      addTemporaryContent: vi.fn(),
    };
    mockAudioService = { playSound: vi.fn(), stopSound: vi.fn(), speakWord: vi.fn() };
    mockUIService = { setSelectedExerciseItem: vi.fn() };
    mockRouter = { navigate: vi.fn() };
    mockDialog = { open: vi.fn() };
    mockPageTitle = { title: '' } as AppPageTitle;
    mockRatingService = {
      getRatings: vi.fn().mockReturnValue(of([])),
      upsertRating: vi.fn().mockReturnValue(of({} as UserLearningRating)),
    };

    mockLearningContentService.getVocabularyContents.mockReturnValue(of(mockDataFiles));
    mockLearningContentService.getVocabularyWordContent.mockReturnValue(of(mockWordContent));

    await TestBed.configureTestingModule({
      imports: [VocabularyExercisesComponent, NoopAnimationsModule, TranslocoModule],
      providers: [
        { provide: LearningContentService, useValue: mockLearningContentService },
        { provide: AudioService, useValue: mockAudioService },
        { provide: UIService, useValue: mockUIService },
        { provide: Router, useValue: mockRouter },
        { provide: MatDialog, useValue: mockDialog },
        { provide: AppPageTitle, useValue: mockPageTitle },
        { provide: LearningRatingService, useValue: mockRatingService },
        { provide: TranslocoService, useValue: createMockTranslocoService() },
        { provide: TRANSLOCO_TRANSPILER, useValue: {} },
        { provide: TRANSLOCO_MISSING_HANDLER, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VocabularyExercisesComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should set page title to Vocabulary', () => {
      fixture.detectChanges();
      expect(component.pageTitle.title).toBe('Vocabulary');
    });

    it('should load all data files on initialization', () => {
      fixture.detectChanges();
      expect(mockLearningContentService.getVocabularyContents).toHaveBeenCalled();
      expect(component.allFiles()).toEqual(mockDataFiles);
    });

    it('should expose the file list via signals when it arrives (no click needed)', () => {
      // Regression guard: the file list lands in an async subscribe callback.
      // Because allFiles/isLoadingContents are signals read by the template,
      // the OnPush view updates without any manual markForCheck.
      fixture.detectChanges(); // runs ngOnInit → synchronous of() emit → next

      expect(component.allFiles()).toEqual(mockDataFiles);
      expect(component.isLoadingContents()).toBe(false);
    });

    it('should handle error when loading data files fails', () => {
      mockLearningContentService.getVocabularyContents.mockReturnValue(
        throwError(() => new Error('Load failed'))
      );
      vi.spyOn(console, 'error');

      fixture.detectChanges();

      expect(console.error).toHaveBeenCalled();
    });
  });

  // The filter bar's structured criteria travel through dataSource.filter as
  // JSON; tests go through applyListFilter rather than assigning raw strings.
  const applyFreeText = (text: string) =>
    component.applyListFilter({
      freeText: text,
      wordConditions: [],
      ratingConditions: [],
    });

  describe('applyListFilter', () => {
    it('should serialize non-empty criteria into the data source filter', () => {
      component.dataSource.data = mockWordContent;

      applyFreeText('  HELLO  ');

      expect(component.dataSource.filter).not.toBe('');
      expect(component.dataSource.filteredData.length).toBe(1);
      expect(component.dataSource.filteredData[0].enword).toBe('hello');
    });

    it('should clear the filter string when all criteria are empty', () => {
      component.dataSource.data = mockWordContent;

      component.applyListFilter({ freeText: '', wordConditions: [], ratingConditions: [] });

      expect(component.dataSource.filter).toBe('');
    });

    it('should AND the word and rating conditions with the free text', () => {
      const ratedWords: LearnEnglishWordFileItem[] = [
        { id: 1, enword: 'apple', cnword: '苹果' },
        { id: 2, enword: 'application', cnword: '应用' },
        { id: 3, enword: 'apricot', cnword: '杏' },
      ];
      component.dataSource.data = ratedWords;
      component.contentRatingMap.set(new Map([
        [1, 5],
        [2, 2],
        [3, 5],
      ]));

      component.applyListFilter({
        freeText: '',
        wordConditions: [{ operator: 'startsWith', text: 'app' }],
        ratingConditions: [{ operator: RatingOperatorEnum.LargerOrEquals, value: 5 }],
      });

      expect(component.dataSource.filteredData.length).toBe(1);
      expect(component.dataSource.filteredData[0].enword).toBe('apple');
    });

    it('should filter phrases in/out via the textless phrase operators', () => {
      const words: LearnEnglishWordFileItem[] = [
        { id: 1, enword: 'apple', cnword: '苹果' },
        { id: 2, enword: 'give up', cnword: '放弃' },
      ];
      component.dataSource.data = words;

      component.applyListFilter({
        freeText: '',
        wordConditions: [{ operator: 'isPhrase', text: '' }],
        ratingConditions: [],
      });
      expect(component.dataSource.filteredData.length).toBe(1);
      expect(component.dataSource.filteredData[0].enword).toBe('give up');

      component.applyListFilter({
        freeText: '',
        wordConditions: [{ operator: 'notPhrase', text: '' }],
        ratingConditions: [],
      });
      expect(component.dataSource.filteredData.length).toBe(1);
      expect(component.dataSource.filteredData[0].enword).toBe('apple');
    });

    it('should re-run an active rating filter when a rating change makes a row match', () => {
      const ratedWords: LearnEnglishWordFileItem[] = [
        { id: 1, enword: 'apple', cnword: '苹果' },
        { id: 2, enword: 'banana', cnword: '香蕉' },
      ];
      component.dataSource.data = ratedWords;
      component.contentRatingMap.set(new Map([[1, 5]]));
      component.studyContentId = 1;
      mockRatingService.upsertRating.mockReturnValue(
        of({ contentId: 1, itemId: 2, rating: 5 } as UserLearningRating)
      );
      component.applyListFilter({
        freeText: '',
        wordConditions: [],
        ratingConditions: [{ operator: RatingOperatorEnum.Equals, value: 5 }],
      });
      expect(component.dataSource.filteredData.length).toBe(1);

      component.onContentRatingChanged(ratedWords[1], { value: 5 } as any);

      // The rating upsert must force the predicate to re-run: banana now matches.
      expect(component.dataSource.filteredData.length).toBe(2);
    });
  });

  describe('filter menu wiring', () => {
    it('onFreeTextChanged applies the free-text filter immediately', () => {
      component.dataSource.data = mockWordContent;
      component.onFreeTextChanged('hello');
      expect(component.dataSource.filter).toContain('hello');
      expect(component.dataSource.filteredData.length).toBe(1);
    });

    it('onDefineWordFilter applies the dialog result to the table filter', () => {
      component.dataSource.data = mockWordContent;
      mockDialog.open.mockReturnValue({
        afterClosed: () => of([{ operator: 'startsWith', text: 'hello' }]),
      });
      component.onDefineWordFilter();
      expect(component.dataSource.filter).toContain('startsWith');
      expect(component.dataSource.filter).toContain('"text":"hello"');
      expect(component.wordConditions()).toEqual([{ operator: 'startsWith', text: 'hello' }]);
    });

    it('onDefineWordFilter with a cancelled dialog leaves the filter untouched', () => {
      component.wordConditions.set([{ operator: 'contains', text: 'x' }]);
      component.applyListFilter({
        freeText: '',
        wordConditions: component.wordConditions(),
        ratingConditions: [],
      });
      const before = component.dataSource.filter;
      mockDialog.open.mockReturnValue({ afterClosed: () => of(undefined) });
      component.onDefineWordFilter();
      expect(component.wordConditions()).toEqual([{ operator: 'contains', text: 'x' }]);
      expect(component.dataSource.filter).toBe(before);
    });

    it('onClearWordFilter empties the word conditions', () => {
      component.wordConditions.set([{ operator: 'contains', text: 'x' }]);
      component.onClearWordFilter();
      expect(component.wordConditions()).toEqual([]);
    });

    it('onClearRatingFilter empties the rating conditions', () => {
      component.ratingConditions.set([{ operator: RatingOperatorEnum.Equals, value: 3 }]);
      component.onClearRatingFilter();
      expect(component.ratingConditions()).toEqual([]);
    });
  });

  describe('list screen re-creation keeps the filter box in sync (M3)', () => {
    it('restores the applied free text in the re-created word list after a session', () => {
      fixture.detectChanges(); // initial list screen
      component.onFreeTextChanged('hello'); // user filters the table

      // Run a session and come back: the @switch destroys the list screen and
      // re-creates a fresh child on return.
      component.mode.set('review');
      fixture.detectChanges();
      component.mode.set('list');
      fixture.detectChanges();

      const child = fixture.debugElement.query(By.directive(VocabularyExercisesWordListComponent));
      expect(child.componentInstance.freeText).toBe('hello');
    });
  });

  describe('table filter drives counts, exercises and selection', () => {
    beforeEach(() => {
      component.dataSource.data = mockWordContent.slice();
      component.selection.clear();
    });

    it('visibleRowCount returns the total when no filter is active', () => {
      expect(component.visibleRowCount).toBe(mockWordContent.length);
    });

    it('visibleRowCount returns the filtered count when a filter is active', () => {
      applyFreeText('hello');

      expect(component.visibleRowCount).toBe(1);
    });

    it('onReviewCore builds the queue from filtered rows only', () => {
      applyFreeText('hello');
      component.reviewSetting.countOfItems = 10;

      component['onReviewCore']();

      expect(component.reviewStore.queue().length).toBe(1);
      expect(component.reviewStore.queue()[0].enword).toBe('hello');
    });

    it('onSpellingStart builds the queue from filtered rows only', () => {
      applyFreeText('banana');
      component.spellingSetting.countOfItems = 10;

      component.onSpellingStart();

      expect(component.spellingStore.queue().length).toBe(1);
      expect(component.spellingStore.queue()[0].enword).toBe('banana');
    });

    it('onNewWorksheetCore builds print items from filtered rows only', () => {
      applyFreeText('apple');
      component.worksheetSetting.countOfItems = 10;
      component.worksheetSetting.subTitle = 'Test';
      mockRouter.navigate.mockReturnValue(Promise.resolve(true));

      component['onNewWorksheetCore']();

      const args = mockUIService.setSelectedExerciseItem.mock.lastCall;
      expect(args?.[0].length).toBe(1);
      expect(args?.[0][0].question).toContain('apple pie');
    });

    it('an explicit selection still wins over the table filter', () => {
      applyFreeText('hello');
      component.selection.select(mockWordContent[2]); // 'test'

      component['onReviewCore']();

      expect(component.reviewStore.queue().length).toBe(1);
      expect(component.reviewStore.queue()[0].enword).toBe('test');
    });
  });

  describe('onFileSelectionChanged', () => {
    it('should load file content when file is selected', () => {
      component.onFileSelectionChanged({ value: mockDataFiles[0] } as any);

      expect(mockLearningContentService.getVocabularyWordContent).toHaveBeenCalledWith('data/file1.json');
    });

    it('should clear data source when no file selected', () => {
      component.onFileSelectionChanged({ value: null } as any);

      expect(component.dataSource.data).toEqual([]);
    });

    it('should handle undefined file content', () => {
      mockLearningContentService.getVocabularyWordContent.mockReturnValue(of(undefined));

      component.onFileSelectionChanged({ value: mockDataFiles[0] } as any);

      expect(component.dataSource.data.length).toBe(0);
    });

    it('should handle error when loading file content fails', () => {
      mockLearningContentService.getVocabularyWordContent.mockReturnValue(
        throwError(() => new Error('Load failed'))
      );
      vi.spyOn(console, 'error');

      component.onFileSelectionChanged({ value: mockDataFiles[0] } as any);

      expect(console.error).toHaveBeenCalled();
    });

    it('should clear any existing selection when switching files', () => {
      // Regression: the SelectionModel holds references to the previous file's
      // row objects. Switching files must clear it so study/print don't act on
      // stale rows from the old file.
      component.dataSource.data = mockWordContent.slice();
      component.selection.select(mockWordContent[0], mockWordContent[1]);
      expect(component.selection.selected.length).toBe(2);

      component.onFileSelectionChanged({ value: mockDataFiles[0] } as any);

      expect(component.selection.selected.length).toBe(0);
      expect(component.selection.isEmpty()).toBe(true);
    });

    it('should clear selection when the file is deselected', () => {
      component.dataSource.data = mockWordContent.slice();
      component.selection.select(mockWordContent[0]);
      expect(component.selection.selected.length).toBe(1);

      component.onFileSelectionChanged({ value: null } as any);

      expect(component.selection.selected.length).toBe(0);
    });

    it('should expose loaded ratings via signal (no click needed)', () => {
      // Regression guard: ratings arrive in an async subscribe callback.
      // Because contentRatingMap is a signal passed to the word-list child as
      // an input, the rating column refreshes without manual markForCheck.
      mockRatingService.getRatings.mockReturnValue(of([{ itemId: 1, rating: 5 }]));
      const before = component.contentRatingMap();

      component.onFileSelectionChanged({ value: mockDataFiles[0] } as any);

      expect(component.getRating(1)).toBe(5);
      expect(component.contentRatingMap()).not.toBe(before);
    });

    it('should drop a slow content response from a superseded file selection', () => {
      // Rapid switch A -> B with A's response landing last: last click wins.
      const file1$ = new Subject<LearnEnglishWordFileItem[]>();
      mockLearningContentService.getVocabularyWordContent.mockReturnValueOnce(file1$.asObservable());

      component.onFileSelectionChanged({ value: mockDataFiles[0] } as any);
      component.onFileSelectionChanged({ value: mockDataFiles[1] } as any);

      file1$.next([{ enword: 'stale', cnword: '过期' }]);

      expect(component.dataSource.data.some(w => w.enword === 'stale')).toBe(false);
    });

    it('should drop slow ratings from a superseded file selection', () => {
      const ratings$ = new Subject<UserLearningRating[]>();
      mockRatingService.getRatings.mockReturnValueOnce(ratings$.asObservable());

      component.onFileSelectionChanged({ value: mockDataFiles[0] } as any);
      component.onFileSelectionChanged({ value: mockDataFiles[1] } as any);

      ratings$.next([{ contentId: 1, itemId: 1, rating: 5 }]);

      expect(component.getRating(1)).toBe(0);
    });

    it('should clear the previous file rows and studyContentId when the new content load errors (L3)', () => {
      // File A loads successfully with rows + a rating; studyContentId = 1.
      mockRatingService.getRatings.mockReturnValue(
        of([{ contentId: 1, itemId: 1, rating: 4 } as UserLearningRating])
      );
      component.onFileSelectionChanged({ value: mockDataFiles[0] } as any);
      expect(component.dataSource.data.length).toBe(mockWordContent.length);
      expect(component.studyContentId).toBe(1);
      expect(component.getRating(1)).toBe(4);

      // File B's content GET fails: A's rows must not remain bound to B's
      // studyContentId (clicking a rating would then persist against the wrong
      // file). The token bump also discards B's in-flight ratings load.
      mockLearningContentService.getVocabularyWordContent.mockReturnValueOnce(
        throwError(() => new Error('Load failed'))
      );
      vi.spyOn(console, 'error').mockImplementation(() => {});

      component.onFileSelectionChanged({ value: mockDataFiles[1] } as any);

      expect(component.dataSource.data).toEqual([]);
      expect(component.studyContentId).toBe(0);
      expect(component.contentRatingMap().size).toBe(0);
      expect(component.getRating(1)).toBe(0);
    });

    it('should not filter a cached file new rows against the previous file ratings (L4)', () => {
      // A rating filter (>= 5) is active. File B's content resolves
      // synchronously (cached); without clearing the rating map before the
      // content subscribe, B's rows would be filtered against A's ratings
      // (colliding item id 1). B's ratings GET errors, so the stale filter
      // would never be corrected — the case the fix targets.
      const fileARows: LearnEnglishWordFileItem[] = [
        { id: 1, enword: 'apple', cnword: '苹果' },
        { id: 2, enword: 'banana', cnword: '香蕉' },
      ];
      const fileBRows: LearnEnglishWordFileItem[] = [
        { id: 1, enword: 'cherry', cnword: '樱桃' }, // id collides with file A
        { id: 3, enword: 'date', cnword: '枣' },
      ];

      // File A: content + ratings (id 1 -> 5); the filter shows only id 1.
      mockLearningContentService.getVocabularyWordContent.mockReturnValue(of(fileARows));
      mockRatingService.getRatings.mockReturnValue(
        of([{ contentId: 1, itemId: 1, rating: 5 } as UserLearningRating])
      );
      component.applyListFilter({
        freeText: '',
        wordConditions: [],
        ratingConditions: [{ operator: RatingOperatorEnum.LargerOrEquals, value: 5 }],
      });

      component.onFileSelectionChanged({ value: mockDataFiles[0] } as any);
      expect(component.dataSource.filteredData.length).toBe(1);
      expect(component.dataSource.filteredData[0].enword).toBe('apple');

      // File B: cached content, ratings GET errors.
      mockLearningContentService.getVocabularyWordContent.mockReturnValue(of(fileBRows));
      mockRatingService.getRatings.mockReturnValue(throwError(() => new Error('ratings failed')));
      vi.spyOn(console, 'error').mockImplementation(() => {});

      component.onFileSelectionChanged({ value: mockDataFiles[1] } as any);

      // B's row id 1 (cherry) has no real rating; it must not inherit A's 5
      // through the still-cached map. With the map cleared before the content
      // subscribe, every B row reads 0 and the >=5 filter hides them all.
      expect(component.dataSource.data.some(w => w.enword === 'cherry')).toBe(true);
      expect(component.dataSource.filteredData.length).toBe(0);
    });
  });

  describe('onAddFileButtonClick', () => {
    it('should trigger file input click', () => {
      const mockInput = { click: vi.fn() } as any;

      component.onAddFileButtonClick(mockInput);

      expect(mockInput.click).toHaveBeenCalled();
    });
  });

  describe('onDownloadTemplateButtonClick', () => {
    it('should download template file with correct JSON format', () => {
      const mockAnchor = {
        href: '',
        download: '',
        click: vi.fn(),
        setAttribute: vi.fn(),
      } as any;

      // Spy on document.createElement but only intercept 'a' tag creation — delegate
      // everything else to the real implementation so subsequent TestBed.createComponent
      // calls still work. Store spy references so we can restore them explicitly.
      const origCreateElement = document.createElement.bind(document);
      const createSpy = vi
        .spyOn(document, 'createElement')
        .mockImplementation((tag: string, options?: any) =>
          tag === 'a' ? mockAnchor : origCreateElement(tag, options)
        );
      const appendSpy = vi
        .spyOn(document.body, 'appendChild')
        .mockImplementation((node: Node) => node);
      const removeSpy = vi
        .spyOn(document.body, 'removeChild')
        .mockImplementation((child: Node) => child);
      const urlCreateSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test');
      const urlRevokeSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

      try {
        component.onDownloadTemplateButtonClick();

        expect(mockAnchor.download).toBe('vocabulary-template.json');
        expect(urlCreateSpy).toHaveBeenCalled();
        expect(removeSpy).toHaveBeenCalledWith(mockAnchor);
        expect(urlRevokeSpy).toHaveBeenCalled();
      } finally {
        createSpy.mockRestore();
        appendSpy.mockRestore();
        removeSpy.mockRestore();
        urlCreateSpy.mockRestore();
        urlRevokeSpy.mockRestore();
      }
    });
  });

  describe('onAddTempFile', () => {
    // FileReader is constructed with `new` in the component, so the mock must
    // be constructor-compatible; the class records created instances so each
    // test can set result/onload afterwards.
    interface MockReader {
      readAsText: ReturnType<typeof vi.fn>;
      onload: ((ev: { target: unknown }) => void) | null;
      result: string;
    }
    const createdReaders: MockReader[] = [];
    class MockFileReader {
      onload: ((ev: { target: unknown }) => void) | null = null;
      result = '';
      readAsText = vi.fn();
      constructor() {
        createdReaders.push(this);
      }
    }
    const installFileReaderMock = (): ReturnType<typeof vi.spyOn> =>
      vi
        .spyOn(window, 'FileReader')
        .mockImplementation(
          MockFileReader as unknown as new () => FileReader
        );

    // The instances array is describe-scoped; clear it per test so
    // `createdReaders[0]` is always THIS test's reader (not a previous test's
    // stale one, whose onload closes over a since-destroyed component).
    beforeEach(() => createdReaders.length = 0);

    it('should handle file upload and update content service', () => {
      const mockFile = new File(['[{"enword":"test","cnword":"测试"}]'], 'test.json', {
        type: 'application/json',
      });
      const mockEvent = { target: { files: [mockFile] } } as any;

      const timestampRegex = /temp-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z\.json/;

      const addTempContentSpy = mockLearningContentService.addTemporaryContent;
      const fileReaderSpy = installFileReaderMock();

      try {
        component.onAddTempFile(mockEvent);

        const reader = createdReaders[0];
        reader.result = '[{"enword":"test","cnword":"测试"}]';
        reader.onload?.({ target: reader });

        expect(addTempContentSpy).toHaveBeenCalled();
        const callArgs = mockLearningContentService.addTemporaryContent.mock.lastCall;
        expect(callArgs?.[0]).toMatch(timestampRegex);
        expect(callArgs?.[1]).toEqual([{ enword: 'test', cnword: '测试' }]);
        expect(component.dataSource.data.length).toBe(1);
        expect(component.dataSource.data[0].enword).toBe('test');
        expect(component.dataSource.data[0].cnword).toBe('测试');
      } finally {
        fileReaderSpy.mockRestore();
      }
    });

    it('should handle file with no files selected', () => {
      const mockEvent = { target: { files: [] } } as any;

      component.onAddTempFile(mockEvent);

      expect(mockLearningContentService.addTemporaryContent).not.toHaveBeenCalled();
    });

    it('should handle JSON parsing error', () => {
      const mockFile = new File(['invalid json'], 'test.json', {
        type: 'application/json',
      });
      const mockEvent = { target: { files: [mockFile] } } as any;

      const fileReaderSpy = installFileReaderMock();
      const consoleSpy = vi.spyOn(console, 'error');

      try {
        component.onAddTempFile(mockEvent);

        const reader = createdReaders[0];
        reader.result = 'invalid json';
        reader.onload?.({ target: reader });

        expect(consoleSpy).toHaveBeenCalledWith('Error parsing JSON file:', expect.any(Error));
      } finally {
        fileReaderSpy.mockRestore();
        consoleSpy.mockRestore();
      }
    });

    it('resets the file input so the same (e.g. corrected) file can be picked again (M4)', () => {
      const mockFile = new File(['[{"enword":"test","cnword":"测试"}]'], 'test.json', {
        type: 'application/json',
      });
      // A real file input keeps the picked path in `value`; unless it is
      // cleared, re-picking the same file fires no change event.
      const target = { files: [mockFile], value: 'C:\\fakepath\\test.json' };
      const mockEvent = { target } as any;
      const fileReaderSpy = installFileReaderMock();

      try {
        component.onAddTempFile(mockEvent);

        expect(target.value).toBe('');
      } finally {
        fileReaderSpy.mockRestore();
      }
    });

    it('should reject files containing one-character enwords (service contract)', () => {
      const mockFile = new File(['[{"enword":"a","cnword":"测试"}]'], 'test.json', {
        type: 'application/json',
      });
      const mockEvent = { target: { files: [mockFile] } } as any;

      const fileReaderSpy = installFileReaderMock();
      const consoleSpy = vi.spyOn(console, 'error');

      try {
        component.onAddTempFile(mockEvent);

        const reader = createdReaders[0];
        reader.result = '[{"enword":"a","cnword":"测试"}]';
        reader.onload?.({ target: reader });

        expect(mockLearningContentService.addTemporaryContent).not.toHaveBeenCalled();
        expect(component.dataSource.data.length).toBe(0);
        expect(consoleSpy).toHaveBeenCalledWith(
          'Invalid word length: "enword" must be longer than one character.'
        );
      } finally {
        fileReaderSpy.mockRestore();
        consoleSpy.mockRestore();
      }
    });

    it('does not mutate state if the component is destroyed mid-read (L5)', () => {
      // Navigating away mid-read fires no takeUntilDestroyed, so the onload
      // callback must bail against a destroyed component instead of writing
      // signals / registering temp content in the service cache.
      const mockFile = new File(['[{"enword":"test","cnword":"测试"}]'], 'test.json', {
        type: 'application/json',
      });
      const mockEvent = { target: { files: [mockFile] } } as any;
      const fileReaderSpy = installFileReaderMock();

      try {
        component.onAddTempFile(mockEvent);
        const reader = createdReaders[0];
        reader.result = '[{"enword":"test","cnword":"测试"}]';

        fixture.destroy();
        expect(component['isDestroyed']).toBe(true);

        reader.onload?.({ target: reader });

        expect(mockLearningContentService.addTemporaryContent).not.toHaveBeenCalled();
        expect(component.dataSource.data.length).toBe(0);
      } finally {
        fileReaderSpy.mockRestore();
      }
    });
  });

  describe('selection methods', () => {
    beforeEach(() => {
      component.dataSource.data = mockWordContent.slice();
    });

    it('isAllSelected should return true when all selected', () => {
      component.selection.select(...mockWordContent);
      expect(component.isAllSelected()).toBe(true);
    });

    it('isAllSelected should return false when not all selected', () => {
      component.selection.select(mockWordContent[0]);
      expect(component.isAllSelected()).toBe(false);
    });

    it('toggleAllRows should select all when not all selected', () => {
      component.toggleAllRows();
      expect(component.selection.selected.length).toBe(mockWordContent.length);
    });

    it('toggleAllRows should clear selection when all selected', () => {
      component.selection.select(...mockWordContent);
      component.toggleAllRows();
      expect(component.selection.selected.length).toBe(0);
    });
  });

  describe('select-all with an active filter (M1)', () => {
    beforeEach(() => {
      component.dataSource.data = mockWordContent.slice();
      component.selection.clear();
    });

    it('toggleAllRows replaces the selection with exactly the visible rows (hidden selections dropped)', () => {
      component.selection.select(mockWordContent[0], mockWordContent[1]); // 'hello', 'world'
      applyFreeText('test'); // visible rows: only 'test'

      component.toggleAllRows();

      expect(component.selection.selected).toEqual([mockWordContent[2]]);
    });

    it('isAllSelected is false when only rows hidden by the filter are selected', () => {
      component.selection.select(mockWordContent[0]); // 'hello' — hidden by the filter below
      applyFreeText('test'); // visible rows: only 'test'; selected count (1) === visible count (1)

      expect(component.isAllSelected()).toBe(false);
    });

    it('isAllSelected is true when every visible row is selected even if hidden rows are also selected', () => {
      component.selection.select(mockWordContent[0]); // hidden by the filter below
      applyFreeText('test');
      component.selection.select(mockWordContent[2]); // 'test' — the only visible row

      expect(component.isAllSelected()).toBe(true);
    });

    it('toggleAllRows clears the selection when every visible row is already selected', () => {
      component.selection.select(mockWordContent[0]);
      applyFreeText('test');
      component.selection.select(mockWordContent[2]);

      component.toggleAllRows();

      expect(component.selection.selected.length).toBe(0);
    });
  });

  describe('review mode', () => {
    it('should initialize review settings with defaults', () => {
      expect(component.reviewSetting.disableVoice).toBe(false);
      expect(component.reviewSetting.hideExplain).toBe(false);
      expect(component.reviewSetting.countOfItems).toBe(20);
    });

    it('should track review state', () => {
      expect(component.mode()).toBe('list');
      component.mode.set('review');
      expect(component.mode()).toBe('review');
    });
  });

  describe('onReviewWithOptions', () => {
    it('should open dialog with correct data when selection exists', () => {
      component.selection.select(mockWordContent[0], mockWordContent[1]);
      const mockDialogRef = { afterClosed: () => of(undefined) };
      mockDialog.open.mockReturnValue(mockDialogRef as any);

      component.onReviewWithOptions();

      expect(mockDialog.open).toHaveBeenCalledWith(expect.any(Function), {
        data: { wordQueueCount: 2, withSelection: true, currentSettings: component.reviewSetting },
        width: '500px',
        enterAnimationDuration: 800,
        exitAnimationDuration: 500,
      });
    });

    it('should open dialog with full dataset when no selection', () => {
      component.dataSource.data = mockWordContent.slice();
      const mockDialogRef = { afterClosed: () => of(undefined) };
      mockDialog.open.mockReturnValue(mockDialogRef as any);

      component.onReviewWithOptions();

      expect(mockDialog.open).toHaveBeenCalledWith(expect.any(Function), {
        data: { wordQueueCount: 8, withSelection: false, currentSettings: component.reviewSetting },
        width: '500px',
        enterAnimationDuration: 800,
        exitAnimationDuration: 500,
      });
    });

    it('should apply review settings and start review when dialog returns data', () => {
      const mockDialogRef = {
        afterClosed: () =>
          of({
            disableVoice: true,
            hideExplain: false,
            countOfItems: 10,
          }),
      };
      mockDialog.open.mockReturnValue(mockDialogRef as any);
      vi.spyOn(component as any, 'onReviewCore');
      component.dataSource.data = mockWordContent.slice();

      component.onReviewWithOptions();

      expect(component.reviewSetting.disableVoice).toBe(true);
      expect(component.reviewSetting.hideExplain).toBe(false);
      expect(component.reviewSetting.countOfItems).toBe(10);
      expect(component['onReviewCore']).toHaveBeenCalled();
    });
  });

  describe('onReviewCore', () => {
    beforeEach(() => {
      component.dataSource.data = mockWordContent.slice();
    });

    it('should process selected items and randomize', () => {
      component.selection.select(mockWordContent[0], mockWordContent[1]);

      component['onReviewCore']();

      expect(component.reviewStore.queue().length).toBe(2);
      expect(component.mode()).toBe('review');
      expect(component.reviewStore.cursor()).toBe(0);
    });

    it('should set initial progress based on first word position', () => {
      component.selection.select(mockWordContent[0], mockWordContent[1]);

      component['onReviewCore']();

      // With 2 items, initial progress should be 50% (1/2 * 100)
      expect(component.reviewStore.progress()).toBe(50);
    });

    it('should limit to countOfItems and randomize', () => {
      component.reviewSetting.countOfItems = 3;
      vi.spyOn(Math, 'random').mockReturnValueOnce(0.5).mockReturnValueOnce(0.3)
        .mockReturnValueOnce(0.8).mockReturnValueOnce(0.1).mockReturnValueOnce(0.6)
        .mockReturnValueOnce(0.4).mockReturnValueOnce(0.7).mockReturnValueOnce(0.2);

      component['onReviewCore']();

      expect(component.reviewStore.queue().length).toBe(3);
    });

    it('should bail out safely when the queue is empty (no data)', () => {
      component.dataSource.data = [];
      component.selection.clear();
      component.studyContentId = 1;
      mockRatingService.getRatings.mockReturnValue(of([]));

      expect(() => component['onReviewCore']()).not.toThrow();

      expect(component.reviewStore.queue().length).toBe(0);
      expect(component.mode()).toBe('list');
      // No point loading ratings when there is nothing to study.
      expect(mockRatingService.getRatings).not.toHaveBeenCalled();
    });

    it('should bail out safely when a filter removes every word', () => {
      // A table filter matching no rows leaves getVisibleData() empty, so the
      // queue is empty and the container stays on the list.
      component.reviewSetting.countOfItems = 10;
      component.selection.clear();
      component.studyContentId = 0;
      component.applyListFilter({
        freeText: 'zzz-not-found',
        wordConditions: [],
        ratingConditions: [],
      });

      expect(() => component['onReviewCore']()).not.toThrow();

      expect(component.reviewStore.queue().length).toBe(0);
      expect(component.mode()).toBe('list');
    });
  });

  describe('onQuitReview', () => {
    it('should reset review state and return to the list', () => {
      component.dataSource.data = mockWordContent.slice();
      component['onReviewCore']();
      component.mode.set('review');

      component.onQuitReview();

      expect(component.mode()).toBe('list');
      expect(component.reviewStore.queue()).toEqual([]);
      expect(component.reviewStore.cursor()).toBe(0);
      expect(component.reviewStore.progress()).toBe(0);
    });

    it('should merge confirmed review ratings back into the list rating map', () => {
      mockRatingService.getRatings.mockReturnValue(of([{ contentId: 1, itemId: 10, rating: 3 }]));
      component.dataSource.data = [{ id: 10, enword: 'hello', cnword: '你好' }] as LearnEnglishWordFileItem[];
      component.studyContentId = 1;
      component['onReviewCore']();

      component.onQuitReview();

      expect(component.contentRatingMap().get(10)).toBe(3);
    });

    it('should re-run an active rating filter with ratings changed during review', () => {
      // Regression guard: quitting merges confirmed ratings into
      // contentRatingMap, but the filter string is unchanged - without
      // re-assigning dataSource.filter, a word downrated below a rating
      // filter's threshold during review stays visible in the list.
      mockRatingService.getRatings.mockReturnValue(of([{ contentId: 1, itemId: 10, rating: 4 }]));
      mockRatingService.upsertRating.mockReturnValue(of({ contentId: 1, itemId: 10, rating: 1 }));
      component.dataSource.data = [
        { id: 10, enword: 'hello', cnword: '你好' },
        { id: 11, enword: 'world', cnword: '世界' },
      ] as LearnEnglishWordFileItem[];
      component.studyContentId = 1;
      // Ratings as a completed file load would have left them.
      component.contentRatingMap.set(new Map([[10, 4]]));
      component.applyListFilter({
        freeText: '',
        wordConditions: [],
        ratingConditions: [{ operator: RatingOperatorEnum.LargerOrEquals, value: 3 }],
      });
      // Only item 10 (rating 4) passes the filter.
      expect(component.dataSource.filteredData.length).toBe(1);

      component['onReviewCore']();
      expect(component.mode()).toBe('review');

      // Downrate the word during the session (server confirms 1).
      component.reviewStore.rateCurrent(1);

      component.onQuitReview();

      expect(component.contentRatingMap().get(10)).toBe(1);
      // The row must drop out of the rating-filtered list on quit.
      expect(component.dataSource.filteredData.length).toBe(0);
    });
  });

  describe('spelling mode', () => {
    it('should initialize spelling settings with defaults', () => {
      expect(component.spellingSetting.disableVoice).toBe(false);
      expect(component.spellingSetting.hideExplain).toBe(false);
      expect(component.spellingSetting.countOfItems).toBe(20);
    });

    it('should track spelling state', () => {
      expect(component.mode()).toBe('list');
    });
  });

  describe('onSpellingWithOptions', () => {
    it('should open dialog and start spelling when confirmed', () => {
      const mockDialogRef = {
        afterClosed: () =>
          of({
            disableVoice: true,
            hideExplain: false,
            countOfItems: 5,
          }),
      };
      mockDialog.open.mockReturnValue(mockDialogRef as any);
      vi.spyOn(component, 'onSpellingStart');
      component.dataSource.data = mockWordContent.slice();

      component.onSpellingWithOptions();

      expect(component.spellingSetting.disableVoice).toBe(true);
      expect(component.onSpellingStart).toHaveBeenCalled();
    });

    it('should switch to the spelling screen via the mode signal when the spelling dialog confirms', () => {
      // Regression guard: the typing view switch happens in the async
      // afterClosed callback. Because mode is a signal read by the template's
      // @switch, the OnPush view switches without manual markForCheck.
      const mockDialogRef = {
        afterClosed: () =>
          of({
            disableVoice: false,
            hideExplain: false,
            countOfItems: 5,
          }),
      };
      mockDialog.open.mockReturnValue(mockDialogRef as any);
      vi.spyOn(component, 'onSpellingStart');

      component.onSpellingWithOptions();

      expect(component.onSpellingStart).toHaveBeenCalled();
    });
  });

  describe('onSpellingStart', () => {
    beforeEach(() => {
      component.dataSource.data = mockWordContent.slice();
    });

    it('should use selected items when selection exists', () => {
      component.selection.select(mockWordContent[0], mockWordContent[1]);

      component.onSpellingStart();

      expect(component.spellingStore.queue().length).toBe(2);
      expect(component.mode()).toBe('spelling');
    });

    it('should limit and randomize spelling queues', () => {
      component.spellingSetting.countOfItems = 3;

      component.onSpellingStart();

      expect(component.spellingStore.queue().length).toBe(3);
      expect(component.spellingStore.results().length).toBe(3);
    });

    it('should stay on the list when the queue is empty', () => {
      component.dataSource.data = [];

      component.onSpellingStart();

      expect(component.mode()).toBe('list');
      expect(component.spellingStore.queue().length).toBe(0);
    });
  });

  describe('spelling session integration', () => {
    beforeEach(() => {
      component.dataSource.data = mockWordContent.slice();
    });

    it('switches to the result screen when the store completes the session', () => {
      component.spellingSetting.countOfItems = 1;
      component.onSpellingStart();
      expect(component.mode()).toBe('spelling');

      // Give up the single word: the store completes, the container effect
      // reacts by switching the screen.
      component.spellingStore.nextWord();
      TestBed.tick();

      expect(component.mode()).toBe('spellingresult');
    });

    it('onQuitSpelling resets the store and returns to the list', () => {
      component.spellingSetting.countOfItems = 2;
      component.onSpellingStart();
      expect(component.spellingStore.queue().length).toBeGreaterThan(0);

      component.onQuitSpelling();

      expect(component.mode()).toBe('list');
      expect(component.spellingStore.queue()).toEqual([]);
    });
  });

  describe('quiz mode', () => {
    it('should initialize quiz settings with defaults', () => {
      expect(component.quizSetting.direction).toBe('en2cn');
      expect(component.quizSetting.countOfItems).toBe(20);
    });
  });

  describe('onQuizWithOptions', () => {
    it('should apply quiz settings and start the quiz when dialog returns data', () => {
      const mockDialogRef = {
        afterClosed: () =>
          of({
            direction: 'cn2en',
            countOfItems: 5,
          }),
      };
      mockDialog.open.mockReturnValue(mockDialogRef as any);
      vi.spyOn(component, 'onQuizStart');
      component.dataSource.data = mockWordContent.slice();

      component.onQuizWithOptions();

      expect(component.quizSetting.direction).toBe('cn2en');
      expect(component.quizSetting.countOfItems).toBe(5);
      expect(component.onQuizStart).toHaveBeenCalled();
    });

    it('should leave settings untouched when the dialog is cancelled', () => {
      const mockDialogRef = { afterClosed: () => of(undefined) };
      mockDialog.open.mockReturnValue(mockDialogRef as any);
      vi.spyOn(component, 'onQuizStart');
      component.quizSetting.direction = 'cn2en';

      component.onQuizWithOptions();

      expect(component.quizSetting.direction).toBe('cn2en');
      expect(component.onQuizStart).not.toHaveBeenCalled();
    });
  });

  describe('onQuizStart', () => {
    beforeEach(() => {
      component.dataSource.data = mockWordContent.slice();
    });

    it('should build single-choice questions from the visible rows', () => {
      component.quizSetting.countOfItems = 3;

      component.onQuizStart();

      expect(component.quizStore.questions().length).toBe(3);
      expect(component.mode()).toBe('quiz');
      const q = component.quizStore.questions()[0];
      expect(q.options.length).toBe(4);
      expect(q.options[q.answerIndex]).toBe(q.cnword);
      expect(q.prompt).toBe(q.enword);
    });

    it('should use selected rows when a selection exists', () => {
      component.selection.select(mockWordContent[0], mockWordContent[1]);

      component.onQuizStart();

      expect(component.quizStore.questions().length).toBe(2);
      expect(component.mode()).toBe('quiz');
    });

    it('should build reversed questions in the cn2en direction', () => {
      component.quizSetting.direction = 'cn2en';
      component.quizSetting.countOfItems = 3;

      component.onQuizStart();

      const q = component.quizStore.questions()[0];
      expect(q.prompt).toBe(q.cnword);
      expect(q.options[q.answerIndex]).toBe(q.enword);
    });

    it('should stay on the list when there is nothing to quiz', () => {
      component.dataSource.data = [];

      component.onQuizStart();

      expect(component.mode()).toBe('list');
      expect(component.quizStore.questions().length).toBe(0);
    });

    it('should stay on the list when every row shares one explanation', () => {
      component.dataSource.data = [
        { enword: 'hello', cnword: '你好' },
        { enword: 'hi', cnword: '你好' },
      ];

      component.onQuizStart();

      expect(component.mode()).toBe('list');
      expect(component.quizStore.questions().length).toBe(0);
    });
  });

  describe('quiz session integration', () => {
    beforeEach(() => {
      component.dataSource.data = mockWordContent.slice();
    });

    it('switches to the quiz result screen when the store completes the session', () => {
      component.quizSetting.countOfItems = 1;
      component.onQuizStart();
      expect(component.mode()).toBe('quiz');

      // Answer the single question: the store completes, the container effect
      // reacts by switching the screen.
      const answerIndex = component.quizStore.currentQuestion()!.answerIndex;
      component.quizStore.answer(answerIndex);
      component.quizStore.next();
      TestBed.tick();

      expect(component.mode()).toBe('quizresult');
    });

    it('onQuitQuiz resets the store and returns to the list', () => {
      component.quizSetting.countOfItems = 2;
      component.onQuizStart();
      expect(component.quizStore.questions().length).toBeGreaterThan(0);

      component.onQuitQuiz();

      expect(component.mode()).toBe('list');
      expect(component.quizStore.questions()).toEqual([]);
    });
  });

  describe('worksheet mode', () => {
    it('should initialize worksheet settings with defaults', () => {
      expect(component.worksheetSetting.countOfItems).toBe(20);
      expect(component.worksheetSetting.printEntryDate).toBe(true);
    });
  });

  describe('onWorksheetWithOptions', () => {
    beforeEach(() => {
      component.dataSource.data = mockWordContent.slice();
    });

    it('should open dialog and generate the worksheet when confirmed', () => {
      const mockDialogRef = {
        afterClosed: () =>
          of({
            countOfItems: 10,
            printEntryDate: true,
            subTitle: 'Test Title',
            printFirstLetter: true,
            uniformBlankLength: false,
            uniformBlankLengthSize: 30,
          }),
      };
      mockDialog.open.mockReturnValue(mockDialogRef as any);
      vi.spyOn(component as any, 'onNewWorksheetCore');

      component.onWorksheetWithOptions();

      expect(component.worksheetSetting.countOfItems).toBe(10);
      expect(component.worksheetSetting.subTitle).toBe('Test Title');
      expect(component.worksheetSetting.uniformBlankLength).toBe(false);
      expect(component.worksheetSetting.uniformBlankLengthSize).toBe(30);
      expect(component['onNewWorksheetCore']).toHaveBeenCalled();
    });

    it('should clear the subtitle when the dialog returns none', () => {
      const mockDialogRef = {
        afterClosed: () =>
          of({
            countOfItems: 15,
            printEntryDate: false,
            printFirstLetter: false,
          }),
      };
      mockDialog.open.mockReturnValue(mockDialogRef as any);
      vi.spyOn(component as any, 'onNewWorksheetCore');
      component.worksheetSetting.subTitle = 'Old Title';

      component.onWorksheetWithOptions();

      expect(component.worksheetSetting.subTitle).toBeUndefined();
    });
  });

  describe('onNewWorksheetCore', () => {
    beforeEach(() => {
      component.dataSource.data = mockWordContent.slice();
      mockRouter.navigate.mockReturnValue(Promise.resolve(true));
    });

    it('should build worksheet items with randomization', () => {
      component.selection.select(mockWordContent[0], mockWordContent[1]);
      component.worksheetSetting.subTitle = 'Test';

      component['onNewWorksheetCore']();

      expect(mockUIService.setSelectedExerciseItem).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/knowledge/displayv2']);
    });

    it('should include first letter when printFirstLetter is true', () => {
      component.selection.select(mockWordContent[0]);
      component.worksheetSetting.printFirstLetter = true;
      component.worksheetSetting.subTitle = 'Test';

      component['onNewWorksheetCore']();

      const args = mockUIService.setSelectedExerciseItem.mock.lastCall;
      expect(args?.[0][0].question).toContain('h ');
    });

    it('should not include first letter when printFirstLetter is false', () => {
      component.selection.select(mockWordContent[0]);
      component.worksheetSetting.printFirstLetter = false;
      component.worksheetSetting.subTitle = 'Test';

      component['onNewWorksheetCore']();

      const args = mockUIService.setSelectedExerciseItem.mock.lastCall;
      expect(args?.[0][0].question).not.toContain('h @');
    });

    it('should thread uniformBlankLength off into the exec print setting', () => {
      component.worksheetSetting.subTitle = 'Test';
      component.worksheetSetting.uniformBlankLength = false;

      component['onNewWorksheetCore']();

      const execPrintSetting = mockUIService.setSelectedExerciseItem.mock.lastCall?.[1];
      expect(execPrintSetting.uniformBlankLength).toBe(false);
    });

    it('should thread a custom uniformBlankLengthSize into the exec print setting', () => {
      component.worksheetSetting.subTitle = 'Test';
      component.worksheetSetting.uniformBlankLength = true;
      component.worksheetSetting.uniformBlankLengthSize = 25;

      component['onNewWorksheetCore']();

      const execPrintSetting = mockUIService.setSelectedExerciseItem.mock.lastCall?.[1];
      expect(execPrintSetting.uniformBlankLength).toBe(true);
      expect(execPrintSetting.uniformBlankLengthSize).toBe(25);
    });

    it('should default uniformBlankLength to true (legacy behavior) from the initializer', () => {
      component.worksheetSetting.subTitle = 'Test';
      // uniformBlankLength left at its initializer default (true).

      component['onNewWorksheetCore']();

      const execPrintSetting = mockUIService.setSelectedExerciseItem.mock.lastCall?.[1];
      expect(execPrintSetting.uniformBlankLength).toBe(true);
    });
  });

  describe('onSelect (By Word)', () => {
    beforeEach(() => {
      component.dataSource.data = mockWordContent.slice();
    });

    it('should select items whose enword matches the supplied words', () => {
      // 'hello', 'world', 'test' all exist in mockWordContent
      const mockDialogRef = {
        afterClosed: () => of({ selectedSelectMode: SelectionModeEnum.ByID, importIDs: 'hello, world, test' }),
      };
      mockDialog.open.mockReturnValue(mockDialogRef as any);

      component.onSelect(SelectionModeEnum.ByID);

      expect(component.selection.selected.length).toBe(3);
      expect(component.selection.selected.some(i => i.enword === 'hello')).toBe(true);
      expect(component.selection.selected.some(i => i.enword === 'world')).toBe(true);
      expect(component.selection.selected.some(i => i.enword === 'test')).toBe(true);
    });

    it('should trim whitespace around each word when matching', () => {
      const mockDialogRef = {
        afterClosed: () => of({ selectedSelectMode: SelectionModeEnum.ByID, importIDs: '  hello ,  world  ' }),
      };
      mockDialog.open.mockReturnValue(mockDialogRef as any);

      component.onSelect(SelectionModeEnum.ByID);

      expect(component.selection.selected.length).toBe(2);
    });

    it('should select nothing when none of the words match', () => {
      const mockDialogRef = {
        afterClosed: () => of({ selectedSelectMode: SelectionModeEnum.ByID, importIDs: 'nonexistent, alsoabsent' }),
      };
      mockDialog.open.mockReturnValue(mockDialogRef as any);

      component.onSelect(SelectionModeEnum.ByID);

      expect(component.selection.selected.length).toBe(0);
    });

    it('normalizes newline separators so a pasted list matches (M14)', () => {
      const mockDialogRef = {
        afterClosed: () => of({ selectedSelectMode: SelectionModeEnum.ByID, importIDs: 'hello\nworld\ntest' }),
      };
      mockDialog.open.mockReturnValue(mockDialogRef as any);

      component.onSelect(SelectionModeEnum.ByID);

      expect(component.selection.selected.length).toBe(3);
      expect(component.selection.selected.some(i => i.enword === 'hello')).toBe(true);
      expect(component.selection.selected.some(i => i.enword === 'world')).toBe(true);
      expect(component.selection.selected.some(i => i.enword === 'test')).toBe(true);
    });

    it('does not clear the existing selection when no token matches (M14)', () => {
      // Pre-existing selection that a no-match paste must not wipe.
      component.selection.select(mockWordContent[0], mockWordContent[1]);
      const mockDialogRef = {
        afterClosed: () => of({ selectedSelectMode: SelectionModeEnum.ByID, importIDs: 'nonexistent' }),
      };
      mockDialog.open.mockReturnValue(mockDialogRef as any);

      component.onSelect(SelectionModeEnum.ByID);

      expect(component.selection.selected.length).toBe(2);
      expect(component.selection.selected.some(i => i.enword === 'hello')).toBe(true);
      expect(component.selection.selected.some(i => i.enword === 'world')).toBe(true);
    });

    it('should not match numeric strings against the id field', () => {
      // Confirms the feature selects by enword text, NOT by item.id.
      // mockWordContent items have no ids; supplying "1,2" selects nothing
      // because no enword equals the string "1" or "2".
      const mockDialogRef = {
        afterClosed: () => of({ selectedSelectMode: SelectionModeEnum.ByID, importIDs: '1,2' }),
      };
      mockDialog.open.mockReturnValue(mockDialogRef as any);

      component.onSelect(SelectionModeEnum.ByID);

      expect(component.selection.selected.length).toBe(0);
    });

    it('should handle a cancelled dialog (undefined result)', () => {
      const mockDialogRef = { afterClosed: () => of(undefined) };
      mockDialog.open.mockReturnValue(mockDialogRef as any);

      component.onSelect(SelectionModeEnum.ByID);

      expect(component.selection.selected.length).toBe(0);
    });
  });

  describe('onSelect (Free Selection)', () => {
    beforeEach(() => {
      component.dataSource.data = mockWordContent.slice();
    });

    it('should randomly select items', () => {
      const mockDialogRef = {
        afterClosed: () => of({ selectedSelectMode: SelectionModeEnum.FreeSelection, countOfItems: 3 }),
      };
      mockDialog.open.mockReturnValue(mockDialogRef as any);

      component.onSelect(SelectionModeEnum.FreeSelection);

      expect(component.selection.selected.length).toBe(3);
    });

    it('should handle undefined dialog result', () => {
      const mockDialogRef = { afterClosed: () => of(undefined) };
      mockDialog.open.mockReturnValue(mockDialogRef as any);

      component.onSelect(SelectionModeEnum.FreeSelection);

      expect(component.selection.selected.length).toBe(0);
    });
  });

  describe('onSelect (By Count)', () => {
    beforeEach(() => {
      component.dataSource.data = mockWordContent.slice();
    });

    it('should select items by count', () => {
      const mockDialogRef = {
        afterClosed: () => of({ selectedSelectMode: SelectionModeEnum.ByCount, countOfItems: 3, countOfOffset: 0 }),
      };
      mockDialog.open.mockReturnValue(mockDialogRef as any);

      component.onSelect(SelectionModeEnum.ByCount);

      expect(component.selection.selected.length).toBe(3);
    });
  });

  describe('onQuickSelect', () => {
    beforeEach(() => {
      component.dataSource.data = mockWordContent.slice();
    });

    it('sequence opens the unified dialog in By Count mode and applies count + offset', () => {
      const mockDialogRef = {
        afterClosed: () => of({ selectedSelectMode: SelectionModeEnum.ByCount, countOfItems: 2, countOfOffset: 1 }),
      };
      mockDialog.open.mockReturnValue(mockDialogRef as any);

      component.onQuickSelect('sequence');

      expect(mockDialog.open).toHaveBeenCalledWith(
        VocabularySelectDialogComponent,
        expect.objectContaining({ data: expect.objectContaining({ mode: SelectionModeEnum.ByCount }) })
      );
      expect(component.selection.selected.length).toBe(2);
    });

    it('random opens the unified dialog in Free Selection mode and applies the count', () => {
      const mockDialogRef = {
        afterClosed: () => of({ selectedSelectMode: SelectionModeEnum.FreeSelection, countOfItems: 3 }),
      };
      mockDialog.open.mockReturnValue(mockDialogRef as any);

      component.onQuickSelect('random');

      expect(mockDialog.open).toHaveBeenCalledWith(
        VocabularySelectDialogComponent,
        expect.objectContaining({ data: expect.objectContaining({ mode: SelectionModeEnum.FreeSelection }) })
      );
      expect(component.selection.selected.length).toBe(3);
    });

    it('words opens the unified dialog in By Word mode and applies the word list', () => {
      const mockDialogRef = {
        afterClosed: () => of({ selectedSelectMode: SelectionModeEnum.ByID, importIDs: 'hello, world' }),
      };
      mockDialog.open.mockReturnValue(mockDialogRef as any);

      component.onQuickSelect('words');

      expect(mockDialog.open).toHaveBeenCalledWith(
        VocabularySelectDialogComponent,
        expect.objectContaining({ data: expect.objectContaining({ mode: SelectionModeEnum.ByID }) })
      );
      expect(component.selection.selected.length).toBe(2);
    });
  });

  describe('rating deselection guards', () => {
    it('onContentRatingChanged should not save and should restore selection on deselect', () => {
      // Clicking the active toggle in a mat-button-toggle-group deselects it,
      // emitting change with value undefined.
      component.studyContentId = 1;
      const group = { value: undefined as unknown };
      const event = { value: undefined, source: { value: 4, buttonToggleGroup: group } } as any;

      component.onContentRatingChanged({ id: 10 } as any, event);

      expect(mockRatingService.upsertRating).not.toHaveBeenCalled();
      expect(group.value).toBe(4);
    });
  });

  describe('rating save failure (M2)', () => {
    it('reverts the toggle group to the last confirmed rating when the upsert fails', () => {
      component.studyContentId = 1;
      component.contentRatingMap.set(new Map([[10, 3]]));
      vi.spyOn(console, 'error');
      mockRatingService.upsertRating.mockReturnValue(throwError(() => new Error('save failed')));
      const group = { value: 5 as unknown };
      const event = { value: 5, source: { value: 5, buttonToggleGroup: group } } as any;

      component.onContentRatingChanged({ id: 10 } as any, event);

      expect(group.value).toBe(3);
    });

    it('reverts the toggle group to unrated (0) when no rating was confirmed yet', () => {
      component.studyContentId = 1;
      vi.spyOn(console, 'error');
      mockRatingService.upsertRating.mockReturnValue(throwError(() => new Error('save failed')));
      const group = { value: 4 as unknown };
      const event = { value: 4, source: { value: 4, buttonToggleGroup: group } } as any;

      component.onContentRatingChanged({ id: 10 } as any, event);

      expect(group.value).toBe(0);
    });

    it('a stale failure does not revert the toggle when a newer rating is pending', () => {
      component.studyContentId = 1;
      component.contentRatingMap.set(new Map([[10, 3]]));
      vi.spyOn(console, 'error');
      const firstSave = new Subject<UserLearningRating>();
      const secondSave = new Subject<UserLearningRating>();
      mockRatingService.upsertRating
        .mockReturnValueOnce(firstSave)
        .mockReturnValueOnce(secondSave);
      const group = { value: 3 as unknown };
      const item = { id: 10 } as any;

      component.onContentRatingChanged(item, { value: 5, source: { value: 5, buttonToggleGroup: group } } as any);
      component.onContentRatingChanged(item, { value: 4, source: { value: 4, buttonToggleGroup: group } } as any);
      group.value = 4; // the user's latest click is what the toggle shows

      firstSave.error(new Error('save failed'));

      expect(group.value).toBe(4);
    });
  });
});

describe('VocabularyExercisesReviewOptionsDialogComponent', () => {
  const configureTestBed = async (data: unknown) => {
    const mockDialogRef = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [
        VocabularyExercisesReviewOptionsDialogComponent,
        NoopAnimationsModule,
        TranslocoModule,
      ],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: TranslocoService, useValue: createMockTranslocoService() },
        { provide: TRANSLOCO_TRANSPILER, useValue: {} },
        { provide: TRANSLOCO_MISSING_HANDLER, useValue: {} },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(VocabularyExercisesReviewOptionsDialogComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    return { component, fixture, mockDialogRef };
  };

  describe('without a selection', () => {
    let component: VocabularyExercisesReviewOptionsDialogComponent;
    let fixture: ComponentFixture<VocabularyExercisesReviewOptionsDialogComponent>;
    let mockDialogRef: any;

    beforeEach(async () => {
      ({ component, fixture, mockDialogRef } = await configureTestBed({
        wordQueueCount: 30,
        withSelection: false,
      }));
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with correct default values', () => {
      expect(component.countOfItems()).toBe(20);
      expect(component.disableVoice()).toBe(false);
      expect(component.hideExplain()).toBe(false);
    });

    it('should close dialog without data on cancel', () => {
      component.onNoClick();
      expect(mockDialogRef.close).toHaveBeenCalledWith();
    });

    it('should close dialog with data on confirm', () => {
      component.countOfItems.set(15);
      component.disableVoice.set(true);
      component.hideExplain.set(false);

      component.onYesClick();

      expect(mockDialogRef.close).toHaveBeenCalledWith({
        countOfItems: 15,
        disableVoice: true,
        hideExplain: false,
      });
    });

    it('should flag invalid output combination when both disableVoice and hideExplain are true', () => {
      component.disableVoice.set(true);
      component.hideExplain.set(true);

      // The OK button is disabled for this combination (no output possible),
      // so onYesClick is unreachable through the UI.
      expect(component.isOutputDisabled).toBe(true);
    });

    describe('count validation (M10)', () => {
      it('flags a cleared / zero / negative / fractional count as invalid', () => {
        [null, 0, -3, 1.5].forEach(bad => {
          component.countOfItems.set(bad as any);
          expect(component.isCountInvalid).toBe(true);
        });
        component.countOfItems.set(5);
        expect(component.isCountInvalid).toBe(false);
      });

      it('disables OK while the count is invalid and enables it once valid', () => {
        const okButton = (): HTMLButtonElement =>
          fixture.nativeElement.querySelectorAll('button[mat-button]')[1];

        component.countOfItems.set(0 as any);
        fixture.detectChanges();
        expect(okButton().disabled).toBe(true);

        component.countOfItems.set(8);
        fixture.detectChanges();
        expect(okButton().disabled).toBe(false);
      });

      it('clamps an invalid count to a positive integer on confirm', () => {
        component.countOfItems.set(-3 as any);
        component.onYesClick();
        expect(mockDialogRef.close).toHaveBeenCalledWith({
          countOfItems: 1,
          disableVoice: false,
          hideExplain: false,
        });
      });
    });
  });

  describe('with current settings and a selection', () => {
    let component: VocabularyExercisesReviewOptionsDialogComponent;
    let mockDialogRef: any;

    beforeEach(async () => {
      ({ component, mockDialogRef } = await configureTestBed({
        wordQueueCount: 3,
        withSelection: true,
        currentSettings: { disableVoice: true, hideExplain: false, countOfItems: 50 },
      }));
    });

    it('seeds every field from currentSettings and pins the count to the selection size', () => {
      expect(component.disableVoice()).toBe(true);
      expect(component.hideExplain()).toBe(false);
      // The disabled count input advertises the selection size.
      expect(component.countOfItems()).toBe(3);
    });

    it('returns the persisted count, not the selection count, on confirm (M11)', () => {
      component.onYesClick();

      expect(mockDialogRef.close).toHaveBeenCalledWith({
        disableVoice: true,
        hideExplain: false,
        countOfItems: 50,
      });
    });
  });
});

describe('VocabularyExercisesSpellingOptionsDialogComponent', () => {
  const configureTestBed = async (data: unknown) => {
    const mockDialogRef = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [
        VocabularyExercisesSpellingOptionsDialogComponent,
        NoopAnimationsModule,
        TranslocoModule,
      ],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: TranslocoService, useValue: createMockTranslocoService() },
        { provide: TRANSLOCO_TRANSPILER, useValue: {} },
        { provide: TRANSLOCO_MISSING_HANDLER, useValue: {} },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(VocabularyExercisesSpellingOptionsDialogComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    return { component, fixture, mockDialogRef };
  };

  describe('without a selection', () => {
    let component: VocabularyExercisesSpellingOptionsDialogComponent;
    let fixture: ComponentFixture<VocabularyExercisesSpellingOptionsDialogComponent>;
    let mockDialogRef: any;

    beforeEach(async () => {
      ({ component, fixture, mockDialogRef } = await configureTestBed({
        wordQueueCount: 25,
        withSelection: false,
      }));
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with correct default values', () => {
      expect(component.countOfItems()).toBe(20);
      expect(component.disableVoice()).toBe(false);
      expect(component.hideExplain()).toBe(false);
    });

    it('should close dialog without data on cancel', () => {
      component.onNoClick();
      expect(mockDialogRef.close).toHaveBeenCalledWith();
    });

    it('should close dialog with data on confirm', () => {
      component.countOfItems.set(10);
      component.disableVoice.set(true);
      component.hideExplain.set(false);

      component.onYesClick();

      expect(mockDialogRef.close).toHaveBeenCalledWith({
        countOfItems: 10,
        disableVoice: true,
        hideExplain: false,
      });
    });

    it('should flag invalid output combination when both disableVoice and hideExplain are true', () => {
      component.disableVoice.set(true);
      component.hideExplain.set(true);

      // The OK button is disabled for this combination (no output possible),
      // so onYesClick is unreachable through the UI.
      expect(component.isOutputDisabled).toBe(true);
    });

    describe('count validation (M10)', () => {
      it('flags a cleared / zero / negative / fractional count as invalid', () => {
        [null, 0, -3, 1.5].forEach(bad => {
          component.countOfItems.set(bad as any);
          expect(component.isCountInvalid).toBe(true);
        });
        component.countOfItems.set(5);
        expect(component.isCountInvalid).toBe(false);
      });

      it('disables OK while the count is invalid and enables it once valid', () => {
        const okButton = (): HTMLButtonElement =>
          fixture.nativeElement.querySelectorAll('button[mat-button]')[1];

        component.countOfItems.set(0 as any);
        fixture.detectChanges();
        expect(okButton().disabled).toBe(true);

        component.countOfItems.set(8);
        fixture.detectChanges();
        expect(okButton().disabled).toBe(false);
      });

      it('clamps an invalid count to a positive integer on confirm', () => {
        component.countOfItems.set(-3 as any);
        component.onYesClick();
        expect(mockDialogRef.close).toHaveBeenCalledWith({
          countOfItems: 1,
          disableVoice: false,
          hideExplain: false,
        });
      });
    });
  });

  describe('with current settings and a selection', () => {
    let component: VocabularyExercisesSpellingOptionsDialogComponent;
    let mockDialogRef: any;

    beforeEach(async () => {
      ({ component, mockDialogRef } = await configureTestBed({
        wordQueueCount: 3,
        withSelection: true,
        currentSettings: { disableVoice: false, hideExplain: true, countOfItems: 50 },
      }));
    });

    it('seeds every field from currentSettings and pins the count to the selection size', () => {
      expect(component.disableVoice()).toBe(false);
      expect(component.hideExplain()).toBe(true);
      expect(component.countOfItems()).toBe(3);
    });

    it('returns the persisted count, not the selection count, on confirm (M11)', () => {
      component.onYesClick();

      expect(mockDialogRef.close).toHaveBeenCalledWith({
        disableVoice: false,
        hideExplain: true,
        countOfItems: 50,
      });
    });
  });
});

describe('VocabularyExercisesQuizOptionsDialogComponent', () => {
  const configureTestBed = async (data: unknown) => {
    await TestBed.configureTestingModule({
      imports: [
        VocabularyExercisesQuizOptionsDialogComponent,
        NoopAnimationsModule,
        TranslocoModule,
      ],
      providers: [
        { provide: MatDialogRef, useValue: { close: vi.fn() } },
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: TranslocoService, useValue: createMockTranslocoService() },
        { provide: TRANSLOCO_TRANSPILER, useValue: {} },
        { provide: TRANSLOCO_MISSING_HANDLER, useValue: {} },
      ],
    }).compileComponents();
  };

  describe('without current settings', () => {
    let component: VocabularyExercisesQuizOptionsDialogComponent;
    let fixture: ComponentFixture<VocabularyExercisesQuizOptionsDialogComponent>;
    let mockDialogRef: any;

    beforeEach(async () => {
      await configureTestBed({ wordQueueCount: 25, withSelection: false });
      mockDialogRef = TestBed.inject(MatDialogRef);
      fixture = TestBed.createComponent(VocabularyExercisesQuizOptionsDialogComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with correct default values', () => {
      expect(component.countOfItems()).toBe(20);
      expect(component.direction()).toBe('en2cn');
    });

    it('should close dialog without data on cancel', () => {
      component.onNoClick();
      expect(mockDialogRef.close).toHaveBeenCalledWith();
    });

    it('should close dialog with data on confirm', () => {
      component.countOfItems.set(10);
      component.direction.set('cn2en');

      component.onYesClick();

      expect(mockDialogRef.close).toHaveBeenCalledWith({
        direction: 'cn2en',
        countOfItems: 10,
      });
    });

    describe('count validation (M10)', () => {
      it('flags a cleared / zero / negative / fractional count as invalid', () => {
        [null, 0, -3, 1.5].forEach(bad => {
          component.countOfItems.set(bad as any);
          expect(component.isCountInvalid).toBe(true);
        });
        component.countOfItems.set(5);
        expect(component.isCountInvalid).toBe(false);
      });

      it('disables OK while the count is invalid and enables it once valid', () => {
        const okButton = (): HTMLButtonElement =>
          fixture.nativeElement.querySelectorAll('button[mat-button]')[1];

        component.countOfItems.set(0 as any);
        fixture.detectChanges();
        expect(okButton().disabled).toBe(true);

        component.countOfItems.set(8);
        fixture.detectChanges();
        expect(okButton().disabled).toBe(false);
      });

      it('clamps an invalid count to a positive integer on confirm', () => {
        component.countOfItems.set(-3 as any);
        component.onYesClick();
        expect(mockDialogRef.close).toHaveBeenCalledWith({ direction: 'en2cn', countOfItems: 1 });
      });
    });
  });

  describe('with current settings and a selection', () => {
    let component: VocabularyExercisesQuizOptionsDialogComponent;
    let fixture: ComponentFixture<VocabularyExercisesQuizOptionsDialogComponent>;
    let mockDialogRef: any;

    beforeEach(async () => {
      await configureTestBed({
        wordQueueCount: 3,
        withSelection: true,
        currentSettings: { direction: 'cn2en', countOfItems: 8 },
      });
      mockDialogRef = TestBed.inject(MatDialogRef);
      fixture = TestBed.createComponent(VocabularyExercisesQuizOptionsDialogComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should seed every field from currentSettings and use the selection count', () => {
      expect(component.direction()).toBe('cn2en');
      // withSelection pins the count to the number of selected rows.
      expect(component.countOfItems()).toBe(3);
    });

    it('returns the persisted count, not the selection count, on confirm (M11)', () => {
      component.onYesClick();

      expect(mockDialogRef.close).toHaveBeenCalledWith({
        direction: 'cn2en',
        countOfItems: 8,
      });
    });
  });
});

describe('VocabularyExercisesWorksheetOptionsDialogComponent', () => {
  const configureTestBed = async (data: unknown) => {
    const mockDialogRef = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [
        VocabularyExercisesWorksheetOptionsDialogComponent,
        NoopAnimationsModule,
        TranslocoModule,
      ],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: TranslocoService, useValue: createMockTranslocoService() },
        { provide: TRANSLOCO_TRANSPILER, useValue: {} },
        { provide: TRANSLOCO_MISSING_HANDLER, useValue: {} },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(VocabularyExercisesWorksheetOptionsDialogComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    return { component, fixture, mockDialogRef };
  };

  describe('without a selection', () => {
    let component: VocabularyExercisesWorksheetOptionsDialogComponent;
    let fixture: ComponentFixture<VocabularyExercisesWorksheetOptionsDialogComponent>;
    let mockDialogRef: any;

    beforeEach(async () => {
      ({ component, fixture, mockDialogRef } = await configureTestBed({
        wordQueueCount: 40,
        withSelection: false,
        title: 'Test File',
      }));
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with defaults and seed subTitle from the file name (M12 fallback)', () => {
      expect(component.countOfItems()).toBe(20);
      // No saved subtitle -> fall back to the file name.
      expect(component.subTitle()).toBe('Test File');
    });

    it('should close dialog without data on cancel', () => {
      component.onNoClick();
      expect(mockDialogRef.close).toHaveBeenCalledWith();
    });

    it('should close dialog with full options on confirm', () => {
      component.countOfItems.set(25);
      component.printEntryDate.set(false);
      component.printFirstLetter.set(true);

      component.onYesClick();

      expect(mockDialogRef.close).toHaveBeenCalledWith(
        expect.objectContaining({
          countOfItems: 25,
          printEntryDate: false,
          printFirstLetter: true,
          uniformBlankLength: true,
          uniformBlankLengthSize: 30,
        })
      );
    });

    it('should close dialog with a custom uniform blank length on confirm', () => {
      component.uniformBlankLength.set(true);
      component.uniformBlankLengthSize.set(30);

      component.onYesClick();

      expect(mockDialogRef.close).toHaveBeenCalledWith(
        expect.objectContaining({
          uniformBlankLength: true,
          uniformBlankLengthSize: 30,
        })
      );
    });

    it('should close dialog with uniform blank disabled when toggled off', () => {
      component.uniformBlankLength.set(false);

      component.onYesClick();

      expect(mockDialogRef.close).toHaveBeenCalledWith(
        expect.objectContaining({
          uniformBlankLength: false,
        })
      );
    });

    describe('count validation (M10)', () => {
      it('flags a cleared / zero / negative / fractional count as invalid', () => {
        [null, 0, -3, 1.5].forEach(bad => {
          component.countOfItems.set(bad as any);
          expect(component.isCountInvalid).toBe(true);
        });
        component.countOfItems.set(5);
        expect(component.isCountInvalid).toBe(false);
      });

      it('disables OK while the count is invalid and enables it once valid', () => {
        const okButton = (): HTMLButtonElement =>
          fixture.nativeElement.querySelectorAll('button[mat-button]')[1];

        component.countOfItems.set(0 as any);
        fixture.detectChanges();
        expect(okButton().disabled).toBe(true);

        component.countOfItems.set(8);
        fixture.detectChanges();
        expect(okButton().disabled).toBe(false);
      });

      it('clamps an invalid count to a positive integer on confirm', () => {
        component.countOfItems.set(-3 as any);
        component.onYesClick();
        expect(mockDialogRef.close).toHaveBeenCalledWith(
          expect.objectContaining({ countOfItems: 1 })
        );
      });
    });
  });

  describe('with current settings and a selection', () => {
    let component: VocabularyExercisesWorksheetOptionsDialogComponent;
    let mockDialogRef: any;

    beforeEach(async () => {
      ({ component, mockDialogRef } = await configureTestBed({
        wordQueueCount: 40,
        withSelection: true,
        title: 'Test File',
        currentSettings: {
          subTitle: 'Unit 5 Test',
          countOfItems: 50,
          printEntryDate: true,
          printFirstLetter: false,
          uniformBlankLength: false,
          uniformBlankLengthSize: 14,
        },
      }));
    });

    it('seeds subTitle from currentSettings, not the file name (M12)', () => {
      expect(component.subTitle()).toBe('Unit 5 Test');
    });

    it('still displays the selection count in the disabled count input', () => {
      expect(component.countOfItems()).toBe(40);
    });

    it('returns the persisted count, not the selection count, on confirm (M11)', () => {
      // The disabled count input shows 40 (selection size); confirm must not
      // write that back as the persisted count.
      component.onYesClick();

      expect(mockDialogRef.close).toHaveBeenCalledWith(
        expect.objectContaining({ countOfItems: 50 })
      );
    });
  });

  describe('dead machinery removal (L11)', () => {
    it('renders no datepicker or radio controls', async () => {
      const { fixture } = await configureTestBed({
        wordQueueCount: 40,
        withSelection: false,
        title: 'Test File',
      });

      // The worksheet dialog never used its datepicker/radio imports; they were
      // dead weight bundled into the lazy chunk. Lock the removal in.
      expect(fixture.nativeElement.querySelector('mat-datepicker, mat-datepicker-toggle, mat-radio-group')).toBeNull();
    });

    it('does not carry the allPrintExecDates / printExecDate fields', async () => {
      const { component } = await configureTestBed({
        wordQueueCount: 40,
        withSelection: false,
        title: 'Test File',
      });

      expect((component as any).allPrintExecDates).toBeUndefined();
      component.onYesClick();
      const closedata = (component as any).dialogRef.close.mock.calls[0][0];
      expect(closedata.printExecDate).toBeUndefined();
    });
  });
});

describe('VocabularySelectDialogComponent', () => {
  let mockDialogRef: any;
  let fixture: ComponentFixture<VocabularySelectDialogComponent>;

  async function createComponent(
    mode: SelectionModeEnum,
    extraData: { rowCount?: number; visibleWords?: string[] } = {}
  ): Promise<VocabularySelectDialogComponent> {
    mockDialogRef = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [VocabularySelectDialogComponent, NoopAnimationsModule, TranslocoModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { mode, ...extraData } },
        { provide: TranslocoService, useValue: createMockTranslocoService() },
        { provide: TRANSLOCO_TRANSPILER, useValue: {} },
        { provide: TRANSLOCO_MISSING_HANDLER, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VocabularySelectDialogComponent);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  it('By Count: should create', async () => {
    const component = await createComponent(SelectionModeEnum.ByCount);
    expect(component).toBeTruthy();
  });

  it('By Count: should close with countOfItems and countOfOffset on confirm', async () => {
    const component = await createComponent(SelectionModeEnum.ByCount, { rowCount: 200 });
    component.countOfItems.set(10);
    component.countOfOffset.set(5);
    component.onYesClick();

    expect(mockDialogRef.close).toHaveBeenCalledWith({
      selectedSelectMode: SelectionModeEnum.ByCount,
      countOfItems: 10,
      countOfOffset: 5,
    });
  });

  it('By Count: isFormInvalid true when countOfItems is 0', async () => {
    const component = await createComponent(SelectionModeEnum.ByCount, { rowCount: 200 });
    component.countOfItems.set(0);
    expect(component.isFormInvalid).toBe(true);
  });

  describe('By Count validation (M13)', () => {
    it('flags a cleared / zero / negative / fractional count as invalid', async () => {
      const component = await createComponent(SelectionModeEnum.ByCount, { rowCount: 200 });
      [null, 0, -3, 1.5].forEach(bad => {
        component.countOfItems.set(bad as any);
        expect(component.isFormInvalid).toBe(true);
      });
      component.countOfItems.set(5);
      expect(component.isFormInvalid).toBe(false);
    });

    it('flags a negative / fractional / out-of-range offset as invalid', async () => {
      const component = await createComponent(SelectionModeEnum.ByCount, { rowCount: 200 });
      component.countOfItems.set(10);
      // offset must be an integer in [0, rowCount)
      [-1, 0.5, 200, 10000].forEach(bad => {
        component.countOfOffset.set(bad as any);
        expect(component.isFormInvalid).toBe(true);
      });
      // valid offsets (0 and rowCount - 1)
      component.countOfOffset.set(0);
      expect(component.isFormInvalid).toBe(false);
      component.countOfOffset.set(199);
      expect(component.isFormInvalid).toBe(false);
    });

    it('disables OK while the offset is out of range and enables it once valid', async () => {
      const component = await createComponent(SelectionModeEnum.ByCount, { rowCount: 8 });
      const okButton = (): HTMLButtonElement =>
        fixture.nativeElement.querySelectorAll('button[mat-button]')[1];

      component.countOfItems.set(3);
      component.countOfOffset.set(8); // === rowCount -> out of range
      fixture.detectChanges();
      expect(okButton().disabled).toBe(true);

      component.countOfOffset.set(5);
      fixture.detectChanges();
      expect(okButton().disabled).toBe(false);
    });

    it('clamps count to >= 1 and offset to [0, rowCount-1] on confirm', async () => {
      const component = await createComponent(SelectionModeEnum.ByCount, { rowCount: 10 });
      component.countOfItems.set(-3 as any);
      component.countOfOffset.set(100 as any);
      component.onYesClick();
      expect(mockDialogRef.close).toHaveBeenCalledWith({
        selectedSelectMode: SelectionModeEnum.ByCount,
        countOfItems: 1,
        countOfOffset: 9,
      });
    });
  });

  it('By Word: should close with normalized comma-joined importIDs on confirm', async () => {
    const component = await createComponent(SelectionModeEnum.ByID, {
      visibleWords: ['hello', 'world'],
    });
    // Newlines and surrounding whitespace normalize to a clean comma list (M14).
    component.importWords.set('  hello\n, world  ');
    component.onYesClick();

    expect(mockDialogRef.close).toHaveBeenCalledWith({
      selectedSelectMode: SelectionModeEnum.ByID,
      importIDs: 'hello,world',
    });
  });

  it('By Word: isFormInvalid true when importWords is empty', async () => {
    const component = await createComponent(SelectionModeEnum.ByID, {
      visibleWords: ['hello', 'world'],
    });
    component.importWords.set('');
    expect(component.isFormInvalid).toBe(true);
  });

  describe('By Word validation (M14)', () => {
    it('flags separator-only input (e.g. ",,,") as invalid', async () => {
      const component = await createComponent(SelectionModeEnum.ByID, {
        visibleWords: ['hello', 'world'],
      });
      component.importWords.set(',,,');
      expect(component.isFormInvalid).toBe(true);
    });

    it('flags input where no token matches a visible word', async () => {
      const component = await createComponent(SelectionModeEnum.ByID, {
        visibleWords: ['hello', 'world'],
      });
      component.importWords.set('nonexistent, alsoabsent');
      expect(component.isFormInvalid).toBe(true);
    });

    it('accepts newline-separated input with at least one match', async () => {
      const component = await createComponent(SelectionModeEnum.ByID, {
        visibleWords: ['hello', 'world', 'test'],
      });
      component.importWords.set('hello\nbanana\ntest');
      expect(component.isFormInvalid).toBe(false);
    });

    it('preserves multi-word entries like "apple pie" (whitespace not split on)', async () => {
      const component = await createComponent(SelectionModeEnum.ByID, {
        visibleWords: ['apple pie', 'hello'],
      });
      component.importWords.set('apple pie, hello');
      expect(component.isFormInvalid).toBe(false);
      component.onYesClick();
      expect(mockDialogRef.close).toHaveBeenCalledWith({
        selectedSelectMode: SelectionModeEnum.ByID,
        importIDs: 'apple pie,hello',
      });
    });
  });

  it('Free Selection: should close with countOfItems on confirm', async () => {
    const component = await createComponent(SelectionModeEnum.FreeSelection);
    component.countOfItems.set(15);
    component.onYesClick();

    expect(mockDialogRef.close).toHaveBeenCalledWith({
      selectedSelectMode: SelectionModeEnum.FreeSelection,
      countOfItems: 15,
    });
  });

  it('Free Selection: isFormInvalid true when countOfItems is 0', async () => {
    const component = await createComponent(SelectionModeEnum.FreeSelection);
    component.countOfItems.set(0);
    expect(component.isFormInvalid).toBe(true);
  });

  it('titleKey returns the correct key per mode', async () => {
    const component = await createComponent(SelectionModeEnum.ByCount);
    component.data.mode = SelectionModeEnum.ByCount;
    expect(component.titleKey).toBe('vocabularyExercises.sequenceSelect');
    component.data.mode = SelectionModeEnum.ByID;
    expect(component.titleKey).toBe('vocabularyExercises.selectWords');
    component.data.mode = SelectionModeEnum.FreeSelection;
    expect(component.titleKey).toBe('vocabularyExercises.randomSelect');
  });
});
