import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: { timeout: 5_000 },

  // Run test files in parallel; fail the build if someone leaves test.only in the code.
  fullyParallel: true,
  forbidOnly: isCI,

  // Retry flaky tests on CI only, so local failures show up immediately.
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,

  // Reports: list in the console, HTML for humans, JUnit XML for CI dashboards.
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],

  use: {
    // saucedemo.com marks elements with data-test="...", so getByTestId() uses that.
    testIdAttribute: 'data-test',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      testDir: './tests/ui',
      use: { ...devices['Desktop Chrome'], baseURL: process.env.UI_BASE_URL ?? 'https://www.saucedemo.com' },
    },
    {
      name: 'firefox',
      testDir: './tests/ui',
      use: { ...devices['Desktop Firefox'], baseURL: process.env.UI_BASE_URL ?? 'https://www.saucedemo.com' },
    },
    {
      name: 'api',
      testDir: './tests/api',
      use: {
        baseURL: process.env.API_BASE_URL ?? 'https://restful-booker.herokuapp.com',
        extraHTTPHeaders: { Accept: 'application/json' },
      },
    },
  ],
});
