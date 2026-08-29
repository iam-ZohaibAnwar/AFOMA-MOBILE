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

/** Client-side filter on the current API page — server has no status query param. */
export type SellerReviewStatusFilter = '' | 'Pending' | 'Approved' | 'Disapproved';

/** Client-side reply filter for seller workflow. */
export type SellerReviewReplyFilter = '' | 'needs-reply' | 'replied';
