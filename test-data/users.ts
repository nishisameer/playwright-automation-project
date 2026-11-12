// =============================================================================
// Test users and customer details for the saucedemo UI tests.
// Passwords come from config/env.ts, never typed directly in a test.
// All data here is synthetic (made up), never real customer data.
// =============================================================================
import { credentials } from '@config/env';

export const PASSWORD = credentials.saucePassword;

// --- saucedemo's built-in accounts (each one behaves differently) ---
export const users = {
  standard: { username: 'standard_user', password: PASSWORD },
  lockedOut: { username: 'locked_out_user', password: PASSWORD },
  invalid: { username: 'not_a_real_user', password: 'wrong_password' },
};

// --- Customer details for the checkout form ---
export const customer = {
  firstName: 'Test',
  lastName: 'Automation',
  postalCode: '84062',
};
