// =============================================================================
// Checkout tests on saucedemo: a full purchase from cart to "Thank you",
// and each required field of the form (scenarios in test-data/scenarios.ts).
// Uses test.step() so the report shows each stage of the purchase separately.
// =============================================================================
import { test, expect } from '@fixtures/test-fixtures';
import { customer } from '@test-data/users';
import { checkoutFormScenarios, products } from '@test-data/scenarios';

test.describe('Checkout (end-to-end)', () => {
  // --- Happy path: buy two items and check the total ---
  test('user can buy two items and the total is correct @smoke', async ({
    loggedInInventory,
    cartPage,
    checkoutPage,
  }) => {
    // Pick two items and remember their prices from the product list.
    const products = ['Sauce Labs Backpack', 'Sauce Labs Bolt T-Shirt'];
    let expectedTotal = 0;
    for (const name of products) {
      const priceText = await loggedInInventory.items
        .filter({ hasText: name })
        .locator('.inventory_item_price')
        .textContent();
      expectedTotal += Number(priceText!.replace('$', ''));
      await loggedInInventory.addToCart(name);
    }

    await test.step('review cart', async () => {
      await loggedInInventory.openCart();
      await cartPage.expectItems(products);
      await cartPage.checkout();
    });

    await test.step('enter customer details', async () => {
      await checkoutPage.fillInformation(customer);
    });

    await test.step('verify totals and finish', async () => {
      expect(await checkoutPage.getItemTotal()).toBeCloseTo(expectedTotal, 2);
      await checkoutPage.finish();
      await checkoutPage.expectOrderComplete();
    });
  });

  // --- Form validation (data-driven: one test per entry in checkoutFormScenarios) ---
  for (const scenario of checkoutFormScenarios) {
    test(`checkout form: ${scenario.name}`, async ({ loggedInInventory, cartPage, checkoutPage }) => {
      await loggedInInventory.addToCart(products.backpack);
      await loggedInInventory.openCart();
      await cartPage.checkout();

      await checkoutPage.fillInformation(scenario.customer);
      await expect(checkoutPage.errorMessage).toContainText(scenario.error);
    });
  }
});
