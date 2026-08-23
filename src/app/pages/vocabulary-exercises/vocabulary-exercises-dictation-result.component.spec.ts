import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslocoModule, TranslocoService, TRANSLOCO_TRANSPILER, TRANSLOCO_MISSING_HANDLER } from '@jsverse/transloco';
import { of } from 'rxjs';

import type { VocabularySpellingQueue } from '../../interfaces';
import { AudioService } from '../../services';

import { VocabularyExercisesDictationResultComponent } from './vocabulary-exercises-dictation-result.component';
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

const word = (enword: string, cnword = '测试'): VocabularySpellingQueue => ({
  enword,
  cnword,
  completed: false,
});

describe('VocabularyExercisesDictationResultComponent', () => {
  let fixture: ComponentFixture<VocabularyExercisesDictationResultComponent>;
  let component: VocabularyExercisesDictationResultComponent;
  let store: VocabularyDictationSessionStore;

  beforeEach(async () => {
    vi.useFakeTimers();
    await TestBed.configureTestingModule({
      imports: [VocabularyExercisesDictationResultComponent, TranslocoModule, NoopAnimationsModule],
      providers: [
        VocabularyDictationSessionStore,
        { provide: AudioService, useValue: { speakWord: vi.fn(), playSound: vi.fn() } },
        { provide: TranslocoService, useValue: mockTransloco() },
        { provide: TRANSLOCO_TRANSPILER, useValue: {} },
        { provide: TRANSLOCO_MISSING_HANDLER, useValue: {} },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(VocabularyExercisesDictationResultComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(VocabularyDictationSessionStore);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the count line and one row per dictated word from the store', () => {
    store.start([word('hello', '你好'), word('world', '世界')]);
    fixture.detectChanges();

    const countEl = fixture.nativeElement.querySelector('.container > div');
    expect(countEl.textContent).toContain('2');

    const rows = fixture.nativeElement.querySelectorAll('table tr.mat-mdc-row');
    expect(rows.length).toBe(2);
    // First row shows the order index and both word fields.
    expect(rows[0].textContent).toContain('hello');
    expect(rows[0].textContent).toContain('你好');
    expect(rows[1].textContent).toContain('world');
  });

  it('is null-safe on an empty session (no div-by-zero, no rows)', () => {
    // No start() called: the store stays at its empty defaults. The count line
    // reads queue().length (0); the table must render no data rows.
    expect(() => fixture.detectChanges()).not.toThrow();

    const countEl = fixture.nativeElement.querySelector('.container > div');
    expect(countEl.textContent).toContain('0');
    expect(fixture.nativeElement.querySelectorAll('table tr.mat-mdc-row').length).toBe(0);
  });

  it('emits backToList when the back button is clicked', () => {
    fixture.detectChanges();
    const spy = vi.spyOn(component.backToList, 'emit');

    const btn = fixture.nativeElement.querySelector('button');
    btn.click();

    expect(spy).toHaveBeenCalled();
  });
});
