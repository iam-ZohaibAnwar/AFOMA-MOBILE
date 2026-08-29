import type { Ionicons } from '@expo/vector-icons';

import { colors } from '../../../../design-system';
import type { AdminProductStatusChipTone } from '../../../admin/product-management/components/AdminProductStatusChip';
import type { SellerReviewListItem, SellerReviewReplyFilter, SellerReviewStatusFilter } from '../types/sellerReview';
import {
  formatSellerReviewStatus,
  getReviewReplyId,
  getSellerReviewCustomerName,
  getSellerReviewProductName,
  getSellerReviewText,
  getSellerReviewTitle,
  sellerReviewStatusBadgeVariant,
} from './sellerReviewsDisplay';

export function resolveSellerReviewAccentColor(status?: string | null): string {
  const variant = sellerReviewStatusBadgeVariant(status);

  if (variant === 'success') {
    return colors.success;
  }

  if (variant === 'warning') {
    return colors.warningText;
  }

  return colors.primary;
}

export function resolveSellerReviewListIcon(): keyof typeof Ionicons.glyphMap {
  return 'star-outline';
}

export function resolveSellerReviewListStatusChips(review: SellerReviewListItem) {
  const statusLabel = formatSellerReviewStatus(review.reviewStatus);
  const variant = sellerReviewStatusBadgeVariant(review.reviewStatus);
  const chips: Array<{
    id: string;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    tone: AdminProductStatusChipTone;
  }> = [
    {
      id: 'status',
      label: statusLabel,
      icon:
        variant === 'success'
          ? 'checkmark-circle-outline'
          : variant === 'warning'
            ? 'close-circle-outline'
            : 'time-outline',
      tone:
        variant === 'success' ? 'success' : variant === 'warning' ? 'warning' : 'neutral',
    },
  ];

  if (getReviewReplyId(review)) {
    chips.push({
      id: 'reply',
      label: 'Replied',
      icon: 'chatbubble-ellipses-outline',
      tone: 'info',
    });
  }

  return chips;
}

export function formatSellerReviewListRating(value?: number | null): string {
  if (value == null || !Number.isFinite(value)) {
    return '—';
  }

  return value.toFixed(1);
}

export function filterSellerReviewsByStatus(
  reviews: SellerReviewListItem[],
  statusFilter: SellerReviewStatusFilter,
): SellerReviewListItem[] {
  if (!statusFilter) {
    return reviews;
  }

  return reviews.filter((review) => review.reviewStatus === statusFilter);
}

export function filterSellerReviewsByReply(
  reviews: SellerReviewListItem[],
  replyFilter: SellerReviewReplyFilter,
): SellerReviewListItem[] {
  if (!replyFilter) {
    return reviews;
  }

  return reviews.filter((review) => {
    const hasReply = Boolean(getReviewReplyId(review));

    if (replyFilter === 'replied') {
      return hasReply;
    }

    return !hasReply;
  });
}

export function filterSellerReviewsBySearch(
  reviews: SellerReviewListItem[],
  searchTerm: string,
): SellerReviewListItem[] {
  const query = searchTerm.trim().toLowerCase();
  if (!query) {
    return reviews;
  }

  return reviews.filter((review) => {
    const haystack = [
      getSellerReviewCustomerName(review),
      getSellerReviewProductName(review),
      getSellerReviewTitle(review),
      getSellerReviewText(review),
      review._id,
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(query);
  });
}

export function getSellerReviewsEmptyStateMessage(
  statusFilter: SellerReviewStatusFilter,
  replyFilter: SellerReviewReplyFilter,
): { title: string; message: string } {
  if (replyFilter === 'needs-reply') {
    return {
      title: 'No reviews need a reply',
      message: 'Customer reviews waiting for your response will appear here.',
    };
  }

  if (replyFilter === 'replied') {
    return {
      title: 'No replies yet',
      message: 'Reviews you have replied to will appear here.',
    };
  }

  switch (statusFilter) {
    case 'Pending':
      return {
        title: 'No pending reviews',
        message: 'Reviews awaiting moderation will appear here.',
      };
    case 'Approved':
      return {
        title: 'No approved reviews',
        message: 'Approved customer reviews will appear here.',
      };
    case 'Disapproved':
      return {
        title: 'No disapproved reviews',
        message: 'Disapproved reviews will appear here if moderation rejects feedback.',
      };
    default:
      return {
        title: 'No reviews yet',
        message: 'Customer product reviews will appear here once shoppers submit feedback.',
      };
  }
}
