import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { users } from '../test-data/users';

type Pages = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  /** An InventoryPage that is already logged in as standard_user. */
  loggedInInventory: InventoryPage;
};

// Custom fixtures: tests ask for what they need and Playwright builds it for them.
export const test = base.extend<Pages>({
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  inventoryPage: async ({ page }, use) => use(new InventoryPage(page)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
  checkoutPage: async ({ page }, use) => use(new CheckoutPage(page)),

  loggedInInventory: async ({ page }, use) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login(users.standard.username, users.standard.password);
    const inventory = new InventoryPage(page);
    await inventory.expectLoaded();
    await use(inventory);
  },
});

export { expect } from '@playwright/test';
