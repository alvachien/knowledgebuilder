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

import { AIService, AudioService, LearningRatingService } from '../../services';

import { TranslateExercisesReviewSessionComponent } from './translate-exercises-review-session.component';
import { TranslateReviewSessionStore } from './translate-exercises-review-session.store';

describe('TranslateExercisesReviewSessionComponent', () => {
  let component: TranslateExercisesReviewSessionComponent;
  let fixture: ComponentFixture<TranslateExercisesReviewSessionComponent>;
  let store: TranslateReviewSessionStore;

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
      imports: [TranslateExercisesReviewSessionComponent, NoopAnimationsModule],
      providers: [
        TranslateReviewSessionStore,
        { provide: AudioService, useValue: { playSound: vi.fn(), speakWord: vi.fn() } },
        { provide: AIService, useValue: { getTTS: vi.fn().mockReturnValue(of({ audioFileUrl: 'a.mp3' })) } },
        { provide: LearningRatingService, useValue: { getRatings: vi.fn().mockReturnValue(of([])), upsertRating: vi.fn() } },
        { provide: TranslocoService, useValue: mockTranslocoService },
        { provide: TRANSLOCO_TRANSPILER, useValue: {} },
        { provide: TRANSLOCO_MISSING_HANDLER, useValue: {} },
        { provide: TRANSLOCO_INTERCEPTOR, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TranslateExercisesReviewSessionComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(TranslateReviewSessionStore);
    store.start([{ ensent: 'Hello world', cnsent: '你好世界', rating: 0 }], true, 0);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the current sentence pair', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Hello world');
    expect(el.textContent).toContain('你好世界');
  });

  it('should advance on ArrowRight and quit on Escape (keyup)', () => {
    store.start(
      [{ ensent: 'a', cnsent: '甲', rating: 0 }, { ensent: 'b', cnsent: '乙', rating: 0 }],
      true,
      0
    );
    const quitSpy = vi.spyOn(component.quit, 'emit');

    component.handleKeyboardEvent(new KeyboardEvent('keyup', { key: 'ArrowRight' }));
    expect(store.cursor()).toBe(1);

    component.handleKeyboardEvent(new KeyboardEvent('keyup', { key: '3' }));
    expect(store.currentItem().rating).toBe(3);

    component.handleKeyboardEvent(new KeyboardEvent('keyup', { key: 'Escape' }));
    expect(quitSpy).toHaveBeenCalled();
  });
});
