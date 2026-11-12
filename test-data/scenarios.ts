// =============================================================================
// Scenario lists for data-driven tests.
//
// Each spec loops over a list and creates one test per entry, so adding a
// scenario means adding one entry here, with no new test code.
// The scenario name becomes part of the test title in the report.
// =============================================================================
import { buildBooking, buildCustomer } from '@test-data/builders';

// --- saucedemo product names (exactly as shown on the site) ---
export const products = {
  backpack: 'Sauce Labs Backpack',
  bikeLight: 'Sauce Labs Bike Light',
  boltTShirt: 'Sauce Labs Bolt T-Shirt',
  fleeceJacket: 'Sauce Labs Fleece Jacket',
  onesie: 'Sauce Labs Onesie',
  redTShirt: 'Test.allTheThings() T-Shirt (Red)',
} as const;

// --- UI: what to put in the cart ---
export const cartScenarios = [
  { name: 'single item', items: [products.backpack] },
  { name: 'two items', items: [products.backpack, products.bikeLight] },
  { name: 'clothing only', items: [products.boltTShirt, products.fleeceJacket, products.onesie] },
  { name: 'all six items', items: Object.values(products) },
];

// --- UI: checkout form, each missing field and the error it should show ---
export const checkoutFormScenarios = [
  {
    name: 'missing first name',
    customer: buildCustomer({ firstName: '' }),
    error: /first name is required/i,
  },
  { name: 'missing last name', customer: buildCustomer({ lastName: '' }), error: /last name is required/i },
  {
    name: 'missing postal code',
    customer: buildCustomer({ postalCode: '' }),
    error: /postal code is required/i,
  },
];

// --- API: bookings that should be saved exactly as sent ---
export const bookingScenarios = [
  { name: 'standard stay', booking: buildBooking() },
  { name: 'no deposit paid', booking: buildBooking({ depositpaid: false }) },
  {
    name: 'one-night stay',
    booking: buildBooking({ bookingdates: { checkin: '2026-12-10', checkout: '2026-12-11' } }),
  },
  {
    name: 'long stay, high price',
    booking: buildBooking({
      totalprice: 4200,
      bookingdates: { checkin: '2026-12-01', checkout: '2027-01-15' },
    }),
  },
  { name: 'no extra needs', booking: buildBooking({ additionalneeds: undefined }) },
  {
    name: 'name with accent and hyphen',
    booking: buildBooking({ firstname: 'José', lastname: "O'Neil-Smith" }),
  },
];
