import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '../../../../components/ecommerce/EmptyState';
import { ErrorState } from '../../../../components/ecommerce/ErrorState';
import { SearchBar } from '../../../../components/ecommerce/SearchBar';
import { AppButton } from '../../../../components/ui/AppButton';
import { AppText } from '../../../../components/ui/AppText';
import { colors, spacing } from '../../../../design-system';
import type { AdminStackParamList } from '../../navigation/adminTypes';
import { useRequireAdmin } from '../../hooks/useRequireAdmin';
import { authReturnTo } from '../../../auth/utils/authNavigation';
import { AdminOrderCard } from '../components/AdminOrderCard';
import { AdminOrderFiltersSheet } from '../components/AdminOrderFiltersSheet';
import { useAdminOrderList } from '../hooks/useAdminOrderList';
import type { AdminOrderListItem } from '../types/adminOrderManagement';
import { ADMIN_ORDER_STATUS_FILTERS } from '../utils/adminOrderDisplay';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminOrderManagement'>;

const LIST_RETURN_TO = authReturnTo.adminOrderManagement();

export function AdminOrderManagementScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { isAuthorized } = useRequireAdmin(LIST_RETURN_TO);
  const [filtersVisible, setFiltersVisible] = useState(false);

  const {
    orders,
    currentPage,
    totalPages,
    totalOrders,
    isLoading,
    isRefreshing,
    error,
    searchInput,
    setSearchInput,
    statusFilter,
    hasActiveFilters,
    applyStatusFilter,
    clearStatusFilter,
    refresh,
    goToPreviousPage,
    goToNextPage,
    canGoPrevious,
    canGoNext,
  } = useAdminOrderList(isAuthorized);

  const activeFilterSummary = useMemo(() => {
    if (!statusFilter) {
      return '';
    }

    const match = ADMIN_ORDER_STATUS_FILTERS.find((option) => option.value === statusFilter);
    return match ? `Status: ${match.label}` : `Status: ${statusFilter}`;
  }, [statusFilter]);

  const handleOrderPress = useCallback(
    (order: AdminOrderListItem) => {
      if (!order._id) {
        return;
      }

      navigation.navigate('AdminOrderDetail', {
        orderId: order._id,
        initialOrder: order,
      });
    },
    [navigation],
  );

  const renderItem = useCallback(
    ({ item }: { item: AdminOrderListItem }) => (
      <AdminOrderCard order={item} onPress={handleOrderPress} />
    ),
    [handleOrderPress],
  );

  const listHeader = (
    <View style={styles.headerContent}>
      <View style={styles.titleBlock}>
        <AppText variant="h3">Order Management</AppText>
        <AppText variant="bodySmall" color="textSecondary">
          {totalOrders} {totalOrders === 1 ? 'order' : 'orders'}
        </AppText>
      </View>

      <SearchBar
        mode="input"
        placeholder="Search by customer name..."
        value={searchInput}
        onChangeText={setSearchInput}
      />

      <View style={styles.filterRow}>
        <AppButton
          label={hasActiveFilters ? 'Filters (active)' : 'Filters'}
          variant="outline"
          onPress={() => setFiltersVisible(true)}
        />
        {hasActiveFilters ? (
          <Pressable accessibilityRole="button" onPress={clearStatusFilter} style={styles.clearFilters}>
            <AppText variant="bodySmall" color="textLink">
              Clear
            </AppText>
          </Pressable>
        ) : null}
      </View>

      {activeFilterSummary ? (
        <AppText variant="caption" color="textSecondary">
          {activeFilterSummary}
        </AppText>
      ) : null}

      {error && orders.length === 0 ? (
        <ErrorState message={error} onAction={() => void refresh()} style={styles.inlineError} />
      ) : null}

      {isLoading && orders.length === 0 && !error ? (
        <View style={styles.inlineLoading}>
          <ActivityIndicator size="small" color={colors.primary} />
          <AppText variant="bodySmall" color="textSecondary">
            Loading orders...
          </AppText>
        </View>
      ) : null}
    </View>
  );

  const listFooter =
    orders.length > 0 ? (
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
    return <View style={[styles.screen, { paddingTop: insets.top }]} />;
  }

  return (
    <>
      <FlatList
        style={styles.screen}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.xxl },
          orders.length === 0 && styles.emptyContent,
        ]}
        data={orders}
        keyExtractor={(item, index) => item._id ?? `admin-order-${index}`}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={listHeader}
        ListFooterComponent={listFooter}
        ListEmptyComponent={
          !isLoading && !error ? (
            <EmptyState
              title="No orders found"
              message={
                hasActiveFilters || searchInput.trim()
                  ? 'Try adjusting your search or status filter.'
                  : 'Platform orders will appear here once customers checkout.'
              }
            />
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => void refresh()}
            tintColor={colors.primary}
          />
        }
      />

      <AdminOrderFiltersSheet
        visible={filtersVisible}
        statusFilter={statusFilter}
        onClose={() => setFiltersVisible(false)}
        onApply={applyStatusFilter}
        onClear={() => {
          clearStatusFilter();
          setFiltersVisible(false);
        }}
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
    gap: spacing.lg,
  },
  emptyContent: {
    flexGrow: 1,
  },
  headerContent: {
    gap: spacing.md,
  },
  titleBlock: {
    gap: spacing.xs,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  clearFilters: {
    paddingVertical: spacing.sm,
  },
  inlineError: {
    alignSelf: 'stretch',
    marginHorizontal: 0,
  },
  inlineLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  separator: {
    height: spacing.md,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.lg,
  },
  paginationButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  paginationButtonDisabled: {
    opacity: 0.5,
  },
});
