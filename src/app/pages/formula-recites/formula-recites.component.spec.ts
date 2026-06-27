import { vi } from 'vitest';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Title } from '@angular/platform-browser';
import {
  TranslocoService,
  TRANSLOCO_TRANSPILER,
  TRANSLOCO_MISSING_HANDLER,
  TRANSLOCO_INTERCEPTOR,
} from '@jsverse/transloco';
import { of, throwError } from 'rxjs';

import type { FormulaReciteDataFile, FormulaReciteContent } from '../../interfaces';
import { FormulaReciteAIModeEnum, FormulaReciteFileTypeEnum } from '../../interfaces';
import { AIService } from '../../services/ai.service';
import { StorageService } from '../../services/storage.service';
import { UIService } from '../../services/ui.service';
import { UserCodeService } from '../../services/user-code.service';
import { UtilService } from '../../services/util.service';
import { FooterComponent } from '../../shared/footer/footer';
import { MathItemComponent } from '../../shared/mathitem';
import { AppPageTitle } from '../page-title/page-title';

import {
  FormulaRecitesComponent,
  FormulaRecitesPrintOptionsDialogComponent,
  FormulaRecitesLLMDialogComponent,
} from './formula-recites.component';

function createMockTranslocoService() {
  const mock = {
    setActiveLang: vi.fn(),
    getActiveLang: vi.fn(),
    selectTranslate: vi.fn().mockReturnValue(of('')),
    _loadDependencies: vi.fn().mockReturnValue(of(null)),
    translate: vi.fn((key: string) => {
      if (key === 'formulaRecites.explain') {
        return '讲解';
      }
      if (key === 'formulaRecites.generateQuiz') {
        return '生成试题';
      }
      if (key === 'translateExercises.chineseToEnglish') {
        return '中译英';
      }
      if (key === 'translateExercises.englishToChinese') {
        return '英译中';
      }
      if (key === 'translateExercises.explain') {
        return '讲解';
      }
      if (key === 'translateExercises.correct') {
        return '纠正';
      }
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
  return mock;
}

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

describe('FormulaRecitesComponent', () => {
  let component: FormulaRecitesComponent;
  let fixture: ComponentFixture<FormulaRecitesComponent>;
  let mockStorageService: any;
  let mockUtilService: any;
  let mockMatDialog: any;

  const mockFormulaDataFile: FormulaReciteDataFile[] = [
    {
      name: 'test-formula-1',
      file: 'test1.json',
      version: 2,
      contenttype: FormulaReciteFileTypeEnum.Math,
    },
    {
      name: 'test-formula-2',
      file: 'test2.json',
      version: 1,
      contenttype: FormulaReciteFileTypeEnum.Physics,
    },
  ];

  const mockFormulaContent: FormulaReciteContent[] = [
    { name: 'Pythagorean theorem', value: 'a^2 + b^2 = c^2', math: true, source: 'Geometry' },
    { name: 'Einstein mass-energy', value: 'E = mc^2', math: true, source: 'Physics' },
    { name: 'Ideal gas law', value: 'PV=nRT', math: true, source: 'Chemistry' },
  ];

  beforeEach(async () => {
    const storageSpy = {
      getFormulaDataFile: vi.fn(),
      getFormulaFileContent: vi.fn(),
    };
    const utilSpy = {
      getEntryDateString: vi.fn(),
    };
    const uiSpy = { setSelectedExerciseItem: vi.fn() };
    const userCodeSpy = { isUserCodeEntered: true };
    const aiSpy = { explainFormat: vi.fn() };
    const dialogSpy = { open: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [
        FooterComponent,
        MatToolbarModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        FormsModule,
        MatIconModule,
        MatButtonModule,
        MatTableModule,
        MatCheckboxModule,
        MatDividerModule,
        MatProgressBarModule,
        MatPaginatorModule,
        FooterComponent,
        MathItemComponent,
      ],
      providers: [
        { provide: StorageService, useValue: storageSpy },
        { provide: UtilService, useValue: utilSpy },
        { provide: UIService, useValue: uiSpy },
        { provide: UserCodeService, useValue: userCodeSpy },
        { provide: AIService, useValue: aiSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: TranslocoService, useValue: createMockTranslocoService() },
        { provide: Title, useValue: { setTitle: vi.fn() } },
        { provide: AppPageTitle, useClass: MockAppPageTitle },
        { provide: TRANSLOCO_TRANSPILER, useValue: {} },
        { provide: TRANSLOCO_MISSING_HANDLER, useValue: {} },
        { provide: TRANSLOCO_INTERCEPTOR, useValue: {} },
      ],
    }).compileComponents();

    // Override the component to use our custom imports
    TestBed.overrideComponent(FormulaRecitesComponent, {
      set: {
        imports: [
          FooterComponent,
          MatToolbarModule,
          MatFormFieldModule,
          MatInputModule,
          MatSelectModule,
          FormsModule,
          MatIconModule,
          MatButtonModule,
          MatTableModule,
          MatCheckboxModule,
          MatDividerModule,
          MatProgressBarModule,
          MathItemComponent,
          MatPaginatorModule,
        ],
      },
    });

    mockStorageService = TestBed.inject(StorageService) as any;
    mockUtilService = TestBed.inject(UtilService) as any;
    TestBed.inject(UIService) as any;
    TestBed.inject(UserCodeService) as any;
    TestBed.inject(AIService) as any;
    mockMatDialog = TestBed.inject(MatDialog) as any;

    fixture = TestBed.createComponent(FormulaRecitesComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize component and load formula data files', () => {
      mockStorageService.getFormulaDataFile.mockReturnValue(of(mockFormulaDataFile));

      component.ngOnInit();

      expect(mockStorageService.getFormulaDataFile).toHaveBeenCalled();
      expect(component.allFiles).toEqual(mockFormulaDataFile);
    });

    it('should handle error when loading formula data files', () => {
      vi.spyOn(console, 'error');
      mockStorageService.getFormulaDataFile.mockReturnValue(throwError(() => new Error('Error')));

      component.ngOnInit();

      expect(mockStorageService.getFormulaDataFile).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('applyFilter', () => {
    it('should apply filter to data source', () => {
      component.dataSource.data = mockFormulaContent;
      const event = { target: { value: 'Pythagorean' } } as unknown as Event;

      component.applyFilter(event);

      expect(component.dataSource.filter).toBe('pythagorean');
    });
  });

  describe('onFileSelectionChanged', () => {
    it('should load formula content for selected file', () => {
      mockStorageService.getFormulaFileContent.mockReturnValue(of(mockFormulaContent));
      const event = { value: { name: 'test-formula-1' } } as any;

      component.onFileSelectionChanged(event);

      expect(mockStorageService.getFormulaFileContent).toHaveBeenCalledWith('test-formula-1');
      expect(component.dataSource.data).toEqual(mockFormulaContent);
    });

    it('should handle error when loading formula content', () => {
      vi.spyOn(console, 'error');
      mockStorageService.getFormulaFileContent.mockReturnValue(
        throwError(() => new Error('Error'))
      );
      const event = { value: { name: 'test-formula-1' } } as any;

      component.onFileSelectionChanged(event);

      expect(mockStorageService.getFormulaFileContent).toHaveBeenCalledWith('test-formula-1');
      expect(console.error).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('selection methods', () => {
    beforeEach(() => {
      component.dataSource.data = mockFormulaContent;
    });

    it('should select all rows when not all are selected', () => {
      expect(component.isAllSelected()).toBe(false);

      component.toggleAllRows();

      expect(component.selection.selected.length).toBe(3);
      expect(component.isAllSelected()).toBe(true);
    });

    it('should clear selection when all are selected', () => {
      component.selection.select(...mockFormulaContent);
      expect(component.isAllSelected()).toBe(true);

      component.toggleAllRows();

      expect(component.selection.selected.length).toBe(0);
      expect(component.isAllSelected()).toBe(false);
    });

    it('should return correct recite content count', () => {
      component.dataSource.data = mockFormulaContent;

      const count = component.reciteContentCount;

      expect(count).toBe(3);
    });
  });

  describe('display methods', () => {
    it('should return display content text correctly for version 2', () => {
      component.selectedFile = { name: 'test', file: 'test', version: 2 };
      const result = component.getDisplayContentText('content@to@remove');

      expect(result).toBe('contenttoremove');
    });

    it('should return display content text correctly for version 1', () => {
      component.selectedFile = { name: 'test', file: 'test', version: 1 };
      const result = component.getDisplayContentText('content@to@keep');

      expect(result).toBe('content@to@keep');
    });

    it('should return display content text in test mode correctly for version 2', () => {
      component.selectedFile = { name: 'test', file: 'test', version: 2 };
      const result = component.getDisplayContentTextInTest('part1@part2@part3');

      // 'part2' has 5 characters, so it's replaced with '__'.repeat(5) = 10 underscores
      expect(result).toBe('part1__________part3');
    });

    it('should return display content text in test mode correctly for version 1', () => {
      component.selectedFile = { name: 'test', file: 'test', version: 1 };
      const result = component.getDisplayContentTextInTest('content');

      expect(result).toBe('_'.repeat('content'.length));
    });

    it('should return current date string', () => {
      const result = component.currentDateString;
      expect(result).toContain('T'); // ISO string format
    });
  });

  describe('printing methods', () => {
    it('should get entry date string', () => {
      mockUtilService.getEntryDateString.mockReturnValue('2023-01-01');
      component.printSetting.printExecDate = true;
      component.printSetting.execDate = new Date('2023-01-01');

      const result = component.getEntryDateString();

      expect(result).toBe('2023-01-01');
      expect(mockUtilService.getEntryDateString).toHaveBeenCalledWith(new Date('2023-01-01'));
    });
  });

  describe('onPrintWithOptions', () => {
    it('should open print options dialog', () => {
      const mockDialogRef = { afterClosed: vi.fn().mockReturnValue(of({ countOfItems: 10 })) };
      mockMatDialog.open.mockReturnValue(mockDialogRef);
      component.selectedFile = { name: 'test', file: 'test' };
      component.dataSource.data = mockFormulaContent;

      component.onPrintWithOptions();

      expect(mockMatDialog.open).toHaveBeenCalledWith(
        FormulaRecitesPrintOptionsDialogComponent,
        expect.objectContaining({
          width: '600px',
          height: '560px',
          enterAnimationDuration: 800,
          exitAnimationDuration: 500,
        })
      );
    });
  });
});

describe('FormulaRecitesPrintOptionsDialogComponent', () => {
  let component: FormulaRecitesPrintOptionsDialogComponent;
  let fixture: ComponentFixture<FormulaRecitesPrintOptionsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormulaRecitesPrintOptionsDialogComponent],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: { reciteContentCount: 5, disableCount: false, filename: 'test' },
        },
        {
          provide: MatDialogRef,
          useValue: { close: vi.fn() },
        },
        { provide: TranslocoService, useValue: createMockTranslocoService() },
        { provide: TRANSLOCO_TRANSPILER, useValue: {} },
        { provide: TRANSLOCO_MISSING_HANDLER, useValue: {} },
        { provide: TRANSLOCO_INTERCEPTOR, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FormulaRecitesPrintOptionsDialogComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should handle onNoClick', () => {
    const dialogRef = TestBed.inject(MatDialogRef) as any;

    component.onNoClick();

    expect(dialogRef.close).toHaveBeenCalled();
  });

  it('should handle onYesClick', () => {
    const dialogRef = TestBed.inject(MatDialogRef) as any;

    component.onYesClick();

    expect(dialogRef.close).toHaveBeenCalled();
  });
});

describe('FormulaRecitesLLMDialogComponent', () => {
  let component: FormulaRecitesLLMDialogComponent;
  let fixture: ComponentFixture<FormulaRecitesLLMDialogComponent>;
  let mockAIService: any;

  beforeEach(async () => {
    const aiSpy = { explainFormat: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [FormulaRecitesLLMDialogComponent],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: { formattype: 'math', name: 'test', content: 'test content' },
        },
        {
          provide: MatDialogRef,
          useValue: { close: vi.fn() },
        },
        { provide: AIService, useValue: aiSpy },
        { provide: TranslocoService, useValue: createMockTranslocoService() },
        { provide: TRANSLOCO_TRANSPILER, useValue: {} },
        { provide: TRANSLOCO_MISSING_HANDLER, useValue: {} },
        { provide: TRANSLOCO_INTERCEPTOR, useValue: {} },
      ],
    }).compileComponents();

    mockAIService = TestBed.inject(AIService) as any;

    fixture = TestBed.createComponent(FormulaRecitesLLMDialogComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should handle onNoClick', () => {
    const dialogRef = TestBed.inject(MatDialogRef) as any;

    component.onNoClick();

    expect(dialogRef.close).toHaveBeenCalled();
  });

  it('should handle submit with Explain mode', () => {
    const mockResponse = { content: 'explained content' };
    mockAIService.explainFormat.mockReturnValue(of(mockResponse));
    component.mode.set(FormulaReciteAIModeEnum.Explain);
    component.data = { formattype: 'math', name: 'test', content: 'test content' };

    component.onSubmit();

    expect(mockAIService.explainFormat).toHaveBeenCalledWith(
      'math',
      expect.stringContaining('讲解一下如下知识点')
    );
    expect(component.aireply()).toBe('explained content');
  });

  it('should handle submit with MoreQuiz mode', () => {
    const mockResponse = { content: 'quiz content' };
    mockAIService.explainFormat.mockReturnValue(of(mockResponse));
    component.mode.set(FormulaReciteAIModeEnum.MoreQuiz);
    component.data = { formattype: 'math', name: 'test', content: 'test content' };

    component.onSubmit();

    expect(mockAIService.explainFormat).toHaveBeenCalledWith(
      'math',
      expect.stringContaining('生成三个题目')
    );
    expect(component.aireply()).toBe('quiz content');
  });

  it('should get AI mode name', () => {
    expect(component.getAIModeName(FormulaReciteAIModeEnum.Explain)).toBe('讲解');
    expect(component.getAIModeName(FormulaReciteAIModeEnum.MoreQuiz)).toBe('生成试题');
  });
});
