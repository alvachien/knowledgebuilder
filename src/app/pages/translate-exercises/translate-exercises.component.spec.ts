import { vi } from 'vitest';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import {
  TranslocoService,
  TRANSLOCO_TRANSPILER,
  TRANSLOCO_MISSING_HANDLER,
  TRANSLOCO_INTERCEPTOR,
} from '@jsverse/transloco';
import { of, throwError } from 'rxjs';

import {
  TranslateDirectionEnum,
  TranslateExerciseStatusEnum,
  TranslationAIModeEnum,
} from '../../interfaces';
import type { LearningContent, LearnEnglishSentFileItem } from '../../interfaces';
import {
  StorageService,
  LearningContentService,
  UtilService,
  AudioService,
  AIService,
  UserCodeService,
  UIService,
} from '../../services';
import { AppPageTitle } from '../page-title/page-title';

import {
  TranslateExercisesComponent,
  TranslateExercisesOptionsDialogComponent,
  TranslateExercisesPrintOptionsDialogComponent,
  TranslateExercisesLLMDialogComponent,
} from './translate-exercises.component';

const mockDataFiles: LearningContent[] = [
  { id: 1, categoryId: 2, nameEnglish: 'File1', nameChinese: '文件一', fileUrl: 'data/file1.json' },
  { id: 2, categoryId: 2, nameEnglish: 'File2', nameChinese: '文件二', fileUrl: 'data/file2.json' },
];

const mockFileContent: LearnEnglishSentFileItem[] = [
  { ensent: 'Hello world', cnsent: '你好世界', enwords: ['hello'] },
  { ensent: 'Good morning', cnsent: '早上好', enwords: ['good'] },
  { ensent: 'Thank you', cnsent: '谢谢', enwords: ['thank'] },
];

describe('TranslateExercisesComponent', () => {
  let component: TranslateExercisesComponent;
  let fixture: ComponentFixture<TranslateExercisesComponent>;
  let mockStorageService: any;
  let mockLearningContentService: any;
  let mockAudioService: any;
  let mockAIService: any;
  let mockUIService: any;
  let mockRouter: any;
  let mockDialog: any;
  let mockSnackBar: any;
  let mockPageTitle: AppPageTitle;

  beforeEach(async () => {
    mockStorageService = {
      getLearnEnglishSentDataFile: vi.fn(),
      getLearnEnglishSentFileContent: vi.fn(),
    };
    mockLearningContentService = {
      getSentenceContents: vi.fn(),
      getSentenceFileContent: vi.fn(),
    };
    mockAudioService = { playSound: vi.fn() };
    mockAIService = { getTTS: vi.fn(), explainSentence: vi.fn() };
    mockUIService = { setSelectedExerciseItem: vi.fn() };
    mockRouter = { navigate: vi.fn() };
    mockDialog = { open: vi.fn() };
    mockSnackBar = { open: vi.fn() };
    mockPageTitle = { title: '' } as AppPageTitle;
    mockLearningContentService.getSentenceContents.mockReturnValue(of(mockDataFiles));

    const mockTranslocoService = {
      setActiveLang: vi.fn(),
      getActiveLang: vi.fn(),
      selectTranslate: vi.fn().mockReturnValue(of('')),
      _loadDependencies: vi.fn().mockReturnValue(of(null)),
      translate: vi.fn((key: string) => {
        if (key === 'translateExercises.chineseToEnglish') {return '中译英';}
        if (key === 'translateExercises.englishToChinese') {return '英译中';}
        if (key === 'translateExercises.explain') {return '讲解';}
        if (key === 'translateExercises.correct') {return '纠正';}
        if (key === 'translateExercises.aiMode.explain') {return '讲解';}
        if (key === 'translateExercises.aiMode.correct') {return '纠正';}
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
      imports: [TranslateExercisesComponent, NoopAnimationsModule],
      providers: [
        { provide: StorageService, useValue: mockStorageService },
        { provide: LearningContentService, useValue: mockLearningContentService },
        { provide: AudioService, useValue: mockAudioService },
        { provide: AIService, useValue: mockAIService },
        { provide: UIService, useValue: mockUIService },
        { provide: Router, useValue: mockRouter },
        { provide: MatDialog, useValue: mockDialog },
        { provide: MatSnackBar, useValue: mockSnackBar },
        { provide: AppPageTitle, useValue: mockPageTitle },
        { provide: UtilService, useValue: {} },
        { provide: UserCodeService, useValue: {} },
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
      expect(component.allFiles).toEqual(mockDataFiles);
    });

    it('should handle error when loading data files fails', () => {
      mockLearningContentService.getSentenceContents.mockReturnValue(
        throwError(() => new Error('Load failed'))
      );
      vi.spyOn(console, 'error');

      fixture.detectChanges();

      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('onFileSelectionChanged', () => {
    it('should load file content when file is selected', () => {
      mockLearningContentService.getSentenceFileContent.mockReturnValue(of(mockFileContent));

      component.onFileSelectionChanged({ value: mockDataFiles[0] } as any);

      expect(mockLearningContentService.getSentenceFileContent).toHaveBeenCalledWith('data/file1.json');
      expect(component.dataSource.data).toEqual(mockFileContent);
    });

    it('should clear recite queues when file is selected', () => {
      mockLearningContentService.getSentenceFileContent.mockReturnValue(of(mockFileContent));
      component.recitequeues = [
        { ensent: 'test', cnsent: 'test', enwords: ['test'], completed: false, inputted: '' },
      ];

      component.onFileSelectionChanged({ value: mockDataFiles[0] } as any);

      expect(component.recitequeues).toEqual([]);
    });

    it('should handle undefined file content', () => {
      mockLearningContentService.getSentenceFileContent.mockReturnValue(of(undefined));

      component.onFileSelectionChanged({ value: mockDataFiles[0] } as any);

      expect(component.dataSource.data.length).toBe(0);
    });

    it('should handle error when loading file content fails', () => {
      mockLearningContentService.getSentenceFileContent.mockReturnValue(
        throwError(() => new Error('Load failed'))
      );
      vi.spyOn(console, 'error');

      component.onFileSelectionChanged({ value: mockDataFiles[0] } as any);

      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('applyFilter', () => {
    it('should filter data source with trimmed lowercase value', () => {
      component.dataSource.data = mockFileContent;
      const event = { target: { value: '  HELLO  ' } } as any;

      component.applyFilter(event);

      expect(component.dataSource.filter).toBe('hello');
    });

    it('should filter with empty string', () => {
      component.dataSource.data = mockFileContent;
      const event = { target: { value: '' } } as any;

      component.applyFilter(event);

      expect(component.dataSource.filter).toBe('');
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
      vi.spyOn(console, 'error');

      component.onPlayTTS('Hello world');

      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('onLLMExplain', () => {
    it('should open LLM dialog with sentence', () => {
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
  });

  describe('onStart', () => {
    beforeEach(() => {
      component.dataSource.data = mockFileContent.slice();
    });

    it('should start exercise with selected items', () => {
      component.selection.select(mockFileContent[0], mockFileContent[1]);

      component.onStart();

      expect(component.recitequeues.length).toBe(2);
      expect(component.queueidx).toBe(0);
      expect(component.currentStatus.status).toBe(TranslateExerciseStatusEnum.InProgress);
    });

    it('should start exercise with all items when nothing selected', () => {
      component.setting.countOfItems = 2;

      component.onStart();

      expect(component.recitequeues.length).toBe(2);
      expect(component.queueidx).toBe(0);
    });

    it('should randomize and limit items when count exceeds setting', () => {
      component.setting.countOfItems = 2;

      component.onStart();

      expect(component.recitequeues.length).toBe(2);
    });

    it('should initialize status correctly', () => {
      component.selection.select(mockFileContent[0]);

      component.onStart();

      expect(component.currentStatus.startTime).toBeInstanceOf(Date);
      expect(component.currentStatus.totalCount).toBe(1);
      expect(component.dataSourceResult).toEqual([]);
    });
  });

  describe('onStartWithOptions', () => {
    it('should open options dialog and start exercise on confirm', () => {
      const mockResult = {
        direction: TranslateDirectionEnum.ChineseToEnglish,
        allowEmptyAnswer: true,
        countOfItems: 10,
      };
      const mockDialogRef = { afterClosed: vi.fn().mockReturnValue(of(mockResult)) };
      mockDialog.open.mockReturnValue(mockDialogRef);
      component.dataSource.data = mockFileContent.slice();
      vi.spyOn(component, 'onStart');

      component.onStartWithOptions();

      expect(mockDialog.open).toHaveBeenCalled();
      expect(component.setting.direction).toBe(TranslateDirectionEnum.ChineseToEnglish);
      expect(component.setting.allowEmptyAnswer).toBe(true);
      expect(component.setting.countOfItems).toBe(10);
      expect(component.onStart).toHaveBeenCalled();
    });

    it('should not start exercise when dialog is cancelled', () => {
      const mockDialogRef = { afterClosed: vi.fn().mockReturnValue(of(undefined)) };
      mockDialog.open.mockReturnValue(mockDialogRef);
      vi.spyOn(component, 'onStart');

      component.onStartWithOptions();

      expect(component.onStart).not.toHaveBeenCalled();
    });
  });

  describe('onPrint', () => {
    beforeEach(() => {
      component.dataSource.data = mockFileContent.slice();
      component.selectedFile = { id: 99, categoryId: 2, nameEnglish: 'TestFile', nameChinese: '测试文件', fileUrl: 'data/testfile.json' };
    });

    it('should print selected items', () => {
      component.selection.select(mockFileContent[0]);

      component.onPrint();

      expect(mockUIService.setSelectedExerciseItem).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/knowledge/displayv2']);
    });

    it('should print all items when nothing selected', () => {
      component.printSetting.countOfItems = 2;

      component.onPrint();

      expect(mockUIService.setSelectedExerciseItem).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/knowledge/displayv2']);
    });

    it('should respect print direction setting', () => {
      component.printSetting.direction = TranslateDirectionEnum.ChineseToEnglish;
      component.selection.select(mockFileContent[0]);

      component.onPrint();

      const callArgs = mockUIService.setSelectedExerciseItem.mock.lastCall;
      const items = callArgs?.[0];
      expect(items[0].question).toContain(mockFileContent[0].cnsent);
    });
  });

  describe('onPrintWithOptions', () => {
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
      component.dataSource.data = mockFileContent.slice();
      vi.spyOn(component, 'onPrint');

      component.onPrintWithOptions();

      expect(mockDialog.open).toHaveBeenCalled();
      expect(component.printSetting.printAnswer).toBe(true);
      expect(component.printSetting.printWord).toBe(true);
      expect(component.onPrint).toHaveBeenCalled();
    });

    it('should not print when dialog is cancelled', () => {
      const mockDialogRef = { afterClosed: vi.fn().mockReturnValue(of(undefined)) };
      mockDialog.open.mockReturnValue(mockDialogRef);
      vi.spyOn(component, 'onPrint');

      component.onPrintWithOptions();

      expect(component.onPrint).not.toHaveBeenCalled();
    });
  });

  describe('onSubmitToNext', () => {
    beforeEach(() => {
      component.recitequeues = [
        { ensent: 'Hello', cnsent: '你好', enwords: ['hello'], completed: false, inputted: 'test' },
      ];
      component.queueidx = 0;
    });

    it('should add current item to result and move to next', () => {
      vi.spyOn(component, 'setQueueIndex');

      component.onSubmitToNext();

      expect(component.dataSourceResult.length).toBe(1);
      expect(component.dataSourceResult[0].inputted).toBe('test');
      expect(component.setQueueIndex).toHaveBeenCalledWith(1);
    });
  });

  describe('setQueueIndex', () => {
    beforeEach(() => {
      component.recitequeues = [
        { ensent: 'A', cnsent: 'A', enwords: ['a'], completed: false, inputted: '' },
        { ensent: 'B', cnsent: 'B', enwords: ['b'], completed: false, inputted: '' },
      ];
      component.queueidx = 0;
    });

    it('should move to next valid index', () => {
      component.setQueueIndex(1);

      expect(component.queueidx).toBe(1);
      expect(component.recitequeues[0].completed).toBe(true);
    });

    it('should complete exercise when reaching the end', () => {
      component.setQueueIndex(2);

      expect(component.currentStatus.status).toBe(TranslateExerciseStatusEnum.Completed);
      expect(component.currentStatus.endTime).toBeInstanceOf(Date);
    });

    it('should not change index when out of bounds below', () => {
      component.setQueueIndex(-1);

      expect(component.queueidx).toBe(0);
    });

    it('should mark current item as completed before moving', () => {
      component.setQueueIndex(1);

      expect(component.recitequeues[0].completed).toBe(true);
    });
  });

  describe('getter methods', () => {
    it('isTranslateNotStarted should return true when not started', () => {
      component.currentStatus.status = TranslateExerciseStatusEnum.NotStarted;
      expect(component.isTranslateNotStarted).toBe(true);
    });

    it('isTranslateInProgress should return true when in progress', () => {
      component.currentStatus.status = TranslateExerciseStatusEnum.InProgress;
      expect(component.isTranslateInProgress).toBe(true);
    });

    it('isTranslateCompleted should return true when completed', () => {
      component.currentStatus.status = TranslateExerciseStatusEnum.Completed;
      expect(component.isTranslateCompleted).toBe(true);
    });

    it('reciteQueuesCount should return data source length', () => {
      component.dataSource.data = mockFileContent;
      expect(component.reciteQueuesCount).toBe(3);
    });

    it('currentQueueItem should return current queue item', () => {
      component.recitequeues = [
        { ensent: 'A', cnsent: 'A', enwords: ['a'], completed: false, inputted: '' },
      ];
      component.queueidx = 0;
      expect(component.currentQueueItem).toEqual(component.recitequeues[0]);
    });

    it('currentProgress should calculate progress percentage', () => {
      component.dataSource.data = mockFileContent;
      component.queueidx = 1;
      expect(component.currentProgress).toBeCloseTo(33.33, 1);
    });

    it('isEnglishToChineseDirection should return true for English to Chinese', () => {
      component.setting.direction = TranslateDirectionEnum.EnglishToChinese;
      expect(component.isEnglishToChineseDirection).toBe(true);
    });

    it('isChineseToEnglishDirection should return true for Chinese to English', () => {
      component.setting.direction = TranslateDirectionEnum.ChineseToEnglish;
      expect(component.isChineseToEnglishDirection).toBe(true);
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
  });

  describe('getDirectionName', () => {
    it('should return correct name for Chinese to English', () => {
      expect(component.getDirectionName(TranslateDirectionEnum.ChineseToEnglish)).toBe('中译英');
    });

    it('should return correct name for English to Chinese', () => {
      expect(component.getDirectionName(TranslateDirectionEnum.EnglishToChinese)).toBe('英译中');
    });
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
      config: {
        reRenderOnLangChange: true,
        prodMode: false,
      },
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
            allDirections: [
              { value: TranslateDirectionEnum.ChineseToEnglish },
              { value: TranslateDirectionEnum.EnglishToChinese },
            ],
            getDirectionName: (dir: TranslateDirectionEnum) =>
              dir === TranslateDirectionEnum.ChineseToEnglish ? '中译英' : '英译中',
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
    expect(component.allowEmptyAnswer()).toBe(false);
    expect(component.direction()).toBe(TranslateDirectionEnum.EnglishToChinese);
  });

  it('should close dialog without data on cancel', () => {
    component.onNoClick();
    expect(mockDialogRef.close).toHaveBeenCalledWith();
  });

  it('should close dialog with data on confirm', () => {
    component.countOfItems.set(15);
    component.allowEmptyAnswer.set(true);
    component.direction.set(TranslateDirectionEnum.ChineseToEnglish);

    component.onYesClick();

    expect(mockDialogRef.close).toHaveBeenCalledWith({
      allowEmptyAnswer: true,
      countOfItems: 15,
      direction: TranslateDirectionEnum.ChineseToEnglish,
    });
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
      config: {
        reRenderOnLangChange: true,
        prodMode: false,
      },
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
            allDirections: [
              { value: TranslateDirectionEnum.ChineseToEnglish },
              { value: TranslateDirectionEnum.EnglishToChinese },
            ],
            getDirectionName: (dir: TranslateDirectionEnum) =>
              dir === TranslateDirectionEnum.ChineseToEnglish ? '中译英' : '英译中',
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
        if (key === 'translateExercises.direction.chineseToEnglish') {return '中译英';}
        if (key === 'translateExercises.direction.englishToChinese') {return '英译中';}
        if (key === 'translateExercises.chineseToEnglish') {return '中译英';}
        if (key === 'translateExercises.englishToChinese') {return '英译中';}
        if (key === 'translateExercises.explain') {return '讲解';}
        if (key === 'translateExercises.correct') {return '纠正';}
        if (key === 'translateExercises.aiMode.explain') {return '讲解';}
        if (key === 'translateExercises.aiMode.correct') {return '纠正';}
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
    vi.spyOn(console, 'error');

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
