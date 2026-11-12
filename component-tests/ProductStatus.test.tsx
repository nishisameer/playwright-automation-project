import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductStatus } from './ProductStatus';

describe('ProductStatus', () => {
  it('shows a loading message while waiting', () => {
    render(<ProductStatus state="loading" />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading products...');
    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
  });

  it('shows a friendly error with a Retry button', () => {
    render(<ProductStatus state="error" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong. Please try again.');
    expect(screen.getByRole('button', { name: 'Retry' })).toBeVisible();
  });

  it('calls onRetry when Retry is clicked', async () => {
    const onRetry = vi.fn(); // a mock function that records calls
    render(<ProductStatus state="error" onRetry={onRetry} />);

    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('shows a message when there are no products', () => {
    render(<ProductStatus state="empty" />);
    expect(screen.getByRole('status')).toHaveTextContent('No products found');
    expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
  });

  it.each([
    { count: 1, text: '1 product' },
    { count: 6, text: '6 products' },
  ])('shows the product count when ready (count $count)', ({ count, text }) => {
    render(<ProductStatus state="ready" count={count} />);
    expect(screen.getByRole('status')).toHaveTextContent(text);
  });
});
