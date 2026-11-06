import { test, expect } from '../../fixtures/test-fixtures';

test.describe('Inventory & cart', () => {
  test('sort by price low to high', async ({ loggedInInventory }) => {
    await loggedInInventory.sortBy('lohi');
    const prices = await loggedInInventory.getPrices();
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  test('sort by price high to low', async ({ loggedInInventory }) => {
    await loggedInInventory.sortBy('hilo');
    const prices = await loggedInInventory.getPrices();
    expect(prices).toEqual([...prices].sort((a, b) => b - a));
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

    test('adding and removing random items updates the cart badge @smoke', async ({ loggedInInventory }) => {
    const firstItem = await loggedInInventory.addRandomToCart();
    const secondItem = await loggedInInventory.addRandomToCart();
    await expect(loggedInInventory.cartBadge).toHaveText('2');

    await loggedInInventory.removeFromCart(firstItem);
    await expect(loggedInInventory.cartBadge).toHaveText('1');

    await loggedInInventory.removeFromCart(secondItem);
    await expect(loggedInInventory.cartBadge).toBeHidden();
  });

  test('cart keeps the items that were added', async ({ loggedInInventory, cartPage }) => {
    await loggedInInventory.addToCart('Sauce Labs Onesie');
    await loggedInInventory.addToCart('Sauce Labs Fleece Jacket');
    await loggedInInventory.openCart();

    await cartPage.expectLoaded();
    await cartPage.expectItems(['Sauce Labs Onesie', 'Sauce Labs Fleece Jacket']);
  });

  test('every product shows a name, price and add button', async ({ loggedInInventory }) => {
    await expect(loggedInInventory.items).toHaveCount(6);

    for (const card of await loggedInInventory.items.all()) {
      await expect(card.locator('.inventory_item_name')).not.toBeEmpty();
      await expect(card.locator('.inventory_item_price')).toHaveText(/^\$\d+\.\d{2}$/);
      await expect(card.getByRole('button', { name: /add to cart/i })).toBeVisible();
    }
  });

  test('adding every product puts all of them in the cart', async ({ loggedInInventory, cartPage }) => {
    const names = await loggedInInventory.getNames();
    for (const name of names) {
      await loggedInInventory.addToCart(name);
    }
    await expect(loggedInInventory.cartBadge).toHaveText(String(names.length));

    await loggedInInventory.openCart();
    await cartPage.expectItems(names);
  });
});
