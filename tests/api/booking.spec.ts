// =============================================================================
// Booking API: the full life of one booking on restful-booker.
//   create (POST) -> read (GET) -> update (PUT) -> delete (DELETE)
// Endpoints, headers and the token logic live in api/BookingClient.ts.
// =============================================================================
import { test, expect } from '@playwright/test';
import { BookingClient, type Booking } from '@api/BookingClient';

// --- Run in order: each step uses the booking created by the step before it ---
test.describe.configure({ mode: 'serial' });

// --- Test data ---
const newBooking: Booking = {
  firstname: 'Playwright',
  lastname: 'Tester',
  totalprice: 150,
  depositpaid: true,
  bookingdates: { checkin: '2026-11-01', checkout: '2026-11-05' },
  additionalneeds: 'Breakfast',
};

// Shared between the serial steps
let bookingId: number;
let token: string;

test.describe('Booking API', () => {
  // --- Is the API up? ---
  test('health check responds @smoke', async ({ request }) => {
    const res = await request.get('/ping');
    expect(res.status()).toBe(201);
  });

  // --- Create ---
  test('create a booking (POST)', async ({ request }) => {
    const res = await new BookingClient(request).create(newBooking);
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body.bookingid).toEqual(expect.any(Number));
    expect(body.booking).toMatchObject(newBooking);
    bookingId = body.bookingid;
  });

  // --- Read ---
  test('read the booking (GET)', async ({ request }) => {
    const res = await new BookingClient(request).get(bookingId);
    expect(res.status()).toBe(200);
    expect(await res.json()).toMatchObject(newBooking);
  });

  // --- Update (needs a token) ---
  test('update the booking (PUT) with an auth token', async ({ request }) => {
    const client = new BookingClient(request);
    token = await client.getToken();
    const updated = { ...newBooking, totalprice: 200, additionalneeds: 'Late checkout' };

    const res = await client.update(bookingId, updated, BookingClient.tokenHeader(token));
    expect(res.status()).toBe(200);
    expect(await res.json()).toMatchObject(updated);
  });

  test('update without a token is forbidden (negative test)', async ({ request }) => {
    const res = await new BookingClient(request).update(bookingId, newBooking);
    expect(res.status()).toBe(403);
  });

  // --- Delete (needs a token), then confirm it's gone ---
  test('delete the booking (DELETE)', async ({ request }) => {
    const client = new BookingClient(request);
    const res = await client.delete(bookingId, BookingClient.tokenHeader(token));
    expect(res.status()).toBe(201); // restful-booker returns 201 for a delete

    const check = await client.get(bookingId);
    expect(check.status()).toBe(404);
  });
});
