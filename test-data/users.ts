// Public demo credentials published on https://www.saucedemo.com
// In a real project, read secrets from environment variables / GitHub Secrets instead.
export const PASSWORD = process.env.SAUCE_PASSWORD ?? 'secret_sauce';

export const users = {
  standard: { username: 'standard_user', password: PASSWORD },
  lockedOut: { username: 'locked_out_user', password: PASSWORD },
  invalid: { username: 'not_a_real_user', password: 'wrong_password' },
};

export const customer = {
  firstName: 'Test',
  lastName: 'Automation',
  postalCode: '84062',
};
