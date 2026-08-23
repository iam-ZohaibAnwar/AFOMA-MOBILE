import type { Product } from './product';

/**
 * Cart line and cart API types traced from AppShell/cart pages.
 * TODO: Verify exact cart line item schema stored in backend.
 */
export interface CartLineItem {
  orderQuantiy?: number;
  basePrice?: number;
  totalAmount?: number;
  maxQuantity?: number | string;
  remark?: string;
  productData?: Product;
  selectedVariations?: Array<{ attributeName?: string; attributeValue?: string }>;
  shippingOptions?: unknown;
  shippingService?: unknown;
  shippingRate?: number;
}

export type CartMap = Record<string, CartLineItem>;

export interface SaveCartRequest {
  user_id: string;
  cart: CartMap;
  subTotal: number | string;
  totalShippingRate: number | string;
  fetchedShippingRate?: number | string;
}

export interface GetCartResponse {
  cart?: CartMap;
  subTotal?: number;
  totalShippingRate?: number;
  fetchedShippingRate?: number;
}
