/**
 * Shows the state of a product list that loads from an API:
 * loading, error (with a Retry button), empty, or ready.
 * The same states an AI agent chat needs: waiting, failed, no answer, answered.
 */
export type LoadState = 'loading' | 'error' | 'empty' | 'ready';

type ProductStatusProps = {
  state: LoadState;
  count?: number;
  onRetry?: () => void;
};

export function ProductStatus({ state, count = 0, onRetry }: ProductStatusProps) {
  switch (state) {
    case 'loading':
      return <p role="status" aria-busy="true">Loading products...</p>;

    case 'error':
      return (
        <div role="alert">
          <p>Something went wrong. Please try again.</p>
          <button type="button" onClick={onRetry}>
            Retry
          </button>
        </div>
      );

    case 'empty':
      return <p role="status">No products found</p>;

    case 'ready':
      return <p role="status">{count} {count === 1 ? 'product' : 'products'}</p>;
  }
}
