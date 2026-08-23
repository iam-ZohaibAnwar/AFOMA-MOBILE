import { useCallback, useEffect } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '../../../../components/ecommerce/EmptyState';
import { ErrorState } from '../../../../components/ecommerce/ErrorState';
import { SearchBar } from '../../../../components/ecommerce/SearchBar';
import { AppCard } from '../../../../components/ui/AppCard';
import { AppText } from '../../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../../design-system';
import type { SellerStackParamList } from '../../../../app/navigation/sellerTypes';
import { authReturnTo } from '../../../auth/utils/authNavigation';
import { useRequireSeller } from '../../hooks/useRequireSeller';
import { SellerEarningCard } from '../components/SellerEarningCard';
import { useSellerEarnings } from '../hooks/useSellerEarnings';
import type { SellerCommissionRecord, SellerEarningsPayoutStatusFilter } from '../types/sellerEarning';
import { formatSellerEarningSummaryAmount } from '../utils/sellerEarningsDisplay';

type Props = NativeStackScreenProps<SellerStackParamList, 'SellerEarnings'>;

const EARNINGS_RETURN_TO = authReturnTo.sellerEarnings();

const STATUS_FILTERS: Array<{ label: string; value: SellerEarningsPayoutStatusFilter }> = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'Pending' },
  { label: 'Paid', value: 'Paid' },
];

export function SellerEarningsScreen({ route }: Props) {
  const insets = useSafeAreaInsets();
  const { isAuthorized, sellerId } = useRequireSeller(EARNINGS_RETURN_TO);
  const initialStatusFilter = route.params?.payoutStatus ?? '';

  const {
    commissions,
    payoutSummary,
    currentPage,
    totalPages,
    statusFilter,
    searchTerm,
    isLoading,
    isRefreshing,
    error,
    summaryError,
    setStatusFilter,
    setSearchTerm,
    refresh,
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

  const renderItem = useCallback(
    ({ item }: { item: SellerCommissionRecord }) => <SellerEarningCard record={item} />,
    [],
  );

  const listHeader = (
    <View style={styles.headerContent}>
      <AppCard variant="flat" style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryColumn}>
            <AppText variant="caption" color="textSecondary">
              Pending
            </AppText>
            <AppText variant="h3" style={styles.summaryAmount}>
              {formatSellerEarningSummaryAmount(payoutSummary?.totalPendingPayoutAmount)}
            </AppText>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryColumn}>
            <AppText variant="caption" color="textSecondary">
              Completed
            </AppText>
            <AppText variant="h3" style={styles.summaryAmount}>
              {formatSellerEarningSummaryAmount(payoutSummary?.totalPaidPayoutAmount)}
            </AppText>
          </View>
        </View>
      </AppCard>

      {summaryError ? (
        <ErrorState message={summaryError} onAction={() => void refresh()} style={styles.inlineError} />
      ) : null}

      <View style={styles.filterRow}>
        {STATUS_FILTERS.map((filter) => {
          const isActive = statusFilter === filter.value;

          return (
            <Pressable
              key={filter.label}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              onPress={() => setStatusFilter(filter.value)}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
            >
              <AppText
                variant="bodySmall"
                color={isActive ? 'textInverse' : 'textSecondary'}
                style={styles.filterChipLabel}
              >
                {filter.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      <SearchBar
        mode="input"
        placeholder="Search product..."
        value={searchTerm}
        onChangeText={setSearchTerm}
      />

      {error ? (
        <ErrorState message={error} onAction={() => void refresh()} style={styles.inlineError} />
      ) : null}

      {isLoading && commissions.length === 0 ? (
        <View style={styles.inlineLoading}>
          <ActivityIndicator size="small" color={colors.primary} />
          <AppText variant="bodySmall" color="textSecondary">
            Loading earnings...
          </AppText>
        </View>
      ) : null}
    </View>
  );

  const listFooter =
    commissions.length > 0 ? (
      <View style={styles.pagination}>
        <Pressable
          accessibilityRole="button"
          onPress={goToPreviousPage}
          disabled={!canGoPrevious}
          style={[styles.paginationButton, !canGoPrevious && styles.paginationButtonDisabled]}
        >
          <AppText variant="bodySmall" color={canGoPrevious ? 'textLink' : 'textMuted'}>
            Previous
          </AppText>
        </Pressable>

        <AppText variant="bodySmall" color="textSecondary">
          Page {currentPage} of {totalPages}
        </AppText>

        <Pressable
          accessibilityRole="button"
          onPress={goToNextPage}
          disabled={!canGoNext}
          style={[styles.paginationButton, !canGoNext && styles.paginationButtonDisabled]}
        >
          <AppText variant="bodySmall" color={canGoNext ? 'textLink' : 'textMuted'}>
            Next
          </AppText>
        </Pressable>
      </View>
    ) : null;

  if (!isAuthorized) {
    return (
      <View style={styles.centeredState}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + spacing.xxl },
        commissions.length === 0 && styles.emptyContent,
      ]}
      data={commissions}
      keyExtractor={(item, index) => item._id ?? `${item.orderId?._id ?? 'earning'}-${index}`}
      renderItem={renderItem}
      ListHeaderComponent={listHeader}
      ListFooterComponent={listFooter}
      ListEmptyComponent={
        !isLoading && !error ? (
          <EmptyState title="No orders received" message="Seller earnings will appear here." />
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
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  headerContent: {
    gap: spacing.md,
  },
  summaryCard: {
    padding: spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  summaryColumn: {
    flex: 1,
    gap: spacing.xs,
    alignItems: 'center',
  },
  summaryDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderStrong,
    marginHorizontal: spacing.md,
  },
  summaryAmount: {
    color: colors.primary,
    fontWeight: '700',
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  filterChip: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipLabel: {
    fontWeight: '600',
  },
  inlineError: {
    marginHorizontal: 0,
    alignSelf: 'stretch',
  },
  inlineLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  paginationButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  paginationButtonDisabled: {
    opacity: 0.5,
  },
});
