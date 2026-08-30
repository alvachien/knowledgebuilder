import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
  TranslocoService,
  TRANSLOCO_TRANSPILER,
  TRANSLOCO_MISSING_HANDLER,
  TRANSLOCO_INTERCEPTOR,
} from '@jsverse/transloco';
import { of } from 'rxjs';
import { vi } from 'vitest';

import type { SentenceQuizQuestion } from '../../interfaces';
import { AudioService } from '../../services';

import { TranslateExercisesQuizResultComponent } from './translate-exercises-quiz-result.component';
import { TranslateQuizSessionStore } from './translate-exercises-quiz-session.store';

describe('TranslateExercisesQuizResultComponent', () => {
  let component: TranslateExercisesQuizResultComponent;
  let fixture: ComponentFixture<TranslateExercisesQuizResultComponent>;
  let store: TranslateQuizSessionStore;

  const q = (prompt: string, answerIndex: number): SentenceQuizQuestion => ({
    ensent: 'EN ' + prompt,
    cnsent: 'CN ' + prompt,
    prompt,
    options: ['opt1', 'opt2'],
    answerIndex,
  });

  beforeEach(async () => {
    const mockTranslocoService = {
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

    await TestBed.configureTestingModule({
      imports: [TranslateExercisesQuizResultComponent, NoopAnimationsModule],
      providers: [
        TranslateQuizSessionStore,
        { provide: AudioService, useValue: { playSound: vi.fn() } },
        { provide: TranslocoService, useValue: mockTranslocoService },
        { provide: TRANSLOCO_TRANSPILER, useValue: {} },
        { provide: TRANSLOCO_MISSING_HANDLER, useValue: {} },
        { provide: TRANSLOCO_INTERCEPTOR, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TranslateExercisesQuizResultComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(TranslateQuizSessionStore);
    store.start([q('q1', 0), q('q2', 0)]);
    store.answer(0);
    store.next();
    store.answer(1);
    store.next();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders the score and per-sentence results', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('1 / 2');
    expect(el.textContent).toContain('EN q1');
    expect(el.textContent).toContain('CN q2');
  });

  it('emits backToList from the back button', () => {
    const spy = vi.spyOn(component.backToList, 'emit');
    const btn = (fixture.nativeElement as HTMLElement).querySelector('button');
    btn?.click();

    expect(spy).toHaveBeenCalled();
  });
});
