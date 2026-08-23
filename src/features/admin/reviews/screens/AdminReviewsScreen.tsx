import { useCallback } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '../../../../components/ecommerce/EmptyState';
import { ErrorState } from '../../../../components/ecommerce/ErrorState';
import { AppText } from '../../../../components/ui/AppText';
import { colors, spacing } from '../../../../design-system';
import { authReturnTo } from '../../../auth/utils/authNavigation';
import { useRequireAdmin } from '../../hooks/useRequireAdmin';
import type { AdminStackParamList } from '../../navigation/adminTypes';
import { AdminReviewCard } from '../components/AdminReviewCard';
import { AdminReviewStatusFilterChips } from '../components/AdminReviewStatusFilterChips';
import { useAdminReviews } from '../hooks/useAdminReviews';
import { getAdminReviewsEmptyStateMessage } from '../utils/adminReviewsDisplay';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminReviews'>;

const RETURN_TO = authReturnTo.adminReviews();

export function AdminReviewsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { isAuthorized } = useRequireAdmin(RETURN_TO);
  const {
    reviews,
    filteredReviews,
    statusFilter,
    setStatusFilter,
    isLoading,
    isRefreshing,
    error,
    refresh,
    applySessionPatchesToList,
  } = useAdminReviews({ enabled: isAuthorized });

  useFocusEffect(
    useCallback(() => {
      if (isAuthorized) {
        applySessionPatchesToList();
        void refresh();
      }
    }, [applySessionPatchesToList, isAuthorized, refresh]),
  );

  const emptyState = getAdminReviewsEmptyStateMessage(statusFilter);

  if (!isAuthorized) {
    return <View style={[styles.screen, { paddingTop: insets.top }]} />;
  }

  if (isLoading && reviews.length === 0 && !error) {
    return (
      <View style={[styles.centeredState, { paddingBottom: insets.bottom }]}>
        <AppText variant="bodySmall" color="textSecondary">
          Loading reviews…
        </AppText>
      </View>
    );
  }

  if (error && reviews.length === 0) {
    return (
      <View style={[styles.centeredState, { paddingBottom: insets.bottom }]}>
        <ErrorState message={error} onAction={() => void refresh()} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={() => void refresh()} tintColor={colors.primary} />
      }
    >
      <AppText variant="bodyMedium" color="textSecondary" style={styles.lead}>
        Moderate customer product reviews across the marketplace.
      </AppText>

      <AdminReviewStatusFilterChips value={statusFilter} onChange={setStatusFilter} />

      {error ? <ErrorState message={error} onAction={() => void refresh()} style={styles.inlineError} /> : null}

      <AppText variant="bodySmall" color="textSecondary">
        {filteredReviews.length} of {reviews.length} reviews
      </AppText>

      {filteredReviews.length === 0 ? (
        <EmptyState title={emptyState.title} message={emptyState.message} style={styles.emptyState} />
      ) : (
        filteredReviews.map((review) =>
          review._id ? (
            <AdminReviewCard
              key={review._id}
              review={review}
              onPress={() =>
                navigation.navigate('AdminReviewDetail', {
                  reviewId: review._id!,
                  initialReview: review,
                })
              }
            />
          ) : null,
        )
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },
  lead: {
    marginBottom: spacing.xs,
  },
  inlineError: {
    marginBottom: 0,
  },
  emptyState: {
    marginTop: spacing.sm,
  },
});
