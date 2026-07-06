import { vi } from 'vitest';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import {
  TranslocoModule,
  TranslocoService,
  TRANSLOCO_TRANSPILER,
  TRANSLOCO_MISSING_HANDLER,
} from '@jsverse/transloco';
import { of, throwError } from 'rxjs';

import type { LearningContent, LearnEnglishWordFileItem, UserLearningRating, StudyQueueItem } from '../../interfaces';
import { VocabularyExcludedPartEnum, RatingOperatorEnum } from '../../interfaces';
import { AudioService, UIService, UtilService, LearningContentService, LearningRatingService } from '../../services';
import { AppPageTitle } from '../page-title/page-title';

import {
  VocabularyExercisesComponent,
  VocabularyExercisesStudyOptionsDialogComponent,
  VocabularyExercisesTypingOptionsDialogComponent,
  VocabularyExercisesPrintOptionsDialogComponent,
  VocabularySelectByCountDialogComponent,
  VocabularySelectByWordDialogComponent,
  VocabularySelectFreeDialogComponent,
  VocabularySelectByRatingDialogComponent,
} from './vocabulary-exercises.component';

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
    mockAudioService = { playSound: vi.fn(), stopSound: vi.fn() };
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
        {
          provide: UtilService,
          useValue: {
            getAllCharacters: () => ['a', 'b', 'c'],
            getAllTypingExcludeParts: () => [],
          },
        },
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
      expect(component.allFiles).toEqual(mockDataFiles);
    });

    it('should mark the OnPush view for check after the file list arrives (no click needed)', () => {
      // Regression: the file list lands in an async subscribe callback (not a
      // template event, not an async pipe). With ChangeDetectionStrategy.OnPush
      // the view is not marked dirty automatically, so the files dropdown stayed
      // empty until a later DOM event triggered detection. The component must
      // call markForCheck() once the list is ready.
      const markForCheckSpy = vi.spyOn(component['cdr'], 'markForCheck');
      markForCheckSpy.mockClear();

      fixture.detectChanges(); // runs ngOnInit → synchronous of() emit → next

      expect(component.allFiles).toEqual(mockDataFiles);
      expect(markForCheckSpy).toHaveBeenCalled();
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

  describe('applyFilter', () => {
    it('should filter data source with trimmed lowercase value', () => {
      component.dataSource.data = mockWordContent;
      const event = { target: { value: '  HELLO  ' } } as any;

      component.applyFilter(event);

      expect(component.dataSource.filter).toBe('hello');
    });

    it('should handle empty filter value', () => {
      component.dataSource.data = mockWordContent;
      const event = { target: { value: '' } } as any;

      component.applyFilter(event);

      expect(component.dataSource.filter).toBe('');
    });
  });

  describe('onFileSelectionChanged', () => {
    it('should load file content when file is selected', () => {
      component.onFileSelectionChanged({ value: mockDataFiles[0] } as any);

      expect(mockLearningContentService.getVocabularyWordContent).toHaveBeenCalledWith('data/file1.json');
      expect(component.dataSource.data).toEqual(mockWordContent);
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

    it('should mark the OnPush view for check when ratings load (no click needed)', () => {
      // Regression: ratings arrive in an async subscribe callback; the mat-table
      // only re-renders rows when dataSource emits, so without markForCheck the
      // rating column stays at 0 until the next interaction.
      mockRatingService.getRatings.mockReturnValue(of([{ itemId: 1, rating: 5 }]));
      const markForCheckSpy = vi.spyOn(component['cdr'], 'markForCheck');
      markForCheckSpy.mockClear();

      component.onFileSelectionChanged({ value: mockDataFiles[0] } as any);

      expect(component.getRating(1)).toBe(5);
      expect(markForCheckSpy).toHaveBeenCalled();
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
    it('should handle file upload and update content service', () => {
      const mockFile = new File(['[{"enword":"test","cnword":"测试"}]'], 'test.json', {
        type: 'application/json',
      });
      const mockEvent = { target: { files: [mockFile] } } as any;

      const timestampRegex = /temp-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z\.json/;

      const addTempContentSpy = mockLearningContentService.addTemporaryContent;

      // FileReader is used with `new` in the component, so the mock must be
      // constructor-compatible. We share an instance reference so the test can
      // inspect properties that the component assigns after construction.
      let readerInstance: any;
      function MockFileReader(this: any) {
        readerInstance = this;
        this.readAsText = vi.fn();
        this.onload = null;
        this.result = '';
      }
      const fileReaderSpy = vi
        .spyOn(window, 'FileReader')
        .mockImplementation(MockFileReader as any);

      try {
        component.onAddTempFile(mockEvent);

        readerInstance.result = '[{"enword":"test","cnword":"测试"}]';
        if (readerInstance.onload) {
          readerInstance.onload({ target: readerInstance } as any);
        }

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

      let readerInstance: any;
      function MockFileReader(this: any) {
        readerInstance = this;
        this.readAsText = vi.fn();
        this.onload = null;
        this.result = '';
      }
      const fileReaderSpy = vi
        .spyOn(window, 'FileReader')
        .mockImplementation(MockFileReader as any);
      const consoleSpy = vi.spyOn(console, 'error');

      try {
        component.onAddTempFile(mockEvent);

        readerInstance.result = 'invalid json';
        if (readerInstance.onload) {
          readerInstance.onload({ target: readerInstance } as any);
        }

        expect(consoleSpy).toHaveBeenCalledWith('Error parsing JSON file:', expect.any(Error));
      } finally {
        fileReaderSpy.mockRestore();
        consoleSpy.mockRestore();
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

  describe('getter methods', () => {
    it('wordQueueCount should return data source length', () => {
      component.dataSource.data = mockWordContent;
      expect(component.wordQueueCount).toBe(8);
    });

    it('wordQueueCount should return 0 for empty data source', () => {
      component.dataSource.data = [];
      expect(component.wordQueueCount).toBe(0);
    });

    it('wordExplain should return cnword of current queue item', () => {
      component['wordqueues'] = [
        { enword: 'test', cnword: '测试', completed: false },
        { enword: 'hello', cnword: '你好', completed: false },
      ];
      component['_queueidx'] = 0;
      expect(component.wordExplain).toBe('测试');
    });

    it('wordExplain should return empty string when queue index is out of bounds', () => {
      component['wordqueues'] = [{ enword: 'test', cnword: '测试', completed: false }];
      component['_queueidx'] = -1;
      expect(component.wordExplain).toBe('');
    });

    it('currentTypingProgress should return 100 when wordQueueCount is 0', () => {
      component.dataSource.data = [];
      expect(component.currentTypingProgress).toBe(100);
    });

    it('currentTypingProgress should calculate progress correctly', () => {
      component.dataSource.data = mockWordContent.slice();
      component['_queueidx'] = 4;
      expect(component.currentTypingProgress).toBe(50);
    });
  });

  describe('study mode', () => {
    it('should initialize study settings with defaults', () => {
      expect(component.studySetting.disableVoice).toBe(false);
      expect(component.studySetting.hideExplain).toBe(false);
      expect(component.studySetting.countOfItems).toBe(20);
    });

    it('should track study state', () => {
      expect(component.isStudying).toBe(false);
      component.isStudying = true;
      expect(component.isStudying).toBe(true);
    });
  });

  describe('study navigation getters', () => {
    beforeEach(() => {
      component.studyQueues = [
        { enword: 'test1', cnword: '测试1', audiofile: '', rating: 0 },
        { enword: 'test2', cnword: '测试2', audiofile: '', rating: 0 },
        { enword: 'test3', cnword: '测试3', audiofile: '', rating: 0 },
      ];
    });

    it('isStudyPreviousDisabled should return true when at first word', () => {
      component.currentStudyCursor = 0;
      expect(component.isStudyPreviousDisabled).toBe(true);
    });

    it('isStudyPreviousDisabled should return false when not at first word', () => {
      component.currentStudyCursor = 1;
      expect(component.isStudyPreviousDisabled).toBe(false);
    });

    it('isStudyNextDisabled should return true when at last word', () => {
      component.currentStudyCursor = 2;
      expect(component.isStudyNextDisabled).toBe(true);
    });

    it('isStudyNextDisabled should return false when not at last word', () => {
      component.currentStudyCursor = 1;
      expect(component.isStudyNextDisabled).toBe(false);
    });
  });

  describe('onStudyWithOptions', () => {
    it('should open dialog with correct data when selection exists', () => {
      component.selection.select(mockWordContent[0], mockWordContent[1]);
      const mockDialogRef = { afterClosed: () => of(undefined) };
      mockDialog.open.mockReturnValue(mockDialogRef as any);

      component.onStudyWithOptions();

      expect(mockDialog.open).toHaveBeenCalledWith(expect.any(Function), {
        data: { wordQueueCount: 2, withSelection: true },
        width: '500px',
        height: '480px',
        enterAnimationDuration: 800,
        exitAnimationDuration: 500,
      });
    });

    it('should open dialog with full dataset when no selection', () => {
      component.dataSource.data = mockWordContent.slice();
      const mockDialogRef = { afterClosed: () => of(undefined) };
      mockDialog.open.mockReturnValue(mockDialogRef as any);

      component.onStudyWithOptions();

      expect(mockDialog.open).toHaveBeenCalledWith(expect.any(Function), {
        data: { wordQueueCount: 8, withSelection: false },
        width: '500px',
        height: '480px',
        enterAnimationDuration: 800,
        exitAnimationDuration: 500,
      });
    });

    it('should apply study settings and start study when dialog returns data', () => {
      const mockDialogRef = {
        afterClosed: () =>
          of({
            disableVoice: true,
            hideExplain: false,
            excludePart: VocabularyExcludedPartEnum.word,
            countOfItems: 10,
          }),
      };
      mockDialog.open.mockReturnValue(mockDialogRef as any);
      vi.spyOn(component as any, 'onStudyCore');
      component.dataSource.data = mockWordContent.slice();

      component.onStudyWithOptions();

      expect(component.studySetting.disableVoice).toBe(true);
      expect(component.studySetting.hideExplain).toBe(false);
      expect(component.studySetting.excludePart).toBe(VocabularyExcludedPartEnum.word);
      expect(component.studySetting.countOfItems).toBe(10);
      expect(component['onStudyCore']).toHaveBeenCalled();
    });

    it('should clear excludePart when dialog returns undefined excludePart', () => {
      const mockDialogRef = {
        afterClosed: () =>
          of({
            disableVoice: false,
            hideExplain: false,
            countOfItems: 15,
          }),
      };
      mockDialog.open.mockReturnValue(mockDialogRef as any);
      vi.spyOn(component as any, 'onStudyCore');
      component.studySetting.excludePart = VocabularyExcludedPartEnum.word;
      component.dataSource.data = mockWordContent.slice();

      component.onStudyWithOptions();

      expect(component.studySetting.excludePart).toBeUndefined();
    });
  });

  describe('onStudyCore', () => {
    beforeEach(() => {
      component.dataSource.data = mockWordContent.slice();
    });

    it('should process selected items and randomize', () => {
      component.selection.select(mockWordContent[0], mockWordContent[1]);

      component['onStudyCore']();

      expect(component.studyQueues.length).toBe(2);
      expect(component.isStudying).toBe(true);
      expect(component.currentStudyCursor).toBe(0);
    });

    it('should set initial progress based on first word position', () => {
      component.selection.select(mockWordContent[0], mockWordContent[1]);

      component['onStudyCore']();

      // With 2 items, initial progress should be 50% (1/2 * 100)
      expect(component.currentStudyProgress).toBe(50);
    });

    it('should filter by excludePart=word (only phrases)', () => {
      component.studySetting.excludePart = VocabularyExcludedPartEnum.word;
      component.studySetting.countOfItems = 10;

      component['onStudyCore']();

      expect(component.studyQueues.length).toBe(1);
      expect(component.studyQueues[0].enword).toBe('apple pie');
    });

    it('should filter by excludePart=phase (only single words)', () => {
      component.studySetting.excludePart = VocabularyExcludedPartEnum.phase;
      component.studySetting.countOfItems = 10;

      component['onStudyCore']();

      expect(component.studyQueues.every(q => q.enword.indexOf(' ') === -1)).toBe(true);
    });

    it('should filter by wordLeadingCharacter', () => {
      component.studySetting.wordLeadingCharacter = ['h', 'w'];
      component.studySetting.countOfItems = 10;

      component['onStudyCore']();

      expect(
        component.studyQueues.every(
          q => q.enword.startsWith('h') || q.enword.startsWith('w') || q.enword.startsWith('H')
        )
      ).toBe(true);
    });

    it('should limit to countOfItems and randomize', () => {
      component.studySetting.countOfItems = 3;
      vi.spyOn(Math, 'random').mockReturnValueOnce(0.5).mockReturnValueOnce(0.3)
        .mockReturnValueOnce(0.8).mockReturnValueOnce(0.1).mockReturnValueOnce(0.6)
        .mockReturnValueOnce(0.4).mockReturnValueOnce(0.7).mockReturnValueOnce(0.2);

      component['onStudyCore']();

      expect(component.studyQueues.length).toBe(3);
    });

    it('should pre-populate ratings from API into study queues', () => {
      const mockRatings: UserLearningRating[] = [
        { contentId: 1, itemId: 10, rating: 4 },
        { contentId: 1, itemId: 20, rating: 2 },
      ];
      mockRatingService.getRatings.mockReturnValue(of(mockRatings));

      // Set up data with known ids
      component.dataSource.data = [
        { id: 10, enword: 'hello', cnword: '你好' },
        { id: 20, enword: 'world', cnword: '世界' },
        { id: 30, enword: 'test', cnword: '测试' },
      ] as LearnEnglishWordFileItem[];
      component.studyContentId = 1;

      component['onStudyCore']();

      // Ratings should be loaded and mapped
      expect(mockRatingService.getRatings).toHaveBeenCalledWith(1);
      const ratedItems = component.studyQueues.filter(q => q.rating > 0);
      expect(ratedItems.length).toBe(2);
      expect(component.studyQueues.find(q => q.itemId === 10)?.rating).toBe(4);
      expect(component.studyQueues.find(q => q.itemId === 20)?.rating).toBe(2);
    });

    it('should default rating to 0 when no rating exists for an item', () => {
      mockRatingService.getRatings.mockReturnValue(of([]));

      component.dataSource.data = [
        { id: 10, enword: 'hello', cnword: '你好' },
      ] as LearnEnglishWordFileItem[];
      component.studyContentId = 1;

      component['onStudyCore']();

      expect(component.studyQueues[0].rating).toBe(0);
    });

    it('should not load ratings when studyContentId is 0', () => {
      component.dataSource.data = [
        { id: 10, enword: 'hello', cnword: '你好' },
      ] as LearnEnglishWordFileItem[];
      component.studyContentId = 0;

      component['onStudyCore']();

      expect(mockRatingService.getRatings).not.toHaveBeenCalled();
    });

    it('should bail out safely when the queue is empty (no data)', () => {
      component.dataSource.data = [];
      component.selection.clear();
      component.studyContentId = 1;
      mockRatingService.getRatings.mockReturnValue(of([]));

      expect(() => component['onStudyCore']()).not.toThrow();

      expect(component.studyQueues.length).toBe(0);
      expect(component.isStudying).toBe(false);
      expect(component.currentStudyCursor).toBe(0);
      expect(component.currentStudyProgress).toBe(0);
      // No point loading ratings when there is nothing to study.
      expect(mockRatingService.getRatings).not.toHaveBeenCalled();
    });

    it('should bail out safely when a filter removes every word', () => {
      // mockWordContent has no word starting with 'z', so the leading-char
      // filter eliminates everything.
      component.studySetting.wordLeadingCharacter = ['z'];
      component.studySetting.countOfItems = 10;
      component.selection.clear();
      component.studyContentId = 0;

      expect(() => component['onStudyCore']()).not.toThrow();

      expect(component.studyQueues.length).toBe(0);
      expect(component.isStudying).toBe(false);
      expect(component.currentStudyProgress).toBe(0);
    });
  });

  describe('onRatingChanged', () => {
    it('should save rating via upsertRating when valid', () => {
      const savedRating: UserLearningRating = { contentId: 1, itemId: 10, rating: 4 };
      mockRatingService.upsertRating.mockReturnValue(of(savedRating));

      component.studyContentId = 1;
      const item: StudyQueueItem = { enword: 'hello', cnword: '你好', audiofile: '', rating: 4, itemId: 10 };

      component.onRatingChanged(item);

      expect(mockRatingService.upsertRating).toHaveBeenCalledWith(1, 10, 4);
    });

    it('should not save when rating is less than 1', () => {
      component.studyContentId = 1;
      const item: StudyQueueItem = { enword: 'hello', cnword: '你好', audiofile: '', rating: 0, itemId: 10 };

      component.onRatingChanged(item);

      expect(mockRatingService.upsertRating).not.toHaveBeenCalled();
    });

    it('should not save when itemId is undefined', () => {
      component.studyContentId = 1;
      const item: StudyQueueItem = { enword: 'hello', cnword: '你好', audiofile: '', rating: 3 };

      component.onRatingChanged(item);

      expect(mockRatingService.upsertRating).not.toHaveBeenCalled();
    });

    it('should not save when studyContentId is 0', () => {
      component.studyContentId = 0;
      const item: StudyQueueItem = { enword: 'hello', cnword: '你好', audiofile: '', rating: 3, itemId: 10 };

      component.onRatingChanged(item);

      expect(mockRatingService.upsertRating).not.toHaveBeenCalled();
    });

    it('should update studyRatingMap after successful save', () => {
      const savedRating: UserLearningRating = { contentId: 1, itemId: 10, rating: 5 };
      mockRatingService.upsertRating.mockReturnValue(of(savedRating));

      component.studyContentId = 1;
      const item: StudyQueueItem = { enword: 'hello', cnword: '你好', audiofile: '', rating: 5, itemId: 10 };

      component.onRatingChanged(item);

      expect(component['studyRatingMap'].get(10)).toEqual(savedRating);
    });
  });

  describe('onStudyPreviousWord', () => {
    beforeEach(() => {
      component.studyQueues = [
        { enword: 'test1', cnword: '测试1', audiofile: '', rating: 0 },
        { enword: 'test2', cnword: '测试2', audiofile: '', rating: 0 },
      ];
    });

    it('should move to previous word when not at start', () => {
      component.currentStudyCursor = 1;

      component.onStudyPreviousWord();

      expect(component.currentStudyCursor).toBe(0);
      expect(component.currentStudyProgress).toBe(50);
    });

    it('should not move before start', () => {
      component.currentStudyCursor = 0;

      component.onStudyPreviousWord();

      expect(component.currentStudyCursor).toBe(0);
    });
  });

  describe('onStudyNextWord', () => {
    beforeEach(() => {
      component.studyQueues = [
        { enword: 'test1', cnword: '测试1', audiofile: '', rating: 0 },
        { enword: 'test2', cnword: '测试2', audiofile: '', rating: 0 },
      ];
    });

    it('should move to next word when not at end', () => {
      component.currentStudyCursor = 0;

      component.onStudyNextWord();

      expect(component.currentStudyCursor).toBe(1);
      expect(component.currentStudyProgress).toBe(100);
    });

    it('should not move past end', () => {
      component.currentStudyCursor = 1;

      component.onStudyNextWord();

      expect(component.currentStudyCursor).toBe(1);
    });
  });

  describe('onQuitStudy', () => {
    it('should reset study state', () => {
      component.isStudying = true;
      component.studyQueues = [{ enword: 'test', cnword: '测试', audiofile: '', rating: 0 }];
      component.currentStudyCursor = 1;
      component.currentStudyProgress = 50;

      component.onQuitStudy();

      expect(component.isStudying).toBe(false);
      expect(component.studyQueues).toEqual([]);
      expect(component.currentStudyCursor).toBe(0);
      expect(component.currentStudyProgress).toBe(0);
    });
  });

  describe('speakWord', () => {
    let originalSpeechSynthesis: SpeechSynthesis | undefined;
    let originalCtor: unknown;
    let getVoicesMock: ReturnType<typeof vi.fn>;
    let speakMock: ReturnType<typeof vi.fn>;
    let cancelMock: ReturnType<typeof vi.fn>;
    let voicesChangedHandler: (() => void) | null;

    beforeEach(() => {
      originalSpeechSynthesis = window.speechSynthesis;
      originalCtor = (window as unknown as { SpeechSynthesisUtterance?: unknown }).SpeechSynthesisUtterance;
      voicesChangedHandler = null;
      getVoicesMock = vi.fn(() => []);
      speakMock = vi.fn();
      cancelMock = vi.fn();

      Object.defineProperty(window, 'speechSynthesis', {
        configurable: true,
        value: {
          getVoices: getVoicesMock,
          speak: speakMock,
          cancel: cancelMock,
          set onvoiceschanged(fn: (() => void) | null) {
            voicesChangedHandler = fn;
          },
          get onvoiceschanged(): (() => void) | null {
            return voicesChangedHandler;
          },
        },
      });

      // jsdom does not ship SpeechSynthesisUtterance; provide a minimal stub.
      (window as unknown as { SpeechSynthesisUtterance: unknown }).SpeechSynthesisUtterance =
        class {
          text: string;
          lang = '';
          rate = 1;
          voice?: SpeechSynthesisVoice;
          onerror?: (e: { error: string }) => void;
          constructor(text: string) {
            this.text = text;
          }
        };

      // Fresh per-instance voice cache/listener state for each test.
      component['cachedVoices'] = [];
      component['voicesListenerAttached'] = false;
    });

    afterEach(() => {
      Object.defineProperty(window, 'speechSynthesis', {
        configurable: true,
        value: originalSpeechSynthesis,
      });
      (window as unknown as { SpeechSynthesisUtterance: unknown }).SpeechSynthesisUtterance = originalCtor;
    });

    it('should not throw and should not speak when speechSynthesis is unavailable', () => {
      Object.defineProperty(window, 'speechSynthesis', {
        configurable: true,
        value: undefined,
      });

      expect(() => component['speakWord']('hello')).not.toThrow();
      expect(speakMock).not.toHaveBeenCalled();
    });

    it('should speak the word with an en-US utterance at rate 0.9', () => {
      component['speakWord']('hello');

      expect(cancelMock).toHaveBeenCalled();
      expect(speakMock).toHaveBeenCalledTimes(1);
      const utterance = speakMock.mock.calls[0][0] as SpeechSynthesisUtterance;
      expect(utterance.text).toBe('hello');
      expect(utterance.lang).toBe('en-US');
      expect(utterance.rate).toBe(0.9);
    });

    it('should select the en-US voice from the cache when voices are already loaded', () => {
      const usVoice = { lang: 'en-US', name: 'US English' } as SpeechSynthesisVoice;
      getVoicesMock.mockReturnValue([usVoice]);

      component['speakWord']('hello');

      const utterance = speakMock.mock.calls[0][0] as SpeechSynthesisUtterance;
      expect(utterance.voice).toBe(usVoice);
    });

    it('should attach onvoiceschanged and refresh the cache when voices load later', () => {
      // First call: no voices available yet — selection skipped, listener attached.
      component['speakWord']('hello');
      expect(voicesChangedHandler).not.toBeNull();
      const firstUtterance = speakMock.mock.calls[0][0] as SpeechSynthesisUtterance;
      expect(firstUtterance.voice).toBeUndefined();

      // Platform later publishes the voice list.
      const usVoice = { lang: 'en-US', name: 'US English' } as SpeechSynthesisVoice;
      getVoicesMock.mockReturnValue([usVoice]);
      voicesChangedHandler!();

      // The next utterance should now pick up the cached US voice.
      component['speakWord']('world');
      const secondUtterance = speakMock.mock.calls[1][0] as SpeechSynthesisUtterance;
      expect(secondUtterance.voice).toBe(usVoice);
    });

    it('should not re-attach the onvoiceschanged listener on subsequent calls', () => {
      component['speakWord']('hello');
      const firstHandler = voicesChangedHandler;
      component['speakWord']('world');
      expect(voicesChangedHandler).toBe(firstHandler);
    });

    it('should not warn on interrupted/canceled errors', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      component['speakWord']('hello');
      const utterance = speakMock.mock.calls[0][0] as SpeechSynthesisUtterance;
      const makeEvent = (error: string) => ({ error } as unknown as SpeechSynthesisErrorEvent);
      utterance.onerror!(makeEvent('interrupted'));
      utterance.onerror!(makeEvent('canceled'));
      expect(warnSpy).not.toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it('should warn on other speechSynthesis errors', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      component['speakWord']('hello');
      const utterance = speakMock.mock.calls[0][0] as SpeechSynthesisUtterance;
      utterance.onerror!({ error: 'audio-busy' } as unknown as SpeechSynthesisErrorEvent);
      expect(warnSpy).toHaveBeenCalledWith('speechSynthesis error:', 'audio-busy');
      warnSpy.mockRestore();
    });
  });

  describe('handleKeyboardEvent — study mode shortcuts', () => {
    beforeEach(() => {
      component.isStudying = true;
      component.studyQueues = [
        { enword: 'hello', cnword: '你好', audiofile: '', rating: 0, itemId: 10 },
        { enword: 'world', cnword: '世界', audiofile: '', rating: 0, itemId: 20 },
        { enword: 'test', cnword: '测试', audiofile: '', rating: 0, itemId: 30 },
      ];
      component.currentStudyCursor = 1;
      component.studyContentId = 1;
    });

    it('should set rating to 1-5 when pressing number keys', () => {
      const savedRating: UserLearningRating = { contentId: 1, itemId: 20, rating: 3 };
      mockRatingService.upsertRating.mockReturnValue(of(savedRating));
      const event = new KeyboardEvent('keyup', { key: '3' });

      component.handleKeyboardEvent(event);

      expect(component.studyQueues[1].rating).toBe(3);
      expect(mockRatingService.upsertRating).toHaveBeenCalledWith(1, 20, 3);
    });

    it('should move to previous word on ArrowLeft', () => {
      const event = new KeyboardEvent('keyup', { key: 'ArrowLeft' });

      component.handleKeyboardEvent(event);

      expect(component.currentStudyCursor).toBe(0);
    });

    it('should move to next word on ArrowRight', () => {
      const event = new KeyboardEvent('keyup', { key: 'ArrowRight' });

      component.handleKeyboardEvent(event);

      expect(component.currentStudyCursor).toBe(2);
    });

    it('should increase rating on ArrowUp', () => {
      component.studyQueues[1].rating = 2;
      const savedRating: UserLearningRating = { contentId: 1, itemId: 20, rating: 3 };
      mockRatingService.upsertRating.mockReturnValue(of(savedRating));
      const event = new KeyboardEvent('keyup', { key: 'ArrowUp' });

      component.handleKeyboardEvent(event);

      expect(component.studyQueues[1].rating).toBe(3);
      expect(mockRatingService.upsertRating).toHaveBeenCalledWith(1, 20, 3);
    });

    it('should not increase rating above 5 on ArrowUp', () => {
      component.studyQueues[1].rating = 5;
      const event = new KeyboardEvent('keyup', { key: 'ArrowUp' });

      component.handleKeyboardEvent(event);

      expect(component.studyQueues[1].rating).toBe(5);
      expect(mockRatingService.upsertRating).not.toHaveBeenCalled();
    });

    it('should decrease rating on ArrowDown', () => {
      component.studyQueues[1].rating = 3;
      const savedRating: UserLearningRating = { contentId: 1, itemId: 20, rating: 2 };
      mockRatingService.upsertRating.mockReturnValue(of(savedRating));
      const event = new KeyboardEvent('keyup', { key: 'ArrowDown' });

      component.handleKeyboardEvent(event);

      expect(component.studyQueues[1].rating).toBe(2);
      expect(mockRatingService.upsertRating).toHaveBeenCalledWith(1, 20, 2);
    });

    it('should not decrease rating below 1 on ArrowDown', () => {
      component.studyQueues[1].rating = 1;
      const event = new KeyboardEvent('keyup', { key: 'ArrowDown' });

      component.handleKeyboardEvent(event);

      expect(component.studyQueues[1].rating).toBe(1);
      expect(mockRatingService.upsertRating).not.toHaveBeenCalled();
    });

    it('should quit study mode on Escape', () => {
      vi.spyOn(component, 'onQuitStudy');
      const event = new KeyboardEvent('keyup', { key: 'Escape' });

      component.handleKeyboardEvent(event);

      expect(component.onQuitStudy).toHaveBeenCalled();
    });

    it('should not handle shortcuts when not in study mode', () => {
      component.isStudying = false;
      const event = new KeyboardEvent('keyup', { key: '3' });
      vi.spyOn(component, 'onRatingChanged');

      component.handleKeyboardEvent(event);

      expect(component.onRatingChanged).not.toHaveBeenCalled();
    });

    it('should ignore keys outside 1-5 range in study mode', () => {
      const event = new KeyboardEvent('keyup', { key: '7' });

      component.handleKeyboardEvent(event);

      expect(component.studyQueues[1].rating).toBe(0);
    });
  });

  describe('typing mode', () => {
    it('should initialize typing settings with defaults', () => {
      expect(component.typeSetting.disableVoice).toBe(false);
      expect(component.typeSetting.hideExplain).toBe(false);
      expect(component.typeSetting.countOfItems).toBe(20);
    });

    it('should track typing state', () => {
      expect(component.isTypingInProgress).toBe(false);
      expect(component.isTypingCompleted).toBe(false);
    });
  });

  describe('onTypingWithOptions', () => {
    it('should open dialog and start typing when confirmed', () => {
      const mockDialogRef = {
        afterClosed: () =>
          of({
            disableVoice: true,
            hideExplain: false,
            countOfItems: 5,
          }),
      };
      mockDialog.open.mockReturnValue(mockDialogRef as any);
      vi.spyOn(component, 'onTypingStart');
      component.dataSource.data = mockWordContent.slice();

      component.onTypingWithOptions();

      expect(component.typeSetting.disableVoice).toBe(true);
      expect(component.onTypingStart).toHaveBeenCalled();
    });

    it('should handle undefined excludePart from dialog', () => {
      const mockDialogRef = {
        afterClosed: () =>
          of({
            disableVoice: false,
            hideExplain: false,
            countOfItems: 10,
          }),
      };
      mockDialog.open.mockReturnValue(mockDialogRef as any);
      vi.spyOn(component, 'onTypingStart');
      component.typeSetting.excludePart = VocabularyExcludedPartEnum.word;

      component.onTypingWithOptions();

      expect(component.typeSetting.excludePart).toBeUndefined();
    });

    it('should mark the OnPush view for check when the typing dialog confirms (no click needed)', () => {
      // Regression: the typing view switch (isTypingInProgress) happens in the
      // async afterClosed callback. With ChangeDetectionStrategy.OnPush the
      // view would not switch to the typing screen without markForCheck.
      const mockDialogRef = {
        afterClosed: () =>
          of({
            disableVoice: false,
            hideExplain: false,
            countOfItems: 5,
          }),
      };
      mockDialog.open.mockReturnValue(mockDialogRef as any);
      vi.spyOn(component, 'onTypingStart');
      const markForCheckSpy = vi.spyOn(component['cdr'], 'markForCheck');
      markForCheckSpy.mockClear();

      component.onTypingWithOptions();

      expect(markForCheckSpy).toHaveBeenCalled();
    });
  });

  describe('onTypingStart', () => {
    beforeEach(() => {
      component.dataSource.data = mockWordContent.slice();
    });

    it('should use selected items when selection exists', () => {
      component.selection.select(mockWordContent[0], mockWordContent[1]);

      component.onTypingStart();

      expect(component['wordqueues'].length).toBe(2);
      expect(component.isTypingInProgress).toBe(true);
    });

    it('should filter by excludePart in typing mode', () => {
      component.typeSetting.excludePart = VocabularyExcludedPartEnum.word;
      component.typeSetting.countOfItems = 10;

      component.onTypingStart();

      expect(component['wordqueues'].every(q => q.enword.indexOf(' ') !== -1)).toBe(true);
    });

    it('should filter by wordLeadingCharacter in typing mode', () => {
      component.typeSetting.wordLeadingCharacter = ['t', 'h'];
      component.typeSetting.countOfItems = 10;

      component.onTypingStart();

      expect(
        component['wordqueues'].every(q => q.enword.startsWith('t') || q.enword.startsWith('h'))
      ).toBe(true);
    });

    it('should limit and randomize typing queues', () => {
      component.typeSetting.countOfItems = 3;

      component.onTypingStart();

      expect(component['wordqueues'].length).toBe(3);
      expect(component.dataSourceResult.length).toBe(3);
    });
  });

  describe('handleKeyboardEvent', () => {
    beforeEach(() => {
      component['_arwords'] = [
        { idx: 0, letter: 't', visible: false },
        { idx: 1, letter: 'e', visible: false },
        { idx: 2, letter: 's', visible: false },
        { idx: 3, letter: 't', visible: false },
      ];
      component['_wordidx'] = 0;
      component.dataSourceResult = [{ enword: 'test', correct: true }];
      component['_queueidx'] = 0;
      component['wordqueues'] = [{ enword: 'test', cnword: '测试', completed: false }];
    });

    it('should handle correct key press', () => {
      const event = new KeyboardEvent('keyup', { key: 't' });

      component.handleKeyboardEvent(event);

      expect(component['_arwords'][0].visible).toBe(true);
      expect(component['_wordidx']).toBe(1);
      expect(mockAudioService.playSound).toHaveBeenCalledWith('Default.wav');
    });

    it('should handle incorrect key press', () => {
      const event = new KeyboardEvent('keyup', { key: 'x' });

      component.handleKeyboardEvent(event);

      expect(component.dataSourceResult[0].correct).toBe(false);
      expect(mockAudioService.playSound).toHaveBeenCalledWith('beep.wav');
    });

    it('should handle backspace key', () => {
      component['_wordidx'] = 2;
      component['_arwords'][0].visible = true;
      component['_arwords'][1].visible = true;
      const event = new KeyboardEvent('keyup', { key: 'Backspace' });

      component.handleKeyboardEvent(event);

      expect(component['_wordidx']).toBe(1);
      expect(component['_arwords'][1].visible).toBe(false);
    });

    it('should not go below index 0 on backspace', () => {
      component['_wordidx'] = 0;
      const event = new KeyboardEvent('keyup', { key: 'Backspace' });

      component.handleKeyboardEvent(event);

      expect(component['_wordidx']).toBe(0);
    });

    it('should complete word when last letter is typed', () => {
      component['_wordidx'] = 3;
      component['_arwords'][0].visible = true;
      component['_arwords'][1].visible = true;
      component['_arwords'][2].visible = true;
      vi.spyOn(component, 'setWordQueueIndex');
      const event = new KeyboardEvent('keyup', { key: 't' });

      component.handleKeyboardEvent(event);

      expect(component.setWordQueueIndex).toHaveBeenCalledWith(1);
    });
  });

  describe('onNeedHint', () => {
    beforeEach(() => {
      component['_arwords'] = [
        { idx: 0, letter: 't', visible: false },
        { idx: 1, letter: 'e', visible: false },
      ];
      component['_wordidx'] = 0;
      component['_queueidx'] = 0;
      component.dataSourceResult = [{ enword: 'test', correct: true }];
      component['wordqueues'] = [
        { enword: 'test', cnword: '测试', completed: false },
        { enword: 'hello', cnword: '你好', completed: false },
      ];
    });

    it('should reveal current letter and mark as incorrect', () => {
      component.onNeedHint();

      expect(component.dataSourceResult[0].correct).toBe(false);
      expect(component['_arwords'][0].visible).toBe(true);
      expect(component['_wordidx']).toBe(1);
    });

    it('should move to next word when last letter is revealed', () => {
      component['_wordidx'] = 1;
      vi.spyOn(component, 'setWordQueueIndex');

      component.onNeedHint();

      expect(component.setWordQueueIndex).toHaveBeenCalledWith(1);
    });
  });

  describe('onNextWord', () => {
    beforeEach(() => {
      component['_queueidx'] = 0;
      component.dataSourceResult = [{ enword: 'test', correct: true }];
    });

    it('should mark current word as incorrect and move to next', () => {
      vi.spyOn(component, 'setWordQueueIndex');

      component.onNextWord();

      expect(component.dataSourceResult[0].correct).toBe(false);
      expect(component.setWordQueueIndex).toHaveBeenCalledWith(1);
    });
  });

  describe('setWordQueueIndex', () => {
    beforeEach(() => {
      component['wordqueues'] = [
        { enword: 'test', cnword: '测试', completed: false },
        { enword: 'hello', cnword: '你好', completed: false },
      ];
      component['_queueidx'] = -1;
      component.dataSourceResult = [
        { enword: 'test', correct: true },
        { enword: 'hello', correct: true },
      ];
    });

    it('should initialize word letters and set queue index', () => {
      component.setWordQueueIndex(0);

      expect(component['_queueidx']).toBe(0);
      expect(component['_arwords'].length).toBe(4);
      expect(component['_wordidx']).toBe(0);
    });

    it('should speak word when voice is not disabled', () => {
      component.typeSetting.disableVoice = false;
      const speakSpy = vi.spyOn(component as any, 'speakWord');

      component.setWordQueueIndex(0);

      expect(speakSpy).toHaveBeenCalledWith('test');
    });

    it('should not speak word when voice is disabled', () => {
      component.typeSetting.disableVoice = true;
      const speakSpy = vi.spyOn(component as any, 'speakWord');

      component.setWordQueueIndex(0);

      expect(speakSpy).not.toHaveBeenCalled();
    });

    it('should mark previous word as completed', () => {
      component['_queueidx'] = 0;

      component.setWordQueueIndex(1);

      expect(component['wordqueues'][0].completed).toBe(true);
    });

    it('should complete typing when all words are done', () => {
      component['_queueidx'] = 1;
      component['wordqueues'][0].completed = true;

      component.setWordQueueIndex(2);

      expect(component.isTypingInProgress).toBe(false);
      expect(component.isTypingCompleted).toBe(true);
      expect(mockAudioService.playSound).toHaveBeenCalledWith('correct.wav');
    });

    it('should calculate correct and incorrect counts on completion', () => {
      component['_queueidx'] = 1;
      component['wordqueues'][0].completed = true;
      component.dataSourceResult = [
        { enword: 'test', correct: true },
        { enword: 'hello', correct: false },
      ];

      component.setWordQueueIndex(2);

      expect(component.typingCorrectWordCount).toBe(1);
      expect(component.typingIncorrectWordCount).toBe(1);
    });
  });

  describe('print mode', () => {
    it('should initialize print settings with defaults', () => {
      expect(component.printSetting.countOfItems).toBe(20);
      expect(component.printSetting.printEntryDate).toBe(true);
    });
  });

  describe('onPrintWithOptions', () => {
    beforeEach(() => {
      component.dataSource.data = mockWordContent.slice();
    });

    it('should open dialog and print when confirmed', () => {
      const mockDialogRef = {
        afterClosed: () =>
          of({
            countOfItems: 10,
            printEntryDate: true,
            subTitle: 'Test Title',
            wordLeadingCharacter: ['a'],
            printFirstLetter: true,
          }),
      };
      mockDialog.open.mockReturnValue(mockDialogRef as any);
      vi.spyOn(component as any, 'onNewPrintCore');

      component.onPrintWithOptions();

      expect(component.printSetting.countOfItems).toBe(10);
      expect(component.printSetting.subTitle).toBe('Test Title');
      expect(component['onNewPrintCore']).toHaveBeenCalled();
    });

    it('should clear optional print settings when undefined', () => {
      const mockDialogRef = {
        afterClosed: () =>
          of({
            countOfItems: 15,
            printEntryDate: false,
            printFirstLetter: false,
          }),
      };
      mockDialog.open.mockReturnValue(mockDialogRef as any);
      vi.spyOn(component as any, 'onNewPrintCore');
      component.printSetting.excludePart = VocabularyExcludedPartEnum.word;
      component.printSetting.subTitle = 'Old Title';

      component.onPrintWithOptions();

      expect(component.printSetting.excludePart).toBeUndefined();
      expect(component.printSetting.subTitle).toBeUndefined();
      expect(component.printSetting.wordLeadingCharacter).toBeUndefined();
    });
  });

  describe('onNewPrintCore', () => {
    beforeEach(() => {
      component.dataSource.data = mockWordContent.slice();
      mockRouter.navigate.mockReturnValue(Promise.resolve(true));
    });

    it('should print selected items with randomization', () => {
      component.selection.select(mockWordContent[0], mockWordContent[1]);
      component.printSetting.subTitle = 'Test';

      component['onNewPrintCore']();

      expect(mockUIService.setSelectedExerciseItem).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/knowledge/displayv2']);
    });

    it('should filter by excludePart in print mode', () => {
      component.printSetting.excludePart = VocabularyExcludedPartEnum.word;
      component.printSetting.countOfItems = 10;
      component.printSetting.subTitle = 'Test';

      component['onNewPrintCore']();

      const args = mockUIService.setSelectedExerciseItem.mock.lastCall;
      expect(args?.[0].length).toBe(1);
      expect(args?.[0][0].question).toContain('apple pie');
    });

    it('should filter by wordLeadingCharacter in print mode', () => {
      component.printSetting.wordLeadingCharacter = ['h', 'w'];
      component.printSetting.countOfItems = 10;
      component.printSetting.subTitle = 'Test';

      component['onNewPrintCore']();

      const args = mockUIService.setSelectedExerciseItem.mock.lastCall;
      expect(
        args?.[0].every(
          (item: any) => item.question.includes('hello') || item.question.includes('world')
        )
      ).toBe(true);
    });

    it('should include first letter when printFirstLetter is true', () => {
      component.selection.select(mockWordContent[0]);
      component.printSetting.printFirstLetter = true;
      component.printSetting.subTitle = 'Test';

      component['onNewPrintCore']();

      const args = mockUIService.setSelectedExerciseItem.mock.lastCall;
      expect(args?.[0][0].question).toContain('h ');
    });

    it('should not include first letter when printFirstLetter is false', () => {
      component.selection.select(mockWordContent[0]);
      component.printSetting.printFirstLetter = false;
      component.printSetting.subTitle = 'Test';

      component['onNewPrintCore']();

      const args = mockUIService.setSelectedExerciseItem.mock.lastCall;
      expect(args?.[0][0].question).not.toContain('h @');
    });
  });

  describe('onSelectByWord', () => {
    beforeEach(() => {
      component.dataSource.data = mockWordContent.slice();
    });

    it('should select items whose enword matches the supplied words', () => {
      // 'hello', 'world', 'test' all exist in mockWordContent
      const mockDialogRef = {
        afterClosed: () => of({ words: 'hello, world, test' }),
      };
      mockDialog.open.mockReturnValue(mockDialogRef as any);

      component.onSelectByWord();

      expect(component.selection.selected.length).toBe(3);
      expect(component.selection.selected.some(i => i.enword === 'hello')).toBe(true);
      expect(component.selection.selected.some(i => i.enword === 'world')).toBe(true);
      expect(component.selection.selected.some(i => i.enword === 'test')).toBe(true);
    });

    it('should trim whitespace around each word when matching', () => {
      const mockDialogRef = {
        afterClosed: () => of({ words: '  hello ,  world  ' }),
      };
      mockDialog.open.mockReturnValue(mockDialogRef as any);

      component.onSelectByWord();

      expect(component.selection.selected.length).toBe(2);
    });

    it('should select nothing when none of the words match', () => {
      const mockDialogRef = {
        afterClosed: () => of({ words: 'nonexistent, alsoabsent' }),
      };
      mockDialog.open.mockReturnValue(mockDialogRef as any);

      component.onSelectByWord();

      expect(component.selection.selected.length).toBe(0);
    });

    it('should not match numeric strings against the id field', () => {
      // Confirms the feature selects by enword text, NOT by item.id.
      // mockWordContent items have no ids; supplying "1,2" selects nothing
      // because no enword equals the string "1" or "2".
      const mockDialogRef = {
        afterClosed: () => of({ words: '1,2' }),
      };
      mockDialog.open.mockReturnValue(mockDialogRef as any);

      component.onSelectByWord();

      expect(component.selection.selected.length).toBe(0);
    });

    it('should handle a cancelled dialog (undefined result)', () => {
      const mockDialogRef = { afterClosed: () => of(undefined) };
      mockDialog.open.mockReturnValue(mockDialogRef as any);

      component.onSelectByWord();

      expect(component.selection.selected.length).toBe(0);
    });
  });

  describe('onSelectFreeSelection', () => {
    beforeEach(() => {
      component.dataSource.data = mockWordContent.slice();
    });

    it('should randomly select items', () => {
      const mockDialogRef = {
        afterClosed: () => of({ countOfItems: 3 }),
      };
      mockDialog.open.mockReturnValue(mockDialogRef as any);

      component.onSelectFreeSelection();

      expect(component.selection.selected.length).toBe(3);
    });

    it('should handle undefined dialog result', () => {
      const mockDialogRef = { afterClosed: () => of(undefined) };
      mockDialog.open.mockReturnValue(mockDialogRef as any);

      component.onSelectFreeSelection();

      expect(component.selection.selected.length).toBe(0);
    });
  });

  describe('onSelectByCount', () => {
    beforeEach(() => {
      component.dataSource.data = mockWordContent.slice();
    });

    it('should select items by count', () => {
      const mockDialogRef = {
        afterClosed: () => of({ countOfItems: 3, countOfOffset: 0 }),
      };
      mockDialog.open.mockReturnValue(mockDialogRef as any);

      component.onSelectByCount();

      expect(component.selection.selected.length).toBe(3);
    });
  });

  describe('onSelectByRating', () => {
    beforeEach(() => {
      component.dataSource.data = [
        { id: 1, enword: 'hello', cnword: '你好' },
        { id: 2, enword: 'world', cnword: '世界' },
        { id: 3, enword: 'test', cnword: '测试' },
      ] as LearnEnglishWordFileItem[];
      // Set up ratings
      component['contentRatingMap'].set(1, 5);
      component['contentRatingMap'].set(2, 3);
      component['contentRatingMap'].set(3, 0);
    });

    it('should select items with rating equals 5', () => {
      const mockDialogRef = {
        afterClosed: () => of({ ratingOperator: RatingOperatorEnum.Equals, ratingValue: 5 }),
      };
      mockDialog.open.mockReturnValue(mockDialogRef as any);

      component.onSelectByRating();

      expect(component.selection.selected.length).toBe(1);
      expect(component.selection.selected[0].id).toBe(1);
    });

    it('should select items with rating greater than 3', () => {
      const mockDialogRef = {
        afterClosed: () => of({ ratingOperator: RatingOperatorEnum.GreaterThan, ratingValue: 3 }),
      };
      mockDialog.open.mockReturnValue(mockDialogRef as any);

      component.onSelectByRating();

      expect(component.selection.selected.length).toBe(1);
      expect(component.selection.selected[0].id).toBe(1);
    });

    it('should select items with any rating', () => {
      const mockDialogRef = {
        afterClosed: () => of({ ratingOperator: RatingOperatorEnum.HasAny }),
      };
      mockDialog.open.mockReturnValue(mockDialogRef as any);

      component.onSelectByRating();

      expect(component.selection.selected.length).toBe(2);
    });

    it('should select items with no rating', () => {
      const mockDialogRef = {
        afterClosed: () => of({ ratingOperator: RatingOperatorEnum.HasNone }),
      };
      mockDialog.open.mockReturnValue(mockDialogRef as any);

      component.onSelectByRating();

      expect(component.selection.selected.length).toBe(1);
      expect(component.selection.selected[0].id).toBe(3);
    });

    it('should select rated items below the value, excluding unrated (0)', () => {
      // ratings: id1=5, id2=3, id3=0. LessThan 4 → only id2 (rating 3);
      // id3 (unrated, 0) is deliberately excluded (covered by HasNone).
      const mockDialogRef = {
        afterClosed: () => of({ ratingOperator: RatingOperatorEnum.LessThan, ratingValue: 4 }),
      };
      mockDialog.open.mockReturnValue(mockDialogRef as any);

      component.onSelectByRating();

      expect(component.selection.selected.length).toBe(1);
      expect(component.selection.selected[0].id).toBe(2);
    });

    it('should select nothing when no rated item is below the value', () => {
      // ratings: id1=5, id2=3, id3=0. LessThan 2 → no rated item qualifies.
      const mockDialogRef = {
        afterClosed: () => of({ ratingOperator: RatingOperatorEnum.LessThan, ratingValue: 2 }),
      };
      mockDialog.open.mockReturnValue(mockDialogRef as any);

      component.onSelectByRating();

      expect(component.selection.selected.length).toBe(0);
    });

    it('should select items with rating larger or equals 3', () => {
      // ratings: id1=5, id2=3, id3=0. LargerOrEquals 3 → id1, id2.
      const mockDialogRef = {
        afterClosed: () => of({ ratingOperator: RatingOperatorEnum.LargerOrEquals, ratingValue: 3 }),
      };
      mockDialog.open.mockReturnValue(mockDialogRef as any);

      component.onSelectByRating();

      expect(component.selection.selected.length).toBe(2);
      expect(component.selection.selected.some(i => i.id === 1)).toBe(true);
      expect(component.selection.selected.some(i => i.id === 2)).toBe(true);
    });

    it('should select items with rating less or equals 3, excluding unrated', () => {
      // ratings: id1=5, id2=3, id3=0. LessOrEquals 3 → only id2 (rating 3);
      // id3 (unrated, 0) is deliberately excluded (covered by HasNone).
      const mockDialogRef = {
        afterClosed: () => of({ ratingOperator: RatingOperatorEnum.LessOrEquals, ratingValue: 3 }),
      };
      mockDialog.open.mockReturnValue(mockDialogRef as any);

      component.onSelectByRating();

      expect(component.selection.selected.length).toBe(1);
      expect(component.selection.selected[0].id).toBe(2);
    });

    it('should select nothing for less or equals when no rated item is at or below the value', () => {
      // ratings: id1=5, id2=3, id3=0. LessOrEquals 2 → no rated item qualifies;
      // id3 (unrated, 0) is excluded, confirming it does not collapse into HasNone.
      const mockDialogRef = {
        afterClosed: () => of({ ratingOperator: RatingOperatorEnum.LessOrEquals, ratingValue: 2 }),
      };
      mockDialog.open.mockReturnValue(mockDialogRef as any);

      component.onSelectByRating();

      expect(component.selection.selected.length).toBe(0);
    });

    it('should preserve the existing selection when the dialog is cancelled', () => {
      component.selection.select(component.dataSource.data[0]);
      const initialCount = component.selection.selected.length;

      const mockDialogRef = { afterClosed: () => of(undefined) };
      mockDialog.open.mockReturnValue(mockDialogRef as any);

      component.onSelectByRating();

      expect(component.selection.selected.length).toBe(initialCount);
    });
  });
});

describe('VocabularyExercisesStudyOptionsDialogComponent', () => {
  let component: VocabularyExercisesStudyOptionsDialogComponent;
  let fixture: ComponentFixture<VocabularyExercisesStudyOptionsDialogComponent>;
  let mockDialogRef: any;

  beforeEach(async () => {
    mockDialogRef = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [
        VocabularyExercisesStudyOptionsDialogComponent,
        NoopAnimationsModule,
        TranslocoModule,
      ],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            wordQueueCount: 30,
            withSelection: false,
          },
        },
        {
          provide: UtilService,
          useValue: {
            getAllCharacters: () => ['a', 'b', 'c'],
            getAllTypingExcludeParts: () => [],
          },
        },
        { provide: TranslocoService, useValue: createMockTranslocoService() },
        { provide: TRANSLOCO_TRANSPILER, useValue: {} },
        { provide: TRANSLOCO_MISSING_HANDLER, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VocabularyExercisesStudyOptionsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
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
      excludePart: undefined,
      wordLeadingCharacter: [],
    });
  });

  it('should not close when both disableVoice and hideExplain are true', () => {
    component.disableVoice.set(true);
    component.hideExplain.set(true);

    component.onYesClick();

    expect(mockDialogRef.close).not.toHaveBeenCalled();
  });
});

describe('VocabularyExercisesTypingOptionsDialogComponent', () => {
  let component: VocabularyExercisesTypingOptionsDialogComponent;
  let fixture: ComponentFixture<VocabularyExercisesTypingOptionsDialogComponent>;
  let mockDialogRef: any;

  beforeEach(async () => {
    mockDialogRef = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [
        VocabularyExercisesTypingOptionsDialogComponent,
        NoopAnimationsModule,
        TranslocoModule,
      ],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            wordQueueCount: 25,
            withSelection: false,
          },
        },
        {
          provide: UtilService,
          useValue: {
            getAllCharacters: () => ['a', 'b', 'c'],
            getAllTypingExcludeParts: () => [],
          },
        },
        { provide: TranslocoService, useValue: createMockTranslocoService() },
        { provide: TRANSLOCO_TRANSPILER, useValue: {} },
        { provide: TRANSLOCO_MISSING_HANDLER, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VocabularyExercisesTypingOptionsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
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
      excludePart: undefined,
      wordLeadingCharacter: [],
    });
  });

  it('should not close when both disableVoice and hideExplain are true', () => {
    component.disableVoice.set(true);
    component.hideExplain.set(true);

    component.onYesClick();

    expect(mockDialogRef.close).not.toHaveBeenCalled();
  });
});

describe('VocabularyExercisesPrintOptionsDialogComponent', () => {
  let component: VocabularyExercisesPrintOptionsDialogComponent;
  let fixture: ComponentFixture<VocabularyExercisesPrintOptionsDialogComponent>;
  let mockDialogRef: any;

  beforeEach(async () => {
    mockDialogRef = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [
        VocabularyExercisesPrintOptionsDialogComponent,
        NoopAnimationsModule,
        TranslocoModule,
      ],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            wordQueueCount: 40,
            withSelection: true,
            title: 'Test File',
          },
        },
        {
          provide: UtilService,
          useValue: {
            getAllCharacters: () => ['a', 'b', 'c'],
            getAllTypingExcludeParts: () => [],
          },
        },
        { provide: TranslocoService, useValue: createMockTranslocoService() },
        { provide: TRANSLOCO_TRANSPILER, useValue: {} },
        { provide: TRANSLOCO_MISSING_HANDLER, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VocabularyExercisesPrintOptionsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with selection count when withSelection is true', () => {
    expect(component.countOfItems()).toBe(40);
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
      })
    );
  });
});

describe('VocabularySelectByCountDialogComponent', () => {
  let component: VocabularySelectByCountDialogComponent;
  let fixture: ComponentFixture<VocabularySelectByCountDialogComponent>;
  let mockDialogRef: any;

  beforeEach(async () => {
    mockDialogRef = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [VocabularySelectByCountDialogComponent, NoopAnimationsModule, TranslocoModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: TranslocoService, useValue: createMockTranslocoService() },
        { provide: TRANSLOCO_TRANSPILER, useValue: {} },
        { provide: TRANSLOCO_MISSING_HANDLER, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VocabularySelectByCountDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should close with countOfItems and countOfOffset on confirm', () => {
    component.countOfItems.set(10);
    component.countOfOffset.set(5);
    component.onYesClick();

    expect(mockDialogRef.close).toHaveBeenCalledWith({ countOfItems: 10, countOfOffset: 5 });
  });

  it('isFormInvalid should return true when countOfItems is 0', () => {
    component.countOfItems.set(0);
    expect(component.isFormInvalid).toBe(true);
  });
});

describe('VocabularySelectByWordDialogComponent', () => {
  let component: VocabularySelectByWordDialogComponent;
  let fixture: ComponentFixture<VocabularySelectByWordDialogComponent>;
  let mockDialogRef: any;

  beforeEach(async () => {
    mockDialogRef = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [VocabularySelectByWordDialogComponent, NoopAnimationsModule, TranslocoModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: TranslocoService, useValue: createMockTranslocoService() },
        { provide: TRANSLOCO_TRANSPILER, useValue: {} },
        { provide: TRANSLOCO_MISSING_HANDLER, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VocabularySelectByWordDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should close with words on confirm', () => {
    component.importWords.set('hello, world');
    component.onYesClick();

    expect(mockDialogRef.close).toHaveBeenCalledWith({ words: 'hello, world' });
  });

  it('isFormInvalid should return true when importWords is empty', () => {
    component.importWords.set('');
    expect(component.isFormInvalid).toBe(true);
  });
});

describe('VocabularySelectFreeDialogComponent', () => {
  let component: VocabularySelectFreeDialogComponent;
  let fixture: ComponentFixture<VocabularySelectFreeDialogComponent>;
  let mockDialogRef: any;

  beforeEach(async () => {
    mockDialogRef = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [VocabularySelectFreeDialogComponent, NoopAnimationsModule, TranslocoModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: TranslocoService, useValue: createMockTranslocoService() },
        { provide: TRANSLOCO_TRANSPILER, useValue: {} },
        { provide: TRANSLOCO_MISSING_HANDLER, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VocabularySelectFreeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should close with countOfItems on confirm', () => {
    component.countOfItems.set(15);
    component.onYesClick();

    expect(mockDialogRef.close).toHaveBeenCalledWith({ countOfItems: 15 });
  });
});

describe('VocabularySelectByRatingDialogComponent', () => {
  let component: VocabularySelectByRatingDialogComponent;
  let fixture: ComponentFixture<VocabularySelectByRatingDialogComponent>;
  let mockDialogRef: any;

  beforeEach(async () => {
    mockDialogRef = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [VocabularySelectByRatingDialogComponent, NoopAnimationsModule, TranslocoModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: TranslocoService, useValue: createMockTranslocoService() },
        { provide: TRANSLOCO_TRANSPILER, useValue: {} },
        { provide: TRANSLOCO_MISSING_HANDLER, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VocabularySelectByRatingDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should close with ratingOperator and ratingValue on confirm', () => {
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

  it('ratingOperators should include Larger or Equals and Less or Equals', () => {
    const values = component.ratingOperators.map(op => op.value);
    expect(values).toContain(RatingOperatorEnum.LargerOrEquals);
    expect(values).toContain(RatingOperatorEnum.LessOrEquals);
    expect(component.ratingOperators.length).toBe(7);
  });
});
