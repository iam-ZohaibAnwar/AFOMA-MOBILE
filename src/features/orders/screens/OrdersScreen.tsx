import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';

import { Skeleton } from '../../../components/ecommerce';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { navigateToHomeTab } from '../../../app/navigation/shoppingNavigation';
import type { RootStackParamList, ShoppingStackParamList } from '../../../app/navigation/types';
import { AppButton } from '../../../components/ui/AppButton';
import { AppText } from '../../../components/ui/AppText';
import { colors, spacing } from '../../../design-system';
import { useAuth } from '../../auth/hooks/useAuth';
import { resolveAuthUserId } from '../../auth/utils/resolveAuthUserId';
import { useRequireAuth } from '../../auth/hooks/useRequireAuth';
import { authReturnTo } from '../../auth/utils/authNavigation';
import { OrderListItem } from '../components/OrderListItem';
import { OrderListPagination } from '../components/OrderListPagination';
import { useOrders } from '../hooks/useOrders';

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
        <View key={`orders-page-skeleton-${index}`} style={styles.pageSkeletonRow}>
          <Skeleton variant="rect" width={64} height={64} />
          <View style={styles.pageSkeletonContent}>
            <Skeleton variant="text" height={16} width="75%" />
            <Skeleton variant="text" height={12} width="32%" />
            <Skeleton variant="text" height={12} width="58%" />
          </View>
        </View>
      ))}
    </View>
  );
}

export function OrdersScreen({ navigation }: Props) {
  const rootNavigation = useNavigation<OrdersNavigationProp>();
  const { user } = useAuth();
  const authUserId = resolveAuthUserId(user);
  const { isAuthorized } = useRequireAuth(ORDERS_RETURN_TO);
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

  if (!isAuthorized) {
    return (
      <View style={styles.centeredState}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const isPageLoadingEmpty = isPageLoading && orders.length === 0;
  const showEmptyState =
    hasLoadedOnce && orders.length === 0 && !isLoading && !isPageLoadingEmpty && !error;
  const showInlineError =
    Boolean(error) && orders.length === 0 && !isLoading && !isPageLoadingEmpty;
  const showPagination = (orders.length > 0 || isPageLoadingEmpty) && (totalOrders > 0 || totalPages > 1);

  const listHeader = (
    <View style={styles.listHeader}>
      {totalOrders > 0 ? (
        <AppText variant="bodySmall" color="textSecondary" style={styles.countText}>
          {totalOrders} {totalOrders === 1 ? 'order' : 'orders'}
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
        No orders yet
      </AppText>
      <AppText variant="body" color="textSecondary" style={styles.subtitle}>
        When you place an order, it will appear here.
      </AppText>
      <AppButton label="Continue Shopping" onPress={() => navigateToHomeTab(rootNavigation)} />
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
      data={orders}
      keyExtractor={(item, index) => item._id ?? `order-${index}`}
      contentContainerStyle={[
        styles.listContent,
        orders.length === 0 && styles.listContentEmpty,
      ]}
      showsVerticalScrollIndicator={false}
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
  listContent: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing['3xl'],
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  listHeader: {
    gap: spacing.sm,
  },
  countText: {
    fontWeight: '600',
    marginBottom: spacing.xs,
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
  pageSkeletonRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  pageSkeletonContent: {
    flex: 1,
    gap: spacing.sm,
    paddingTop: spacing.xs,
  },
});
