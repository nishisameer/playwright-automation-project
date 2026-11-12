// =============================================================================
// Data builders: one place for sensible default test data.
//
// A test only spells out what matters to it, and the builder fills in the rest:
//   buildBooking()                          a normal, valid booking
//   buildBooking({ depositpaid: false })    the same booking, with no deposit
//
// If a required field is added later, only the builder changes, not every test.
// =============================================================================
import type { Booking } from '@api/BookingClient';
import { customer } from '@test-data/users';

// --- API: restful-booker bookings ---
export function buildBooking(overrides: Partial<Booking> = {}): Booking {
  return {
    firstname: 'Test',
    lastname: 'Guest',
    totalprice: 150,
    depositpaid: true,
    bookingdates: { checkin: '2026-12-01', checkout: '2026-12-05' },
    additionalneeds: 'Breakfast',
    ...overrides,
  };
}

// --- UI: saucedemo checkout form ---
export type Customer = typeof customer;

export function buildCustomer(overrides: Partial<Customer> = {}): Customer {
  return { ...customer, ...overrides };
}
