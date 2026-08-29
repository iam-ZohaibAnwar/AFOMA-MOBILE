import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { navigateToHomeTab } from '../../../app/navigation/shoppingNavigation';
import {
  marketplaceScrollProps,
  useMarketplaceScrollHandler,
} from '../../../app/navigation/marketplaceChrome';
import type { RootStackParamList, ShoppingStackParamList } from '../../../app/navigation/types';
import { EmptyState } from '../../../components/ecommerce/EmptyState';
import { ErrorState } from '../../../components/ecommerce/ErrorState';
import { AppText } from '../../../components/ui/AppText';
import { colors, spacing } from '../../../design-system';
import { useAuth } from '../../auth/hooks/useAuth';
import { resolveAuthUserId } from '../../auth/utils/resolveAuthUserId';
import { useRequireAuth } from '../../auth/hooks/useRequireAuth';
import { authReturnTo } from '../../auth/utils/authNavigation';
import { CustomerOrderStatusTabs } from '../components/CustomerOrderStatusTabs';
import { OrderListItem } from '../components/OrderListItem';
import { OrderListPagination } from '../components/OrderListPagination';
import { OrderListSearchBar } from '../components/OrderListSearchBar';
import { useOrders } from '../hooks/useOrders';
import {
  applyCustomerOrderSessionPatch,
  peekCustomerOrderSessionPatches,
} from '../state/customerOrderSessionPatch';
import {
  filterCustomerOrdersList,
  type CustomerOrderStatusFilter,
} from '../utils/customerOrderListFilters';
import type { OrderSummary } from '../../../services/types/order';

type Props = NativeStackScreenProps<ShoppingStackParamList, 'Orders'>;

type OrdersNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<ShoppingStackParamList, 'Orders'>,
  NativeStackNavigationProp<RootStackParamList>
>;

const ORDERS_RETURN_TO = authReturnTo.orders();

export function OrdersScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const rootNavigation = useNavigation<OrdersNavigationProp>();
  const onMarketplaceScroll = useMarketplaceScrollHandler();
  const { user } = useAuth();
  const authUserId = resolveAuthUserId(user);
  const { isAuthorized } = useRequireAuth(ORDERS_RETURN_TO);
  const [statusFilter, setStatusFilter] = useState<CustomerOrderStatusFilter>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sessionPatchVersion, setSessionPatchVersion] = useState(0);

  const {
    orders,
    totalOrders,
    totalPages,
    currentPage,
    isLoading,
    isRefreshing,
    isPageLoading,
    error,
    retry,
    goToPreviousPage,
    goToNextPage,
    canGoPrevious,
    canGoNext,
  } = useOrders(isAuthorized ? authUserId : undefined);

  useFocusEffect(
    useCallback(() => {
      if (peekCustomerOrderSessionPatches().size > 0) {
        setSessionPatchVersion((version) => version + 1);
      }
    }, []),
  );

  const patchedOrders = useMemo(
    () =>
      orders.map((order) => applyCustomerOrderSessionPatch(order) ?? order),
    [orders, sessionPatchVersion],
  );

  const filteredOrders = useMemo(
    () => filterCustomerOrdersList(patchedOrders, statusFilter, searchQuery),
    [patchedOrders, searchQuery, statusFilter],
  );

  const hasActiveFilters = statusFilter !== '' || searchQuery.trim().length > 0;

  const handleOrderPress = useCallback(
    (pressedOrderId: string) => {
      const matchedOrder = patchedOrders.find((entry) => entry._id === pressedOrderId);
      navigation.navigate('OrderDetail', {
        orderId: pressedOrderId,
        initialOrder: matchedOrder,
      });
    },
    [navigation, patchedOrders],
  );

  const renderItem = useCallback(
    ({ item }: { item: OrderSummary }) => (
      <OrderListItem order={item} onPress={handleOrderPress} />
    ),
    [handleOrderPress],
  );

  if (!isAuthorized) {
    return (
      <View style={[styles.centeredState, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const listHeader = (
    <View style={styles.headerContent}>
      <OrderListSearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search orders by ID or product..."
        accessibilityLabel="Search orders by ID or product"
      />

      <CustomerOrderStatusTabs activeStatus={statusFilter} onStatusChange={setStatusFilter} />

      {totalOrders > 0 ? (
        <AppText variant="bodySmall" color="textSecondary" style={styles.countText}>
          {hasActiveFilters
            ? `${filteredOrders.length} matching on this page · ${totalOrders} total orders`
            : `${totalOrders} ${totalOrders === 1 ? 'order' : 'orders'}`}
        </AppText>
      ) : null}

      {error && orders.length > 0 ? (
        <ErrorState message={error} onAction={() => void retry()} style={styles.inlineError} />
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

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + spacing.xxl },
        filteredOrders.length === 0 && styles.emptyContent,
      ]}
      data={filteredOrders}
      keyExtractor={(item, index) => item._id ?? `order-${index}`}
      renderItem={renderItem}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      ListHeaderComponent={listHeader}
      ListFooterComponent={
        orders.length > 0 || isPageLoading ? (
          <OrderListPagination
            currentPage={currentPage}
            totalPages={totalPages}
            canGoPrevious={canGoPrevious}
            canGoNext={canGoNext}
            isLoading={isPageLoading}
            onPrevious={goToPreviousPage}
            onNext={goToNextPage}
          />
        ) : null
      }
      ListEmptyComponent={
        !isLoading && !error ? (
          <EmptyState
            title={hasActiveFilters ? 'No matching orders' : 'No orders yet'}
            message={
              hasActiveFilters
                ? 'Try adjusting your search or status tab.'
                : 'When you place an order, it will appear here.'
            }
            actionLabel={hasActiveFilters ? 'Clear filters' : 'Continue Shopping'}
            onAction={
              hasActiveFilters
                ? () => {
                    setStatusFilter('');
                    setSearchQuery('');
                  }
                : () => navigateToHomeTab(rootNavigation)
            }
          />
        ) : error && orders.length === 0 ? (
          <ErrorState message={error} onAction={() => void retry()} style={styles.inlineError} />
        ) : null
      }
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={() => void retry()}
          tintColor={colors.primary}
        />
      }
      onScroll={onMarketplaceScroll}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      {...marketplaceScrollProps}
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
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
