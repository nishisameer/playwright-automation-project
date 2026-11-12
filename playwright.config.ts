// =============================================================================
// Playwright configuration: which tests run, in which browsers, against which
// URLs, and what gets saved when something fails.
// URLs and credentials live in config/env.ts, not here.
// =============================================================================
import { defineConfig, devices } from '@playwright/test';
import { urls, isCI } from './config/env';

export default defineConfig({
  // --- Where tests live and how long they may take ---
  testDir: './tests',
  timeout: 30_000, // per test
  expect: { timeout: 5_000 }, // per assertion (assertions retry until this runs out)

  // --- Parallel runs and retries ---
  fullyParallel: true, // run test files and tests side by side
  forbidOnly: isCI, // fail CI if someone forgot a test.only
  retries: isCI ? 2 : 0, // retry flaky tests on CI only, so local failures show immediately
  workers: isCI ? 2 : undefined, // GitHub runners have 2 CPUs

  // --- Reports: console list, HTML for people, JUnit XML for CI dashboards ---
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],

  // --- Settings shared by every project below ---
  use: {
    testIdAttribute: 'data-test', // saucedemo uses data-test="...", so getByTestId() reads that
    trace: 'on-first-retry', // full step-by-step trace when a test is retried
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  // --- Projects: each one is a group of tests with its own settings ---
  projects: [
    // UI tests on saucedemo, in two browsers
    {
      name: 'chromium',
      testDir: './tests/ui',
      use: { ...devices['Desktop Chrome'], baseURL: urls.ui },
    },
    {
      name: 'firefox',
      testDir: './tests/ui',
      use: { ...devices['Desktop Firefox'], baseURL: urls.ui },
    },

    // API tests on restful-booker (no browser needed)
    {
      name: 'api',
      testDir: './tests/api',
      use: {
        baseURL: urls.api,
        extraHTTPHeaders: { Accept: 'application/json' },
      },
    },

    // Technique examples that run on a fake page served by page.route(), not on a real site.
    // One browser is enough for these.
    {
      name: 'examples',
      testDir: './tests/examples',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
