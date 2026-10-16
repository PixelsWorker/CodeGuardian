import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['dist/**', 'node_modules/**'],
    globalSetup: ['./tests/global-setup.ts'],
    testTimeout: 15_000,
  },
});
