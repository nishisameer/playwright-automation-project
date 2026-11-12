// =============================================================================
// Booking scenarios, data-driven: one test per entry in bookingScenarios
// (test-data/scenarios.ts). Each booking is created, read back and compared
// with what was sent. The createBooking fixture deletes it afterwards.
// =============================================================================
import { test, expect } from '@fixtures/api-fixtures';
import { bookingScenarios } from '@test-data/scenarios';

test.describe('Booking scenarios', () => {
  for (const scenario of bookingScenarios) {
    test(`booking: ${scenario.name}`, async ({ createBooking, bookingClient }) => {
      // --- Create (cleanup is handled by the fixture) ---
      const id = await createBooking(scenario.booking);

      // --- Read it back ---
      const res = await bookingClient.get(id);
      expect(res.status()).toBe(200);

      // --- Saved exactly as sent ---
      // JSON round-trip drops fields left undefined, the same way the request did.
      const sent = JSON.parse(JSON.stringify(scenario.booking));
      expect(await res.json()).toMatchObject(sent);
    });
  }
});
