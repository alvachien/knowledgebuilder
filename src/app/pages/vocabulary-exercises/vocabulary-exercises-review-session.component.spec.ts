import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslocoModule, TranslocoService, TRANSLOCO_TRANSPILER, TRANSLOCO_MISSING_HANDLER } from '@jsverse/transloco';
import { of } from 'rxjs';

import type { UserLearningRating, VocabularyAutoPlayOption } from '../../interfaces';
import { AudioService, LearningRatingService, UserLearningTimeService, WordDictionaryService } from '../../services';

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
  let mockDialog: { open: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    mockDialog = { open: vi.fn().mockReturnValue({ afterClosed: () => of(undefined) }) };
    await TestBed.configureTestingModule({
      imports: [VocabularyExercisesReviewSessionComponent, TranslocoModule, NoopAnimationsModule],
      providers: [
        VocabularyReviewSessionStore,
        {
          provide: AudioService,
          useValue: {
            speakWord: vi.fn().mockResolvedValue(undefined),
            playSound: vi.fn(),
            playAuthenticatedOneShot: vi.fn(
              (_src: string, _format: string, onEnd?: () => void) => {
                onEnd?.();
                return Promise.resolve(true);
              }
            ),
            stopWordOneShot: vi.fn(),
            cancelSpeech: vi.fn(),
            speakSequence: vi.fn().mockResolvedValue(undefined),
          },
        },
        { provide: MatDialog, useValue: mockDialog },
        { provide: UserLearningTimeService, useValue: { markActivity: vi.fn() } },
        {
          provide: LearningRatingService,
          useValue: {
            getRatings: vi.fn().mockReturnValue(of([])),
            upsertRating: vi.fn().mockReturnValue(of({} as UserLearningRating)),
          },
        },
        {
          provide: WordDictionaryService,
          useValue: { getWord: vi.fn().mockReturnValue(of(null)) },
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
    store.start([{ enword: 'hello', cnword: '你好', rating: 2 }], true, 0);
  });

  /**
   * Builds a KeyboardEvent whose target lives inside `ancestorTag` (an open
   * dialog trigger / its overlay panel), mirroring where keyups land while a
   * dialog or dropdown is focused.
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

    it('ignores keys while the settings dialog is open (arrows spin its number inputs), so the word is not re-rated', () => {
      const event = keyFromControl('mat-select', 'ArrowUp');

      component.handleKeyboardEvent(event);

      expect(store.currentItem().rating).toBe(2);
      expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it('does not quit on Escape while the settings dialog is open (Escape closes the dialog)', () => {
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
          { enword: 'hello', cnword: '你好', rating: 2 },
          { enword: 'world', cnword: '世界', rating: 0 },
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
          { enword: 'hello', cnword: '你好', rating: 2 },
          { enword: 'world', cnword: '世界', rating: 0 },
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

      // Auto Play settings, play/pause, re-read, previous, next, quit - the
      // stop fab only renders while a cycle is on (see below).
      expect(fabs.length).toBe(6);
      fabs.forEach(fab => {
        expect(fab.getAttribute('aria-label')).toBeTruthy();
      });
    });

    it('shows the stop button only while the auto play cycle is on', () => {
      const countFabs = (): number =>
        (fixture.nativeElement as HTMLElement).querySelectorAll('button[mat-fab]').length;

      fixture.detectChanges();
      expect(countFabs()).toBe(6); // stopped: no stop button

      store.toggleAutoPlay(); // playing
      fixture.detectChanges();
      expect(countFabs()).toBe(7);

      store.toggleAutoPlay(); // paused: the cycle is still on
      fixture.detectChanges();
      expect(countFabs()).toBe(7);

      store.stopAutoPlay(); // stopped again
      fixture.detectChanges();
      expect(countFabs()).toBe(6);
    });
  });

  describe('toolbar', () => {
    /** The first toolbar fab is the Auto Play settings button. */
    function clickSettingsFab(): void {
      fixture.detectChanges();
      const fabs: NodeListOf<HTMLButtonElement> =
        fixture.nativeElement.querySelectorAll('button[mat-fab]');
      fabs[0].click();
    }

    it('shows the position / total count next to the progress bar', () => {
      store.start(
        [
          { enword: 'hello', cnword: '你好', rating: 2 },
          { enword: 'world', cnword: '世界', rating: 0 },
        ],
        true,
        0
      );
      fixture.detectChanges();

      const count = fixture.nativeElement.querySelector('.review-progress-count') as HTMLElement;
      expect(count.textContent.trim()).toBe('1 / 2');

      store.next();
      fixture.detectChanges();
      expect(count.textContent.trim()).toBe('2 / 2');
    });

    it('opens the Auto Play settings dialog seeded with the store values', () => {
      store.setAutoModeSeconds(7);
      store.autoPlayRandomize.set(true);
      store.autoPlaySentences.set(3);

      clickSettingsFab();

      expect(mockDialog.open).toHaveBeenCalledTimes(1);
      const openArgs = mockDialog.open.mock.calls[0] as unknown as [unknown, { data: { currentSettings: VocabularyAutoPlayOption } }];
      expect(openArgs[1].data.currentSettings).toEqual({
        intervalSeconds: 7,
        randomizeWords: true,
        sentencesToRead: 3,
      });
    });

    it('applies the settings the dialog closes with', () => {
      mockDialog.open.mockReturnValue({
        afterClosed: () => of({ intervalSeconds: 10, randomizeWords: false, sentencesToRead: 5 }),
      });

      clickSettingsFab();

      expect(store.autoModeSeconds()).toBe(10);
      expect(store.autoPlayRandomize()).toBe(false);
      expect(store.autoPlaySentences()).toBe(5);
    });

    it('leaves the settings untouched when the dialog is cancelled', () => {
      store.setAutoModeSeconds(6);
      store.autoPlaySentences.set(2);

      clickSettingsFab(); // afterClosed -> of(undefined)

      expect(store.autoModeSeconds()).toBe(6);
      expect(store.autoPlaySentences()).toBe(2);
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

    it('does not preventDefault arrows while a form control is focused (it needs them)', () => {
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
          { enword: 'hello', cnword: '你好', rating: 2 },
          { enword: 'world', cnword: '世界', rating: 0 },
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
