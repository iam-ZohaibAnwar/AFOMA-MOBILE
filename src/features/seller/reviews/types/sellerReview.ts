import type { Review } from '../../../../services/types/review';

/** Row returned by GET /reviews/seller/{sellerId} (web seller review list). */
export interface SellerReviewListItem extends Review {
  avgRating?: number;
  price?: number;
  value?: number;
  quality?: number;
}

export type SellerReviewDetail = Review;

export interface SellerReviewsQuery {
  page?: number;
  limit?: number;
}

export interface SellerReviewsResponse {
  data?: SellerReviewListItem[];
  totalPages?: number;
}
