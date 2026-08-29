import { useCallback, useEffect } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '../../../components/ecommerce/EmptyState';
import { ErrorState } from '../../../components/ecommerce/ErrorState';
import { AppText } from '../../../components/ui/AppText';
import { colors, spacing } from '../../../design-system';
import type { ShoppingStackParamList } from '../../../app/navigation/types';
import { OrderListPagination } from '../../orders/components/OrderListPagination';
import { AdminCommissionCardSkeleton } from '../../admin/commission/components/AdminCommissionCardSkeleton';
import { useAuth } from '../../auth/hooks/useAuth';
import { useRequireAuth } from '../../auth/hooks/useRequireAuth';
import { authReturnTo } from '../../auth/utils/authNavigation';
import { resolveAuthSellerId } from '../../auth/utils/resolveAuthSellerId';
import { resolveAuthUserId } from '../../auth/utils/resolveAuthUserId';
import { ReferralEarningCard } from '../referral-earnings/components/ReferralEarningCard';
import { ReferralEarningsContextCard } from '../referral-earnings/components/ReferralEarningsContextCard';
import { ReferralEarningsPayoutStatusTabs } from '../referral-earnings/components/ReferralEarningsPayoutStatusTabs';
import { ReferralEarningsSummaryCard } from '../referral-earnings/components/ReferralEarningsSummaryCard';
import { useReferralEarnings } from '../referral-earnings/hooks/useReferralEarnings';
import { navigateToReferralEarningDetail } from '../referral-earnings/navigation/referralEarningsNavigation';
import type { ReferralCommissionRecord } from '../referral-earnings/types/referralEarning';

type Props = NativeStackScreenProps<ShoppingStackParamList, 'ReferralEarnings'>;

const REFERRAL_EARNINGS_RETURN_TO = authReturnTo.referralEarnings();
const SKELETON_ITEMS = ['r1', 'r2', 'r3'] as const;

export function ReferralEarningsScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const initialStatusFilter = route.params?.payoutStatus ?? '';
  const { isAuthorized } = useRequireAuth(REFERRAL_EARNINGS_RETURN_TO);
  const { user, role } = useAuth();
  const userId = resolveAuthUserId(user);
  const sellerId = resolveAuthSellerId(user);
  const isSeller = role === 'seller' && Boolean(sellerId);

  const {
    commissions,
    summary,
    totalCount,
    currentPage,
    totalPages,
    statusFilter,
    hasActiveFilters,
    isLoading,
    isRefreshing,
    error,
    summaryError,
    setStatusFilter,
    refresh,
    retrySummary,
    goToPreviousPage,
    goToNextPage,
    canGoPrevious,
    canGoNext,
  } = useReferralEarnings(isAuthorized ? userId : undefined, initialStatusFilter);

  useEffect(() => {
    setStatusFilter(route.params?.payoutStatus ?? '');
  }, [route.params?.payoutStatus, setStatusFilter]);

  useFocusEffect(
    useCallback(() => {
      if (isAuthorized && userId) {
        void refresh();
      }
    }, [isAuthorized, refresh, userId]),
  );

  const handlePressRecord = useCallback(
    (record: ReferralCommissionRecord) => {
      const commissionId = record._id;
      if (!commissionId) {
        return;
      }

      navigateToReferralEarningDetail(navigation, commissionId, record);
    },
    [navigation],
  );

  const showSkeletonList = isLoading && commissions.length === 0 && !error;

  const renderItem = useCallback(
    ({ item }: { item: ReferralCommissionRecord }) => (
      <ReferralEarningCard record={item} onPress={handlePressRecord} />
    ),
    [handlePressRecord],
  );

  const listHeader = (
    <View style={styles.headerContent}>
      <ReferralEarningsContextCard isSeller={isSeller} />

      <ReferralEarningsSummaryCard
        summary={summary}
        summaryError={summaryError}
        onRetrySummary={() => void retrySummary()}
      />

      <ReferralEarningsPayoutStatusTabs activeStatus={statusFilter} onStatusChange={setStatusFilter} />

      {totalCount > 0 ? (
        <AppText variant="bodySmall" color="textSecondary" style={styles.countText}>
          {totalCount} {totalCount === 1 ? 'commission' : 'commissions'}
        </AppText>
      ) : null}

      {error && commissions.length > 0 ? (
        <ErrorState message={error} onAction={() => void refresh()} style={styles.inlineError} />
      ) : null}

      {showSkeletonList ? (
        <View style={styles.skeletonList}>
          {SKELETON_ITEMS.map((key) => (
            <AdminCommissionCardSkeleton key={key} />
          ))}
        </View>
      ) : null}
    </View>
  );

  if (!isAuthorized) {
    return <View style={[styles.screen, { paddingTop: insets.top }]} />;
  }

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + spacing.xxl },
        commissions.length === 0 && styles.emptyContent,
      ]}
      data={showSkeletonList ? [] : commissions}
      keyExtractor={(item, index) => item._id ?? `${item.orderId?._id ?? 'referral'}-${index}`}
      renderItem={renderItem}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      ListHeaderComponent={listHeader}
      ListFooterComponent={
        commissions.length > 0 ? (
          <OrderListPagination
            currentPage={currentPage}
            totalPages={totalPages}
            canGoPrevious={canGoPrevious}
            canGoNext={canGoNext}
            isLoading={isLoading}
            onPrevious={goToPreviousPage}
            onNext={goToNextPage}
          />
        ) : null
      }
      ListEmptyComponent={
        !showSkeletonList && !isLoading && !error ? (
          <EmptyState
            title="No referral earnings yet"
            message={
              hasActiveFilters
                ? 'Try adjusting your payout status filter.'
                : isSeller
                  ? 'When someone you referred shops on AFOMA, your commissions will appear here.'
                  : 'When someone you referred places an eligible order, your commissions will appear here.'
            }
          />
        ) : error && commissions.length === 0 ? (
          <ErrorState message={error} onAction={() => void refresh()} style={styles.inlineError} />
        ) : null
      }
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={() => void refresh()} tintColor={colors.primary} />
      }
      showsVerticalScrollIndicator={false}
    />
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
  emptyContent: {
    flexGrow: 1,
  },
  headerContent: {
    gap: spacing.md,
    paddingBottom: spacing.xs,
  },
  countText: {
    fontWeight: '600',
  },
  inlineError: {
    marginTop: 0,
  },
  skeletonList: {
    gap: spacing.md,
  },
  separator: {
    height: spacing.md,
  },
});
