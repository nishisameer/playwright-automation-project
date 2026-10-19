import { type Locator, type Page, expect } from '@playwright/test';

export class CheckoutPage {
  readonly page: Page;
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly postalCode: Locator;
  readonly continueButton: Locator;
  readonly finishButton: Locator;
  readonly errorMessage: Locator;
  readonly itemTotal: Locator;
  readonly completeHeader: Locator;

  constructor(page: Page) {
    this.page = page;
    this.firstName = page.getByTestId('firstName');
    this.lastName = page.getByTestId('lastName');
    this.postalCode = page.getByTestId('postalCode');
    this.continueButton = page.getByTestId('continue');
    this.finishButton = page.getByTestId('finish');
    this.errorMessage = page.getByTestId('error');
    this.itemTotal = page.locator('.summary_subtotal_label');
    this.completeHeader = page.locator('.complete-header');
  }

  async fillInformation(info: { firstName: string; lastName: string; postalCode: string }) {
    await this.firstName.fill(info.firstName);
    await this.lastName.fill(info.lastName);
    await this.postalCode.fill(info.postalCode);
    await this.continueButton.click();
  }

  /** Reads "Item total: $39.98" from the overview step and returns 39.98. */
  async getItemTotal(): Promise<number> {
    const text = (await this.itemTotal.textContent()) ?? '';
    return Number(text.replace(/[^0-9.]/g, ''));
  }

  async finish() {
    await this.finishButton.click();
  }

  async expectOrderComplete() {
    await expect(this.page).toHaveURL(/checkout-complete\.html/);
    await expect(this.completeHeader).toHaveText(/thank you for your order/i);
  }
}
