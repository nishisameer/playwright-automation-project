// =============================================================================
// Custom fixtures: tests ask for what they need by name, and Playwright
// builds it before the test and cleans it up after.
//
//   test('...', async ({ loginPage, loggedInInventory }) => { ... })
//
// Import { test, expect } from here instead of '@playwright/test'.
// =============================================================================
import { test as base } from '@playwright/test';
import { LoginPage } from '@pages/LoginPage';
import { InventoryPage } from '@pages/InventoryPage';
import { CartPage } from '@pages/CartPage';
import { CheckoutPage } from '@pages/CheckoutPage';
import { users } from '@test-data/users';

// --- The names tests can ask for, and their types ---
type Pages = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  /** The product list, logged in as standard_user. */
  loggedInInventory: InventoryPage;
};

export const test = base.extend<Pages>({
  // --- Page objects: just wrap the page the test already has ---
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  inventoryPage: async ({ page }, use) => use(new InventoryPage(page)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
  checkoutPage: async ({ page }, use) => use(new CheckoutPage(page)),

  // --- Logged-in product list ---
  // Usually the saved session (tests/setup/auth.setup.ts) means we're already logged in,
  // so this just opens the page. If not (for example, a spec that resets the session),
  // it falls back to logging in through the form, so the fixture always works.
  loggedInInventory: async ({ page }, use) => {
    const login = new LoginPage(page);
    const inventory = new InventoryPage(page);

    await page.goto('/inventory.html');
    // Wait for whichever page shows up: the products, or the login form.
    await inventory.title.or(login.loginButton).first().waitFor();

    if (await login.loginButton.isVisible()) {
      await login.login(users.standard.username, users.standard.password);
    }
    await inventory.expectLoaded();
    await use(inventory);
  },
});

export { expect } from '@playwright/test';
