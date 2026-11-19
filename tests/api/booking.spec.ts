// =============================================================================
// Booking API: create (POST) -> read (GET) -> update (PUT) -> delete (DELETE)
// on restful-booker, written two ways so you can compare them:
//
//   1. Serial:      one booking shared by the tests, which run in order.
//   2. Independent: each test makes its own booking with the createBooking
//                   fixture (fixtures/api-fixtures.ts), which deletes it afterwards.
//
// Endpoints, headers and the token logic live in api/BookingClient.ts.
// =============================================================================
import { test, expect } from '@fixtures/api-fixtures';
import { BookingClient, type Booking } from '@api/BookingClient';
import { buildBooking } from '@test-data/builders';

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

// =============================================================================
// 1. Serial: the life of ONE booking, step by step
// =============================================================================
test.describe('Booking API (serial)', () => {
  // --- Run in order: each step uses the booking created by the step before it ---
  test.describe.configure({ mode: 'serial' });

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

// =============================================================================
// 2. Independent: every test sets up its own booking, so they can run in any
//    order and in parallel. A failure in one doesn't affect the others.
// =============================================================================
test.describe('Booking API (independent, with fixtures)', () => {
  // --- Test data: the builder's defaults, with a name that's easy to spot ---
  const booking = buildBooking({ firstname: 'Fixture', lastname: 'Tester' });

  // --- Create ---
  test('create a booking (POST)', async ({ createBooking, bookingClient }) => {
    const id = await createBooking(booking); // the fixture checks status 200 and deletes it afterwards
    expect(id).toEqual(expect.any(Number));

    const res = await bookingClient.get(id);
    expect(await res.json()).toMatchObject(booking);
  });

  // --- Read ---
  test('read a booking (GET)', async ({ createBooking, bookingClient }) => {
    const id = await createBooking(booking);

    const res = await bookingClient.get(id);
    expect(res.status()).toBe(200);
    expect(await res.json()).toMatchObject(booking);
  });

  // --- Update (needs a token) ---
  test('update a booking (PUT) with an auth token', async ({ createBooking, bookingClient }) => {
    const id = await createBooking(booking);
    const token = await bookingClient.getToken();
    const updated = { ...booking, totalprice: 200, additionalneeds: 'Late checkout' };

    const res = await bookingClient.update(id, updated, BookingClient.tokenHeader(token));
    expect(res.status()).toBe(200);
    expect(await res.json()).toMatchObject(updated);
  });

  test('update without a token is forbidden (negative test)', async ({ createBooking, bookingClient }) => {
    const id = await createBooking(booking);

    const res = await bookingClient.update(id, booking);
    expect(res.status()).toBe(403);
  });

  // --- Delete (needs a token), then confirm it's gone ---
  test('delete a booking (DELETE)', async ({ createBooking, bookingClient }) => {
    const id = await createBooking(booking);
    const token = await bookingClient.getToken();

    const res = await bookingClient.delete(id, BookingClient.tokenHeader(token));
    expect(res.status()).toBe(201); // restful-booker returns 201 for a delete

    const check = await bookingClient.get(id);
    expect(check.status()).toBe(404);
    // The fixture's cleanup will try to delete it again; that's fine, it's already gone.
  });
});
