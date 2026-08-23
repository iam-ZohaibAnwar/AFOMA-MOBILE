import type {
  CreateReviewRequest,
  CreateSellerReviewReplyRequest,
  LinkReviewReplyRequest,
  ProductAverageReviewResponse,
  ProductReviewsResponse,
  Review,
  UpdateReviewStatusRequest,
} from '../types/review';
import { apiGet, apiPost, apiPut } from './request';

/** GET /reviews/single/{productId} */
export async function getProductReviews(productId: string): Promise<ProductReviewsResponse> {
  return apiGet<ProductReviewsResponse>(
    `/reviews/single/${encodeURIComponent(productId)}`,
    undefined,
    'Failed to load product reviews',
  );
}

/** GET /reviews/single/customized/{productId}/variation/{variationId} */
export async function getCustomizedProductReviews(
  productId: string,
  variationId: string,
): Promise<ProductReviewsResponse> {
  return apiGet<ProductReviewsResponse>(
    `/reviews/single/customized/${encodeURIComponent(productId)}/variation/${encodeURIComponent(variationId)}`,
    undefined,
    'Failed to load customized product reviews',
  );
}

/** GET /reviews/average-review/{productId} */
export async function getProductAverageReview(productId: string): Promise<ProductAverageReviewResponse> {
  return apiGet<ProductAverageReviewResponse>(
    `/reviews/average-review/${encodeURIComponent(productId)}`,
    undefined,
    'Failed to load product review averages',
  );
}

/** GET /reviews/{reviewId} */
export async function getReviewById(reviewId: string): Promise<Review> {
  return apiGet<Review>(`/reviews/${encodeURIComponent(reviewId)}`, undefined, 'Failed to load review');
}

/** POST /reviews/ */
export async function createReview(body: CreateReviewRequest): Promise<Review> {
  return apiPost<Review>('/reviews/', body, undefined, 'Failed to create review');
}

/** PUT /reviews/{reviewId} */
export async function updateReview(reviewId: string, body: CreateReviewRequest): Promise<Review> {
  return apiPut<Review>(`/reviews/${encodeURIComponent(reviewId)}`, body, undefined, 'Failed to update review');
}

/** PUT /reviews/{reviewId}/update-status */
export async function updateReviewStatus(
  reviewId: string,
  body: UpdateReviewStatusRequest,
): Promise<Review> {
  return apiPut<Review>(
    `/reviews/${encodeURIComponent(reviewId)}/update-status`,
    body,
    undefined,
    'Failed to update review status',
  );
}

/** PUT /reviews/{reviewId} — partial update (e.g. link seller reply). */
export async function linkReviewReply(
  reviewId: string,
  body: LinkReviewReplyRequest,
): Promise<Review> {
  return apiPut<Review>(
    `/reviews/${encodeURIComponent(reviewId)}`,
    body,
    undefined,
    'Failed to link review reply',
  );
}

/** POST /reviews/ — seller reply record (web parity). */
export async function createSellerReviewReply(body: CreateSellerReviewReplyRequest): Promise<Review> {
  return apiPost<Review>('/reviews/', body, undefined, 'Failed to post review reply');
}

/** GET /reviews/best/review — used on home page */
export async function getBestReviews(limit: number): Promise<Review[]> {
  return apiGet<Review[]>(
    '/reviews/best/review',
    { params: { limit } },
    'Failed to load best reviews',
  );
}
