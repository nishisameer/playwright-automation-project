import { test, expect } from '../../fixtures/test-fixtures';
import { customer } from '../../test-data/users';

test.describe('Checkout (end-to-end)', () => {
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

  test('checkout requires a first name', async ({ loggedInInventory, cartPage, checkoutPage }) => {
    await loggedInInventory.addToCart('Sauce Labs Backpack');
    await loggedInInventory.openCart();
    await cartPage.checkout();

    await checkoutPage.fillInformation({ ...customer, firstName: '' });
    await expect(checkoutPage.errorMessage).toContainText(/first name is required/i);
  });
});
