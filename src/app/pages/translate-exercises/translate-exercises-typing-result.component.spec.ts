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

import { TranslateDirectionEnum } from '../../interfaces';

import { TranslateExercisesTypingResultComponent } from './translate-exercises-typing-result.component';
import { TranslateTypingSessionStore } from './translate-exercises-typing-session.store';

describe('TranslateExercisesTypingResultComponent', () => {
  let component: TranslateExercisesTypingResultComponent;
  let fixture: ComponentFixture<TranslateExercisesTypingResultComponent>;
  let store: TranslateTypingSessionStore;

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
      imports: [TranslateExercisesTypingResultComponent, NoopAnimationsModule],
      providers: [
        TranslateTypingSessionStore,
        { provide: TranslocoService, useValue: mockTranslocoService },
        { provide: TRANSLOCO_TRANSPILER, useValue: {} },
        { provide: TRANSLOCO_MISSING_HANDLER, useValue: {} },
        { provide: TRANSLOCO_INTERCEPTOR, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TranslateExercisesTypingResultComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(TranslateTypingSessionStore);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the per-sentence results after completion', () => {
    store.start(
      [{ ensent: 'Hello world', cnsent: '你好世界', completed: false, inputted: '' }],
      TranslateDirectionEnum.EnglishToChinese
    );
    store.setInput('你好世界');
    store.submitAndNext();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Hello world');
    expect(el.textContent).toContain('你好世界');
  });
});
