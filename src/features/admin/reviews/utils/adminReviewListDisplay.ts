import type { Ionicons } from '@expo/vector-icons';

import { colors } from '../../../../design-system';
import type { AdminProductStatusChipTone } from '../../product-management/components/AdminProductStatusChip';
import type { AdminReviewListItem, AdminReviewListTabId } from '../types/adminReviews';
import {
  formatAdminReviewStatus,
  getAdminReviewCustomerName,
  getAdminReviewProductName,
  getAdminReviewTitle,
  isPopulatedAdminReviewProduct,
} from './adminReviewsContent';
import { adminReviewStatusBadgeVariant, getAdminReviewText } from './adminReviewsDisplay';

export function getAdminReviewListProductLabel(
  review: AdminReviewListItem,
  listTab: AdminReviewListTabId,
): string {
  if (listTab === 'seller-replies' && review.isReply) {
    const productName = getAdminReviewProductName(review);
    if (productName === '—') {
      return 'Seller reply to customer';
    }
  }

  return getAdminReviewProductName(review);
}

export function resolveAdminReviewAccentColor(status?: string | null): string {
  const variant = adminReviewStatusBadgeVariant(status);

  if (variant === 'success') {
    return colors.success;
  }

  if (variant === 'warning') {
    return colors.warningText;
  }

  return colors.primary;
}

export function resolveAdminReviewListIcon(
  listTab: AdminReviewListTabId,
): keyof typeof Ionicons.glyphMap {
  return listTab === 'seller-replies' ? 'chatbubble-ellipses-outline' : 'star-outline';
}

export function resolveAdminReviewListStatusChips(review: AdminReviewListItem) {
  const statusLabel = formatAdminReviewStatus(review.reviewStatus);
  const variant = adminReviewStatusBadgeVariant(review.reviewStatus);

  return [
    {
      id: 'status',
      label: statusLabel,
      icon:
        variant === 'success'
          ? ('checkmark-circle-outline' as const)
          : variant === 'warning'
            ? ('close-circle-outline' as const)
            : ('time-outline' as const),
      tone:
        (variant === 'success'
          ? 'success'
          : variant === 'warning'
            ? 'warning'
            : 'neutral') as AdminProductStatusChipTone,
    },
  ];
}

export function formatAdminReviewRating(value?: number | null): string {
  if (value == null || !Number.isFinite(value)) {
    return '—';
  }

  return value.toFixed(1);
}

export function filterAdminReviewsBySearch(
  reviews: AdminReviewListItem[],
  searchTerm: string,
): AdminReviewListItem[] {
  const query = searchTerm.trim().toLowerCase();
  if (!query) {
    return reviews;
  }

  return reviews.filter((review) => {
    const haystack = [
      getAdminReviewCustomerName(review),
      getAdminReviewProductName(review),
      getAdminReviewTitle(review),
      getAdminReviewText(review),
      review._id,
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(query);
  });
}

export function canOpenAdminReviewProductPreview(review: AdminReviewListItem): boolean {
  if (!isPopulatedAdminReviewProduct(review.productId)) {
    return false;
  }

  return Boolean(review.productId.slug?.trim() || review.productId._id?.trim());
}
