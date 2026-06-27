import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { KatexService } from './katex.service';

describe('KatexService', () => {
  let service: KatexService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KatexService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('isLoaded', () => {
    it('should return false before loading', () => {
      expect(service.isLoaded()).toBe(false);
    });

    it('should return true after loading', () => {
      // Mock the katex module
      Object.defineProperty(service, 'katexModule', {
        value: { renderToString: () => '', default: {} },
        writable: true,
      });

      expect(service.isLoaded()).toBe(true);
    });
  });

  describe('getKatexModule', () => {
    it('should throw error if not loaded', () => {
      expect(() => service.getKatexModule()).toThrowError(
        'KaTeX module not loaded. Call loadKatex() first.'
      );
    });

    it('should return module if loaded', () => {
      const mockModule = { renderToString: () => 'mock', default: {} };
      Object.defineProperty(service, 'katexModule', { value: mockModule, writable: true });

      expect(service.getKatexModule()).toBe(mockModule);
    });
  });

  describe('loadKatex', () => {
    beforeEach(() => {
      // Reset the promise cache to avoid conflicts between tests
      Object.defineProperty(service, 'loadingPromise', { value: null, writable: true });
      Object.defineProperty(service, 'katexModule', { value: null, writable: true });
    });

    it('should return cached module if already loaded', async () => {
      const mockModule: any = { default: {}, renderToString: () => 'cached' };
      Object.defineProperty(service, 'katexModule', { value: mockModule, writable: true });

      const result = await service.loadKatex();

      expect(result).toBe(mockModule);
    });

    it('should return existing loading promise if loading is in progress', async () => {
      const mockModule: any = { default: {}, renderToString: () => 'loading' };
      const mockPromise = Promise.resolve(mockModule);
      Object.defineProperty(service, 'loadingPromise', { value: mockPromise, writable: true });

      const result = await service.loadKatex();

      expect(result).toEqual(mockModule);
    });
  });

  describe('loadAutoRender', () => {
    beforeEach(() => {
      // Reset the promise cache to avoid conflicts between tests
      Object.defineProperty(service, 'autoRenderLoadingPromise', { value: null, writable: true });
      Object.defineProperty(service, 'autoRenderModule', { value: null, writable: true });
    });

    it('should return cached module if already loaded', async () => {
      const mockModule: any = { default: () => {} };
      Object.defineProperty(service, 'autoRenderModule', { value: mockModule, writable: true });

      const result = await service.loadAutoRender();

      expect(result).toBe(mockModule);
    });

    it('should return existing loading promise if loading is in progress', async () => {
      const mockModule: any = { default: () => {} };
      const mockPromise = Promise.resolve(mockModule);
      Object.defineProperty(service, 'autoRenderLoadingPromise', {
        value: mockPromise,
        writable: true,
      });

      const result = await service.loadAutoRender();

      expect(result).toEqual(mockModule);
    });
  });

  describe('renderToString', () => {
    it('should render to string with options', async () => {
      const mockKatexModule = {
        renderToString: vi.fn().mockReturnValue('rendered'),
        default: {},
      };
      Object.defineProperty(service, 'katexModule', { value: mockKatexModule, writable: true });

      const result = await service.renderToString('x^2', { displayMode: true });

      expect(mockKatexModule.renderToString).toHaveBeenCalledWith('x^2', {
        throwOnError: false,
        displayMode: true,
      });
      expect(result).toBe('rendered');
    });

    it('should load katex if not loaded before rendering', async () => {
      const mockModule = {
        renderToString: vi.fn().mockReturnValue('rendered'),
        default: {},
      };

      // Temporarily override loadKatex to return our mock
      vi.spyOn(service, 'loadKatex').mockReturnValue(Promise.resolve(mockModule));

      const result = await service.renderToString('x^2');

      expect(service.loadKatex).toHaveBeenCalled();
      expect(mockModule.renderToString).toHaveBeenCalledWith('x^2', {
        throwOnError: false,
      });
      expect(result).toBe('rendered');
    });
  });

  describe('renderMathInElement', () => {
    it('should render math with auto-render function when available', async () => {
      const mockElement = document.createElement('div');
      const mockAutoRenderModule = {
        default: vi.fn(),
      };
      Object.defineProperty(service, 'autoRenderModule', {
        value: mockAutoRenderModule,
        writable: true,
      });

      await service.renderMathInElement(mockElement, { macros: { '\\R': '\\mathbb{R}' } });

      expect(mockAutoRenderModule.default).toHaveBeenCalledWith(mockElement, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false },
          { left: '\\(', right: '\\)', display: false },
          { left: '\\[', right: '\\]', display: true },
        ],
        throwOnError: false,
        macros: { '\\R': '\\mathbb{R}' },
      });
    });

    it('should use fallback global renderMathInElement when auto-render function is not available', async () => {
      const mockElement = document.createElement('div');
      const mockGlobalFunction = vi.fn();
      (window as any).renderMathInElement = mockGlobalFunction;

      const mockAutoRenderModule = { default: undefined };
      Object.defineProperty(service, 'autoRenderModule', {
        value: mockAutoRenderModule,
        writable: true,
      });

      await service.renderMathInElement(mockElement);

      expect(mockGlobalFunction).toHaveBeenCalledWith(mockElement, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false },
          { left: '\\(', right: '\\)', display: false },
          { left: '\\[', right: '\\]', display: true },
        ],
        throwOnError: false,
      });

      delete (window as any).renderMathInElement;
    });

    it('should log error when no render function is available', async () => {
      const mockElement = document.createElement('div');
      const mockAutoRenderModule = { default: undefined };
      Object.defineProperty(service, 'autoRenderModule', {
        value: mockAutoRenderModule,
        writable: true,
      });

      // Remove any fallback function
      const originalRenderMathInElement = (window as any).renderMathInElement;
      delete (window as any).renderMathInElement;

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await service.renderMathInElement(mockElement);

      expect(consoleSpy).toHaveBeenCalledWith('KaTeX auto-render function not available');

      // Restore original function
      if (originalRenderMathInElement) {
        (window as any).renderMathInElement = originalRenderMathInElement;
      }
    });

    it('should load auto-render if not loaded before rendering', async () => {
      const mockElement = document.createElement('div');
      const mockModule = {
        default: vi.fn(),
      };

      // Temporarily override loadAutoRender to return our mock
      vi.spyOn(service, 'loadAutoRender').mockReturnValue(Promise.resolve(mockModule));

      await service.renderMathInElement(mockElement);

      expect(service.loadAutoRender).toHaveBeenCalled();
      expect(mockModule.default).toHaveBeenCalledWith(mockElement, expect.any(Object));
    });
  });
});
