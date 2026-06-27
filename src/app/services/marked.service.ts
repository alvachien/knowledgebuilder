import { Injectable } from '@angular/core';
import type { MarkedExtension, MarkedOptions } from 'marked';
import { Marked } from 'marked';

@Injectable({
  providedIn: 'root'
})
export class MarkedService {
  private markedInstance: Marked | null = null;
  private defaultOptions: MarkedOptions = {
    gfm: true,
    breaks: true,
  };

  /**
   * Get or create the singleton Marked instance (for simple parsing without extensions).
   */
  getInstance(): Marked {
    if (!this.markedInstance) {
      this.markedInstance = new Marked();
      this.markedInstance.setOptions(this.defaultOptions);
    }
    return this.markedInstance;
  }

  /**
   * Parse markdown text to HTML using the shared instance (no extensions).
   */
  parse(markdown: string): string {
    const instance = this.getInstance();
    return instance.parse(markdown) as string;
  }

  /**
   * Parse markdown text to HTML asynchronously
   */
  async parseAsync(markdown: string): Promise<string> {
    const instance = this.getInstance();
    return instance.parse(markdown) as string;
  }

  /**
   * Parse markdown with additional extensions applied to a FRESH instance.
   * This does NOT mutate the shared singleton — safe for concurrent use by
   * multiple components with different extension sets.
   */
  parseWithExtensions(markdown: string, extensions: MarkedExtension[]): string {
    const localInstance = new Marked();
    localInstance.setOptions(this.defaultOptions);
    for (const ext of extensions) {
      localInstance.use(ext);
    }
    return localInstance.parse(markdown) as string;
  }

  /**
   * Apply extensions to the shared Marked instance (legacy — prefer `parseWithExtensions`).
   */
  use(extension: MarkedExtension): void {
    const instance = this.getInstance();
    instance.use(extension);
  }

  /**
   * Clear all extensions from the shared Marked instance (legacy — prefer `parseWithExtensions`).
   */
  clearExtensions(): void {
    // Create a new instance to clear extensions
    this.markedInstance = new Marked();
    this.markedInstance.setOptions(this.defaultOptions);
  }

  /**
   * Set options for the shared Marked instance
   */
  setOptions(options: MarkedOptions): void {
    const instance = this.getInstance();
    instance.setOptions(options);
  }

  /**
   * Check if Marked instance is already created
   */
  isInitialized(): boolean {
    return !!this.markedInstance;
  }
}