// =============================================================================
// Vitest configuration: fast tests that run in Node, without a real browser.
//   component-tests/  React components rendered in a fake page (jsdom)
//   ai-eval/          the AI evaluation example (plain functions)
// Playwright runs everything in tests/; Vitest runs everything here.
// =============================================================================
import { defineConfig } from 'vitest/config';

export default defineConfig({
  esbuild: { jsx: 'automatic' }, // React JSX without importing React in every file
  test: {
    // --- Which files are Vitest tests ---
    include: ['component-tests/**/*.test.{ts,tsx}', 'ai-eval/**/*.test.ts'],

    // --- A fake browser page in Node, so components can render ---
    environment: 'jsdom',
    setupFiles: ['./component-tests/setup.ts'],

    // --- Reports: console output, plus JUnit XML for CI ---
    reporters: ['default', 'junit'],
    outputFile: { junit: 'test-results/vitest-junit.xml' },
  },
});
