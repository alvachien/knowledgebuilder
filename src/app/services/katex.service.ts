import { Injectable } from '@angular/core';

// Type definitions for KaTeX
interface KatexModule {
  default: any;
  renderToString: (expression: string, options?: any) => string;
  renderMathInElement?: (element: HTMLElement, options?: any) => void;
}

interface AutoRenderModule {
  default?: (element: HTMLElement, options?: any) => void;
}

@Injectable({
  providedIn: 'root'
})
export class KatexService {
  private katexModule: KatexModule | null = null;
  private autoRenderModule: AutoRenderModule | null = null;
  private loadingPromise: Promise<KatexModule> | null = null;
  private autoRenderLoadingPromise: Promise<AutoRenderModule> | null = null;

  /**
   * Load KaTeX core module dynamically
   */
  async loadKatex(): Promise<KatexModule> {
    // Return cached module if already loaded
    if (this.katexModule) {
      return this.katexModule;
    }

    // Return existing loading promise if loading is in progress
    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    // Start loading KaTeX
    this.loadingPromise = (async () => {
      try {
        const katexImport = await import('katex');
        this.katexModule = katexImport as unknown as KatexModule;
        return this.katexModule;
      } catch (error) {
        console.error('Failed to load KaTeX module:', error);
        this.loadingPromise = null;
        throw error;
      }
    })();

    return this.loadingPromise;
  }

  /**
   * Load KaTeX auto-render module dynamically
   */
  async loadAutoRender(): Promise<AutoRenderModule> {
    // Return cached module if already loaded
    if (this.autoRenderModule) {
      return this.autoRenderModule;
    }

    // Return existing loading promise if loading is in progress
    if (this.autoRenderLoadingPromise) {
      return this.autoRenderLoadingPromise;
    }

    // Start loading auto-render
    this.autoRenderLoadingPromise = (async () => {
      try {
        const autoRenderImport = await import('katex/contrib/auto-render');
        this.autoRenderModule = autoRenderImport as unknown as AutoRenderModule;
        return this.autoRenderModule;
      } catch (error) {
        console.error('Failed to load KaTeX auto-render module:', error);
        this.autoRenderLoadingPromise = null;
        throw error;
      }
    })();

    return this.autoRenderLoadingPromise;
  }

  /**
   * Render math expression to HTML string
   */
  async renderToString(expression: string, options?: any): Promise<string> {
    const katex = await this.loadKatex();
    return katex.renderToString(expression, {
      throwOnError: false,
      ...options
    });
  }

  /**
   * Render math expressions in an HTML element
   */
  async renderMathInElement(element: HTMLElement, options?: any): Promise<void> {
    const autoRender = await this.loadAutoRender();
    
    // Check if auto-render function is available
    if (autoRender.default) {
      autoRender.default(element, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false },
          { left: '\\(', right: '\\)', display: false },
          { left: '\\[', right: '\\]', display: true }
        ],
        throwOnError: false,
        ...options
      });
    } else if ((window as any).renderMathInElement) {
      // Fallback to global renderMathInElement if available
      (window as any).renderMathInElement(element, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false },
          { left: '\\(', right: '\\)', display: false },
          { left: '\\[', right: '\\]', display: true }
        ],
        throwOnError: false,
        ...options
      });
    } else {
      console.error('KaTeX auto-render function not available');
    }
  }

  /**
   * Check if KaTeX is already loaded (useful for components that want to check before rendering)
   */
  isLoaded(): boolean {
    return !!this.katexModule;
  }

  /**
   * Get the loaded KaTeX module (throws if not loaded)
   */
  getKatexModule(): KatexModule {
    if (!this.katexModule) {
      throw new Error('KaTeX module not loaded. Call loadKatex() first.');
    }
    return this.katexModule;
  }
}