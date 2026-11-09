import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CartBadge } from './CartBadge';

// Component tests: render ONE component on its own (no browser, no server)
// and check what the user would see. Each test runs in milliseconds.
describe('CartBadge', () => {
  it('is hidden when the cart is empty', () => {
    render(<CartBadge count={0} />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('shows the number of items', () => {
    render(<CartBadge count={2} />);
    expect(screen.getByRole('status')).toHaveTextContent('2');
  });

  it('uses "item" for one and "items" for more (for screen readers)', () => {
    const { rerender } = render(<CartBadge count={1} />);
    expect(screen.getByRole('status')).toHaveAccessibleName('Cart, 1 item');

    rerender(<CartBadge count={3} />);
    expect(screen.getByRole('status')).toHaveAccessibleName('Cart, 3 items');
  });

  // Boundary values: 99 is shown as-is, 100 switches to "99+"
  it.each([
    { count: 99, shown: '99' },
    { count: 100, shown: '99+' },
  ])('shows the right label when the count is $count', ({ count, shown }) => {
    render(<CartBadge count={count} />);
    expect(screen.getByRole('status')).toHaveTextContent(shown);
  });

  it('is hidden for a negative count (bad data)', () => {
    render(<CartBadge count={-1} />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
