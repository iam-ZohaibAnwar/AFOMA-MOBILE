import { useCallback, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ErrorState } from '../../../../components/ecommerce/ErrorState';
import { AppText } from '../../../../components/ui/AppText';
import { colors, spacing } from '../../../../design-system';
import { authReturnTo } from '../../../auth/utils/authNavigation';
import { useRequireAdmin } from '../../hooks/useRequireAdmin';
import type { AdminStackParamList } from '../../navigation/adminTypes';
import { AdminReviewStatusSheet } from '../components/AdminReviewStatusSheet';
import { AdminReviewDetailContentCard } from '../components/detail/AdminReviewDetailContentCard';
import { AdminReviewDetailHero } from '../components/detail/AdminReviewDetailHero';
import { AdminReviewDetailOperationsCard } from '../components/detail/AdminReviewDetailOperationsCard';
import { AdminReviewDetailRatingsCard } from '../components/detail/AdminReviewDetailRatingsCard';
import { useAdminReviewModeration } from '../hooks/useAdminReviewModeration';
import { useAdminReviewDetail } from '../hooks/useAdminReviews';
import type { AdminReviewStatus } from '../types/adminReviews';
import { formatAdminReviewStatus } from '../utils/adminReviewsContent';
import { navigateToAdminReviewProductPreview } from '../utils/adminReviewProductPreview';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminReviewDetail'>;

export function AdminReviewDetailScreen({ route }: Props) {
  const { reviewId, initialReview, listTab = 'customer' } = route.params;
  const navigation = useNavigation<NavigationProp<AdminStackParamList>>();
  const insets = useSafeAreaInsets();
  const returnTo = authReturnTo.adminReviewDetail(reviewId);
  const { isAuthorized } = useRequireAdmin(returnTo);
  const [statusSheetVisible, setStatusSheetVisible] = useState(false);

  const { review, isLoading, isRefreshing, error, reload, applyReviewUpdate } = useAdminReviewDetail({
    reviewId,
    initialReview,
    enabled: isAuthorized,
  });

  const { isUpdating, error: moderationError, updateStatus, clearError } = useAdminReviewModeration(
    isAuthorized ? reviewId : undefined,
  );

  const handleApplyStatus = useCallback(
    async (nextStatus: AdminReviewStatus) => {
      const updated = await updateStatus(nextStatus);
      if (!updated) {
        return;
      }

      applyReviewUpdate(updated);
      setStatusSheetVisible(false);
    },
    [applyReviewUpdate, updateStatus],
  );

  const handleViewProduct = useCallback(() => {
    if (!review) {
      return;
    }

    const didNavigate = navigateToAdminReviewProductPreview(navigation, review);
    if (!didNavigate) {
      Alert.alert('Product unavailable', 'This review does not include a product link yet.');
    }
  }, [navigation, review]);

  if (!isAuthorized) {
    return <View style={[styles.screen, { paddingTop: insets.top }]} />;
  }

  if (isLoading && !review && !error) {
    return (
      <View style={[styles.centeredState, { paddingBottom: insets.bottom }]}>
        <AppText variant="bodySmall" color="textSecondary">
          Loading review...
        </AppText>
      </View>
    );
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

  return (
    <>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => void reload()}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <AdminReviewDetailHero review={review} listTab={listTab} />
        <AdminReviewDetailRatingsCard review={review} />
        <AdminReviewDetailContentCard review={review} />
        <AdminReviewDetailOperationsCard
          review={review}
          isUpdating={isUpdating}
          onChangeStatusPress={() => {
            clearError();
            setStatusSheetVisible(true);
          }}
          onViewProductPress={handleViewProduct}
        />

        {error ? (
          <ErrorState message={error} onAction={() => void reload()} style={styles.inlineError} />
        ) : null}
      </ScrollView>

      <AdminReviewStatusSheet
        visible={statusSheetVisible}
        currentStatus={formatAdminReviewStatus(review.reviewStatus)}
        isUpdating={isUpdating}
        error={moderationError}
        onDismiss={() => setStatusSheetVisible(false)}
        onApply={(nextStatus) => {
          void handleApplyStatus(nextStatus);
        }}
        onClearError={clearError}
      />
    </>
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
