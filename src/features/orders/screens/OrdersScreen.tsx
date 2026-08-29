import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  View,
} from 'react-native';
import { Skeleton } from '../../../components/ecommerce';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { navigateToHomeTab } from '../../../app/navigation/shoppingNavigation';
import {
  marketplaceScrollProps,
  useMarketplaceScrollHandler,
} from '../../../app/navigation/marketplaceChrome';
import type { RootStackParamList, ShoppingStackParamList } from '../../../app/navigation/types';
import { AppButton } from '../../../components/ui/AppButton';
import { AppText } from '../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../design-system';
import { useAuth } from '../../auth/hooks/useAuth';
import { resolveAuthUserId } from '../../auth/utils/resolveAuthUserId';
import { useRequireAuth } from '../../auth/hooks/useRequireAuth';
import { authReturnTo } from '../../auth/utils/authNavigation';
import { OrderListItem } from '../components/OrderListItem';
import { OrderListPagination } from '../components/OrderListPagination';
import { OrderListSearchBar } from '../components/OrderListSearchBar';
import { OrderStatusTabs } from '../components/OrderStatusTabs';
import { useOrders } from '../hooks/useOrders';
import { filterOrdersList, type OrderStatusTabId } from '../utils/orderListFilters';

type Props = NativeStackScreenProps<ShoppingStackParamList, 'Orders'>;

type OrdersNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<ShoppingStackParamList, 'Orders'>,
  NativeStackNavigationProp<RootStackParamList>
>;

const ORDERS_RETURN_TO = authReturnTo.orders();

const PAGE_SKELETON_ROW_COUNT = 3;

function OrderListPageSkeleton() {
  return (
    <View style={styles.pageSkeletonList}>
      {Array.from({ length: PAGE_SKELETON_ROW_COUNT }, (_, index) => (
        <View key={`orders-page-skeleton-${index}`} style={styles.pageSkeletonCard}>
          <Skeleton variant="text" height={12} width="42%" />
          <View style={styles.pageSkeletonThumbs}>
            <Skeleton variant="rect" width={52} height={52} />
            <Skeleton variant="rect" width={52} height={52} />
            <Skeleton variant="rect" width={52} height={52} />
          </View>
          <Skeleton variant="text" height={24} width="38%" />
        </View>
      ))}
    </View>
  );
}

export function OrdersScreen({ navigation }: Props) {
  const rootNavigation = useNavigation<OrdersNavigationProp>();
  const onMarketplaceScroll = useMarketplaceScrollHandler();
  const { user } = useAuth();
  const authUserId = resolveAuthUserId(user);
  const { isAuthorized } = useRequireAuth(ORDERS_RETURN_TO);
  const [activeStatusTab, setActiveStatusTab] = useState<OrderStatusTabId>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const {
    orders,
    totalOrders,
    totalPages,
    currentPage,
    hasLoadedOnce,
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

  const filteredOrders = useMemo(
    () => filterOrdersList(orders, activeStatusTab, searchQuery),
    [activeStatusTab, orders, searchQuery],
  );

  const hasActiveFilters = activeStatusTab !== 'all' || searchQuery.trim().length > 0;

  if (!isAuthorized) {
    return (
      <View style={styles.centeredState}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const isPageLoadingEmpty = isPageLoading && orders.length === 0;
  const showEmptyState =
    hasLoadedOnce &&
    filteredOrders.length === 0 &&
    !isLoading &&
    !isPageLoadingEmpty &&
    !error;
  const showInlineError =
    Boolean(error) && orders.length === 0 && !isLoading && !isPageLoadingEmpty;
  const showPagination =
    (orders.length > 0 || isPageLoadingEmpty) && (totalOrders > 0 || totalPages > 1);

  const listHeader = (
    <View style={styles.listHeader}>
      <OrderListSearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search orders by ID or product..."
        accessibilityLabel="Search orders by ID or product"
      />

      <OrderStatusTabs activeTabId={activeStatusTab} onTabChange={setActiveStatusTab} />

      {totalOrders > 0 ? (
        <AppText variant="bodySmall" color="textSecondary" style={styles.countText}>
          {hasActiveFilters
            ? `${filteredOrders.length} matching on this page · ${totalOrders} total orders`
            : `${totalOrders} ${totalOrders === 1 ? 'order' : 'orders'}`}
        </AppText>
      ) : null}

      {isRefreshing ? (
        <View style={styles.refreshRow}>
          <ActivityIndicator size="small" color={colors.primary} />
          <AppText variant="caption" color="textMuted">
            Updating orders...
          </AppText>
        </View>
      ) : null}

      {error && orders.length > 0 ? (
        <View style={styles.inlineError}>
          <AppText variant="bodySmall" color="error" style={styles.errorText}>
            {error}
          </AppText>
          <AppButton label="Try again" onPress={() => void retry()} />
        </View>
      ) : null}
    </View>
  );

  const listEmpty = showEmptyState ? (
    <View style={styles.emptyState}>
      <AppText variant="h3" style={styles.title}>
        {hasActiveFilters ? 'No matching orders' : 'No orders yet'}
      </AppText>
      <AppText variant="body" color="textSecondary" style={styles.subtitle}>
        {hasActiveFilters
          ? 'Try another status tab or adjust your search.'
          : 'When you place an order, it will appear here.'}
      </AppText>
      {hasActiveFilters ? (
        <AppButton
          label="Clear filters"
          variant="secondary"
          onPress={() => {
            setActiveStatusTab('all');
            setSearchQuery('');
          }}
        />
      ) : (
        <AppButton label="Continue Shopping" onPress={() => navigateToHomeTab(rootNavigation)} />
      )}
    </View>
  ) : showInlineError ? (
    <View style={styles.emptyState}>
      <AppText variant="bodySmall" color="error" style={styles.errorText}>
        {error}
      </AppText>
      <AppButton label="Try again" onPress={() => void retry()} />
    </View>
  ) : isPageLoadingEmpty ? (
    <OrderListPageSkeleton />
  ) : isLoading ? (
    <View style={styles.inlineLoading}>
      <ActivityIndicator size="small" color={colors.primary} />
      <AppText variant="bodySmall" color="textMuted">
        Loading orders...
      </AppText>
    </View>
  ) : null;

  return (
    <FlatList
      data={filteredOrders}
      keyExtractor={(item, index) => item._id ?? `order-${index}`}
      style={styles.list}
      contentContainerStyle={[
        styles.listContent,
        filteredOrders.length === 0 && styles.listContentEmpty,
      ]}
      showsVerticalScrollIndicator={false}
      onScroll={onMarketplaceScroll}
      keyboardShouldPersistTaps="handled"
      {...marketplaceScrollProps}
      renderItem={({ item }) => (
        <OrderListItem
          order={item}
          onPress={(orderId) => navigation.navigate('OrderDetail', { orderId })}
        />
      )}
      ListHeaderComponent={listHeader}
      ListEmptyComponent={listEmpty}
      ListFooterComponent={
        showPagination ? (
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
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing['3xl'],
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  listHeader: {
    gap: spacing.md,
    paddingBottom: spacing.xs,
  },
  countText: {
    fontWeight: '600',
  },
  refreshRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  inlineError: {
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  inlineLoading: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['3xl'],
    gap: spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['3xl'],
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 22,
  },
  errorText: {
    textAlign: 'center',
    lineHeight: 20,
  },
  pageSkeletonList: {
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  pageSkeletonCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.large,
    padding: spacing.lg,
    gap: spacing.md,
  },
  pageSkeletonThumbs: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
});
