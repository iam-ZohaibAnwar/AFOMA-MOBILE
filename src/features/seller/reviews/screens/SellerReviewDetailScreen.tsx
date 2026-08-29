import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ErrorState } from '../../../../components/ecommerce/ErrorState';
import { colors, spacing } from '../../../../design-system';
import { AdminReviewDetailContentCard } from '../../../admin/reviews/components/detail/AdminReviewDetailContentCard';
import { AdminReviewDetailRatingsCard } from '../../../admin/reviews/components/detail/AdminReviewDetailRatingsCard';
import type { AdminReviewListItem } from '../../../admin/reviews/types/adminReviews';
import type { SellerStackParamList } from '../../../../app/navigation/sellerTypes';
import { useAuth } from '../../../auth/hooks/useAuth';
import { authReturnTo } from '../../../auth/utils/authNavigation';
import { resolveAuthUserId } from '../../../auth/utils/resolveAuthUserId';
import { useRequireSeller } from '../../hooks/useRequireSeller';
import { SellerReviewDetailHero } from '../components/detail/SellerReviewDetailHero';
import { SellerReviewReplySection } from '../components/SellerReviewReplySection';
import { useSellerReviewDetail } from '../hooks/useSellerReviewDetail';
import { useSellerReviewReply } from '../hooks/useSellerReviewReply';

type Props = NativeStackScreenProps<SellerStackParamList, 'SellerReviewDetail'>;

export function SellerReviewDetailScreen({ route }: Props) {
  const { reviewId, initialReview } = route.params;
  const insets = useSafeAreaInsets();
  const returnTo = authReturnTo.sellerReviewDetail(reviewId, initialReview);
  const { isAuthorized } = useRequireSeller(returnTo);
  const { user } = useAuth();
  const userId = resolveAuthUserId(user);

  const { review, isRefreshing, error, reload, applyReviewUpdate } = useSellerReviewDetail(
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
    return <View style={[styles.screen, { paddingTop: insets.top }]} />;
  }

  if (error && !review) {
    return (
      <View style={[styles.centeredState, { paddingBottom: insets.bottom }]}>
        <ErrorState message={error} onAction={() => void reload()} />
      </View>
    );
  }

  if (!review) {
    return <View style={[styles.screen, { paddingTop: insets.top }]} />;
  }

  const displayReview = review as AdminReviewListItem;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={() => void reload()} tintColor={colors.primary} />
      }
      showsVerticalScrollIndicator={false}
    >
      {error ? (
        <ErrorState message={error} onAction={() => void reload()} style={styles.inlineError} />
      ) : null}

      <SellerReviewDetailHero review={review} />
      <AdminReviewDetailRatingsCard review={displayReview} />
      <AdminReviewDetailContentCard review={displayReview} />

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
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },
  inlineError: {
    marginHorizontal: 0,
  },
});
