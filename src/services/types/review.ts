/**
 * Review types from PDP and order flows.
 * TODO: Verify average-review response structure.
 */
export interface Review {
  _id?: string;
  createdAt?: string;
  heading?: string;
  comment?: string;
  value?: number;
  quality?: number;
  price?: number;
  reviewStatus?: string;
  isReply?: boolean;
}

export type ProductReviewsResponse = Review[];

export type ProductAverageReviewResponse = Record<string, unknown>;

export interface CreateReviewRequest {
  heading: string;
  comment: string;
  value?: number;
  quality?: number;
  price?: number;
  // TODO: product/order linkage fields required by backend
}

export interface UpdateReviewStatusRequest {
  newStatus: string;
}
