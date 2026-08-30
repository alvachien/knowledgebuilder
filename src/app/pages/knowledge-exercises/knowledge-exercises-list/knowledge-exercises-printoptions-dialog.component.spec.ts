import type { ComponentFixture} from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
  TranslocoService,
  TRANSLOCO_TRANSPILER,
  TRANSLOCO_MISSING_HANDLER,
} from '@jsverse/transloco';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { KnowledgeExercisesPrintOptionsDialogComponent } from './knowledge-exercises-printoptions-dialog.component';

function mockTranslocoService() {
  return {
    setActiveLang: vi.fn(),
    getActiveLang: vi.fn(),
    selectTranslate: vi.fn().mockReturnValue(of('')),
    _loadDependencies: vi.fn().mockReturnValue(of(null)),
    translate: vi.fn((key: string) => key),
    activeLang: 'en',
    config: { reRenderOnLangChange: true, prodMode: false },
    langChanges$: of('en'),
    events$: of(),
  };
}

describe('KnowledgeExercisesPrintOptionsDialogComponent', () => {
  let component: KnowledgeExercisesPrintOptionsDialogComponent;
  let fixture: ComponentFixture<KnowledgeExercisesPrintOptionsDialogComponent>;
  let mockDialogRef: any;
  let mockSnackBar: any;

  beforeEach(async () => {
    const dialogRefSpy = { close: vi.fn() };
    const snackBarSpy = { open: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [KnowledgeExercisesPrintOptionsDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { defaultTitle: 'Test Title' } },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: TranslocoService, useValue: mockTranslocoService() },
        { provide: TRANSLOCO_TRANSPILER, useValue: {} },
        { provide: TRANSLOCO_MISSING_HANDLER, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(KnowledgeExercisesPrintOptionsDialogComponent);
    component = fixture.componentInstance;
    mockDialogRef = TestBed.inject(MatDialogRef) as any;
    mockSnackBar = TestBed.inject(MatSnackBar) as any;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default title', () => {
    expect(component.formTitle()).toBe('Test Title');
  });

  it('should close dialog without data when onNoClick called', () => {
    component.onNoClick();

    expect(mockDialogRef.close).toHaveBeenCalledWith();
  });

  it('should show error when form title is empty on submit', () => {
    component.formTitle.set('');

    component.onYesClick();

    expect(mockSnackBar.open).toHaveBeenCalledWith('required_field', 'close', {
      duration: 3000,
    });
    expect(mockDialogRef.close).not.toHaveBeenCalled();
  });

  it('should show error when form title is whitespace only', () => {
    component.formTitle.set('   ');

    component.onYesClick();

    expect(mockSnackBar.open).toHaveBeenCalledWith('required_field', 'close', {
      duration: 3000,
    });
    expect(mockDialogRef.close).not.toHaveBeenCalled();
  });

  it('should close with print options data when form is valid', () => {
    component.formTitle.set('Valid Title');
    component.printEntryDate.set(true);
    component.printScore.set(false);

    component.onYesClick();

    expect(mockDialogRef.close).toHaveBeenCalledWith(
      expect.objectContaining({
        formTitle: 'Valid Title',
        printEntryDate: true,
        printScore: false,
      })
    );
  });

  it('should include all form fields in close data', () => {
    component.formTitle.set('Complete Form');
    component.printEntryDate.set(true);
    component.printScore.set(false);
    component.printAnswer.set(true);
    component.printHintOfAnswer.set(false);
    component.printID.set(true);
    component.hideLabelOfQuestionType.set(['MultipleChoice'] as any);
    component.shuffleOptionsInSelection.set(true);

    component.onYesClick();

    expect(mockDialogRef.close).toHaveBeenCalledWith({
      formTitle: 'Complete Form',
      printEntryDate: true,
      printScore: false,
      printAnswer: true,
      printHintOfAnswer: false,
      printID: true,
      hideLabelOfQuestionType: ['MultipleChoice'],
      shuffleOptionsInSelection: true,
    });
  });
});
