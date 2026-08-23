/** Moderation statuses confirmed on staging Phase 1. */
export type AdminReviewStatus = 'Approved' | 'Pending' | 'Disapproved';

export const ADMIN_REVIEW_STATUSES: AdminReviewStatus[] = ['Approved', 'Pending', 'Disapproved'];

export type AdminReviewStatusFilter = AdminReviewStatus | '';

export interface AdminReviewPopulatedUser {
  _id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  city?: string;
  state?: string;
}

export interface AdminReviewPopulatedProduct {
  _id?: string;
  productName?: string;
  slug?: string;
  sku?: string;
  productStatus?: string;
  Category?: { _id?: string; name?: string; slug?: string };
  SubCategory?: { _id?: string; name?: string; slug?: string };
  childCategory?: { _id?: string; name?: string; slug?: string };
}

/** Primary list model — GET /reviews/ returns populated references. */
export interface AdminReviewListItem {
  _id?: string;
  reviewStatus?: string;
  title?: string;
  heading?: string;
  reviewText?: string;
  comment?: string;
  avgRating?: number;
  price?: number;
  value?: number;
  quality?: number;
  sellerId?: string;
  isReply?: boolean;
  UserId?: AdminReviewPopulatedUser | string;
  productId?: AdminReviewPopulatedProduct | string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

/** GET /reviews/:id — same keys, typically unpopulated id references. */
export type AdminReviewDetailRecord = AdminReviewListItem;

export interface UpdateAdminReviewStatusPayload {
  newStatus: string;
}

/** Raw API response — parsed inside adminReviewsApi, not exposed to UI. */
export interface UpdateAdminReviewStatusApiResponse {
  message?: string;
  Data?: AdminReviewDetailRecord;
}

export interface AdminReviewStatusUpdateResult {
  message?: string;
  review: AdminReviewDetailRecord;
}
