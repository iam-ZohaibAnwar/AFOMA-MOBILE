import { getCartByUserId, saveCart } from '../../../services/api/cartApi';
import type { CartLineItem, CartMap, GetCartResponse } from '../../../services/types/cart';
import { parseMaxQuantity } from './cartLineMerge';

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

export function getCartItemCount(cart: CartMap): number {
  return Object.values(cart).reduce((sum, line) => sum + (line.orderQuantiy ?? 0), 0);
}

export function getCartLineAttributes(line: CartLineItem): string | undefined {
  const values = line.selectedVariations
    ?.map((variation) => variation.attributeValue?.trim())
    .filter(Boolean);

  if (values?.length) {
    return values.join(' · ');
  }

  return undefined;
}

export function updateCartLineQuantity(
  cart: CartMap,
  itemId: string,
  nextQuantity: number,
): CartMap {
  const line = cart[itemId];
  if (!line) {
    return cart;
  }

  if (line.productData?.productType === 'Downloadable') {
    return cart;
  }

  const maxQuantity = parseMaxQuantity(line.maxQuantity, line.productData?.quantity);
  const quantity = Math.max(1, Math.min(nextQuantity, maxQuantity));
  const unitPrice = line.basePrice ?? 0;

  return {
    ...cart,
    [itemId]: {
      ...line,
      orderQuantiy: quantity,
      totalAmount: parseFloat((unitPrice * quantity).toFixed(2)),
    },
  };
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
