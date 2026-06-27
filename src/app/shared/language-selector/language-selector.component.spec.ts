import { LiveAnnouncer } from '@angular/cdk/a11y';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { vi } from 'vitest';

import { LanguageSelectorComponent } from './';

describe('LanguageSelectorComponent', () => {
  let component: LanguageSelectorComponent;
  let fixture: ComponentFixture<LanguageSelectorComponent>;
  let mockTranslocoService: { getActiveLang: ReturnType<typeof vi.fn>; setActiveLang: ReturnType<typeof vi.fn> };
  let mockLiveAnnouncer: { announce: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    const translocoSpy = { getActiveLang: vi.fn(), setActiveLang: vi.fn() };
    const announcerSpy = { announce: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [LanguageSelectorComponent, TranslocoModule],
      providers: [
        { provide: TranslocoService, useValue: translocoSpy },
        { provide: LiveAnnouncer, useValue: announcerSpy },
      ],
    }).compileComponents();

    mockTranslocoService = TestBed.inject(TranslocoService) as any;
    mockLiveAnnouncer = TestBed.inject(LiveAnnouncer) as any;
    mockTranslocoService.getActiveLang.mockReturnValue('en');
    mockLiveAnnouncer.announce.mockReturnValue(Promise.resolve());
  });

  beforeEach(() => {
    localStorage.clear();
    fixture = TestBed.createComponent(LanguageSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize with active language from service', () => {
      mockTranslocoService.getActiveLang.mockReturnValue('zh-CN');
      const newFixture = TestBed.createComponent(LanguageSelectorComponent);
      const newComponent = newFixture.componentInstance;

      expect(newComponent.currentLanguage).toBe('zh-CN');
    });

    it('should load saved language preference from localStorage on init', () => {
      localStorage.setItem('selectedLanguage', 'zh-CN');
      const newFixture = TestBed.createComponent(LanguageSelectorComponent);
      const newComponent = newFixture.componentInstance;

      newComponent.ngOnInit();

      expect(mockTranslocoService.setActiveLang).toHaveBeenCalledWith('zh-CN');
      expect(newComponent.currentLanguage).toBe('zh-CN');
    });

    it('should NOT load saved language if it is not in availableLanguages', () => {
      localStorage.setItem('selectedLanguage', 'fr');
      mockTranslocoService.getActiveLang.mockReturnValue('en');
      const newFixture = TestBed.createComponent(LanguageSelectorComponent);
      const newComponent = newFixture.componentInstance;

      newComponent.ngOnInit();

      expect(mockTranslocoService.setActiveLang).not.toHaveBeenCalled();
      expect(newComponent.currentLanguage).toBe('en');
    });

    it('should handle no saved language preference', () => {
      mockTranslocoService.getActiveLang.mockReturnValue('en');
      const newFixture = TestBed.createComponent(LanguageSelectorComponent);
      const newComponent = newFixture.componentInstance;

      newComponent.ngOnInit();

      expect(newComponent.currentLanguage).toBe('en');
    });
  });

  describe('Language Switching', () => {
    it('should switch to Chinese language', () => {
      component.switchLanguage('zh-CN');

      expect(mockTranslocoService.setActiveLang).toHaveBeenCalledWith('zh-CN');
      expect(component.currentLanguage).toBe('zh-CN');
    });

    it('should switch to English language', () => {
      component.switchLanguage('en');

      expect(mockTranslocoService.setActiveLang).toHaveBeenCalledWith('en');
      expect(component.currentLanguage).toBe('en');
    });

    it('should save language preference to localStorage', () => {
      component.switchLanguage('zh-CN');

      expect(localStorage.getItem('selectedLanguage')).toBe('zh-CN');
    });

    it('should announce language change for accessibility with language name', () => {
      component.switchLanguage('zh-CN');

      expect(mockLiveAnnouncer.announce).toHaveBeenCalledWith(
        'Language changed to 中文',
        'polite',
        3000
      );
    });

    it('should announce language change for English with language name', () => {
      component.switchLanguage('en');

      expect(mockLiveAnnouncer.announce).toHaveBeenCalledWith(
        'Language changed to English',
        'polite',
        3000
      );
    });

    it('should use language code when language name not found', () => {
      component.switchLanguage('unknown-lang');

      expect(mockLiveAnnouncer.announce).toHaveBeenCalledWith(
        'Language changed to unknown-lang',
        'polite',
        3000
      );
    });
  });

  describe('Available Languages', () => {
    it('should have English and Chinese in available languages', () => {
      expect(component.availableLanguages).toEqual([
        { code: 'en', name: 'English' },
        { code: 'zh-CN', name: '中文' },
      ]);
    });

    it('should have exactly 2 languages available', () => {
      expect(component.availableLanguages.length).toBe(2);
    });
  });
});
