import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslocoModule, TranslocoService, TRANSLOCO_TRANSPILER, TRANSLOCO_MISSING_HANDLER } from '@jsverse/transloco';
import { of } from 'rxjs';

import type { VocabularyQuizQuestion } from '../../interfaces';
import { AudioService } from '../../services';

import { VocabularyExercisesQuizSessionComponent } from './vocabulary-exercises-quiz-session.component';
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

describe('VocabularyExercisesQuizSessionComponent', () => {
  let fixture: ComponentFixture<VocabularyExercisesQuizSessionComponent>;
  let component: VocabularyExercisesQuizSessionComponent;
  let store: VocabularyQuizSessionStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VocabularyExercisesQuizSessionComponent, TranslocoModule, NoopAnimationsModule],
      providers: [
        VocabularyQuizSessionStore,
        { provide: AudioService, useValue: { speakWord: vi.fn(), playSound: vi.fn() } },
        { provide: TranslocoService, useValue: mockTransloco() },
        { provide: TRANSLOCO_TRANSPILER, useValue: {} },
        { provide: TRANSLOCO_MISSING_HANDLER, useValue: {} },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(VocabularyExercisesQuizSessionComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(VocabularyQuizSessionStore);
    // Do NOT call detectChanges: keyboard-handler tests only. Two questions so
    // next() can actually advance.
    store.start([question('hello', '你好'), question('world', '世界', 1)]);
  });

  function keyup(init: {
    key: string;
    target?: EventTarget | null;
    ctrlKey?: boolean;
    altKey?: boolean;
    metaKey?: boolean;
  }): KeyboardEvent {
    return {
      target: document.body,
      preventDefault: vi.fn(),
      ...init,
    } as unknown as KeyboardEvent;
  }

  describe('keyboard forwarding (M7)', () => {
    it('does not skip past the feedback when Enter is released on a focused option button', () => {
      // The button click already happened on keydown: the question is answered.
      store.answer(0);

      component.handleKeyboardEvent(keyup({ key: 'Enter', target: document.createElement('button') }));

      // Still on the first question: the green/red feedback must stay visible.
      expect(store.currentIndex()).toBe(0);
      expect(store.isAnswered()).toBe(true);
    });

    it('does not act on Space released on a focused button', () => {
      store.answer(0);

      component.handleKeyboardEvent(keyup({ key: ' ', target: document.createElement('button') }));

      expect(store.currentIndex()).toBe(0);
    });

    it('does not act on Space released on a focused button before answering', () => {
      component.handleKeyboardEvent(keyup({ key: ' ', target: document.createElement('button') }));

      expect(store.selectedIndex()).toBe(-1);
      expect(store.currentIndex()).toBe(0);
    });

    it('does not answer on modifier chords (Ctrl+number is a browser/app shortcut)', () => {
      component.handleKeyboardEvent(keyup({ key: '2', ctrlKey: true }));

      expect(store.selectedIndex()).toBe(-1);
    });

    it('still answers on plain number keys', () => {
      component.handleKeyboardEvent(keyup({ key: '2' }));

      expect(store.selectedIndex()).toBe(1);
    });

    it('still advances on Enter from a plain target once answered', () => {
      store.answer(0);

      component.handleKeyboardEvent(keyup({ key: 'Enter' }));

      expect(store.currentIndex()).toBe(1);
      expect(store.isAnswered()).toBe(false);
    });
  });

  describe('accessibility (M9)', () => {
    it('every icon-only toolbar fab exposes an accessible name via aria-label', () => {
      fixture.detectChanges();

      const fabs: NodeListOf<HTMLButtonElement> =
        fixture.nativeElement.querySelectorAll('button[mat-fab]');

      // Next question, quit.
      expect(fabs.length).toBe(2);
      fabs.forEach(fab => {
        expect(fab.getAttribute('aria-label')).toBeTruthy();
      });
    });
  });

  describe('live announcements + focus (L9)', () => {
    it('shows an aria-live status region announcing correct after a right answer', () => {
      fixture.detectChanges();
      store.answer(0); // correct (answerIndex 0 on the first question)
      fixture.detectChanges();

      const status = fixture.nativeElement.querySelector('.vocabulary-test-status');
      expect(status).toBeTruthy();
      expect(status.getAttribute('aria-live')).toBe('polite');
      expect(status.textContent).toContain('vocabularyExercises.correct');
    });

    it('announces incorrect after a wrong answer', () => {
      fixture.detectChanges();
      store.answer(1); // wrong: correct index is 0
      fixture.detectChanges();

      const status = fixture.nativeElement.querySelector('.vocabulary-test-status');
      expect(status).toBeTruthy();
      expect(status.textContent).toContain('vocabularyExercises.incorrect');
    });

    it('does not render the status region before answering', () => {
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.vocabulary-test-status')).toBeNull();
    });

    it('keeps answered option buttons focusable (no disabled attribute) so focus is not dropped to body', () => {
      fixture.detectChanges();
      store.answer(0);
      fixture.detectChanges();

      const options: NodeListOf<HTMLButtonElement> =
        fixture.nativeElement.querySelectorAll('button.vocabulary-test-option');
      expect(options.length).toBeGreaterThan(0);
      options.forEach(btn => {
        // Re-answering is guarded by the store; the buttons stay focusable.
        expect(btn.disabled).toBe(false);
      });
    });

    it('renders a correctness icon on the answered option', () => {
      fixture.detectChanges();
      store.answer(0); // correct
      fixture.detectChanges();

      const icons: NodeListOf<HTMLElement> =
        fixture.nativeElement.querySelectorAll('.vocabulary-test-option-icon');
      expect(icons.length).toBeGreaterThan(0);
    });
  });
});
