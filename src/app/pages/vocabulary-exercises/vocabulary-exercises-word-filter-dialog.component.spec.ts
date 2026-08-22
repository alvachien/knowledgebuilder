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

import type { WordCondition } from '../../interfaces';

import { VocabularyExercisesWordFilterDialogComponent } from './vocabulary-exercises-word-filter-dialog.component';

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

describe('VocabularyExercisesWordFilterDialogComponent', () => {
  let fixture: ComponentFixture<VocabularyExercisesWordFilterDialogComponent>;
  let closeSpy: ReturnType<typeof vi.fn>;

  async function createWith(seed: WordCondition[]) {
    closeSpy = vi.fn();
    await TestBed.configureTestingModule({
      imports: [VocabularyExercisesWordFilterDialogComponent, NoopAnimationsModule],
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
    fixture = TestBed.createComponent(VocabularyExercisesWordFilterDialogComponent);
  }

  it('seeds conditions from the injected data without mutating the seed', async () => {
    const seed: WordCondition[] = [{ operator: 'startsWith', text: 'a' }];
    await createWith(seed);
    expect(fixture.componentInstance.conditions().length).toBe(1);
    expect(fixture.componentInstance.conditions()[0]).toEqual({ operator: 'startsWith', text: 'a' });
    // Mutating the dialog's copy must not touch the caller's array.
    fixture.componentInstance.onAddCondition();
    expect(seed.length).toBe(1);
  });

  it('onAddCondition appends a blank contains condition', async () => {
    await createWith([]);
    fixture.componentInstance.onAddCondition();
    expect(fixture.componentInstance.conditions()).toEqual([{ operator: 'contains', text: '' }]);
  });

  it('onRemoveCondition removes the row at the index', async () => {
    await createWith([
      { operator: 'startsWith', text: 'a' },
      { operator: 'endsWith', text: 'ing' },
    ]);
    fixture.componentInstance.onRemoveCondition(0);
    expect(fixture.componentInstance.conditions()).toEqual([{ operator: 'endsWith', text: 'ing' }]);
  });

  it('onClose closes returning the current conditions', async () => {
    await createWith([{ operator: 'startsWith', text: 'a' }]);
    fixture.componentInstance.onClose();
    expect(closeSpy).toHaveBeenCalledWith(fixture.componentInstance.conditions());
  });

  it('hasEmptyCondition is true when any condition text is blank or whitespace', async () => {
    await createWith([{ operator: 'contains', text: '  ' }]);
    expect(fixture.componentInstance.hasEmptyCondition()).toBe(true);
    fixture.componentInstance.conditions.set([{ operator: 'contains', text: 'a' }]);
    expect(fixture.componentInstance.hasEmptyCondition()).toBe(false);
  });

  it('hasEmptyCondition ignores blank text on the phrase operators', async () => {
    await createWith([
      { operator: 'isPhrase', text: '' },
      { operator: 'notPhrase', text: '   ' },
    ]);
    expect(fixture.componentInstance.hasEmptyCondition()).toBe(false);
    // A blank text condition alongside still blocks Close.
    fixture.componentInstance.conditions.set([
      { operator: 'isPhrase', text: '' },
      { operator: 'contains', text: '' },
    ]);
    expect(fixture.componentInstance.hasEmptyCondition()).toBe(true);
  });

  it('isPhraseOp is true only for the phrase operators', async () => {
    await createWith([]);
    expect(fixture.componentInstance.isPhraseOp('isPhrase')).toBe(true);
    expect(fixture.componentInstance.isPhraseOp('notPhrase')).toBe(true);
    expect(fixture.componentInstance.isPhraseOp('contains')).toBe(false);
  });

  it('hasEmptyCondition is false with no conditions (empty list clears the filter)', async () => {
    await createWith([]);
    expect(fixture.componentInstance.hasEmptyCondition()).toBe(false);
  });

  it('onCancel closes with undefined (no argument)', async () => {
    await createWith([{ operator: 'startsWith', text: 'a' }]);
    fixture.componentInstance.onCancel();
    expect(closeSpy).toHaveBeenCalledWith();
  });
});
