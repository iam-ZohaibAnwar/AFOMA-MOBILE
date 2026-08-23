import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ErrorState } from '../../../../components/ecommerce/ErrorState';
import { AppCard } from '../../../../components/ui/AppCard';
import { AppText } from '../../../../components/ui/AppText';
import { colors, spacing } from '../../../../design-system';
import type { SellerStackParamList } from '../../../../app/navigation/sellerTypes';
import { useAuth } from '../../../auth/hooks/useAuth';
import { authReturnTo } from '../../../auth/utils/authNavigation';
import { resolveAuthUserId } from '../../../auth/utils/resolveAuthUserId';
import { useRequireSeller } from '../../hooks/useRequireSeller';
import { SellerReviewReplySection } from '../components/SellerReviewReplySection';
import { useSellerReviewDetail } from '../hooks/useSellerReviewDetail';
import { useSellerReviewReply } from '../hooks/useSellerReviewReply';
import {
  formatSellerReviewDate,
  formatSellerReviewRating,
  formatSellerReviewStatus,
  getSellerReviewCustomerName,
  getSellerReviewProductName,
  getSellerReviewText,
  getSellerReviewTitle,
} from '../utils/sellerReviewsDisplay';

type Props = NativeStackScreenProps<SellerStackParamList, 'SellerReviewDetail'>;

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.field}>
      <AppText variant="caption" color="textSecondary">
        {label}
      </AppText>
      <AppText variant="bodyMedium" style={styles.fieldValue}>
        {value}
      </AppText>
    </View>
  );
}

function RatingField({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.ratingField}>
      <AppText variant="caption" color="textSecondary">
        {label}
      </AppText>
      <AppText variant="bodyMedium" style={styles.ratingValue}>
        {value}
      </AppText>
    </View>
  );
}

export function SellerReviewDetailScreen({ route }: Props) {
  const { reviewId, initialReview } = route.params;
  const insets = useSafeAreaInsets();
  const returnTo = authReturnTo.sellerReviewDetail(reviewId);
  const { isAuthorized } = useRequireSeller(returnTo);
  const { user } = useAuth();
  const userId = resolveAuthUserId(user);

  const { review, isLoading, error, reload, applyReviewUpdate } = useSellerReviewDetail(
    isAuthorized ? reviewId : undefined,
    initialReview,
  );

  const {
    sellerReply,
    isLoadingReply,
    replyError,
    isSubmitting,
    submitError,
    successMessage,
    hasReply,
    submitReply,
    reloadReply,
    clearSubmitFeedback,
  } = useSellerReviewReply(review, userId, applyReviewUpdate);

  if (!isAuthorized) {
    return (
      <View style={styles.centeredState}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isLoading && !review) {
    return (
      <View style={styles.centeredState}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!review) {
    return (
      <View style={[styles.centeredState, styles.errorWrap]}>
        <ErrorState message={error ?? 'Review not found.'} onAction={() => void reload()} />
      </View>
    );
  }

  const reviewDate = formatSellerReviewDate(review);
  const averageRating = formatSellerReviewRating(review.avgRating);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
      showsVerticalScrollIndicator={false}
    >
      {error ? <ErrorState message={error} onAction={() => void reload()} style={styles.error} /> : null}

      <AppCard variant="flat">
        <AppText variant="bodyMedium" style={styles.sectionTitle}>
          Customer review
        </AppText>
        <AppText variant="bodySmall" color="textSecondary" style={styles.ratingSummary}>
          ★ {averageRating}
        </AppText>
        <DetailField label="Customer" value={getSellerReviewCustomerName(review)} />
        <DetailField label="Product" value={getSellerReviewProductName(review)} />
        <DetailField label="Review title" value={getSellerReviewTitle(review)} />
        <DetailField label="Status" value={formatSellerReviewStatus(review.reviewStatus)} />
        {reviewDate !== '—' ? <DetailField label="Date" value={reviewDate} /> : null}
      </AppCard>

      <AppCard variant="flat">
        <AppText variant="bodyMedium" style={styles.sectionTitle}>
          Ratings
        </AppText>
        <View style={styles.ratingsRow}>
          <RatingField label="Average" value={averageRating} />
          <RatingField label="Price" value={formatSellerReviewRating(review.price)} />
          <RatingField label="Value" value={formatSellerReviewRating(review.value)} />
          <RatingField label="Quality" value={formatSellerReviewRating(review.quality)} />
        </View>
      </AppCard>

      <AppCard variant="flat">
        <AppText variant="caption" color="textSecondary">
          Review
        </AppText>
        <AppText variant="bodyMedium" style={styles.reviewText}>
          {getSellerReviewText(review)}
        </AppText>
      </AppCard>

      <SellerReviewReplySection
        hasReply={hasReply}
        sellerReply={sellerReply}
        isLoadingReply={isLoadingReply}
        replyError={replyError}
        isSubmitting={isSubmitting}
        submitError={submitError}
        successMessage={successMessage}
        onSubmitReply={submitReply}
        onReloadReply={() => void reloadReply()}
        onClearFeedback={clearSubmitFeedback}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.lg },
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  errorWrap: {
    padding: spacing.lg,
  },
  error: {
    alignSelf: 'stretch',
    marginHorizontal: 0,
  },
  field: {
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  fieldValue: {
    color: colors.textPrimary,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  ratingSummary: {
    marginBottom: spacing.sm,
  },
  ratingsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  ratingField: {
    minWidth: '22%',
    gap: 2,
  },
  ratingValue: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  reviewText: {
    color: colors.textPrimary,
    lineHeight: 22,
    marginTop: spacing.sm,
  },
});
