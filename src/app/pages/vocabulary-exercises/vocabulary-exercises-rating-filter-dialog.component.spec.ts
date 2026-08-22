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

import { RatingOperatorEnum } from '../../interfaces';
import type { RatingCondition } from '../../interfaces';

import { VocabularyExercisesRatingFilterDialogComponent } from './vocabulary-exercises-rating-filter-dialog.component';

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

describe('VocabularyExercisesRatingFilterDialogComponent', () => {
  let fixture: ComponentFixture<VocabularyExercisesRatingFilterDialogComponent>;
  let closeSpy: ReturnType<typeof vi.fn>;

  async function createWith(seed: RatingCondition[]) {
    closeSpy = vi.fn();
    await TestBed.configureTestingModule({
      imports: [VocabularyExercisesRatingFilterDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: seed },
        { provide: MatDialogRef, useValue: { close: closeSpy } },
        { provide: TranslocoService, useValue: mockTranslocoService() },
        { provide: TRANSLOCO_TRANSPILER, useValue: {} },
        { provide: TRANSLOCO_MISSING_HANDLER, useValue: {} },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(VocabularyExercisesRatingFilterDialogComponent);
  }

  it('seeds conditions from the injected data without mutating the seed', async () => {
    const seed: RatingCondition[] = [{ operator: RatingOperatorEnum.Equals, value: 5 }];
    await createWith(seed);
    expect(fixture.componentInstance.conditions()).toEqual([{ operator: RatingOperatorEnum.Equals, value: 5 }]);
    fixture.componentInstance.onAddCondition();
    expect(seed.length).toBe(1);
  });

  it('onAddCondition appends a >= 3 condition', async () => {
    await createWith([]);
    fixture.componentInstance.onAddCondition();
    expect(fixture.componentInstance.conditions()).toEqual([
      { operator: RatingOperatorEnum.LargerOrEquals, value: 3 },
    ]);
  });

  it('onRemoveCondition removes the row at the index', async () => {
    await createWith([
      { operator: RatingOperatorEnum.Equals, value: 5 },
      { operator: RatingOperatorEnum.LessThan, value: 2 },
    ]);
    fixture.componentInstance.onRemoveCondition(0);
    expect(fixture.componentInstance.conditions()).toEqual([
      { operator: RatingOperatorEnum.LessThan, value: 2 },
    ]);
  });

  it('onClose closes returning the current conditions', async () => {
    await createWith([{ operator: RatingOperatorEnum.Equals, value: 5 }]);
    fixture.componentInstance.onClose();
    expect(closeSpy).toHaveBeenCalledWith(fixture.componentInstance.conditions());
  });

  it('onCancel closes with undefined', async () => {
    await createWith([{ operator: RatingOperatorEnum.Equals, value: 5 }]);
    fixture.componentInstance.onCancel();
    expect(closeSpy).toHaveBeenCalledWith();
  });
});
