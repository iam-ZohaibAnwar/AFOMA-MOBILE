import { getCartByUserId, saveCart } from '../../../services/api/cartApi';
import type { CartMap, GetCartResponse } from '../../../services/types/cart';

export function calculateSubTotal(cart: CartMap): number {
  return Object.values(cart).reduce((sum, line) => sum + (line.totalAmount ?? 0), 0);
}

export function getCartEntries(cart: CartMap): Array<{ id: string; line: CartMap[string] }> {
  return Object.entries(cart).map(([id, line]) => ({ id, line }));
}

export function removeCartLine(cart: CartMap, itemId: string): CartMap {
  const nextCart = { ...cart };
  delete nextCart[itemId];
  return nextCart;
}

export async function persistCart(
  userId: string,
  cart: CartMap,
  existing?: Pick<GetCartResponse, 'totalShippingRate' | 'fetchedShippingRate'>,
): Promise<void> {
  await saveCart({
    user_id: userId,
    cart,
    subTotal: calculateSubTotal(cart),
    totalShippingRate: existing?.totalShippingRate ?? 0,
    fetchedShippingRate: existing?.fetchedShippingRate ?? 0,
  });
}

export async function loadUserCart(userId: string): Promise<GetCartResponse> {
  return getCartByUserId(userId);
}
