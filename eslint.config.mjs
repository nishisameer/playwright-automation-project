// =============================================================================
// ESLint: finds bugs in the code before the tests run.
// The most important rule for Playwright is "no floating promises": a missing
// `await` makes a test pass or fail at random, and this catches it.
// Formatting (spaces, quotes) is left to Prettier.
// =============================================================================
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  // --- Folders that are generated, not written by us ---
  {
    ignores: [
      'node_modules/',
      'playwright-report/',
      'test-results/',
      'blob-report/',
      '.auth/',
      '.playwright-mcp/',
    ],
  },

  // --- Recommended JavaScript + TypeScript rules for every file ---
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // --- Rules that need type information (like spotting a missing await) ---
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: { parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname } },
    rules: {
      '@typescript-eslint/no-floating-promises': 'error', // missing await
      '@typescript-eslint/await-thenable': 'error', // await on something that isn't a promise
    },
  },

  // --- Playwright best practices, for Playwright tests only ---
  {
    files: ['tests/**/*.ts'],
    ...playwright.configs['flat/recommended'],
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      'playwright/no-conditional-in-test': 'off', // data-driven loops are on purpose
      // Page-object methods named expect...() contain the assertions, so count them as assertions.
      'playwright/expect-expect': ['warn', { assertFunctionPatterns: ['^expect[A-Z]'] }],
    },
  },

  // --- Turn off rules that would fight with Prettier's formatting ---
  prettier,
);
