import { type Locator, type Page, expect } from '@playwright/test';
import { randomInt } from 'node:crypto';

export type SortOption = 'az' | 'za' | 'lohi' | 'hilo';

export class InventoryPage {
  readonly page: Page;
  readonly title: Locator;
  readonly items: Locator;
  readonly itemNames: Locator;
  readonly itemPrices: Locator;
  readonly sortDropdown: Locator;
  readonly cartBadge: Locator;
  readonly cartLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator('.title');
    this.items = page.locator('.inventory_item');
    this.itemNames = page.locator('.inventory_item_name');
    this.itemPrices = page.locator('.inventory_item_price');
    this.sortDropdown = page.locator('.product_sort_container');
    this.cartBadge = page.locator('.shopping_cart_badge');
    this.cartLink = page.locator('.shopping_cart_link');
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/inventory\.html/);
    await expect(this.title).toHaveText('Products');
  }

  /** Adds a product by its visible name, e.g. "Sauce Labs Backpack". */
  async addToCart(productName: string) {
    const card = this.items.filter({ hasText: productName });
    await card.getByRole('button', { name: /add to cart/i }).click();
  }

   /** Adds a random product that isn't in the cart yet and returns its name. */
  async addRandomToCart(): Promise<string> {
    const addButton = this.page.getByRole('button', { name: /add to cart/i });
    const available = this.items.filter({ has: addButton });
    const card = available.nth(randomInt(await available.count()));
    const name = await card.locator('.inventory_item_name').innerText();
    await card.getByRole('button', { name: /add to cart/i }).click();
    return name;
  }
  
  async removeFromCart(productName: string) {
    const card = this.items.filter({ hasText: productName });
    await card.getByRole('button', { name: /remove/i }).click();
  }

  async sortBy(option: SortOption) {
    await this.sortDropdown.selectOption(option);
  }

  async getPrices(): Promise<number[]> {
    const texts = await this.itemPrices.allTextContents();
    return texts.map((t) => Number(t.replace('$', '')));
  }

  async getNames(): Promise<string[]> {
    return this.itemNames.allTextContents();
  }

  async openCart() {
    await this.cartLink.click();
  }

  /** Opens the side menu and logs out. */
  async logout() {
    await this.page.getByRole('button', { name: 'Open Menu' }).click();
    await this.page.getByRole('link', { name: 'Logout' }).click();
  }
}
