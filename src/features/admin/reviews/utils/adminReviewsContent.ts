import type {
  AdminReviewDetailRecord,
  AdminReviewListItem,
  AdminReviewStatusFilter,
} from '../types/adminReviews';

export function isPopulatedAdminReviewUser(
  userId: AdminReviewListItem['UserId'],
): userId is Exclude<AdminReviewListItem['UserId'], string | undefined> {
  return Boolean(userId && typeof userId === 'object');
}

export function isPopulatedAdminReviewProduct(
  productId: AdminReviewListItem['productId'],
): productId is Exclude<AdminReviewListItem['productId'], string | undefined> {
  return Boolean(productId && typeof productId === 'object');
}

/** Client-side status filter — server ignores reviewStatus query params. */
export function filterAdminReviewsByStatus(
  reviews: AdminReviewListItem[],
  statusFilter: AdminReviewStatusFilter,
): AdminReviewListItem[] {
  if (!statusFilter) {
    return reviews;
  }

  return reviews.filter((review) => review.reviewStatus === statusFilter);
}

/**
 * Preserve populated list references when patching status from PUT Data
 * (which returns string UserId/productId only).
 */
export function patchAdminReviewListItem(
  existing: AdminReviewListItem,
  updated: AdminReviewDetailRecord,
): AdminReviewListItem {
  return {
    ...existing,
    ...updated,
    UserId: isPopulatedAdminReviewUser(existing.UserId) ? existing.UserId : updated.UserId,
    productId: isPopulatedAdminReviewProduct(existing.productId)
      ? existing.productId
      : updated.productId,
  };
}

export function patchAdminReviewInList(
  reviews: AdminReviewListItem[],
  reviewId: string,
  updated: AdminReviewDetailRecord,
): AdminReviewListItem[] {
  return reviews.map((review) => {
    if (review._id !== reviewId) {
      return review;
    }

    return patchAdminReviewListItem(review, updated);
  });
}

/** Detail display merges populated initialReview with unpopulated GET/PUT updates. */
export function mergeAdminReviewDetail(
  initialReview: AdminReviewListItem | undefined,
  remoteReview: AdminReviewDetailRecord | null,
): AdminReviewListItem | null {
  if (!initialReview && !remoteReview) {
    return null;
  }

  if (!remoteReview) {
    return initialReview ?? null;
  }

  if (!initialReview) {
    return remoteReview;
  }

  return patchAdminReviewListItem(initialReview, remoteReview);
}

export function getAdminReviewCustomerName(review: Pick<AdminReviewListItem, 'UserId'>): string {
  if (isPopulatedAdminReviewUser(review.UserId)) {
    const fullName = [review.UserId.firstName, review.UserId.lastName].filter(Boolean).join(' ').trim();
    return fullName || '—';
  }

  if (typeof review.UserId === 'string' && review.UserId.trim()) {
    return review.UserId.trim();
  }

  return '—';
}

export function getAdminReviewProductName(review: Pick<AdminReviewListItem, 'productId'>): string {
  if (isPopulatedAdminReviewProduct(review.productId)) {
    return review.productId.productName?.trim() || '—';
  }

  if (typeof review.productId === 'string' && review.productId.trim()) {
    return review.productId.trim();
  }

  return '—';
}

export function getAdminReviewTitle(review: Pick<AdminReviewListItem, 'title' | 'heading'>): string {
  return review.title?.trim() || review.heading?.trim() || '—';
}

export function formatAdminReviewStatus(status?: string | null): string {
  return status?.trim() || '—';
}
