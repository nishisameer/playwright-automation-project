import { test, expect } from '../../fixtures/test-fixtures';

test.describe('Inventory & cart', () => {
  test('sort by price low to high', async ({ loggedInInventory }) => {
    await loggedInInventory.sortBy('lohi');
    const prices = await loggedInInventory.getPrices();
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  test('sort by name Z to A', async ({ loggedInInventory }) => {
    await loggedInInventory.sortBy('za');
    const names = await loggedInInventory.getNames();
    expect(names).toEqual([...names].sort().reverse());
  });

  test('adding and removing items updates the cart badge @smoke', async ({ loggedInInventory }) => {
    await loggedInInventory.addToCart('Sauce Labs Backpack');
    await loggedInInventory.addToCart('Sauce Labs Bike Light');
    await expect(loggedInInventory.cartBadge).toHaveText('2');

    await loggedInInventory.removeFromCart('Sauce Labs Backpack');
    await expect(loggedInInventory.cartBadge).toHaveText('1');

    await loggedInInventory.removeFromCart('Sauce Labs Bike Light');
    await expect(loggedInInventory.cartBadge).toBeHidden();
  });

  test('cart keeps the items that were added', async ({ loggedInInventory, cartPage }) => {
    await loggedInInventory.addToCart('Sauce Labs Onesie');
    await loggedInInventory.addToCart('Sauce Labs Fleece Jacket');
    await loggedInInventory.openCart();

    await cartPage.expectLoaded();
    await cartPage.expectItems(['Sauce Labs Onesie', 'Sauce Labs Fleece Jacket']);
  });
});
