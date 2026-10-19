import { test, expect, type APIRequestContext } from '@playwright/test';

// API tests against https://restful-booker.herokuapp.com (a public practice API).
// They run serially because each step uses the booking created in the step before it.
test.describe.configure({ mode: 'serial' });

const newBooking = {
  firstname: 'Playwright',
  lastname: 'Tester',
  totalprice: 150,
  depositpaid: true,
  bookingdates: { checkin: '2026-11-01', checkout: '2026-11-05' },
  additionalneeds: 'Breakfast',
};

let bookingId: number;
let token: string;

async function getToken(request: APIRequestContext): Promise<string> {
  const res = await request.post('/auth', {
    data: { username: 'admin', password: 'password123' },
  });
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body.token).toBeTruthy();
  return body.token;
}

test.describe('Booking API', () => {
  test('health check responds @smoke', async ({ request }) => {
    const res = await request.get('/ping');
    expect(res.status()).toBe(201);
  });

  test('create a booking (POST)', async ({ request }) => {
    const res = await request.post('/booking', { data: newBooking });
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body.bookingid).toEqual(expect.any(Number));
    expect(body.booking).toMatchObject(newBooking);
    bookingId = body.bookingid;
  });

  test('read the booking (GET)', async ({ request }) => {
    const res = await request.get(`/booking/${bookingId}`);
    expect(res.status()).toBe(200);
    expect(await res.json()).toMatchObject(newBooking);
  });

  test('update the booking (PUT) with an auth token', async ({ request }) => {
    token = await getToken(request);
    const updated = { ...newBooking, totalprice: 200, additionalneeds: 'Late checkout' };

    const res = await request.put(`/booking/${bookingId}`, {
      data: updated,
      headers: { Cookie: `token=${token}` },
    });
    expect(res.status()).toBe(200);
    expect(await res.json()).toMatchObject(updated);
  });

  test('update without a token is forbidden (negative test)', async ({ request }) => {
    const res = await request.put(`/booking/${bookingId}`, { data: newBooking });
    expect(res.status()).toBe(403);
  });

  test('delete the booking (DELETE)', async ({ request }) => {
    const res = await request.delete(`/booking/${bookingId}`, {
      headers: { Cookie: `token=${token}` },
    });
    expect(res.status()).toBe(201);

    const check = await request.get(`/booking/${bookingId}`);
    expect(check.status()).toBe(404);
  });
});
