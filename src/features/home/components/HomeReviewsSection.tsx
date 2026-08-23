import { ScrollView, StyleSheet, View } from 'react-native';

import { AppCard } from '../../../components/ui/AppCard';
import { AppText } from '../../../components/ui/AppText';
import { EmptyState, ErrorState, Rating, Skeleton } from '../../../components/ecommerce';
import { colors, screenPaddingHorizontal, spacing } from '../../../design-system';
import type { Review } from '../../../services/types/review';

interface HomeReviewsSectionProps {
  reviews: Review[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

function getReviewerName(review: Review): string {
  const user = review.UserId;
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim();
  return fullName || 'Verified buyer';
}

function getReviewQuote(review: Review): string {
  const comment = review.comment?.trim();
  if (comment) {
    return `"${comment}"`;
  }

  const heading = review.heading?.trim();
  return heading ? `"${heading}"` : '"Great product and smooth shopping experience."';
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <AppCard variant="elevated" style={styles.reviewCard}>
      <Rating value={review.avgRating ?? review.value ?? 5} size="sm" />
      <AppText variant="body" color="textSecondary" style={styles.quote}>
        {getReviewQuote(review)}
      </AppText>
      <AppText variant="label" color="textPrimary">
        — {getReviewerName(review)}
      </AppText>
    </AppCard>
  );
}

export function HomeReviewsSection({
  reviews,
  isLoading,
  error,
  onRetry,
}: HomeReviewsSectionProps) {
  if (isLoading) {
    return (
      <View style={styles.loadingWrap}>
        <Skeleton variant="rect" height={160} style={styles.skeleton} />
      </View>
    );
  }

  if (error) {
    return (
      <ErrorState message={error} onAction={() => void onRetry()} style={styles.statePanel} />
    );
  }

  if (reviews.length === 0) {
    return (
      <EmptyState
        title="No reviews yet"
        message="Buyer reviews will appear here once customers share feedback."
        style={styles.statePanel}
      />
    );
  }

  if (reviews.length === 1) {
    return (
      <View style={styles.singleWrap}>
        <ReviewCard review={reviews[0]} />
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      decelerationRate="fast"
    >
      {reviews.map((review, index) => (
        <View key={review._id ?? `review-${index}`} style={styles.reviewWrap}>
          <ReviewCard review={review} />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: screenPaddingHorizontal,
    gap: spacing.md,
    paddingBottom: spacing.xs,
  },
  reviewWrap: {
    width: 300,
  },
  reviewCard: {
    gap: spacing.md,
    backgroundColor: colors.surface,
  },
  quote: {
    lineHeight: 22,
  },
  singleWrap: {
    paddingHorizontal: screenPaddingHorizontal,
  },
  loadingWrap: {
    paddingHorizontal: screenPaddingHorizontal,
  },
  skeleton: {
    borderRadius: 12,
  },
  statePanel: {
    marginHorizontal: screenPaddingHorizontal,
  },
});
