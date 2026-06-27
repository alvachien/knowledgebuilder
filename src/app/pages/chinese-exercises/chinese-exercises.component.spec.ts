import { vi } from 'vitest';
import { SelectionModel } from '@angular/cdk/collections';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { of, throwError } from 'rxjs';

import type { LearnChineseFileItem, LearningContent } from '../../interfaces';
import { QuestionBankItemLevelEnum } from '../../interfaces';
import { LearningContentService } from '../../services/learning-content.service';
import { LearningRatingService } from '../../services/learning-rating.service';
import { StorageService } from '../../services/storage.service';
import { UIService } from '../../services/ui.service';
import { AppPageTitle } from '../page-title/page-title';

import {
  ChineseExercisesComponent,
  ChineseExercisesOptionsDialogComponent,
  ChineseExercisesPrintOptionsDialogComponent,
} from './chinese-exercises.component';

describe('ChineseExercisesComponent', () => {
  let component: ChineseExercisesComponent;
  let fixture: ComponentFixture<ChineseExercisesComponent>;
  let storageServiceSpy: any;
  let contentServiceSpy: any;
  let ratingServiceSpy: any;
  let dialogSpy: any;
  let uiServiceSpy: any;
  let routerSpy: any;

  const mockLearningContents: LearningContent[] = [
    { id: 1, categoryId: 4, nameChinese: '测试文件1', nameEnglish: 'Test File 1', fileUrl: 'storage/learnchinese/test1.json' },
    { id: 2, categoryId: 4, nameChinese: '测试文件2', nameEnglish: 'Test File 2', fileUrl: 'storage/learnchinese/test2.json' },
  ];

  const mockLearnChineseFileItem: LearnChineseFileItem[] = [
    {
      subject: 'Test Subject 1',
      author: 'Test Author 1',
      content: 'Test Content 1',
    },
    {
      subject: 'Test Subject 2',
      author: 'Test Author 2',
      content: 'Test Content 2',
    },
  ];

  beforeEach(async () => {
    const storageSpy = {
      getLearnChineseDataFile: vi.fn(),
      getLearnChineseFileContent: vi.fn(),
    };

    const contentSpy = {
      getChineseContents: vi.fn(),
      getChineseFileContent: vi.fn(),
      getStorageFileUrl: vi.fn((url: string) => `http://test-api/${url.replace('storage/', '')}`),
    };

    const ratingSpy = {
      getRatings: vi.fn(),
      upsertRating: vi.fn(),
    };

    const matDialogSpy = { open: vi.fn() };
    const uiSpy = { setSelectedExerciseItem: vi.fn() };
    const routeSpy = { navigate: vi.fn() };

    // Mock Title service
    const titleSpy = { setTitle: vi.fn() };

    // Mock HttpClient
    const httpSpy = { get: vi.fn().mockReturnValue(of([])) };

    // Create a minimal mock class that doesn't have dependencies
    class MockAppPageTitle {
      _title = '';
      _originalTitle = 'Knowledge Builder';

      get title(): string {
        return this._title;
      }

      set title(value: string) {
        this._title = value;
      }
    }

    await TestBed.configureTestingModule({
      imports: [
        ChineseExercisesComponent,
        TranslocoTestingModule.forRoot({
          langs: { en: {}, 'zh-CN': {} },
          translocoConfig: {
            availableLangs: ['en', 'zh-CN'],
            defaultLang: 'en',
          },
          preloadLangs: true,
        }),
      ],
      providers: [
        { provide: AppPageTitle, useClass: MockAppPageTitle },
        { provide: StorageService, useValue: storageSpy },
        { provide: LearningContentService, useValue: contentSpy },
        { provide: LearningRatingService, useValue: ratingSpy },
        { provide: MatDialog, useValue: matDialogSpy },
        { provide: UIService, useValue: uiSpy },
        { provide: Router, useValue: routeSpy },
        { provide: Title, useValue: titleSpy },
        { provide: HttpClient, useValue: httpSpy },
      ],
    }).compileComponents();

    storageServiceSpy = TestBed.inject(StorageService) as any;
    contentServiceSpy = TestBed.inject(LearningContentService) as any;
    ratingServiceSpy = TestBed.inject(LearningRatingService) as any;
    dialogSpy = TestBed.inject(MatDialog) as any;
    uiServiceSpy = TestBed.inject(UIService) as any;
    routerSpy = TestBed.inject(Router) as any;
    fixture = TestBed.createComponent(ChineseExercisesComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize with default values', () => {
      expect(component.allFiles).toEqual([]);
      expect(component.selectedFile).toBeUndefined();
      expect(component.currentStatus.status).toBeDefined();
      expect(component.queueidx).toBe(-1);
      expect(component.dataSource).toBeDefined();
      expect(component.selection).toBeDefined();
    });

    it('should load learn chinese data files on init', () => {
      contentServiceSpy.getChineseContents.mockReturnValue(of(mockLearningContents));

      component.ngOnInit();

      expect(contentServiceSpy.getChineseContents).toHaveBeenCalled();
      expect(component.allFiles).toEqual(mockLearningContents);
    });

    it('should handle error when loading learn chinese data files', () => {
      const errorSpy = vi.spyOn(console, 'error');
      contentServiceSpy.getChineseContents.mockReturnValue(
        throwError(() => new Error('Test error'))
      );

      component.ngOnInit();

      expect(contentServiceSpy.getChineseContents).toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('File selection', () => {
    beforeEach(() => {
      component.allFiles = mockLearningContents;
      contentServiceSpy.getChineseFileContent.mockReturnValue(of(mockLearnChineseFileItem));
      ratingServiceSpy.getRatings.mockReturnValue(of([]));
    });

    it('should handle file selection change', () => {
      const event = { value: mockLearningContents[0] } as any;

      component.onFileSelectionChanged(event);

      expect(contentServiceSpy.getChineseFileContent).toHaveBeenCalledWith('storage/learnchinese/test1.json');
      expect(component.dataSource.data).toEqual(mockLearnChineseFileItem);
    });

    it('should handle empty file content', () => {
      contentServiceSpy.getChineseFileContent.mockReturnValue(of(undefined));
      const event = { value: mockLearningContents[0] } as any;

      component.onFileSelectionChanged(event);

      expect(component.dataSource.data).toEqual([]);
    });
  });

  describe('Selection methods', () => {
    beforeEach(() => {
      component.dataSource.data = [...mockLearnChineseFileItem];
      component.selection = new SelectionModel<LearnChineseFileItem>(true, []);
    });

    it('should select all rows when none are selected', () => {
      expect(component.isAllSelected()).toBe(false);

      component.toggleAllRows();

      expect(component.isAllSelected()).toBe(true);
      expect(component.selection.selected.length).toBe(2);
    });

    it('should clear selection when all are selected', () => {
      component.selection.select(...mockLearnChineseFileItem);
      expect(component.isAllSelected()).toBe(true);

      component.toggleAllRows();

      expect(component.selection.selected.length).toBe(0);
    });

    it('should return correct recite content count', () => {
      component.dataSource.data = [...mockLearnChineseFileItem];

      expect(component.reciteContentCount).toBe(2);
    });
  });

  describe('Display content methods', () => {
    it('should return display content without @ character for version 2 file', () => {
      component.selectedFile = mockLearningContents[1];
      (component as any).fileMetadataMap.set('storage/learnchinese/test2.json', { version: 2 });
      const item = {
        subject: 'Test',
        contentlength: 1,
        content1: 'Hello@World',
      } as LearnChineseFileItem;

      const result = component.getDisplayContentText(item);

      expect(result).toBe('HelloWorld'); // @ symbol should be removed
    });

    it('should return display content without modification for version 1 file', () => {
      component.selectedFile = mockLearningContents[0];
      (component as any).fileMetadataMap.set('storage/learnchinese/test1.json', { version: 1 });
      const item = {
        subject: 'Test',
        content: 'Hello@World',
      } as LearnChineseFileItem;

      const result = component.getDisplayContentText(item);

      expect(result).toBe('Hello@World'); // @ symbol should remain
    });

    it('should return content property if contentlength is not defined', () => {
      component.selectedFile = mockLearningContents[0];
      (component as any).fileMetadataMap.set('storage/learnchinese/test1.json', { version: 1 });
      const item = {
        subject: 'Test',
        content: 'Direct Content',
      } as LearnChineseFileItem;

      const result = component.getDisplayContentText(item);

      expect(result).toBe('Direct Content');
    });
  });

  describe('Status getters', () => {
    it('should return correct status for Not Started', () => {
      component.currentStatus.status = 0; // ChineseReciteStatusEnum.NotStarted

      expect(component.isRecitingNotStarted).toBe(true);
      expect(component.isRecitingInProgress).toBe(false);
      expect(component.isRecitingCompleted).toBe(false);
    });

    it('should return correct status for In Progress', () => {
      component.currentStatus.status = 1; // ChineseReciteStatusEnum.InProgress

      expect(component.isRecitingNotStarted).toBe(false);
      expect(component.isRecitingInProgress).toBe(true);
      expect(component.isRecitingCompleted).toBe(false);
    });

    it('should return correct status for Completed', () => {
      component.currentStatus.status = 2; // ChineseReciteStatusEnum.Completed

      expect(component.isRecitingNotStarted).toBe(false);
      expect(component.isRecitingInProgress).toBe(false);
      expect(component.isRecitingCompleted).toBe(true);
    });
  });

  describe('Filter methods', () => {
    beforeEach(() => {
      component.dataSource.data = [...mockLearnChineseFileItem];
    });

    it('should apply filter to data source', () => {
      const event = new Event('input');
      Object.defineProperty(event, 'target', {
        writable: true,
        value: { value: 'Test Subject 1' },
      });

      component.applyFilter(event);

      expect(component.dataSource.filter).toBe('test subject 1');
      expect(component.dataSource.filteredData.length).toBe(1);
      expect(component.dataSource.filteredData[0].subject).toBe('Test Subject 1');
    });
  });

  describe('Dialog interactions', () => {
    beforeEach(() => {
      component.dataSource.data = [...mockLearnChineseFileItem];
      component.selectedFile = mockLearningContents[0];
    });

    it('should open options dialog with correct data when no items selected', () => {
      const mockDialogRef = {
        afterClosed: () => of(undefined),
      } as MatDialogRef<any>;
      dialogSpy.open.mockReturnValue(mockDialogRef);

      component.onStartWithOptions();

      expect(dialogSpy.open).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          data: {
            reciteContentCount: 2,
            disableCount: false,
            translationDisabled: undefined,
          },
          width: '500px',
          height: '360px',
        })
      );
    });

    it('should open options dialog with selected items count', () => {
      component.selection.select(mockLearnChineseFileItem[0]);
      const mockDialogRef = {
        afterClosed: () => of(undefined),
      } as MatDialogRef<any>;
      dialogSpy.open.mockReturnValue(mockDialogRef);

      component.onStartWithOptions();

      expect(dialogSpy.open).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          data: {
            reciteContentCount: 1,
            disableCount: true,
            translationDisabled: undefined,
          },
        })
      );
    });

    it('should call onStart when dialog returns result', () => {
      const mockResult = {
        selectedLevel: QuestionBankItemLevelEnum.Medium,
        allowEmptyAnswer: true,
        countOfItems: 10,
      };
      const mockDialogRef = {
        afterClosed: () => of(mockResult),
      } as MatDialogRef<any>;
      dialogSpy.open.mockReturnValue(mockDialogRef);
      vi.spyOn(component, 'onStart');

      component.onStartWithOptions();

      expect(component.setting.selectedLevel).toBe(QuestionBankItemLevelEnum.Medium);
      expect(component.setting.allowEmptyAnswer).toBe(true);
      expect(component.setting.countOfItems).toBe(10);
      expect(component.onStart).toHaveBeenCalled();
    });

    it('should not call onStart when dialog is cancelled', () => {
      const mockDialogRef = {
        afterClosed: () => of(undefined),
      } as MatDialogRef<any>;
      dialogSpy.open.mockReturnValue(mockDialogRef);
      vi.spyOn(component, 'onStart');

      component.onStartWithOptions();

      expect(component.onStart).not.toHaveBeenCalled();
    });

    it('should open print options dialog with correct data', () => {
      const mockDialogRef = {
        afterClosed: () => of(undefined),
      } as MatDialogRef<any>;
      dialogSpy.open.mockReturnValue(mockDialogRef);

      component.onPrintWithOptions();

      expect(dialogSpy.open).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          data: {
            reciteContentCount: 2,
            disableCount: false,
            translationDisabled: undefined,
          },
          width: '600px',
          height: '500px',
        })
      );
    });

    it('should call onPrint when print dialog returns result', () => {
      const mockResult = {
        selectedLevel: QuestionBankItemLevelEnum.Hard,
        countOfItems: 15,
        printEntryDate: true,
        respectRetentionCurve: false,
        printExecDate: true,
        execDate: new Date(),
      };
      const mockDialogRef = {
        afterClosed: () => of(mockResult),
      } as MatDialogRef<any>;
      dialogSpy.open.mockReturnValue(mockDialogRef);
      vi.spyOn(component, 'onPrint');

      component.onPrintWithOptions();

      expect(component.printSetting.selectedLevel).toBe(QuestionBankItemLevelEnum.Hard);
      expect(component.printSetting.countOfItems).toBe(15);
      expect(component.printSetting.printEntryDate).toBe(true);
      expect(component.printSetting.respectRetentionCurve).toBe(false);
      expect(component.onPrint).toHaveBeenCalled();
    });

    it('should not call onPrint when dialog is cancelled', () => {
      const mockDialogRef = {
        afterClosed: () => of(undefined),
      } as MatDialogRef<any>;
      dialogSpy.open.mockReturnValue(mockDialogRef);
      vi.spyOn(component, 'onPrint');

      component.onPrintWithOptions();

      expect(component.onPrint).not.toHaveBeenCalled();
    });
  });

  describe('Print functionality', () => {
    beforeEach(() => {
      component.dataSource.data = [...mockLearnChineseFileItem];
      component.selectedFile = mockLearningContents[0];
      component.printSetting = {
        selectedLevel: QuestionBankItemLevelEnum.Medium,
        countOfItems: 20,
        respectRetentionCurve: false,
        printEntryDate: true,
      };
    });

    it('should print with selected items', () => {
      component.selection.select(mockLearnChineseFileItem[0]);

      component.onPrint();

      expect(uiServiceSpy.setSelectedExerciseItem).toHaveBeenCalled();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/knowledge/displayv2']);
    });

    it('should print all items when none selected', () => {
      component.onPrint();

      expect(uiServiceSpy.setSelectedExerciseItem).toHaveBeenCalled();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/knowledge/displayv2']);
    });

    it('should randomize and limit items when count exceeds setting', () => {
      // Add more items to exceed countOfItems
      const manyItems: LearnChineseFileItem[] = [];
      for (let i = 0; i < 30; i++) {
        manyItems.push({
          subject: `Subject ${i}`,
          author: `Author ${i}`,
          content: `Content ${i}`,
        });
      }
      component.dataSource.data = manyItems;
      component.printSetting.countOfItems = 10;

      component.onPrint();

      const callArgs = uiServiceSpy.setSelectedExerciseItem.mock.lastCall;
      expect(callArgs?.[0].length).toBe(10);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/knowledge/displayv2']);
    });

    it('should set order and id for print queues', () => {
      component.onPrint();

      const callArgs = uiServiceSpy.setSelectedExerciseItem.mock.lastCall;
      const printQueues = callArgs?.[0];

      expect(printQueues[0].order).toBe(1);
      expect(printQueues[0].id).toBe('1');
      if (printQueues.length > 1) {
        expect(printQueues[1].order).toBe(2);
        expect(printQueues[1].id).toBe('2');
      }
    });

    it('should include file name in form title', () => {
      component.selectedFile = { id: 99, categoryId: 4, nameChinese: 'Test File', nameEnglish: 'Test File', fileUrl: 'storage/learnchinese/test.json' };

      component.onPrint();

      const callArgs = uiServiceSpy.setSelectedExerciseItem.mock.lastCall;
      const printSetting = callArgs?.[1];

      expect(printSetting?.formTitle).toContain('Test File');
    });

    it('should use default title when no file selected', () => {
      component.selectedFile = undefined;

      component.onPrint();

      const callArgs = uiServiceSpy.setSelectedExerciseItem.mock.lastCall;
      const printSetting = callArgs?.[1];

      expect(printSetting?.formTitle).toContain('Chinese Exercises');
    });
  });
});

describe('ChineseExercisesOptionsDialogComponent', () => {
  let component: ChineseExercisesOptionsDialogComponent;
  let fixture: ComponentFixture<ChineseExercisesOptionsDialogComponent>;
  let dialogRefSpy: any;

  beforeEach(async () => {
    const matDialogRefSpy = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ChineseExercisesOptionsDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: matDialogRefSpy },
        {
          provide: MAT_DIALOG_DATA,
          useValue: { reciteContentCount: 20, disableCount: false, translationDisabled: false },
        },
      ],
    }).compileComponents();

    dialogRefSpy = TestBed.inject(MatDialogRef) as any;
    fixture = TestBed.createComponent(ChineseExercisesOptionsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.selectedLevel()).toBe(QuestionBankItemLevelEnum.Medium);
    expect(component.allowEmptyAnswer()).toBe(false);
    expect(component.countOfItems()).toBe(20);
  });

  it('should initialize with disabled count when disableCount is true', () => {
    TestBed.resetTestingModule();
    const matDialogRefSpy = { close: vi.fn() };

    void TestBed.configureTestingModule({
      imports: [ChineseExercisesOptionsDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: matDialogRefSpy },
        {
          provide: MAT_DIALOG_DATA,
          useValue: { reciteContentCount: 15, disableCount: true, translationDisabled: false },
        },
      ],
    }).compileComponents();

    const newFixture = TestBed.createComponent(ChineseExercisesOptionsDialogComponent);
    const newComponent = newFixture.componentInstance;

    expect(newComponent.countOfItems()).toBe(15);
  });

  it('should close dialog without data when onNoClick is called', () => {
    component.onNoClick();

    expect(dialogRefSpy.close).toHaveBeenCalledWith();
  });

  it('should close dialog with selected options when onYesClick is called', () => {
    component.selectedLevel.set(QuestionBankItemLevelEnum.Hard);
    component.allowEmptyAnswer.set(true);
    component.countOfItems.set(30);

    component.onYesClick();

    expect(dialogRefSpy.close).toHaveBeenCalledWith({
      selectedLevel: QuestionBankItemLevelEnum.Hard,
      countOfItems: 30,
      allowEmptyAnswer: true,
    });
  });

  it('should expose getQuestionBankLevelName function', () => {
    expect(component.getQuestionBankLevelName).toBeDefined();
    expect(typeof component.getQuestionBankLevelName).toBe('function');
  });

  it('should have all levels available', () => {
    expect(component.allLevels).toBeDefined();
    expect(Array.isArray(component.allLevels)).toBe(true);
    expect(component.allLevels.length).toBeGreaterThan(0);
  });
});

describe('ChineseExercisesPrintOptionsDialogComponent', () => {
  let component: ChineseExercisesPrintOptionsDialogComponent;
  let fixture: ComponentFixture<ChineseExercisesPrintOptionsDialogComponent>;
  let dialogRefSpy: any;

  beforeEach(async () => {
    const matDialogRefSpy = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ChineseExercisesPrintOptionsDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: matDialogRefSpy },
        {
          provide: MAT_DIALOG_DATA,
          useValue: { reciteContentCount: 20, disableCount: false, translationDisabled: false },
        },
      ],
    }).compileComponents();

    dialogRefSpy = TestBed.inject(MatDialogRef) as any;
    fixture = TestBed.createComponent(ChineseExercisesPrintOptionsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.selectedLevel()).toBe(QuestionBankItemLevelEnum.Medium);
    expect(component.countOfItems()).toBe(20);
    expect(component.printEntryDate()).toBe(true);
    expect(component.selectedExecDateModel()).toBe(0);
  });

  it('should initialize with disabled count when disableCount is true', () => {
    TestBed.resetTestingModule();
    const matDialogRefSpy = { close: vi.fn() };

    void TestBed.configureTestingModule({
      imports: [ChineseExercisesPrintOptionsDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: matDialogRefSpy },
        {
          provide: MAT_DIALOG_DATA,
          useValue: { reciteContentCount: 25, disableCount: true, translationDisabled: false },
        },
      ],
    }).compileComponents();

    const newFixture = TestBed.createComponent(ChineseExercisesPrintOptionsDialogComponent);
    const newComponent = newFixture.componentInstance;

    expect(newComponent.countOfItems()).toBe(25);
  });

  it('should close dialog without data when onNoClick is called', () => {
    component.onNoClick();

    expect(dialogRefSpy.close).toHaveBeenCalledWith();
  });

  it('should close dialog with print options when onYesClick is called with exec date model 0', () => {
    component.selectedLevel.set(QuestionBankItemLevelEnum.Easy);
    component.countOfItems.set(25);
    component.printEntryDate.set(false);
    component.selectedExecDateModel.set(0);

    component.onYesClick();

    expect(dialogRefSpy.close).toHaveBeenCalledWith({
      selectedLevel: QuestionBankItemLevelEnum.Easy,
      countOfItems: 25,
      printEntryDate: false,
      respectRetentionCurve: false,
      printExecDate: false,
      execDate: undefined,
    });
  });

  it('should close dialog with respectRetentionCurve true when exec date model is 1', () => {
    component.selectedExecDateModel.set(1);

    component.onYesClick();

    expect(dialogRefSpy.close).toHaveBeenCalledWith(
      expect.objectContaining({
        respectRetentionCurve: true,
        printExecDate: false,
        execDate: undefined,
      })
    );
  });

  it('should close dialog with printExecDate and execDate when exec date model is 2', () => {
    const testDate = new Date(2024, 0, 1);
    component.selectedExecDateModel.set(2);
    component.execDate.set(testDate);

    component.onYesClick();

    expect(dialogRefSpy.close).toHaveBeenCalledWith(
      expect.objectContaining({
        respectRetentionCurve: false,
        printExecDate: true,
        execDate: testDate,
      })
    );
  });

  it('should have all levels and print exec dates available', () => {
    expect(component.allLevels).toBeDefined();
    expect(Array.isArray(component.allLevels)).toBe(true);
    expect(component.allPrintExecDates).toBeDefined();
    expect(Array.isArray(component.allPrintExecDates)).toBe(true);
  });

  it('should expose getQuestionBankLevelName function', () => {
    expect(component.getQuestionBankLevelName).toBeDefined();
    expect(typeof component.getQuestionBankLevelName).toBe('function');
  });
});
