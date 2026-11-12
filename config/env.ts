// =============================================================================
// Environment settings: the ONE place for URLs and credentials.
//
// Values come from environment variables first (a local .env file, or GitHub
// Secrets in CI). The fallbacks are the public demo values that saucedemo.com
// and restful-booker publish, so the project runs out of the box.
// In a real project there would be no fallback for passwords.
// =============================================================================
import { existsSync } from 'node:fs';

// --- Load a local .env file if there is one (Node 20.12+ has this built in) ---
if (existsSync('.env')) {
  process.loadEnvFile('.env');
}

// Note: '||' (not '??') so an empty value, like an unset GitHub Secret, also uses the default.

// --- Where the apps under test live ---
export const urls = {
  ui: process.env.UI_BASE_URL || 'https://www.saucedemo.com',
  api: process.env.API_BASE_URL || 'https://restful-booker.herokuapp.com',
};

// --- Login details ---
export const credentials = {
  /** Shared password for every saucedemo user. */
  saucePassword: process.env.SAUCE_PASSWORD || 'secret_sauce',
  /** Admin account that restful-booker uses to create auth tokens. */
  apiUsername: process.env.API_USERNAME || 'admin',
  apiPassword: process.env.API_PASSWORD || 'password123',
};

// --- Saved login (see tests/setup/auth.setup.ts) ---
// The setup project logs in once per browser and saves the cookies here,
// so UI tests can start already logged in instead of filling the login form.
export const authStatePath = (browser: string) => `.auth/standard-user-${browser}.json`;

// --- Are we running in CI (GitHub Actions sets CI=true)? ---
export const isCI = !!process.env.CI;
