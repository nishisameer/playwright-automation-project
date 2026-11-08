import { test, expect } from '../../fixtures/test-fixtures';
import type { Page } from '@playwright/test';
import { users } from '../../test-data/users';

/**
 * page.route() intercepts requests the BROWSER makes and lets the test decide what happens:
 *   route.abort()     -> the request fails (like a network error)
 *   route.fulfill()   -> return a fake response (status, body) without calling the server
 *   route.continue()  -> let the real request go through (optionally changed)
 */

// ---------- Part 1: the real Sauce Demo site ----------
test.describe('Network control on Sauce Demo', () => {
  test('store still works when product images fail to load', async ({ page, loginPage, inventoryPage }) => {
    // Fail every image request before the page loads
    await page.route('**/*.{png,jpg,jpeg,svg}', (route) => route.abort());

    await loginPage.goto();
    await loginPage.login(users.standard.username, users.standard.password);
    await inventoryPage.expectLoaded();

    // Products, prices and buttons still show, and the user can still shop
    await expect(inventoryPage.items).toHaveCount(6);
    await inventoryPage.addToCart('Sauce Labs Backpack');
    await expect(inventoryPage.cartBadge).toHaveText('1');
  });
});

// ---------- Part 2: loading, error and empty states ----------
// Sauce Demo has no backend API to mock, so this small page loads its products from /api/products,
// like a real app (or an AI agent chat) would. page.route() serves both the page and the API.
const APP_URL = 'https://mock-store.test/';

const appHtml = `
  <h1>Products</h1>
  <p id="status" role="status">Loading...</p>
  <ul id="list"></ul>
  <button id="retry" hidden>Retry</button>
  <script>
    async function load() {
      const status = document.getElementById('status');
      const retry = document.getElementById('retry');
      status.textContent = 'Loading...';
      retry.hidden = true;
      try {
        const res = await fetch('/api/products');
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const products = await res.json();
        status.textContent = products.length ? products.length + ' products' : 'No products found';
        document.getElementById('list').innerHTML = products.map(p => '<li>' + p.name + '</li>').join('');
      } catch (e) {
        status.textContent = 'Something went wrong. Please try again.';
        retry.hidden = false;
      }
    }
    document.getElementById('retry').onclick = load;
    load();
  </script>`;

async function openMockStore(page: Page) {
  await page.route(APP_URL, (route) =>
    route.fulfill({ status: 200, contentType: 'text/html', body: appHtml }),
  );
  await page.goto(APP_URL);
}

test.describe('Mocked API states', () => {
  test('success: shows the products from the API', async ({ page }) => {
    await page.route('**/api/products', (route) =>
      route.fulfill({ status: 200, json: [{ name: 'Backpack' }, { name: 'Bike Light' }] }),
    );
    await openMockStore(page);

    await expect(page.getByRole('status')).toHaveText('2 products');
    await expect(page.getByRole('listitem')).toHaveText(['Backpack', 'Bike Light']);
  });

  test('slow response: shows a loading state first', async ({ page }) => {
    await page.route('**/api/products', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // pretend the server is slow
      await route.fulfill({ status: 200, json: [{ name: 'Backpack' }] });
    });
    await openMockStore(page);

    await expect(page.getByRole('status')).toHaveText('Loading...');
    await expect(page.getByRole('status')).toHaveText('1 products'); // web-first assertion waits
  });

  test('server error: shows a friendly message and a retry button', async ({ page }) => {
    await page.route('**/api/products', (route) =>
      route.fulfill({ status: 500, json: { error: 'Internal Server Error' } }),
    );
    await openMockStore(page);

    await expect(page.getByRole('status')).toHaveText('Something went wrong. Please try again.');
    await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible();
  });

  test('retry works after the server recovers', async ({ page }) => {
    let calls = 0;
    await page.route('**/api/products', (route) => {
      calls++;
      return calls === 1
        ? route.fulfill({ status: 503 }) // first call fails
        : route.fulfill({ status: 200, json: [{ name: 'Backpack' }] }); // second call works
    });
    await openMockStore(page);

    await page.getByRole('button', { name: 'Retry' }).click();
    await expect(page.getByRole('status')).toHaveText('1 products');
    expect(calls).toBe(2);
  });

  test('network failure: request never reaches the server', async ({ page }) => {
    await page.route('**/api/products', (route) => route.abort('failed'));
    await openMockStore(page);

    await expect(page.getByRole('status')).toHaveText('Something went wrong. Please try again.');
  });

  test('empty list: shows a "no products" message', async ({ page }) => {
    await page.route('**/api/products', (route) => route.fulfill({ status: 200, json: [] }));
    await openMockStore(page);

    await expect(page.getByRole('status')).toHaveText('No products found');
    await expect(page.getByRole('listitem')).toHaveCount(0);
  });
});
