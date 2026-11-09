/**
 * A small cart badge, like the one on Sauce Demo.
 * - Hidden when the cart is empty
 * - Shows the number of items
 * - Shows "99+" for very large numbers
 */
type CartBadgeProps = {
  count: number;
};

export function CartBadge({ count }: CartBadgeProps) {
  if (count <= 0) return null;

  const label = count > 99 ? '99+' : String(count);
  const itemWord = count === 1 ? 'item' : 'items';

  return (
    <span className="cart-badge" role="status" aria-label={`Cart, ${count} ${itemWord}`}>
      {label}
    </span>
  );
}
