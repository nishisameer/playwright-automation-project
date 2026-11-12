// =============================================================================
// Cart tests, data-driven: one test per entry in cartScenarios
// (test-data/scenarios.ts). To test another combination of products,
// add an entry there; no new test code is needed.
// =============================================================================
import { test, expect } from '@fixtures/test-fixtures';
import { cartScenarios } from '@test-data/scenarios';

test.describe('Cart scenarios', () => {
  for (const scenario of cartScenarios) {
    test(`cart: ${scenario.name}`, async ({ loggedInInventory, cartPage }) => {
      // --- Add every item in the scenario ---
      for (const item of scenario.items) {
        await loggedInInventory.addToCart(item);
      }

      // --- The badge counts them ---
      await expect(loggedInInventory.cartBadge).toHaveText(String(scenario.items.length));

      // --- The cart lists exactly those items ---
      await loggedInInventory.openCart();
      await cartPage.expectLoaded();
      await cartPage.expectItems(scenario.items);
    });
  }
});
