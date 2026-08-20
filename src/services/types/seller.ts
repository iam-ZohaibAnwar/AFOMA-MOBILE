/**
 * Seller types from storefront usage.
 * TODO: Verify full seller/store response from GET /sellers/store/{slug}.
 */
export interface Seller {
  _id?: string;
  firstName?: string;
  lastName?: string;
  storeSlug?: string;
  storeTitle?: string;
  storeDesc?: string;
  shop_status?: number;
  storePolicy?: Record<string, unknown>;
}

export interface SellerByIdsRequest {
  ids: string[];
}

export type SellerByIdsResponse = Seller[];
