import type { CartMap } from '../../../services/types/cart';

export interface CartMemorySnapshot {
  userKey: string;
  cart: CartMap;
  totalShippingRate: number;
  fetchedShippingRate: number;
}

let cartMemoryCache: CartMemorySnapshot | null = null;

function cartUserKey(userId?: string): string {
  return userId ?? 'guest';
}

export function getCartMemoryCache(userId?: string): CartMemorySnapshot | null {
  if (!cartMemoryCache) {
    return null;
  }

  return cartMemoryCache.userKey === cartUserKey(userId) ? cartMemoryCache : null;
}

export function setCartMemoryCache(
  userId: string | undefined,
  snapshot: Pick<CartMemorySnapshot, 'cart' | 'totalShippingRate' | 'fetchedShippingRate'>,
): void {
  cartMemoryCache = {
    userKey: cartUserKey(userId),
    ...snapshot,
  };
}

export function clearCartMemoryCache(): void {
  cartMemoryCache = null;
}
