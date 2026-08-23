import { useCallback } from 'react';
import {
  ActivityIndicator,
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
import { SearchBar } from '../../../../components/ecommerce/SearchBar';
import { SelectField } from '../../../../components/forms';
import { AppText } from '../../../../components/ui/AppText';
import { colors, spacing } from '../../../../design-system';
import type { SellerStackParamList } from '../../../../app/navigation/sellerTypes';
import { authReturnTo } from '../../../auth/utils/authNavigation';
import { useRequireSeller } from '../../hooks/useRequireSeller';
import { SellerOrderCard } from '../components/SellerOrderCard';
import { useSellerOrders } from '../hooks/useSellerOrders';
import { SELLER_ORDER_STATUS_FILTERS } from '../utils/sellerOrderMappers';

type Props = NativeStackScreenProps<SellerStackParamList, 'SellerOrders'>;

const ORDERS_RETURN_TO = authReturnTo.sellerOrders();

export function SellerOrdersScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { isAuthorized, sellerId } = useRequireSeller(ORDERS_RETURN_TO);
  const {
    orders,
    totalOrders,
    isLoading,
    isLoadingMore,
    isRefreshing,
    error,
    searchInput,
    setSearchInput,
    statusFilter,
    setStatusFilter,
    hasActiveFilters,
    hasMore,
    refresh,
    loadMore,
  } = useSellerOrders(isAuthorized ? sellerId : undefined);

  useFocusEffect(
    useCallback(() => {
      if (isAuthorized && sellerId) {
        void refresh();
      }
    }, [isAuthorized, refresh, sellerId]),
  );

  const handlePressOrder = useCallback(
    (orderId: string) => {
      navigation.navigate('SellerOrderDetail', { orderId });
    },
    [navigation],
  );

  const renderItem = useCallback(
    ({ item }: { item: (typeof orders)[number] }) => (
      <SellerOrderCard order={item} onPress={handlePressOrder} />
    ),
    [handlePressOrder],
  );

  if (!isAuthorized) {
    return (
      <View style={styles.centeredState}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isLoading && orders.length === 0 && !error) {
    return (
      <View style={styles.centeredState}>
        <ActivityIndicator size="large" color={colors.primary} />
        <AppText variant="bodySmall" color="textSecondary">
          Loading orders...
        </AppText>
      </View>
    );
  }

  if (error && orders.length === 0 && totalOrders === 0) {
    return (
      <View style={[styles.centeredState, { paddingBottom: insets.bottom }]}>
        <ErrorState message={error} onAction={() => void refresh()} />
      </View>
    );
  }

  const listHeader = (
    <View style={styles.headerContent}>
      <SearchBar
        mode="input"
        placeholder="Search by name..."
        value={searchInput}
        onChangeText={setSearchInput}
      />

      <SelectField
        label="Order status"
        value={statusFilter}
        options={SELLER_ORDER_STATUS_FILTERS}
        onChange={(value) => setStatusFilter(value as typeof statusFilter)}
        modalTitle="Filter by order status"
      />

      {error ? (
        <ErrorState message={error} onAction={() => void refresh()} style={styles.inlineError} />
      ) : null}

      {totalOrders > 0 ? (
        <AppText variant="bodySmall" color="textSecondary">
          {hasActiveFilters ? `${orders.length} loaded orders` : `${totalOrders} orders`}
        </AppText>
      ) : null}
    </View>
  );

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
      data={orders}
      keyExtractor={(item, index) => item._id ?? `order-${index}`}
      renderItem={renderItem}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      ListHeaderComponent={listHeader}
      ListEmptyComponent={
        <EmptyState
          title={hasActiveFilters ? 'No matching orders' : 'No orders received'}
          message={
            hasActiveFilters
              ? 'Try adjusting your search or status filter.'
              : 'Orders from customers will appear here.'
          }
          style={styles.emptyState}
        />
      }
      ListFooterComponent={
        isLoadingMore ? (
          <View style={styles.footerLoading}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : null
      }
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={() => void refresh()} tintColor={colors.primary} />
      }
      onEndReached={() => {
        if (hasMore) {
          loadMore();
        }
      }}
      onEndReachedThreshold={0.4}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
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
  headerContent: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  inlineError: {
    alignSelf: 'stretch',
    marginHorizontal: 0,
  },
  separator: {
    height: spacing.md,
  },
  emptyState: {
    marginHorizontal: 0,
    alignSelf: 'stretch',
  },
  footerLoading: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
});
