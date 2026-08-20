import type { Product } from '../types/product';
import type { Seller, SellerByIdsRequest, SellerByIdsResponse } from '../types/seller';
import type { Review } from '../types/review';
import type { PaginationParams } from '../types/common';
import { apiGet, apiPost } from './request';

/** GET /sellers/store/{slug} */
export async function getSellerStoreBySlug(slug: string): Promise<Seller> {
  return apiGet<Seller>(`/sellers/store/${encodeURIComponent(slug)}`, undefined, 'Failed to load seller store');
}

/** GET /sellers/{sellerId} */
export async function getSellerById(sellerId: string): Promise<Seller> {
  return apiGet<Seller>(`/sellers/${encodeURIComponent(sellerId)}`, undefined, 'Failed to load seller');
}

/** POST /sellers/sellerByIds — body: { ids: string[] } */
export async function getSellersByIds(body: SellerByIdsRequest): Promise<SellerByIdsResponse> {
  return apiPost<SellerByIdsResponse>('/sellers/sellerByIds', body, undefined, 'Failed to load sellers');
}

/** GET /products/by/{sellerId} — storefront listing helper (same endpoint as products API). */
export async function getSellerStoreProducts(
  sellerId: string,
  params: PaginationParams = {},
): Promise<Product[]> {
  return apiGet<Product[]>(
    `/products/by/${encodeURIComponent(sellerId)}`,
    { params },
    'Failed to load seller store products',
  );
}

/** GET /reviews/seller/{sellerId} */
export async function getSellerReviews(
  sellerId: string,
  params: PaginationParams = {},
): Promise<Review[]> {
  return apiGet<Review[]>(
    `/reviews/seller/${encodeURIComponent(sellerId)}`,
    { params },
    'Failed to load seller reviews',
  );
}
