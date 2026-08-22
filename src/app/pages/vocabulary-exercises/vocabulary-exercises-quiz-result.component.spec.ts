import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslocoModule, TranslocoService, TRANSLOCO_TRANSPILER, TRANSLOCO_MISSING_HANDLER } from '@jsverse/transloco';
import { of } from 'rxjs';

import type { VocabularyQuizQuestion } from '../../interfaces';
import { AudioService } from '../../services';

import { VocabularyExercisesQuizResultComponent } from './vocabulary-exercises-quiz-result.component';
import { VocabularyQuizSessionStore } from './vocabulary-exercises-quiz-session.store';

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

const question = (enword: string, cnword: string, answerIndex = 0): VocabularyQuizQuestion => ({
  enword,
  cnword,
  direction: 'en2cn',
  prompt: enword,
  options: [cnword, '干扰项一', '干扰项二', '干扰项三'],
  answerIndex,
});

describe('VocabularyExercisesQuizResultComponent', () => {
  let fixture: ComponentFixture<VocabularyExercisesQuizResultComponent>;
  let component: VocabularyExercisesQuizResultComponent;
  let store: VocabularyQuizSessionStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VocabularyExercisesQuizResultComponent, TranslocoModule, NoopAnimationsModule],
      providers: [
        VocabularyQuizSessionStore,
        { provide: AudioService, useValue: { speakWord: vi.fn(), playSound: vi.fn() } },
        { provide: TranslocoService, useValue: mockTransloco() },
        { provide: TRANSLOCO_TRANSPILER, useValue: {} },
        { provide: TRANSLOCO_MISSING_HANDLER, useValue: {} },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(VocabularyExercisesQuizResultComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(VocabularyQuizSessionStore);
  });

  it('renders the score line and one checkbox per result row from the store', () => {
    store.start([question('apple', '苹果'), question('sky', '天空')]);
    store.answer(0); // apple correct
    store.next();
    store.answer(1); // sky wrong (correct index is 0)
    store.next(); // complete
    fixture.detectChanges();

    const scoreEl = fixture.nativeElement.querySelector('.container > div');
    // correctCount 1 / total 2
    expect(scoreEl.textContent).toContain('1 / 2');
    // One mat-checkbox per result row (no MDC class coupling: the host tag is stable).
    expect(fixture.nativeElement.querySelectorAll('mat-checkbox').length).toBe(2);
  });

  it('is null-safe on an empty session (no div-by-zero, no rows)', () => {
    // No start() called: the store stays at its empty defaults. The score line
    // divides correctCount / questions().length; with 0/0 it must render (as
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
