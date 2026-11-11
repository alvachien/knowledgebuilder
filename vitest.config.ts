import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['src/**/*.spec.ts'],
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
    // GitHub-hosted runners saturate when many heavy Angular/jsdom fork
    // workers run concurrently: timer callbacks starve and timing-sensitive
    // specs blow their per-test timeout (PR #101 CI, 2026-11). Run serially
    // there (≈ the summed test time, ~4 min wall); keep full parallelism
    // locally where the machine is not the bottleneck.
    maxWorkers: process.env['CI'] ? 1 : undefined,
    testTimeout: 15_000,
    coverage: {
      reporter: ['text', 'html', 'lcovonly'],
    },
  },
  resolve: {
    mainFields: ['module', 'main'],
  },
});
