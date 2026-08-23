import type { PaginationParams } from '../../../services/types/common';
import type { Review } from '../../../services/types/review';
import { getSellerProductsPage } from '../../../services/api/productsApi';
import { getSellerReviews, getSellerStoreBySlug } from '../../../services/api/sellersApi';

export { getSellerProductsPage, getSellerReviews, getSellerStoreBySlug };

export interface SellerReviewsResponse {
  reviews: Review[];
}

export async function getSellerReviewsList(
  sellerId: string,
  params: PaginationParams = {},
): Promise<SellerReviewsResponse> {
  const data = await getSellerReviews(sellerId, params);
  return { reviews: Array.isArray(data) ? data : [] };
}
