import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslocoModule, TranslocoService, TRANSLOCO_TRANSPILER, TRANSLOCO_MISSING_HANDLER } from '@jsverse/transloco';
import { of } from 'rxjs';

import type { VocabularySpellingQueue } from '../../interfaces';
import { AudioService } from '../../services';

import { VocabularyExercisesSpellingResultComponent } from './vocabulary-exercises-spelling-result.component';
import { VocabularySpellingSessionStore } from './vocabulary-exercises-spelling-session.store';

function mockTransloco() {
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

const word = (enword: string, cnword = '测试'): VocabularySpellingQueue => ({
  enword,
  cnword,
  completed: false,
});

describe('VocabularyExercisesSpellingResultComponent', () => {
  let fixture: ComponentFixture<VocabularyExercisesSpellingResultComponent>;
  let component: VocabularyExercisesSpellingResultComponent;
  let store: VocabularySpellingSessionStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VocabularyExercisesSpellingResultComponent, TranslocoModule, NoopAnimationsModule],
      providers: [
        VocabularySpellingSessionStore,
        { provide: AudioService, useValue: { speakWord: vi.fn(), playSound: vi.fn() } },
        { provide: TranslocoService, useValue: mockTransloco() },
        { provide: TRANSLOCO_TRANSPILER, useValue: {} },
        { provide: TRANSLOCO_MISSING_HANDLER, useValue: {} },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(VocabularyExercisesSpellingResultComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(VocabularySpellingSessionStore);
  });

  it('renders the score line and one checkbox per result row from the store', () => {
    store.start([word('ab', '词一'), word('cd', '词二')], true);
    // Type 'ab' correctly (word 0 correct), give up word 1 (incorrect).
    store.handleKey('a');
    store.handleKey('b');
    // word 0 completes -> cursor moves to word 1
    store.nextWord(); // give up word 1 -> completes the session
    fixture.detectChanges();

    const scoreEl = fixture.nativeElement.querySelector('.container > div');
    // correctCount 1 / total 2
    expect(scoreEl.textContent).toContain('1 / 2');
    expect(fixture.nativeElement.querySelectorAll('mat-checkbox').length).toBe(2);
  });

  it('is null-safe on an empty session (no div-by-zero, no rows)', () => {
    // No start() called: the store stays at its empty defaults. The score line
    // divides correctCount / queue().length; with 0/0 it must render (as
    // "0 / 0") without throwing, and the table must render no data rows.
    expect(() => fixture.detectChanges()).not.toThrow();

    const scoreEl = fixture.nativeElement.querySelector('.container > div');
    expect(scoreEl.textContent).toContain('0 / 0');
    expect(fixture.nativeElement.querySelectorAll('mat-checkbox').length).toBe(0);
  });

  it('emits backToList when the back button is clicked', () => {
    fixture.detectChanges();
    const spy = vi.spyOn(component.backToList, 'emit');

    const btn = fixture.nativeElement.querySelector('button');
    btn.click();

    expect(spy).toHaveBeenCalled();
  });
});
