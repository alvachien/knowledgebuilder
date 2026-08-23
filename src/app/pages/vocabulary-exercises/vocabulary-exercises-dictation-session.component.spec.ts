import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslocoModule, TranslocoService, TRANSLOCO_TRANSPILER, TRANSLOCO_MISSING_HANDLER } from '@jsverse/transloco';
import { of } from 'rxjs';

import type { VocabularySpellingQueue } from '../../interfaces';
import { AudioService } from '../../services';

import { VocabularyExercisesDictationSessionComponent } from './vocabulary-exercises-dictation-session.component';
import { VocabularyDictationSessionStore } from './vocabulary-exercises-dictation-session.store';

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

describe('VocabularyExercisesDictationSessionComponent', () => {
  let fixture: ComponentFixture<VocabularyExercisesDictationSessionComponent>;
  let component: VocabularyExercisesDictationSessionComponent;
  let store: VocabularyDictationSessionStore;

  beforeEach(async () => {
    vi.useFakeTimers();
    await TestBed.configureTestingModule({
      imports: [VocabularyExercisesDictationSessionComponent, TranslocoModule, NoopAnimationsModule],
      providers: [
        VocabularyDictationSessionStore,
        { provide: AudioService, useValue: { speakWord: vi.fn(), playSound: vi.fn() } },
        { provide: TranslocoService, useValue: mockTransloco() },
        { provide: TRANSLOCO_TRANSPILER, useValue: {} },
        { provide: TRANSLOCO_MISSING_HANDLER, useValue: {} },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(VocabularyExercisesDictationSessionComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(VocabularyDictationSessionStore);
    store.start([
      { enword: 'hello', cnword: '你好', completed: false } as VocabularySpellingQueue,
      { enword: 'world', cnword: '世界', completed: false } as VocabularySpellingQueue,
    ]);
  });

  afterEach(() => {
    vi.useRealTimers();
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

  describe('keyboard', () => {
    it('quits on Escape', () => {
      const spy = vi.spyOn(component.quit, 'emit');

      component.handleKeyboardEvent(keyup({ key: 'Escape' }));

      expect(spy).toHaveBeenCalled();
    });

    it('does not quit on a plain letter key (no typing in dictation)', () => {
      const spy = vi.spyOn(component.quit, 'emit');

      component.handleKeyboardEvent(keyup({ key: 'h' }));

      expect(spy).not.toHaveBeenCalled();
    });

    it('ignores modifier chords (Ctrl+Escape must not quit)', () => {
      const spy = vi.spyOn(component.quit, 'emit');

      component.handleKeyboardEvent(keyup({ key: 'Escape', ctrlKey: true }));

      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('the quit fab exposes an accessible name via aria-label', () => {
      fixture.detectChanges();

      const fabs: NodeListOf<HTMLButtonElement> =
        fixture.nativeElement.querySelectorAll('button[mat-fab]');

      expect(fabs.length).toBe(1);
      expect(fabs[0].getAttribute('aria-label')).toBeTruthy();
    });

    it('renders the live dictation status with an aria-live region', () => {
      fixture.detectChanges();

      const status = fixture.nativeElement.querySelector('.vocabulary-dictation-status');
      expect(status).toBeTruthy();
      expect(status.getAttribute('aria-live')).toBe('polite');
      // Current word is 1 of 2.
      expect(status.textContent).toContain('1');
      expect(status.textContent).toContain('2');
    });
  });
});
