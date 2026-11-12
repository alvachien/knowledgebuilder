import { defineConfig } from 'vitest/config';

// Loaded by the Angular unit-test builder via "runnerConfig" in angular.json
// (without that option the builder ignores this file entirely). The builder
// manages test discovery, setup files and the Angular plugin itself, so only
// runner-level options belong here — include/setupFiles/globals would be
// stripped with a warning or duplicated.
export default defineConfig({
  test: {
    environment: 'jsdom',
    // Heavy Angular/jsdom DOM specs can starve past Vitest's 5s default on
    // loaded CI runners; give them headroom (a real hang still fails).
    testTimeout: 15_000,
    // The builder runs files with isolate:false — spec files share one worker's
    // globals, so file order matters for cross-file state. Serial workers in CI
    // make runs deterministic (a state leak fails consistently instead of
    // flaking by worker assignment); locally keep full parallelism.
    maxWorkers: process.env['CI'] ? 1 : undefined,
    coverage: {
      reporter: ['text', 'html', 'lcovonly'],
    },
  },
});
