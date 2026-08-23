import type { AppBadgeProps } from '../../../../components/ui/AppBadge';
import type { AdminReviewListItem, AdminReviewStatusFilter } from '../types/adminReviews';
import { formatAdminReviewStatus } from './adminReviewsContent';

export function getAdminReviewText(review: Pick<AdminReviewListItem, 'reviewText' | 'comment'>): string {
  return review.reviewText?.trim() || review.comment?.trim() || '—';
}

export function getAdminReviewCustomerEmail(review: Pick<AdminReviewListItem, 'UserId'>): string | undefined {
  if (review.UserId && typeof review.UserId === 'object') {
    return review.UserId.email?.trim() || undefined;
  }

  return undefined;
}

export function adminReviewStatusBadgeVariant(
  status?: string | null,
): NonNullable<AppBadgeProps['variant']> {
  const normalized = formatAdminReviewStatus(status);

  if (normalized === 'Approved') {
    return 'success';
  }

  if (normalized === 'Disapproved') {
    return 'warning';
  }

  if (normalized === 'Pending') {
    return 'neutral';
  }

  return 'neutral';
}

export function getAdminReviewsEmptyStateMessage(statusFilter: AdminReviewStatusFilter): {
  title: string;
  message: string;
} {
  switch (statusFilter) {
    case 'Pending':
      return {
        title: 'No pending reviews',
        message: 'All customer reviews have been moderated.',
      };
    case 'Approved':
      return {
        title: 'No approved reviews',
        message: 'Approved reviews will appear here once you moderate pending feedback.',
      };
    case 'Disapproved':
      return {
        title: 'No disapproved reviews',
        message: 'Disapproved reviews will appear here when moderation rejects feedback.',
      };
    default:
      return {
        title: 'No reviews yet',
        message: 'Customer product reviews will appear here once shoppers submit feedback.',
      };
  }
}
