import 'zone.js';
import 'zone.js/testing';
import { TestBed } from '@angular/core/testing';
import {
  BrowserTestingModule,
  platformBrowserTesting,
} from '@angular/platform-browser/testing';
import { HighContrastModeDetector } from '@angular/cdk/a11y';

// Initialize the Angular test environment exactly once.
// Guard against NG0400 (already initialized).
try {
  TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting());
} catch {
  // Test environment already initialized — safe to ignore.
}

// ResizeObserver polyfill for jsdom (required by Angular Material)
if (typeof (globalThis as any).ResizeObserver === 'undefined') {
  (globalThis as any).ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// Stub KaTeX globals to prevent errors in jsdom
// The project uses KaTeX for math rendering; tests don't need real rendering.
(globalThis as any).katex = {
  render() {},
  renderToString() { return ''; },
};
(globalThis as any).renderMathInElement = function () {};

// MutationObserver polyfill for jsdom
if (typeof (globalThis as any).MutationObserver === 'undefined') {
  (globalThis as any).MutationObserver = class MutationObserver {
    observe() {}
    disconnect() {}
    takeRecords() { return []; }
  };
}

// URL.createObjectURL / revokeObjectURL polyfill for jsdom.
// jsdom does not implement object URLs. MarkdownContentComponent creates blob:
// URLs for authenticated images (fetched via HttpClient so the JWT is attached)
// and revokes them on re-render/destroy. Real browsers provide these natively.
const _URLCtor = (globalThis as any).URL;
if (_URLCtor && typeof _URLCtor.createObjectURL !== 'function') {
  let _blobCounter = 0;
  _URLCtor.createObjectURL = () => `blob:mock-${++_blobCounter}`;
  _URLCtor.revokeObjectURL = () => {};
}

// MediaQueryList polyfill for jsdom - jsdom does not implement window.matchMedia.
// Angular Material's mobileQuery requires both addEventListener and the deprecated addListener.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
  }),
});

// Stub Angular CDK HighContrastModeDetector.getHighContrastMode.
// In jsdom the detector's `createElement('div').style` can be undefined in some setups,
// causing `Cannot set properties of undefined (setting 'backgroundColor')` during A11yModule init.
// High-contrast detection is irrelevant in unit tests, so always return NONE.
const _detectorProto = (HighContrastModeDetector as any).prototype;
if (_detectorProto && !_detectorProto.__highContrastPatched) {
  _detectorProto.getHighContrastMode = function (): number {
    // HighContrastMode.NONE is the string 'none'-equivalent enum value (0).
    return 0;
  };
  _detectorProto.__highContrastPatched = true;
}
