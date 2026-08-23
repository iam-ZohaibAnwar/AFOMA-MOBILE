import { getReviewById } from '../../../../services/api/reviewsApi';
import { apiGet } from '../../../../services/api/request';
import type { SellerReviewDetail, SellerReviewsQuery, SellerReviewsResponse } from '../types/sellerReview';

/**
 * GET /reviews/seller/{sellerId}
 *
 * Paginated seller review list. Uses sellerId (not userId).
 */
export async function getSellerReviewsPage(
  sellerId: string,
  query: SellerReviewsQuery = {},
): Promise<SellerReviewsResponse> {
  const params: Record<string, string> = {};

  if (query.page != null) {
    params.page = String(query.page);
  }
  if (query.limit != null) {
    params.limit = String(query.limit);
  }

  return apiGet<SellerReviewsResponse>(
    `/reviews/seller/${encodeURIComponent(sellerId)}`,
    Object.keys(params).length > 0 ? { params } : undefined,
    'Failed to load seller reviews',
  );
}

/** GET /reviews/{reviewId} — same endpoint as web seller review detail. */
export async function getSellerReviewDetail(reviewId: string): Promise<SellerReviewDetail> {
  return getReviewById(reviewId);
}
