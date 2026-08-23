import { apiGet, apiPut } from '../../../../services/api/request';
import type {
  AdminReviewDetailRecord,
  AdminReviewListItem,
  UpdateAdminReviewStatusApiResponse,
  UpdateAdminReviewStatusPayload,
  AdminReviewStatusUpdateResult,
} from '../types/adminReviews';

/** GET /reviews/ — top-level populated review array. */
export async function getAdminReviewsList(): Promise<AdminReviewListItem[]> {
  const response = await apiGet<AdminReviewListItem[]>(
    '/reviews/',
    undefined,
    'Failed to load reviews',
  );

  return Array.isArray(response) ? response : [];
}

/** GET /reviews/:id — unpopulated id references. */
export async function getAdminReviewById(reviewId: string): Promise<AdminReviewDetailRecord> {
  return apiGet<AdminReviewDetailRecord>(
    `/reviews/${encodeURIComponent(reviewId)}`,
    undefined,
    'Failed to load review',
  );
}

/**
 * PUT /reviews/:id/update-status
 * Parses `{ message, Data }` and returns the updated review record only.
 */
export async function updateAdminReviewStatus(
  reviewId: string,
  newStatus: string,
): Promise<AdminReviewStatusUpdateResult> {
  const payload: UpdateAdminReviewStatusPayload = { newStatus };

  const response = await apiPut<UpdateAdminReviewStatusApiResponse>(
    `/reviews/${encodeURIComponent(reviewId)}/update-status`,
    payload,
    undefined,
    'Failed to update review status',
  );

  const review = response.Data;
  if (!review?._id) {
    throw new Error('Review status update did not return review data');
  }

  return {
    message: response.message,
    review,
  };
}
