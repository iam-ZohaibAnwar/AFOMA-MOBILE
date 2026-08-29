import { apiGet, apiPut } from '../../../../services/api/request';
import type {
  AdminReviewDetailRecord,
  AdminReviewListItem,
  UpdateAdminReviewStatusApiResponse,
  UpdateAdminReviewStatusPayload,
  AdminReviewStatusUpdateResult,
} from '../types/adminReviews';

function normalizeAdminReviewsListResponse(response: unknown): AdminReviewListItem[] {
  if (!Array.isArray(response)) {
    return [];
  }

  return [...response].reverse();
}

/** GET /reviews/ — customer reviews (non-replies), populated references. */
export async function getAdminReviewsList(): Promise<AdminReviewListItem[]> {
  const response = await apiGet<AdminReviewListItem[]>(
    '/reviews/',
    undefined,
    'Failed to load reviews',
  );

  return normalizeAdminReviewsListResponse(response);
}

/** GET /reviews/all/replies — seller replies only, populated references. */
export async function getAdminReviewRepliesList(): Promise<AdminReviewListItem[]> {
  const response = await apiGet<AdminReviewListItem[]>(
    '/reviews/all/replies',
    undefined,
    'Failed to load seller replies',
  );

  return normalizeAdminReviewsListResponse(response);
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
