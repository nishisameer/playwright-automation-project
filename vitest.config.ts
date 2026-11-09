import { defineConfig } from 'vitest/config';

// Vitest runs the component tests in src/ (Playwright runs the tests in tests/).
export default defineConfig({
  esbuild: { jsx: 'automatic' }, // React JSX without importing React in every file
  test: {
    environment: 'jsdom', // a fake browser page in Node, so components can render
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['./vitest.setup.ts'],
    reporters: ['default', 'junit'],
    outputFile: { junit: 'test-results/vitest-junit.xml' },
  },
});
