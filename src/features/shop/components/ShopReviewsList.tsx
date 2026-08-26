import { StyleSheet, View } from 'react-native';

import { AppText } from '../../../components/ui/AppText';
import { EmptyState, Skeleton } from '../../../components/ecommerce';
import { colors, radius, spacing } from '../../../design-system';
import type { Review } from '../../../services/types/review';
import {
  getAverageReviewRating,
  getBuyerReviews,
  getReviewStarBreakdown,
} from '../utils/shopReviewsDisplay';
import { ShopReviewCard } from './ShopReviewCard';
import { ShopReviewsBreakdown } from './ShopReviewsBreakdown';
import { ShopReviewsSummary } from './ShopReviewsSummary';

export interface ShopReviewsListProps {
  reviews: Review[];
  averageRating?: number;
  isLoading?: boolean;
}

function ShopReviewsSkeleton() {
  return (
    <View style={styles.content}>
      <View style={styles.summarySkeleton}>
        <Skeleton variant="text" height={40} width={72} />
        <Skeleton variant="text" height={16} width={120} />
        <Skeleton variant="text" height={12} width={160} />
      </View>

      <View style={styles.breakdownSkeleton}>
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={`breakdown-${index}`} variant="rect" height={8} style={styles.breakdownBar} />
        ))}
      </View>

      {Array.from({ length: 2 }).map((_, index) => (
        <View key={`review-skeleton-${index}`} style={styles.reviewSkeleton}>
          <View style={styles.reviewHeaderSkeleton}>
            <Skeleton variant="circle" width={44} height={44} />
            <View style={styles.reviewMetaSkeleton}>
              <Skeleton variant="text" height={16} width="70%" />
              <Skeleton variant="text" height={12} width="50%" />
            </View>
          </View>
          <Skeleton variant="text" height={14} width="90%" />
          <Skeleton variant="text" height={12} width="100%" />
          <Skeleton variant="text" height={12} width="88%" />
        </View>
      ))}
    </View>
  );
}

export function ShopReviewsList({ reviews, averageRating, isLoading = false }: ShopReviewsListProps) {
  if (isLoading) {
    return <ShopReviewsSkeleton />;
  }

  const buyerReviews = getBuyerReviews(reviews);

  if (buyerReviews.length === 0) {
    return (
      <EmptyState
        title="No reviews yet"
        message="Buyer reviews will appear here once customers share feedback."
        style={styles.emptyState}
      />
    );
  }

  const resolvedAverage = averageRating ?? getAverageReviewRating(buyerReviews) ?? 0;
  const breakdown = getReviewStarBreakdown(buyerReviews);

  return (
    <View style={styles.content}>
      <AppText variant="h3" style={styles.sectionTitle}>
        Customer Reviews
      </AppText>

      <ShopReviewsSummary averageRating={resolvedAverage} reviewCount={buyerReviews.length} />
      <ShopReviewsBreakdown rows={breakdown} />

      <View style={styles.reviewList}>
        {buyerReviews.map((review, index) => (
          <ShopReviewCard key={review._id ?? `review-${index}`} review={review} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  reviewList: {
    gap: spacing.md,
  },
  emptyState: {
    marginTop: spacing.xl,
  },
  summarySkeleton: {
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.xl,
    borderRadius: radius.large,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  breakdownSkeleton: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.large,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  breakdownBar: {
    borderRadius: radius.pill,
  },
  reviewSkeleton: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.large,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  reviewHeaderSkeleton: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  reviewMetaSkeleton: {
    flex: 1,
    gap: spacing.xs,
  },
});
