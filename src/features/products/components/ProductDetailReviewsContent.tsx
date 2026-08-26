import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Rating } from '../../../components/ecommerce';
import { AppText } from '../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../design-system';
import type { PdpTheme } from '../../../design-system/pdpTheme';
import type { Review } from '../../../services/types/review';

export interface ProductDetailReviewsContentProps {
  reviews: Review[];
  reviewCount: number;
  isLoading: boolean;
  theme: PdpTheme;
}

function getReviewerName(review: Review): string {
  const user = review.UserId;
  if (typeof user === 'string') {
    return 'Verified buyer';
  }

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim();
  if (!fullName) {
    return 'Verified buyer';
  }

  const [firstName, ...rest] = fullName.split(/\s+/);
  if (rest.length === 0) {
    return firstName;
  }

  return `${firstName} ${rest[0].charAt(0)}.`;
}

function getReviewText(review: Review): string {
  return review.comment?.trim() || review.reviewText?.trim() || review.heading?.trim() || '';
}

function getReviewRating(review: Review): number {
  const value = review.avgRating ?? review.value ?? review.quality ?? review.price;
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : 5;
}

export function ProductDetailReviewsContent({
  reviews,
  reviewCount,
  isLoading,
  theme,
}: ProductDetailReviewsContentProps) {
  if (isLoading) {
    return (
      <View style={styles.loadingRow}>
        <ActivityIndicator size="small" color={colors.textPrimary} />
        <AppText variant="bodySmall" style={{ color: theme.textSecondary }}>
          Loading reviews…
        </AppText>
      </View>
    );
  }

  if (reviewCount === 0 || reviews.length === 0) {
    return (
      <AppText variant="bodySmall" style={{ color: theme.textSecondary }}>
        No reviews yet for this product.
      </AppText>
    );
  }

  const visibleReviews = reviews.filter((review) => !review.isReply && getReviewText(review)).slice(0, 3);

  return (
    <View style={styles.container}>
      {visibleReviews.map((review, index) => (
        <View
          key={review._id ?? `review-${index}`}
          style={[styles.reviewCard, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}
        >
          <View style={styles.reviewHeader}>
            <AppText variant="bodyMedium" style={[styles.reviewerName, { color: theme.textPrimary }]}>
              {getReviewerName(review)}
            </AppText>
            <Rating
              value={getReviewRating(review)}
              size="sm"
              starFilledColor={theme.starFilled}
              starEmptyColor={theme.starEmpty}
            />
          </View>
          <AppText
            variant="bodySmall"
            style={{ color: theme.textSecondary }}
            numberOfLines={3}
          >
            {getReviewText(review)}
          </AppText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  reviewCard: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.large,
    borderWidth: StyleSheet.hairlineWidth,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  reviewerName: {
    flex: 1,
    fontWeight: '700',
  },
});
