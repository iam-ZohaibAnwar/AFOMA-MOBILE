import type { GetCartResponse, SaveCartRequest } from '../types/cart';
import { apiGet, apiPost } from './request';

/** POST /cart/add-cart — persists cart for authenticated user */
export async function saveCart(body: SaveCartRequest): Promise<unknown> {
  return apiPost<unknown>('/cart/add-cart', body, undefined, 'Failed to save cart');
}

/** GET /cart/{userId} — hydrate server cart when local cart is empty */
export async function getCartByUserId(userId: string): Promise<GetCartResponse> {
  return apiGet<GetCartResponse>(
    `/cart/${encodeURIComponent(userId)}`,
    undefined,
    'Failed to load cart',
  );
}
