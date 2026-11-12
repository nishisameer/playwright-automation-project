import { test, expect } from '@fixtures/test-fixtures';
import { users, PASSWORD } from '@test-data/users';

// =============================================================================
// UI security checks on saucedemo. These are not penetration tests; they
// catch common, easy-to-miss mistakes in access control and the login form.
// Run only these with: npm run test:security
// =============================================================================

// --- These tests need a logged-OUT browser, so ignore the saved session ---
test.use({ storageState: { cookies: [], origins: [] } });

// --- Expected error messages ---
const notLoggedInError = /you can only access .* when you are logged in/i;
const badLoginError = /do not match any user/i;

// --- Access control: who can open which page ---
test.describe('Security: access control @security', () => {
  // Pages that should never open without logging in first.
  const protectedPages = [
    '/inventory.html',
    '/cart.html',
    '/checkout-step-one.html',
    '/checkout-complete.html',
  ];

  for (const path of protectedPages) {
    test(`${path} is blocked when not logged in`, async ({ page, loginPage }) => {
      await page.goto(path);
      await expect(page).not.toHaveURL(new RegExp(path.replace('.', '\\.')));
      await loginPage.expectError(notLoggedInError);
    });
  }

  test('protected pages are blocked again after logout', async ({ page, loggedInInventory, loginPage }) => {
    await loggedInInventory.logout();
    await expect(loginPage.loginButton).toBeVisible();

    // Trying to jump straight back in should fail.
    await page.goto('/inventory.html');
    await loginPage.expectError(notLoggedInError);
  });

  test('deleting the session cookie logs the user out', async ({
    page,
    context,
    loggedInInventory,
    loginPage,
  }) => {
    await expect(loggedInInventory.items).toHaveCount(6);

    await context.clearCookies();
    await page.goto('/inventory.html');
    await loginPage.expectError(notLoggedInError);
  });
});

// --- Login form: what it reveals and what input it accepts ---
test.describe('Security: login page @security', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('password field hides what is typed', async ({ loginPage }) => {
    await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');
  });

  test('wrong username and wrong password show the same error (no user enumeration)', async ({
    loginPage,
  }) => {
    // Real user, wrong password: remember the exact message
    await loginPage.login(users.standard.username, 'wrong_password');
    await loginPage.expectError(badLoginError);
    const wrongPasswordMessage = await loginPage.errorMessage.innerText();

    // Fake user, real password: must show the same message, word for word.
    // If these differed, an attacker could find out which usernames exist.
    await loginPage.goto();
    await loginPage.login('no_such_user', PASSWORD);
    await expect(loginPage.errorMessage).toHaveText(wrongPasswordMessage);
  });

  test('password never appears in the URL after logging in', async ({ page, loginPage, inventoryPage }) => {
    await loginPage.login(users.standard.username, users.standard.password);
    await inventoryPage.expectLoaded();
    expect(page.url()).not.toContain(users.standard.password);
  });

  const sqlInjection = ["' OR '1'='1", "admin'--", "' OR 1=1; --"];

  for (const payload of sqlInjection) {
    test(`SQL injection is rejected: ${payload}`, async ({ page, loginPage }) => {
      await loginPage.login(payload, payload);
      await loginPage.expectError(badLoginError);
      await expect(page).not.toHaveURL(/inventory/);
    });
  }

  test('script typed into the login form is not run (XSS)', async ({ page, loginPage }) => {
    // Fail the test if any alert/confirm/prompt pops up.
    let dialogShown = false;
    page.on('dialog', async (dialog) => {
      dialogShown = true;
      await dialog.dismiss();
    });

    const payloads = ['<script>alert("xss")</script>', '<img src=x onerror="window.__xss=true">'];

    for (const payload of payloads) {
      await loginPage.login(payload, payload);
      await loginPage.expectError(badLoginError);
    }

    expect(dialogShown).toBe(false);
    expect(await page.evaluate(() => (window as unknown as { __xss?: boolean }).__xss)).toBeUndefined();
  });
});
