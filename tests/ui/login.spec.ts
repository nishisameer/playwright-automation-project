// =============================================================================
// Login page tests on saucedemo: a good login, blocked and wrong users, and
// required-field validation.
// =============================================================================
import { test, expect } from '@fixtures/test-fixtures';
import { users, PASSWORD } from '@test-data/users';

// --- These tests need a logged-OUT browser, so ignore the saved session ---
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Login', () => {
  // --- Every test starts on the login page ---
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  // --- Happy path ---
  test('standard user can log in @smoke', async ({ loginPage, inventoryPage }) => {
    await loginPage.login(users.standard.username, users.standard.password);
    await inventoryPage.expectLoaded();
    await expect(inventoryPage.items).toHaveCount(6);
  });

  // --- Users who must NOT get in ---
  test('locked out user sees an error', async ({ loginPage }) => {
    await loginPage.login(users.lockedOut.username, users.lockedOut.password);
    await loginPage.expectError(/locked out/i);
  });

  test('invalid credentials are rejected', async ({ loginPage, page }) => {
    await loginPage.login(users.invalid.username, users.invalid.password);
    await loginPage.expectError(/do not match any user/i);
    await expect(page).not.toHaveURL(/inventory/);
  });

  // --- Required fields (data-driven) ---
  // Data-driven test: one test definition, several input combinations.
  const missingFields = [
    { case: 'empty username', username: '', password: PASSWORD, error: /username is required/i },
    { case: 'empty password', username: 'standard_user', password: '', error: /password is required/i },
  ];

  for (const data of missingFields) {
    test(`validation: ${data.case}`, async ({ loginPage }) => {
      await loginPage.login(data.username, data.password);
      await loginPage.expectError(data.error);
    });
  }
});
