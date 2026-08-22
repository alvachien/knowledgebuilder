import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslocoModule, TranslocoService, TRANSLOCO_TRANSPILER, TRANSLOCO_MISSING_HANDLER } from '@jsverse/transloco';
import { of } from 'rxjs';

import type { ReviewQueueItem, UserLearningRating } from '../../interfaces';
import { AudioService, LearningRatingService } from '../../services';

import { VocabularyExercisesReviewSessionComponent } from './vocabulary-exercises-review-session.component';
import { VocabularyReviewSessionStore } from './vocabulary-exercises-review-session.store';

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

describe('VocabularyExercisesReviewSessionComponent', () => {
  let fixture: ComponentFixture<VocabularyExercisesReviewSessionComponent>;
  let component: VocabularyExercisesReviewSessionComponent;
  let store: VocabularyReviewSessionStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VocabularyExercisesReviewSessionComponent, TranslocoModule, NoopAnimationsModule],
      providers: [
        VocabularyReviewSessionStore,
        { provide: AudioService, useValue: { speakWord: vi.fn(), playSound: vi.fn() } },
        {
          provide: LearningRatingService,
          useValue: {
            getRatings: vi.fn().mockReturnValue(of([])),
            upsertRating: vi.fn().mockReturnValue(of({} as UserLearningRating)),
          },
        },
        { provide: TranslocoService, useValue: mockTransloco() },
        { provide: TRANSLOCO_TRANSPILER, useValue: {} },
        { provide: TRANSLOCO_MISSING_HANDLER, useValue: {} },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(VocabularyExercisesReviewSessionComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(VocabularyReviewSessionStore);
    // Required signal input must be set before any read.
    fixture.componentRef.setInput('hideExplain', false);
    // Do NOT call detectChanges: keyboard-handler tests only.
    store.start([{ enword: 'hello', cnword: '你好', rating: 2 } as ReviewQueueItem], true, 0);
  });

  /**
   * Builds a KeyboardEvent whose target lives inside `ancestorTag` (an open
   * mat-select trigger / its overlay panel), mirroring where keyups land while
   * the seconds-per-word dropdown is open.
   */
  function keyFromControl(ancestorTag: string, key: string): KeyboardEvent {
    const ancestor = document.createElement(ancestorTag);
    const trigger = document.createElement('div');
    ancestor.appendChild(trigger);
    return {
      key,
      target: trigger,
      preventDefault: vi.fn(),
    } as unknown as KeyboardEvent;
  }

  describe('keyboard shortcuts', () => {
    it('rates the current word up on ArrowUp from a plain target', () => {
      const event = {
        key: 'ArrowUp',
        target: document.body,
        preventDefault: vi.fn(),
      } as unknown as KeyboardEvent;

      component.handleKeyboardEvent(event);

      expect(store.currentItem().rating).toBe(3);
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('quits on Escape from a plain target', () => {
      const spy = vi.spyOn(component.quit, 'emit');

      component.handleKeyboardEvent({
        key: 'Escape',
        target: document.body,
        preventDefault: vi.fn(),
      } as unknown as KeyboardEvent);

      expect(spy).toHaveBeenCalled();
    });

    it('ignores keys while the seconds-per-word select is focused (arrows navigate its options)', () => {
      const event = keyFromControl('mat-select', 'ArrowUp');

      component.handleKeyboardEvent(event);

      expect(store.currentItem().rating).toBe(2);
      expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it('does not quit on Escape while the select dropdown is open (Escape closes the panel)', () => {
      const spy = vi.spyOn(component.quit, 'emit');

      component.handleKeyboardEvent(keyFromControl('mat-select', 'Escape'));

      expect(spy).not.toHaveBeenCalled();
    });

    it('ignores keys landing inside the dropdown overlay panel', () => {
      const pane = document.createElement('div');
      pane.className = 'cdk-overlay-pane';
      const option = document.createElement('mat-option');
      pane.appendChild(option);
      const event = {
        key: 'ArrowDown',
        target: option,
        preventDefault: vi.fn(),
      } as unknown as KeyboardEvent;

      component.handleKeyboardEvent(event);

      expect(store.currentItem().rating).toBe(2);
      expect(event.preventDefault).not.toHaveBeenCalled();
    });
  });

  describe('arrow keys while the rating toggle group has focus', () => {
    // MatButtonToggleGroup applies arrow keys on keydown by clicking the
    // neighboring toggle (rating change + server upsert, with wrap-around).
    // The document keyup handler must not apply the same key a second time,
    // otherwise one keystroke changes the rating twice and sends a duplicate
    // upsert (and horizontal arrows would additionally navigate the queue).
    function keyFromToggleGroup(key: string): KeyboardEvent {
      return keyFromControl('mat-button-toggle-group', key);
    }

    function restartWithTwoWords(): void {
      store.start(
        [
          { enword: 'hello', cnword: '你好', rating: 2 } as ReviewQueueItem,
          { enword: 'world', cnword: '世界', rating: 0 } as ReviewQueueItem,
        ],
        true,
        0
      );
    }

    it('does not change the rating on ArrowUp (the group already applied it on keydown)', () => {
      const event = keyFromToggleGroup('ArrowUp');

      component.handleKeyboardEvent(event);

      expect(store.currentItem().rating).toBe(2);
      expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it('does not change the rating on ArrowDown (the group already applied it on keydown)', () => {
      const event = keyFromToggleGroup('ArrowDown');

      component.handleKeyboardEvent(event);

      expect(store.currentItem().rating).toBe(2);
      expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it('does not advance to the next word on ArrowRight', () => {
      restartWithTwoWords();

      component.handleKeyboardEvent(keyFromToggleGroup('ArrowRight'));

      expect(store.currentItem().enword).toBe('hello');
    });

    it('does not go back to the previous word on ArrowLeft', () => {
      restartWithTwoWords();
      store.next();

      component.handleKeyboardEvent(keyFromToggleGroup('ArrowLeft'));

      expect(store.currentItem().enword).toBe('world');
    });

    it('still rates via number keys (the group does not handle them)', () => {
      component.handleKeyboardEvent(keyFromToggleGroup('4'));

      expect(store.currentItem().rating).toBe(4);
    });

    it('still quits on Escape', () => {
      const spy = vi.spyOn(component.quit, 'emit');

      component.handleKeyboardEvent(keyFromToggleGroup('Escape'));

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('modifier chords (M8)', () => {
    function keyWithModifiers(key: string, modifiers: { ctrlKey?: boolean; altKey?: boolean; metaKey?: boolean }): KeyboardEvent {
      return {
        key,
        target: document.body,
        preventDefault: vi.fn(),
        ...modifiers,
      } as unknown as KeyboardEvent;
    }

    function restartWithTwoWords(): void {
      store.start(
        [
          { enword: 'hello', cnword: '你好', rating: 2 } as ReviewQueueItem,
          { enword: 'world', cnword: '世界', rating: 0 } as ReviewQueueItem,
        ],
        true,
        0
      );
    }

    it('does not navigate on Alt+ArrowRight (Alt+ArrowLeft/Right belongs to browser history)', () => {
      restartWithTwoWords();

      component.handleKeyboardEvent(keyWithModifiers('ArrowRight', { altKey: true }));

      expect(store.currentItem().enword).toBe('hello');
    });

    it('does not navigate on Ctrl+ArrowLeft', () => {
      restartWithTwoWords();
      store.next();

      component.handleKeyboardEvent(keyWithModifiers('ArrowLeft', { ctrlKey: true }));

      expect(store.currentItem().enword).toBe('world');
    });

    it('does not rate on Ctrl/Alt + number (browser/app shortcuts)', () => {
      component.handleKeyboardEvent(keyWithModifiers('5', { ctrlKey: true }));
      component.handleKeyboardEvent(keyWithModifiers('4', { altKey: true }));

      expect(store.currentItem().rating).toBe(2);
    });

    it('does not quit on modifier+Escape', () => {
      const spy = vi.spyOn(component.quit, 'emit');

      component.handleKeyboardEvent(keyWithModifiers('Escape', { ctrlKey: true }));

      expect(spy).not.toHaveBeenCalled();
    });

    it('still navigates on plain arrows (regression guard)', () => {
      restartWithTwoWords();

      component.handleKeyboardEvent(keyWithModifiers('ArrowRight', {}));

      expect(store.currentItem().enword).toBe('world');
    });
  });

  describe('accessibility (M9)', () => {
    it('every icon-only toolbar fab exposes an accessible name via aria-label', () => {
      fixture.detectChanges();

      const fabs: NodeListOf<HTMLButtonElement> =
        fixture.nativeElement.querySelectorAll('button[mat-fab]');

      // Auto mode, previous, next, quit.
      expect(fabs.length).toBe(4);
      fabs.forEach(fab => {
        expect(fab.getAttribute('aria-label')).toBeTruthy();
      });
    });
  });

  describe('scroll suppression on keydown (L10)', () => {
    function keydown(init: {
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

    it('preventDefault on ArrowUp/Down/Left/Right from a plain target so the page does not scroll', () => {
      for (const key of ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']) {
        const event = keydown({ key });
        component.handleKeyDownEvent(event);
        expect(event.preventDefault).toHaveBeenCalled();
      }
    });

    it('does not preventDefault non-arrow keys (number keys are not scroll keys)', () => {
      const event = keydown({ key: '3' });
      component.handleKeyDownEvent(event);
      expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it('does not preventDefault arrows while the seconds-per-word select is focused (it needs them)', () => {
      const ancestor = document.createElement('mat-select');
      const trigger = document.createElement('div');
      ancestor.appendChild(trigger);
      const event = keydown({ key: 'ArrowDown', target: trigger });

      component.handleKeyDownEvent(event);

      expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it('does not preventDefault arrows while the rating toggle group is focused (it needs them)', () => {
      const group = document.createElement('mat-button-toggle-group');
      const toggle = document.createElement('mat-button-toggle');
      group.appendChild(toggle);
      const event = keydown({ key: 'ArrowUp', target: toggle });

      component.handleKeyDownEvent(event);

      expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it('does not preventDefault arrows while a button is focused (buttons do not scroll)', () => {
      const event = keydown({ key: 'ArrowDown', target: document.createElement('button') });
      component.handleKeyDownEvent(event);
      expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it('does not preventDefault modifier+arrow chords (browser shortcuts pass through)', () => {
      const event = keydown({ key: 'ArrowLeft', altKey: true });
      component.handleKeyDownEvent(event);
      expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it('still navigates on plain ArrowRight keyup (keydown scroll guard did not break the keyup path)', () => {
      store.start(
        [
          { enword: 'hello', cnword: '你好', rating: 2 } as ReviewQueueItem,
          { enword: 'world', cnword: '世界', rating: 0 } as ReviewQueueItem,
        ],
        true,
        0
      );

      component.handleKeyDownEvent(keydown({ key: 'ArrowRight' }));
      component.handleKeyboardEvent(keydown({ key: 'ArrowRight' }));

      expect(store.currentItem().enword).toBe('world');
    });
  });
});
