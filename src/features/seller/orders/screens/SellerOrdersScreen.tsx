import { useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '../../../../components/ecommerce/EmptyState';
import { ErrorState } from '../../../../components/ecommerce/ErrorState';
import { AppText } from '../../../../components/ui/AppText';
import { colors, spacing } from '../../../../design-system';
import type { SellerStackParamList } from '../../../../app/navigation/sellerTypes';
import { authReturnTo } from '../../../auth/utils/authNavigation';
import { useRequireSeller } from '../../hooks/useRequireSeller';
import { OrderListPagination } from '../../../orders/components/OrderListPagination';
import { OrderListSearchBar } from '../../../orders/components/OrderListSearchBar';
import { SellerOrderCard } from '../components/SellerOrderCard';
import { SellerOrderStatusTabs } from '../components/SellerOrderStatusTabs';
import { useSellerOrders } from '../hooks/useSellerOrders';
import type { SellerOrderSummary } from '../types/sellerOrder';

type Props = NativeStackScreenProps<SellerStackParamList, 'SellerOrders'>;

const ORDERS_RETURN_TO = authReturnTo.sellerOrders();

export function SellerOrdersScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { isAuthorized, sellerId } = useRequireSeller(ORDERS_RETURN_TO);
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
    refresh,
    goToPreviousPage,
    goToNextPage,
    canGoPrevious,
    canGoNext,
  } = useSellerOrders(isAuthorized ? sellerId : undefined);

  const handleOrderPress = useCallback(
    (order: SellerOrderSummary) => {
      if (!order._id) {
        return;
      }

      navigation.navigate('SellerOrderDetail', {
        orderId: order._id,
        initialOrder: order,
      });
    },
    [navigation],
  );

  const renderItem = useCallback(
    ({ item }: { item: SellerOrderSummary }) => (
      <SellerOrderCard order={item} onPress={handleOrderPress} />
    ),
    [handleOrderPress],
  );

  const listHeader = (
    <View style={styles.headerContent}>
      <OrderListSearchBar
        value={searchInput}
        onChangeText={setSearchInput}
        placeholder="Search by customer name..."
        accessibilityLabel="Search orders by customer name"
      />

      <SellerOrderStatusTabs activeStatus={statusFilter} onStatusChange={applyStatusFilter} />

      {totalOrders > 0 ? (
        <AppText variant="bodySmall" color="textSecondary" style={styles.countText}>
          {totalOrders} {totalOrders === 1 ? 'order' : 'orders'}
        </AppText>
      ) : null}

      {error && orders.length > 0 ? (
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

  if (!isAuthorized) {
    return <View style={[styles.screen, { paddingTop: insets.top }]} />;
  }

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + spacing.xxl },
        orders.length === 0 && styles.emptyContent,
      ]}
      data={orders}
      keyExtractor={(item, index) => item._id ?? `seller-order-${index}`}
      renderItem={renderItem}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      ListHeaderComponent={listHeader}
      ListFooterComponent={
        orders.length > 0 ? (
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
        !isLoading && !error ? (
          <EmptyState
            title={hasActiveFilters ? 'No matching orders' : 'No orders received'}
            message={
              hasActiveFilters || searchInput.trim()
                ? 'Try adjusting your search or status tab.'
                : 'Orders from customers will appear here once they checkout.'
            }
          />
        ) : error && orders.length === 0 ? (
          <ErrorState message={error} onAction={() => void refresh()} style={styles.inlineError} />
        ) : null
      }
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={() => void refresh()}
          tintColor={colors.primary}
        />
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
});
