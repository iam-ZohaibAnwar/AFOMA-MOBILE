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

import { EmptyState } from '../../../../components/ecommerce/EmptyState';
import { ErrorState } from '../../../../components/ecommerce/ErrorState';
import { AppText } from '../../../../components/ui/AppText';
import { colors, spacing } from '../../../../design-system';
import { OrderListPagination } from '../../../orders/components/OrderListPagination';
import { OrderListSearchBar } from '../../../orders/components/OrderListSearchBar';
import { AdminCommissionCardSkeleton } from '../../../admin/commission/components/AdminCommissionCardSkeleton';
import type { SellerStackParamList } from '../../../../app/navigation/sellerTypes';
import { authReturnTo } from '../../../auth/utils/authNavigation';
import { useRequireSeller } from '../../hooks/useRequireSeller';
import { SellerEarningCard } from '../components/SellerEarningCard';
import { SellerEarningsPayoutStatusTabs } from '../components/SellerEarningsPayoutStatusTabs';
import { SellerEarningsSummary } from '../components/SellerEarningsSummary';
import { useSellerEarnings } from '../hooks/useSellerEarnings';
import { navigateToSellerEarningDetail } from '../navigation/sellerEarningsNavigation';
import type { SellerCommissionRecord } from '../types/sellerEarning';

type Props = NativeStackScreenProps<SellerStackParamList, 'SellerEarnings'>;

const EARNINGS_RETURN_TO = authReturnTo.sellerEarnings();
const SKELETON_ITEMS = ['e1', 'e2', 'e3'] as const;

export function SellerEarningsScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const initialStatusFilter = route.params?.payoutStatus ?? '';
  const { isAuthorized, sellerId } = useRequireSeller(EARNINGS_RETURN_TO);

  const {
    commissions,
    payoutSummary,
    currentPage,
    totalPages,
    statusFilter,
    searchTerm,
    hasActiveFilters,
    isLoading,
    isRefreshing,
    error,
    summaryError,
    setStatusFilter,
    setSearchTerm,
    refresh,
    retrySummary,
    goToPreviousPage,
    goToNextPage,
    canGoPrevious,
    canGoNext,
  } = useSellerEarnings(isAuthorized ? sellerId : undefined, initialStatusFilter);

  useEffect(() => {
    setStatusFilter(route.params?.payoutStatus ?? '');
  }, [route.params?.payoutStatus, setStatusFilter]);

  useFocusEffect(
    useCallback(() => {
      if (isAuthorized && sellerId) {
        void refresh();
      }
    }, [isAuthorized, refresh, sellerId]),
  );

  const handlePressRecord = useCallback(
    (record: SellerCommissionRecord) => {
      const commissionId = record._id;
      if (!commissionId) {
        return;
      }

      navigateToSellerEarningDetail(navigation, commissionId, record);
    },
    [navigation],
  );

  const showSkeletonList = isLoading && commissions.length === 0 && !error;

  const renderItem = useCallback(
    ({ item }: { item: SellerCommissionRecord }) => (
      <SellerEarningCard record={item} onPress={handlePressRecord} />
    ),
    [handlePressRecord],
  );

  const listHeader = (
    <View style={styles.headerContent}>
      <SellerEarningsSummary
        payoutSummary={payoutSummary}
        summaryError={summaryError}
        onRetrySummary={() => void retrySummary()}
      />

      <OrderListSearchBar
        value={searchTerm}
        onChangeText={setSearchTerm}
        placeholder="Search product..."
        accessibilityLabel="Search earnings by product name"
      />

      <SellerEarningsPayoutStatusTabs activeStatus={statusFilter} onStatusChange={setStatusFilter} />

      {commissions.length > 0 ? (
        <AppText variant="bodySmall" color="textSecondary" style={styles.countText}>
          {commissions.length} {commissions.length === 1 ? 'record' : 'records'}
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
      keyExtractor={(item, index) => item._id ?? `${item.orderId?._id ?? 'earning'}-${index}`}
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
            title="No earnings found"
            message={
              hasActiveFilters || searchTerm.trim()
                ? 'Try adjusting your search or payout status filter.'
                : 'Seller earnings will appear here once orders are completed.'
            }
          />
        ) : error && commissions.length === 0 ? (
          <ErrorState message={error} onAction={() => void refresh()} style={styles.inlineError} />
        ) : null
      }
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={() => void refresh()} tintColor={colors.primary} />
      }
      keyboardShouldPersistTaps="handled"
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
