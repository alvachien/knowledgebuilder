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

import { TranslateExercisesQuizSessionComponent } from './translate-exercises-quiz-session.component';
import { TranslateQuizSessionStore } from './translate-exercises-quiz-session.store';

describe('TranslateExercisesQuizSessionComponent', () => {
  let component: TranslateExercisesQuizSessionComponent;
  let fixture: ComponentFixture<TranslateExercisesQuizSessionComponent>;
  let store: TranslateQuizSessionStore;

  const q = (prompt: string, answerIndex: number): SentenceQuizQuestion => ({
    ensent: 'EN ' + prompt,
    cnsent: 'CN ' + prompt,
    prompt,
    options: ['opt1', 'opt2', 'opt3'],
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
      imports: [TranslateExercisesQuizSessionComponent, NoopAnimationsModule],
      providers: [
        TranslateQuizSessionStore,
        { provide: AudioService, useValue: { playSound: vi.fn() } },
        { provide: TranslocoService, useValue: mockTranslocoService },
        { provide: TRANSLOCO_TRANSPILER, useValue: {} },
        { provide: TRANSLOCO_MISSING_HANDLER, useValue: {} },
        { provide: TRANSLOCO_INTERCEPTOR, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TranslateExercisesQuizSessionComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(TranslateQuizSessionStore);
    store.start([q('prompt one', 1)]);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the current prompt and options', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('prompt one');
    expect(el.textContent).toContain('opt1');
    expect(el.textContent).toContain('A');
    expect(el.textContent).toContain('C');
  });

  it('shows the answer feedback once answered', () => {
    store.answer(1);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('common.correct');
    expect(el.querySelector('.sentence-quiz-option-correct')).toBeTruthy();
  });

  it('renders the Chinese hint line', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.sentence-quiz-hint')?.textContent).toContain('CN prompt one');
  });

  it('shows the full sentence in place of the cloze once answered', () => {
    store.answer(1);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.sentence-quiz-prompt')?.textContent).toContain('EN prompt one');
  });

  it('forwards answer keys to the store', () => {
    component.handleKeyboardEvent(new KeyboardEvent('keyup', { key: '2' }));
    expect(store.selectedIndex()).toBe(1);
  });

  it('does not forward Enter pressed on a focused button', () => {
    store.answer(1);
    const nextSpy = vi.spyOn(store, 'next');

    const event = new KeyboardEvent('keyup', { key: 'Enter' });
    vi.spyOn(event, 'target', 'get').mockReturnValue(document.createElement('button'));
    component.handleKeyboardEvent(event);

    expect(nextSpy).not.toHaveBeenCalled();
  });
});
