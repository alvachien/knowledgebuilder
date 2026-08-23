import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
  TranslocoService,
  TRANSLOCO_TRANSPILER,
  TRANSLOCO_MISSING_HANDLER,
} from '@jsverse/transloco';
import { of } from 'rxjs';

import type { VocabularyDictationOption } from '../../interfaces';

import { VocabularyExercisesDictationOptionsDialogComponent } from './vocabulary-exercises-dictationoptions-dialog.component';

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

describe('VocabularyExercisesDictationOptionsDialogComponent', () => {
  let fixture: ComponentFixture<VocabularyExercisesDictationOptionsDialogComponent>;
  let closeSpy: ReturnType<typeof vi.fn>;

  async function createWith(data: {
    wordQueueCount: number;
    withSelection: boolean;
    currentSettings?: VocabularyDictationOption;
  }): Promise<void> {
    closeSpy = vi.fn();
    await TestBed.configureTestingModule({
      imports: [VocabularyExercisesDictationOptionsDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MatDialogRef, useValue: { close: closeSpy } },
        { provide: TranslocoService, useValue: mockTranslocoService() },
        { provide: TRANSLOCO_TRANSPILER, useValue: {} },
        { provide: TRANSLOCO_MISSING_HANDLER, useValue: {} },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(VocabularyExercisesDictationOptionsDialogComponent);
  }

  it('seeds the count from currentSettings when there is no selection', async () => {
    await createWith({ wordQueueCount: 5, withSelection: false, currentSettings: { countOfItems: 30 } });
    expect(fixture.componentInstance.countOfItems()).toBe(30);
  });

  it('seeds the count from wordQueueCount when rows are selected', async () => {
    await createWith({ wordQueueCount: 7, withSelection: true, currentSettings: { countOfItems: 30 } });
    // The input is disabled with a selection; the displayed count is the queue size.
    expect(fixture.componentInstance.countOfItems()).toBe(7);
  });

  it('falls back to 20 when currentSettings is absent and nothing is selected', async () => {
    await createWith({ wordQueueCount: 5, withSelection: false });
    expect(fixture.componentInstance.countOfItems()).toBe(20);
  });

  it('isCountInvalid rejects non-integer / sub-1 counts and accepts valid ones', async () => {
    await createWith({ wordQueueCount: 5, withSelection: false, currentSettings: { countOfItems: 10 } });

    const component = fixture.componentInstance;
    component.countOfItems.set(10);
    expect(component.isCountInvalid).toBe(false);

    component.countOfItems.set(0);
    expect(component.isCountInvalid).toBe(true);

    component.countOfItems.set(-3);
    expect(component.isCountInvalid).toBe(true);

    component.countOfItems.set(2.5);
    expect(component.isCountInvalid).toBe(true);
  });

  it('onYesClick closes returning the entered count, floored to a minimum of 1', async () => {
    await createWith({ wordQueueCount: 5, withSelection: false, currentSettings: { countOfItems: 20 } });
    fixture.componentInstance.countOfItems.set(12);
    fixture.componentInstance.onYesClick();

    expect(closeSpy).toHaveBeenCalledWith({ countOfItems: 12 });
  });

  it('onYesClick with a selection returns the persisted count untouched (M11)', async () => {
    await createWith({ wordQueueCount: 3, withSelection: true, currentSettings: { countOfItems: 25 } });
    fixture.componentInstance.onYesClick();

    expect(closeSpy).toHaveBeenCalledWith({ countOfItems: 25 });
  });

  it('onNoClick closes with undefined', async () => {
    await createWith({ wordQueueCount: 5, withSelection: false });
    fixture.componentInstance.onNoClick();

    expect(closeSpy).toHaveBeenCalledWith();
  });
});
