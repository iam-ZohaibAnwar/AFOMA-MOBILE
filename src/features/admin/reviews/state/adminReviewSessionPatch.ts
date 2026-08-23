import type { AdminReviewDetailRecord, AdminReviewListItem } from '../types/adminReviews';
import { patchAdminReviewListItem } from '../utils/adminReviewsContent';

const sessionPatches = new Map<string, AdminReviewDetailRecord>();

export function setAdminReviewSessionPatch(
  reviewId: string,
  updated: AdminReviewDetailRecord,
): void {
  sessionPatches.set(reviewId, updated);
}

export function applyAdminReviewSessionPatch<T extends AdminReviewListItem>(
  review: T | null | undefined,
): T | null | undefined {
  if (!review?._id) {
    return review;
  }

  const patch = sessionPatches.get(review._id);
  if (!patch) {
    return review;
  }

  return patchAdminReviewListItem(review, patch) as T;
}

export function peekAdminReviewSessionPatches(): Map<string, AdminReviewDetailRecord> {
  return new Map(sessionPatches);
}

export function clearAdminReviewSessionPatch(reviewId: string): void {
  sessionPatches.delete(reviewId);
}
