import { Image, StyleSheet, View } from 'react-native';

import { AppCard } from '../../../components/ui/AppCard';
import { AppText } from '../../../components/ui/AppText';
import { EmptyState, Rating } from '../../../components/ecommerce';
import { colors, spacing } from '../../../design-system';
import type { Review } from '../../../services/types/review';

export interface ShopReviewsListProps {
  reviews: Review[];
}

function getReviewerName(review: Review): string {
  const user = review.UserId;
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim();
  return fullName || 'Verified buyer';
}

function getReviewText(review: Review): string {
  return review.comment?.trim() || review.heading?.trim() || 'Great product and smooth shopping experience.';
}

function getProductImage(review: Review): string | undefined {
  return review.productId?.images?.[0]?.imageUrl;
}

export function ShopReviewsList({ reviews }: ShopReviewsListProps) {
  if (reviews.length === 0) {
    return (
      <EmptyState
        title="No reviews yet"
        message="Buyer reviews will appear here once customers share feedback."
        style={styles.emptyState}
      />
    );
  }

  return (
    <View style={styles.content}>
      {reviews.map((review, index) => (
        <AppCard key={review._id ?? `review-${index}`} variant="elevated" style={styles.reviewCard}>
          <View style={styles.reviewHeader}>
            {getProductImage(review) ? (
              <Image source={{ uri: getProductImage(review) }} style={styles.productImage} />
            ) : (
              <View style={styles.productImagePlaceholder} />
            )}

            <View style={styles.reviewMeta}>
              <AppText variant="bodyMedium" style={styles.productName} numberOfLines={2}>
                {review.productId?.productName ?? 'Product review'}
              </AppText>
              <Rating value={review.avgRating ?? review.value ?? 5} size="sm" />
            </View>
          </View>

          <AppText variant="bodySmall" color="textSecondary" style={styles.reviewText}>
            {getReviewText(review)}
          </AppText>

          <AppText variant="caption" color="textMuted">
            — {getReviewerName(review)}
          </AppText>
        </AppCard>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  emptyState: {
    marginTop: spacing.xl,
  },
  reviewCard: {
    gap: spacing.md,
    backgroundColor: colors.surface,
  },
  reviewHeader: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  productImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: colors.surfaceSecondary,
  },
  productImagePlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: colors.surfaceSecondary,
  },
  reviewMeta: {
    flex: 1,
    gap: spacing.xs,
  },
  productName: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
  reviewText: {
    lineHeight: 20,
  },
});
