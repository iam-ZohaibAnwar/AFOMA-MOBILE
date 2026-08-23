/**
 * Review types from PDP and order flows.
 * TODO: Verify average-review response structure.
 */
export interface Review {
  _id?: string;
  createdAt?: string;
  updatedAt?: string;
  heading?: string;
  title?: string;
  comment?: string;
  reviewText?: string;
  value?: number;
  quality?: number;
  price?: number;
  avgRating?: number;
  reviewStatus?: string;
  isReply?: boolean;
  sellerId?: string;
  replyReviewId?: string | Review;
  UserId?: string | {
    firstName?: string;
    lastName?: string;
    city?: string;
    state?: string;
  };
  productId?: {
    _id?: string;
    productName?: string;
    slug?: string;
    images?: Array<{ imageUrl?: string }>;
    Category?: { slug?: string };
    SubCategory?: { slug?: string };
    childCategory?: { slug?: string };
  } | string;
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

export interface LinkReviewReplyRequest {
  replyReviewId: string;
}

export interface CreateSellerReviewReplyRequest {
  productId: string;
  sellerId: string;
  UserId: string;
  value?: number;
  quality?: number;
  price?: number;
  reviewText: string;
  title: string;
  reviewStatus: 'Pending';
  isReply: true;
}
