import type { SellerProfile } from '../../features/seller/types/sellerProfile';
import type { Product } from '../types/product';
import type { Seller, SellerByIdsRequest, SellerByIdsResponse } from '../types/seller';
import type { Review } from '../types/review';
import type { PaginationParams } from '../types/common';
import { apiClient } from './client';
import { apiGet, apiPost, apiPut } from './request';
import { toApiError } from './errors';

/** PUT /sellers/{sellerId} — partial seller profile update (web parity). */
export type SellerProfileUpdatePayload = Record<string, unknown> & {
  data?: string;
  profileSetup?: Partial<SellerProfile['profileSetup']>;
};

/** GET /sellers/{sellerId} */
export async function getSellerProfile(sellerId: string): Promise<SellerProfile> {
  return apiGet<SellerProfile>(
    `/sellers/${encodeURIComponent(sellerId)}`,
    undefined,
    'Failed to load seller profile',
  );
}

/** PUT /sellers/{sellerId} */
export async function updateSellerProfile(
  sellerId: string,
  body: SellerProfileUpdatePayload,
): Promise<SellerProfile> {
  return apiPut<SellerProfile>(
    `/sellers/${encodeURIComponent(sellerId)}`,
    body,
    undefined,
    'Failed to update seller profile',
  );
}

interface UploadImageResponse {
  imageUrl: string;
}

/** PUT /sellers/seller-shop/update-status/{sellerId}?shop_status=0|1 — web parity. */
export async function updateSellerShopStatus(sellerId: string, shopStatus: 0 | 1): Promise<void> {
  await apiPut<void>(
    `/sellers/seller-shop/update-status/${encodeURIComponent(sellerId)}`,
    undefined,
    { params: { shop_status: shopStatus } },
    'Failed to update shop visibility',
  );
}

/** POST /sellers/upload-sellerimg — store banner or logo (web parity). */
export async function uploadSellerStoreImage(
  localUri: string,
  fileName: string,
  mimeType = 'image/jpeg',
): Promise<string> {
  const formData = new FormData();
  formData.append('sellerImg', {
    uri: localUri,
    name: fileName,
    type: mimeType,
  } as unknown as Blob);

  try {
    const response = await apiClient.post<UploadImageResponse>(
      '/sellers/upload-sellerimg',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );

    return response.data.imageUrl;
  } catch (error) {
    throw toApiError(error, 'Failed to upload store image');
  }
}

/** POST /users/upload-profile — seller profile photo (web parity). */
export async function uploadUserProfileImage(
  localUri: string,
  fileName: string,
  mimeType = 'image/jpeg',
): Promise<string> {
  const formData = new FormData();
  formData.append('userProfile', {
    uri: localUri,
    name: fileName,
    type: mimeType,
  } as unknown as Blob);

  try {
    const response = await apiClient.post<UploadImageResponse>(
      '/users/upload-profile',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );

    return response.data.imageUrl;
  } catch (error) {
    throw toApiError(error, 'Failed to upload profile image');
  }
}
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
  const response = await apiGet<Review[] | { data?: Review[] }>(
    `/reviews/seller/${encodeURIComponent(sellerId)}`,
    { params },
    'Failed to load seller reviews',
  );

  if (Array.isArray(response)) {
    return response;
  }

  return response.data ?? [];
}
