// =============================================================================
// API fixtures for restful-booker.
//
//   bookingClient   a ready-made BookingClient
//   createBooking   creates a booking for the test and DELETES it afterwards,
//                   so tests don't leave junk data on the shared server
//
//   test('...', async ({ createBooking }) => {
//     const id = await createBooking();                         // default booking
//     const id2 = await createBooking(buildBooking({ ... }));   // custom booking
//   })
// =============================================================================
import { test as base } from '@playwright/test';
import { BookingClient, type Booking } from '@api/BookingClient';
import { buildBooking } from '@test-data/builders';

type ApiFixtures = {
  bookingClient: BookingClient;
  createBooking: (booking?: Booking) => Promise<number>;
};

export const test = base.extend<ApiFixtures>({
  // --- A client that uses this test's request context and baseURL ---
  bookingClient: async ({ request }, use) => use(new BookingClient(request)),

  // --- Create bookings during the test, clean them all up after ---
  createBooking: async ({ bookingClient }, use) => {
    const createdIds: number[] = [];

    // What the test gets: a function that creates a booking and remembers its id
    await use(async (booking = buildBooking()) => {
      const id = await bookingClient.createAndGetId(booking);
      createdIds.push(id);
      return id;
    });

    // Cleanup runs after the test, even if it failed
    if (createdIds.length > 0) {
      const token = await bookingClient.getToken();
      for (const id of createdIds) {
        await bookingClient.delete(id, BookingClient.tokenHeader(token)); // may already be gone; that's fine
      }
    }
  },
});

export { expect } from '@playwright/test';
