import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['src/**/*.spec.ts'],
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
    coverage: {
      reporter: ['text', 'html', 'lcovonly'],
    },
  },
  resolve: {
    mainFields: ['module', 'main'],
  },
});
