import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import type { ComponentFixture} from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
  TranslocoService,
  TRANSLOCO_TRANSPILER,
  TRANSLOCO_MISSING_HANDLER,
} from '@jsverse/transloco';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { SelectionModeEnum } from '../../../interfaces';

import { KnowledgeExercisesSelectDialogComponent } from './knowledge-exercises-select-dialog.component';

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

describe('KnowledgeExercisesSelectDialogComponent', () => {
  let fixture: ComponentFixture<KnowledgeExercisesSelectDialogComponent>;
  let closeSpy: ReturnType<typeof vi.fn>;

  async function createWith(data: {
    mode: SelectionModeEnum;
    rowCount?: number;
    visibleIds?: string[];
  }) {
    closeSpy = vi.fn();
    await TestBed.configureTestingModule({
      imports: [KnowledgeExercisesSelectDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MatDialogRef, useValue: { close: closeSpy } },
        { provide: TranslocoService, useValue: mockTranslocoService() },
        { provide: TRANSLOCO_TRANSPILER, useValue: {} },
        { provide: TRANSLOCO_MISSING_HANDLER, useValue: {} },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(KnowledgeExercisesSelectDialogComponent);
  }

  it('random (Free Selection) closes returning only a count', async () => {
    await createWith({ mode: SelectionModeEnum.FreeSelection });
    fixture.componentInstance.countOfItems.set(7);
    fixture.componentInstance.onYesClick();
    expect(closeSpy).toHaveBeenCalledWith({
      selectedSelectMode: SelectionModeEnum.FreeSelection,
      countOfItems: 7,
    });
  });

  it('sequence (By Count) closes returning count and offset', async () => {
    await createWith({ mode: SelectionModeEnum.ByCount, rowCount: 20 });
    fixture.componentInstance.countOfItems.set(5);
    fixture.componentInstance.countOfOffset.set(3);
    fixture.componentInstance.onYesClick();
    expect(closeSpy).toHaveBeenCalledWith({
      selectedSelectMode: SelectionModeEnum.ByCount,
      countOfItems: 5,
      countOfOffset: 3,
    });
  });

  it('isFormInvalid rejects a non-positive count', async () => {
    await createWith({ mode: SelectionModeEnum.FreeSelection });
    fixture.componentInstance.countOfItems.set(0);
    expect(fixture.componentInstance.isFormInvalid).toBe(true);

    fixture.componentInstance.countOfItems.set(1);
    expect(fixture.componentInstance.isFormInvalid).toBe(false);
  });

  it('isFormInvalid rejects a By Count offset at or beyond rowCount', async () => {
    await createWith({ mode: SelectionModeEnum.ByCount, rowCount: 10 });
    fixture.componentInstance.countOfItems.set(2);
    fixture.componentInstance.countOfOffset.set(10);
    expect(fixture.componentInstance.isFormInvalid).toBe(true);

    fixture.componentInstance.countOfOffset.set(9);
    expect(fixture.componentInstance.isFormInvalid).toBe(false);
  });

  it('ids (ByID) closes returning a clean comma-joined list', async () => {
    await createWith({ mode: SelectionModeEnum.ByID, visibleIds: ['1', '2', '3'] });
    fixture.componentInstance.importIDs.set('1\n3,,2');
    fixture.componentInstance.onYesClick();
    expect(closeSpy).toHaveBeenCalledWith({
      selectedSelectMode: SelectionModeEnum.ByID,
      importIDs: '1,3,2',
    });
  });

  it('isFormInvalid rejects empty, separator-only or non-matching ByID input', async () => {
    await createWith({ mode: SelectionModeEnum.ByID, visibleIds: ['1', '2'] });

    fixture.componentInstance.importIDs.set('');
    expect(fixture.componentInstance.isFormInvalid).toBe(true);

    fixture.componentInstance.importIDs.set(',,,');
    expect(fixture.componentInstance.isFormInvalid).toBe(true);

    fixture.componentInstance.importIDs.set('8, 9');
    expect(fixture.componentInstance.isFormInvalid).toBe(true);

    fixture.componentInstance.importIDs.set('8, 2');
    expect(fixture.componentInstance.isFormInvalid).toBe(false);
  });

  it('onNoClick closes with undefined (selection untouched)', async () => {
    await createWith({ mode: SelectionModeEnum.FreeSelection });
    fixture.componentInstance.onNoClick();
    expect(closeSpy).toHaveBeenCalledWith();
  });
});
