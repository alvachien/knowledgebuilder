import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslocoModule, TranslocoService, TRANSLOCO_TRANSPILER, TRANSLOCO_MISSING_HANDLER } from '@jsverse/transloco';
import { of } from 'rxjs';

import type { VocabularySpellingQueue } from '../../interfaces';
import { AudioService } from '../../services';

import { VocabularyExercisesSpellingSessionComponent } from './vocabulary-exercises-spelling-session.component';
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

describe('VocabularyExercisesSpellingSessionComponent', () => {
  let fixture: ComponentFixture<VocabularyExercisesSpellingSessionComponent>;
  let component: VocabularyExercisesSpellingSessionComponent;
  let store: VocabularySpellingSessionStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VocabularyExercisesSpellingSessionComponent, TranslocoModule, NoopAnimationsModule],
      providers: [
        VocabularySpellingSessionStore,
        { provide: AudioService, useValue: { speakWord: vi.fn(), playSound: vi.fn() } },
        { provide: TranslocoService, useValue: mockTransloco() },
        { provide: TRANSLOCO_TRANSPILER, useValue: {} },
        { provide: TRANSLOCO_MISSING_HANDLER, useValue: {} },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(VocabularyExercisesSpellingSessionComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(VocabularySpellingSessionStore);
    // Required signal input must be set before any read.
    fixture.componentRef.setInput('hideExplain', false);
    // Do NOT call detectChanges: keyboard-handler tests only. Current word is
    // 'hello', nothing typed yet, no errors.
    store.start([{ enword: 'hello', cnword: '你好', completed: false } as VocabularySpellingQueue], true);
  });

  function keyup(init: {
    key: string;
    target?: EventTarget | null;
    ctrlKey?: boolean;
    altKey?: boolean;
    metaKey?: boolean;
    shiftKey?: boolean;
  }): KeyboardEvent {
    return {
      target: document.body,
      preventDefault: vi.fn(),
      ...init,
    } as unknown as KeyboardEvent;
  }

  describe('keyboard forwarding (M6)', () => {
    it('does not count Enter as a typing error when a toolbar button has focus', () => {
      component.handleKeyboardEvent(keyup({ key: 'Enter', target: document.createElement('button') }));

      expect(store.results()[0].correct).toBe(true);
      expect(store.letters()[0].visible).toBe(false);
    });

    it('does not count Space as a typing error when a toolbar button has focus', () => {
      component.handleKeyboardEvent(keyup({ key: ' ', target: document.createElement('button') }));

      expect(store.results()[0].correct).toBe(true);
    });

    it('ignores Enter from a plain target (never a word character)', () => {
      component.handleKeyboardEvent(keyup({ key: 'Enter' }));

      expect(store.results()[0].correct).toBe(true);
    });

    it('ignores Tab (focus navigation must not count as a typing error)', () => {
      component.handleKeyboardEvent(keyup({ key: 'Tab' }));

      expect(store.results()[0].correct).toBe(true);
    });

    it('ignores modifier chords (Ctrl+key must not count as a typing error)', () => {
      component.handleKeyboardEvent(keyup({ key: 'f', ctrlKey: true }));

      expect(store.results()[0].correct).toBe(true);
    });

    it('ignores Shift pressed on its own (must not count as a typing error)', () => {
      component.handleKeyboardEvent(keyup({ key: 'Shift' }));

      expect(store.results()[0].correct).toBe(true);
      expect(store.letters()[0].visible).toBe(false);
    });

    it('accepts a capital letter typed with Shift and ignores its trailing Shift keyup', () => {
      store.start([{ enword: 'Apple', cnword: '苹果', completed: false } as VocabularySpellingQueue], true);

      component.handleKeyboardEvent(keyup({ key: 'A', shiftKey: true }));
      component.handleKeyboardEvent(keyup({ key: 'Shift' }));

      expect(store.letters()[0].visible).toBe(true);
      expect(store.letters()[1].visible).toBe(false);
      expect(store.results()[0].correct).toBe(true);
    });

    it('ignores CapsLock toggles (must not count as a typing error)', () => {
      component.handleKeyboardEvent(keyup({ key: 'CapsLock' }));

      expect(store.results()[0].correct).toBe(true);
      expect(store.letters()[0].visible).toBe(false);
    });

    it('quits on Escape instead of marking the word incorrect (parity with the review screen)', () => {
      const spy = vi.spyOn(component.quit, 'emit');

      component.handleKeyboardEvent(keyup({ key: 'Escape' }));

      expect(spy).toHaveBeenCalled();
      expect(store.results()[0].correct).toBe(true);
    });

    it('still forwards plain letter keys', () => {
      component.handleKeyboardEvent(keyup({ key: 'h' }));

      expect(store.letters()[0].visible).toBe(true);
    });

    it('still forwards letter keys while a toolbar button has focus (click a fab, keep typing)', () => {
      component.handleKeyboardEvent(keyup({ key: 'h', target: document.createElement('button') }));

      expect(store.letters()[0].visible).toBe(true);
    });

    it('still forwards Space from a plain target (phrases contain spaces)', () => {
      store.start([{ enword: 'apple pie', cnword: '苹果派', completed: false } as VocabularySpellingQueue], true);

      for (const letter of 'apple') {
        component.handleKeyboardEvent(keyup({ key: letter }));
      }
      component.handleKeyboardEvent(keyup({ key: ' ' }));

      expect(store.letters()[5].visible).toBe(true);
      expect(store.results()[0].correct).toBe(true);
    });
  });

  describe('accessibility (M9)', () => {
    it('every icon-only toolbar fab exposes an accessible name via aria-label', () => {
      fixture.detectChanges();

      const fabs: NodeListOf<HTMLButtonElement> =
        fixture.nativeElement.querySelectorAll('button[mat-fab]');

      // Hint, next word, quit.
      expect(fabs.length).toBe(3);
      fabs.forEach(fab => {
        expect(fab.getAttribute('aria-label')).toBeTruthy();
      });
    });
  });

  describe('live announcements (L9)', () => {
    it('does not render the incorrect status before any wrong key', () => {
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.vocabulary-typing-status')).toBeNull();
    });

    it('announces incorrect via an aria-live region after a wrong keypress', () => {
      fixture.detectChanges();
      // 'x' is not the expected first letter ('h') -> marks the word incorrect.
      component.handleKeyboardEvent(keyup({ key: 'x' }));
      fixture.detectChanges();

      const status = fixture.nativeElement.querySelector('.vocabulary-typing-status');
      expect(status).toBeTruthy();
      expect(status.getAttribute('aria-live')).toBe('polite');
      expect(status.textContent).toContain('common.incorrect');
    });
  });
});
