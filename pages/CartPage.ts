// =============================================================================
// Page object for the cart ( /cart.html ): the items in the cart and the
// button that starts checkout.
// =============================================================================
import { type Locator, type Page, expect } from '@playwright/test';

export class CartPage {
  readonly page: Page;
  readonly cartItems: Locator;
  readonly checkoutButton: Locator;
  readonly continueShoppingButton: Locator;

  // --- Locators ---
  constructor(page: Page) {
    this.page = page;
    this.cartItems = page.locator('.cart_item');
    this.checkoutButton = page.getByTestId('checkout');
    this.continueShoppingButton = page.getByTestId('continue-shopping');
  }

  // --- Checks ---
  async expectLoaded() {
    await expect(this.page).toHaveURL(/cart\.html/);
  }

  async expectItems(names: string[]) {
    await expect(this.cartItems).toHaveCount(names.length);
    for (const name of names) {
      await expect(this.cartItems.filter({ hasText: name })).toHaveCount(1);
    }
  }

  // --- Actions ---
  async checkout() {
    await this.checkoutButton.click();
  }
}
