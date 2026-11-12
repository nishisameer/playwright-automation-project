import { test, expect } from '@playwright/test';

// Basic API security checks on https://restful-booker.herokuapp.com.
// Each test creates its own booking, so tests can run in any order.
// Run only these with: npm run test:security

const booking = {
  firstname: 'Security',
  lastname: 'Tester',
  totalprice: 100,
  depositpaid: true,
  bookingdates: { checkin: '2026-12-01', checkout: '2026-12-03' },
  additionalneeds: 'None',
};

let bookingId: number;

test.beforeEach(async ({ request }) => {
  const res = await request.post('/booking', { data: booking });
  expect(res.ok()).toBeTruthy();
  bookingId = (await res.json()).bookingid;
});

test.describe('Security: authentication @security', () => {
  test('wrong credentials do not return a token', async ({ request }) => {
    const res = await request.post('/auth', { data: { username: 'admin', password: 'wrong' } });
    const body = await res.json();
    expect(body.token).toBeUndefined();
    expect(body.reason).toMatch(/bad credentials/i);
  });

  test('SQL injection in the login does not return a token', async ({ request }) => {
    const res = await request.post('/auth', {
      data: { username: "admin' OR '1'='1", password: "' OR '1'='1" },
    });
    const body = await res.json();
    expect(body.token).toBeUndefined();
  });
});

test.describe('Security: changing data needs a valid token @security', () => {
  test('update with a fake token is forbidden', async ({ request }) => {
    const res = await request.put(`/booking/${bookingId}`, {
      data: { ...booking, totalprice: 1 },
      headers: { Cookie: 'token=fake-token-123' },
    });
    expect(res.status()).toBe(403);
  });

  test('partial update (PATCH) without a token is forbidden', async ({ request }) => {
    const res = await request.patch(`/booking/${bookingId}`, { data: { totalprice: 1 } });
    expect(res.status()).toBe(403);
  });

  test('delete without a token is forbidden and the booking still exists', async ({ request }) => {
    const res = await request.delete(`/booking/${bookingId}`);
    expect(res.status()).toBe(403);

    const check = await request.get(`/booking/${bookingId}`);
    expect(check.status()).toBe(200);
  });

  test('delete with wrong Basic auth is forbidden', async ({ request }) => {
    const wrongBasic = Buffer.from('admin:wrong').toString('base64');
    const res = await request.delete(`/booking/${bookingId}`, {
      headers: { Authorization: `Basic ${wrongBasic}` },
    });
    expect(res.status()).toBe(403);
  });

  test('a rejected update does not change the data', async ({ request }) => {
    const put = await request.put(`/booking/${bookingId}`, { data: { ...booking, totalprice: 1 } });
    expect(put.status()).toBe(403);

    const res = await request.get(`/booking/${bookingId}`);
    expect((await res.json()).totalprice).toBe(booking.totalprice);
  });
});

test.describe('Security: input handling @security', () => {
  test('SQL injection in a search filter does not crash the server', async ({ request }) => {
    const res = await request.get('/booking', { params: { firstname: "' OR 1=1 --" } });
    expect(res.status()).toBeLessThan(500);
  });

  test('error responses do not leak stack traces', async ({ request }) => {
    // Broken JSON on purpose.
    const res = await request.post('/booking', {
      headers: { 'Content-Type': 'application/json' },
      data: '{"firstname": ',
    });
    const text = await res.text();
    expect(text).not.toMatch(/node_modules|at \S+ \(.*:\d+:\d+\)/);
  });
});
