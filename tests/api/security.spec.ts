// =============================================================================
// API security checks on restful-booker.
// Each test creates its own booking (and the fixture deletes it afterwards),
// so tests can run in any order.
// Run only these with: npm run test:security
// =============================================================================
import { test, expect } from '@fixtures/api-fixtures';
import { BookingClient } from '@api/BookingClient';
import { credentials } from '@config/env';
import { buildBooking } from '@test-data/builders';

// --- Test data ---
const booking = buildBooking({ firstname: 'Security', lastname: 'Tester', totalprice: 100 });

let client: BookingClient;
let bookingId: number;

// --- Setup: a fresh booking for every test (deleted again by the fixture) ---
test.beforeEach(async ({ bookingClient, createBooking }) => {
  client = bookingClient;
  bookingId = await createBooking(booking);
});

// --- Logging in: only correct credentials get a token ---
test.describe('Security: authentication @security', () => {
  test('wrong credentials do not return a token', async () => {
    const res = await client.authenticate(credentials.apiUsername, 'wrong');
    const body = await res.json();
    expect(body.token).toBeUndefined();
    expect(body.reason).toMatch(/bad credentials/i);
  });

  test('SQL injection in the login does not return a token', async () => {
    const res = await client.authenticate("admin' OR '1'='1", "' OR '1'='1");
    const body = await res.json();
    expect(body.token).toBeUndefined();
  });
});

// --- Changing data: must be rejected without a valid token ---
test.describe('Security: changing data needs a valid token @security', () => {
  test('update with a fake token is forbidden', async () => {
    const res = await client.update(
      bookingId,
      { ...booking, totalprice: 1 },
      BookingClient.tokenHeader('fake-token-123'),
    );
    expect(res.status()).toBe(403);
  });

  test('partial update (PATCH) without a token is forbidden', async () => {
    const res = await client.patch(bookingId, { totalprice: 1 });
    expect(res.status()).toBe(403);
  });

  test('delete without a token is forbidden and the booking still exists', async () => {
    const res = await client.delete(bookingId);
    expect(res.status()).toBe(403);

    const check = await client.get(bookingId);
    expect(check.status()).toBe(200);
  });

  test('delete with wrong Basic auth is forbidden', async () => {
    const wrongBasic = Buffer.from(`${credentials.apiUsername}:wrong`).toString('base64');
    const res = await client.delete(bookingId, { Authorization: `Basic ${wrongBasic}` });
    expect(res.status()).toBe(403);
  });

  test('a rejected update does not change the data', async () => {
    const put = await client.update(bookingId, { ...booking, totalprice: 1 });
    expect(put.status()).toBe(403);

    const res = await client.get(bookingId);
    expect((await res.json()).totalprice).toBe(booking.totalprice);
  });
});

// --- Bad input: the server should handle it safely ---
test.describe('Security: input handling @security', () => {
  test('SQL injection in a search filter does not crash the server', async () => {
    const res = await client.search({ firstname: "' OR 1=1 --" });
    expect(res.status()).toBeLessThan(500);
  });

  test('error responses do not leak stack traces', async ({ request }) => {
    // Broken JSON on purpose (sent directly, because the client only sends valid bookings).
    const res = await request.post('/booking', {
      headers: { 'Content-Type': 'application/json' },
      data: '{"firstname": ',
    });
    const text = await res.text();
    expect(text).not.toMatch(/node_modules|at \S+ \(.*:\d+:\d+\)/);
  });
});
