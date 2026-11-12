// =============================================================================
// Login setup: runs ONCE before the UI tests in each browser.
//
// It logs in through the real login form and saves the browser's cookies and
// local storage to a file (storageState). The UI projects load that file, so
// every test starts already logged in, which saves a login per test.
// The login form itself is still tested in tests/ui/login.spec.ts.
// =============================================================================
import { test as setup } from '@playwright/test';
import { LoginPage } from '@pages/LoginPage';
import { InventoryPage } from '@pages/InventoryPage';
import { users } from '@test-data/users';
import { authStatePath } from '@config/env';

setup('log in as standard_user and save the session', async ({ page, browserName }) => {
  // --- Log in through the UI ---
  const login = new LoginPage(page);
  await login.goto();
  await login.login(users.standard.username, users.standard.password);
  await new InventoryPage(page).expectLoaded();

  // --- Save cookies + local storage for the UI projects to reuse ---
  await page.context().storageState({ path: authStatePath(browserName) });
});
