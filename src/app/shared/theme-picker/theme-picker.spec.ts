import { LiveAnnouncer } from '@angular/cdk/a11y';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { vi } from 'vitest';

import { StyleManager } from '../style-manager';

import { ThemePickerComponent } from './theme-picker';
import { ThemeStorage } from './theme-storage/theme-storage';

describe('ThemePickerComponent', () => {
  let component: ThemePickerComponent;
  let mockStyleManager: { setStyle: ReturnType<typeof vi.fn>; removeStyle: ReturnType<typeof vi.fn> };
  let mockThemeStorage: { getStoredThemeName: ReturnType<typeof vi.fn>; storeTheme: ReturnType<typeof vi.fn> };
  let mockLiveAnnouncer: { announce: ReturnType<typeof vi.fn> };
  let queryParamMapSubject: Subject<any>;

  beforeEach(() => {
    // Create spies
    mockStyleManager = { setStyle: vi.fn(), removeStyle: vi.fn() };
    mockThemeStorage = { getStoredThemeName: vi.fn(), storeTheme: vi.fn() };
    mockLiveAnnouncer = { announce: vi.fn() };

    // Create a Subject for queryParamMap to simulate route changes
    queryParamMapSubject = new Subject();

    // Default return value for getStoredThemeName (no stored theme)
    mockThemeStorage.getStoredThemeName.mockReturnValue(null);

    TestBed.configureTestingModule({
      imports: [ThemePickerComponent],
      providers: [
        { provide: StyleManager, useValue: mockStyleManager },
        { provide: ThemeStorage, useValue: mockThemeStorage },
        { provide: LiveAnnouncer, useValue: mockLiveAnnouncer },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: queryParamMapSubject.asObservable(),
          },
        },
      ],
    });

    // Create component instance
    component = TestBed.createComponent(ThemePickerComponent).componentInstance;
  });

  it('should have correct themes array', () => {
    expect(component.themes.length).toBe(4);

    const roseRedTheme = component.themes[0];
    expect(roseRedTheme.name).toBe('rose-red');
    expect(roseRedTheme.displayName).toBe('Rose & Red');
    expect(roseRedTheme.color).toBe('#ffd9e1');
    expect(roseRedTheme.background).toBe('#fffbff');
    expect(roseRedTheme.isDefault).toBeUndefined();

    const azureBlueTheme = component.themes[1];
    expect(azureBlueTheme.name).toBe('azure-blue');
    expect(azureBlueTheme.displayName).toBe('Azure & Blue');
    expect(azureBlueTheme.color).toBe('#d7e3ff');
    expect(azureBlueTheme.background).toBe('#fdfbff');
    expect(azureBlueTheme.isDefault).toBe(true);

    const sunshineCoralTheme = component.themes[2];
    expect(sunshineCoralTheme.name).toBe('sunshine-coral');
    expect(sunshineCoralTheme.displayName).toBe('Sunshine & Coral');
    expect(sunshineCoralTheme.color).toBe('#ffd700');
    expect(sunshineCoralTheme.background).toBe('#fff8f0');

    const forestGreenTheme = component.themes[3];
    expect(forestGreenTheme.name).toBe('forest-green');
    expect(forestGreenTheme.displayName).toBe('Forest & Green');
    expect(forestGreenTheme.color).toBe('#b8e6c1');
    expect(forestGreenTheme.background).toBe('#f5fff7');
  });

  describe('selectTheme', () => {
    beforeEach(() => {
      // Reset spy call counts before each test
      mockStyleManager.setStyle.mockClear();
      mockStyleManager.removeStyle.mockClear();
      mockLiveAnnouncer.announce.mockClear();
      mockThemeStorage.storeTheme.mockClear();
    });

    it('should select existing theme by name and set style', () => {
      component.selectTheme('rose-red');

      expect(mockStyleManager.setStyle).toHaveBeenCalledWith('theme', 'rose-red.css');
      expect(component.currentTheme?.name).toBe('rose-red');
      expect(mockLiveAnnouncer.announce).toHaveBeenCalledWith(
        'Rose & Red theme selected.',
        'polite',
        3000
      );
      expect(mockThemeStorage.storeTheme).toHaveBeenCalledWith(component.currentTheme!);
    });

    it('should select existing theme by name and remove style for default theme', () => {
      component.selectTheme('azure-blue');

      expect(mockStyleManager.removeStyle).toHaveBeenCalledWith('theme');
      expect(component.currentTheme?.name).toBe('azure-blue');
      expect(component.currentTheme?.isDefault).toBe(true);
      expect(mockLiveAnnouncer.announce).toHaveBeenCalledWith(
        'Azure & Blue theme selected.',
        'polite',
        3000
      );
      expect(mockThemeStorage.storeTheme).toHaveBeenCalledWith(component.currentTheme!);
    });

    it('should select default theme when theme not found', () => {
      component.selectTheme('non-existent-theme');

      expect(mockStyleManager.removeStyle).toHaveBeenCalledWith('theme');
      expect(component.currentTheme?.name).toBe('azure-blue');
      expect(component.currentTheme?.isDefault).toBe(true);
      expect(mockLiveAnnouncer.announce).toHaveBeenCalledWith(
        'Azure & Blue theme selected.',
        'polite',
        3000
      );
      expect(mockThemeStorage.storeTheme).toHaveBeenCalledWith(component.currentTheme!);
    });

    it('should handle sunshine-coral theme selection', () => {
      component.selectTheme('sunshine-coral');

      expect(mockStyleManager.setStyle).toHaveBeenCalledWith('theme', 'sunshine-coral.css');
      expect(component.currentTheme?.name).toBe('sunshine-coral');
      expect(mockLiveAnnouncer.announce).toHaveBeenCalledWith(
        'Sunshine & Coral theme selected.',
        'polite',
        3000
      );
      expect(mockThemeStorage.storeTheme).toHaveBeenCalledWith(component.currentTheme!);
    });

    it('should handle forest-green theme selection', () => {
      component.selectTheme('forest-green');

      expect(mockStyleManager.setStyle).toHaveBeenCalledWith('theme', 'forest-green.css');
      expect(component.currentTheme?.name).toBe('forest-green');
      expect(mockLiveAnnouncer.announce).toHaveBeenCalledWith(
        'Forest & Green theme selected.',
        'polite',
        3000
      );
      expect(mockThemeStorage.storeTheme).toHaveBeenCalledWith(component.currentTheme!);
    });
  });

  describe('initialization', () => {
    it('should initialize with stored theme from localStorage', () => {
      mockThemeStorage.getStoredThemeName.mockReturnValue('rose-red');

      // Create a new component with stored theme
      const newComponent = TestBed.createComponent(ThemePickerComponent).componentInstance;

      expect(mockThemeStorage.getStoredThemeName).toHaveBeenCalled();
      expect(mockStyleManager.setStyle).toHaveBeenCalledWith('theme', 'rose-red.css');
      expect(newComponent.currentTheme?.name).toBe('rose-red');
    });

    it('should initialize with default theme when no stored theme', () => {
      mockThemeStorage.getStoredThemeName.mockReturnValue(null);

      // Create a new component without stored theme
      const newComponent = TestBed.createComponent(ThemePickerComponent).componentInstance;

      expect(mockThemeStorage.getStoredThemeName).toHaveBeenCalled();
      expect(mockStyleManager.removeStyle).toHaveBeenCalledWith('theme');
      expect(newComponent.currentTheme?.name).toBe('azure-blue');
    });
  });

  it('should unsubscribe on destroy', () => {
    const unsubscribeSpy = vi.fn();
    component['_queryParamSubscription'] = { unsubscribe: unsubscribeSpy } as any;

    component.ngOnDestroy();

    expect(unsubscribeSpy).toHaveBeenCalled();
  });

  it('should initialize query param subscription on init', () => {
    component.ngOnInit();

    queryParamMapSubject.next({
      get: (key: string) => (key === 'theme' ? 'rose-red' : null),
    });

    expect(component.currentTheme?.name).toBe('rose-red');
  });
});
