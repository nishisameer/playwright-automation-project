// =============================================================================
// BookingClient: the API version of a page object.
//
// Page objects keep UI locators in one place; this class keeps the
// restful-booker endpoints in one place. Tests call client.create(...)
// instead of repeating URLs, headers and the token logic in every spec.
// If an endpoint changes, only this file changes.
// =============================================================================
import { type APIRequestContext, type APIResponse, expect } from '@playwright/test';
import { credentials } from '@config/env';

// --- The shape of a booking, so TypeScript catches missing or misspelled fields ---
export type Booking = {
  firstname: string;
  lastname: string;
  totalprice: number;
  depositpaid: boolean;
  bookingdates: { checkin: string; checkout: string };
  additionalneeds?: string;
};

export class BookingClient {
  constructor(private readonly request: APIRequestContext) {}

  // --- Authentication ---

  /** Logs in as the API admin and returns a token. Fails the test if no token comes back. */
  async getToken(): Promise<string> {
    const res = await this.request.post('/auth', {
      data: { username: credentials.apiUsername, password: credentials.apiPassword },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.token, 'auth should return a token').toBeTruthy();
    return body.token;
  }

  /** Sends any username/password to /auth. Used by negative and security tests. */
  async authenticate(username: string, password: string): Promise<APIResponse> {
    return this.request.post('/auth', { data: { username, password } });
  }

  /** restful-booker expects the token as a cookie named "token". */
  static tokenHeader(token: string) {
    return { Cookie: `token=${token}` };
  }

  // --- Create and read (no token needed) ---

  async create(booking: Booking): Promise<APIResponse> {
    return this.request.post('/booking', { data: booking });
  }

  /** Creates a booking, checks it worked, and returns the new booking id. */
  async createAndGetId(booking: Booking): Promise<number> {
    const res = await this.create(booking);
    expect(res.status()).toBe(200);
    return (await res.json()).bookingid;
  }

  async get(id: number): Promise<APIResponse> {
    return this.request.get(`/booking/${id}`);
  }

  async search(params: Record<string, string>): Promise<APIResponse> {
    return this.request.get('/booking', { params });
  }

  // --- Change and delete (token needed) ---
  // headers are optional so security tests can call these WITHOUT a valid token.

  async update(id: number, booking: Booking, headers: Record<string, string> = {}): Promise<APIResponse> {
    return this.request.put(`/booking/${id}`, { data: booking, headers });
  }

  async patch(
    id: number,
    changes: Partial<Booking>,
    headers: Record<string, string> = {},
  ): Promise<APIResponse> {
    return this.request.patch(`/booking/${id}`, { data: changes, headers });
  }

  async delete(id: number, headers: Record<string, string> = {}): Promise<APIResponse> {
    return this.request.delete(`/booking/${id}`, { headers });
  }
}
