import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { navigateToHomeTab } from '../../../app/navigation/shoppingNavigation';
import type { RootStackParamList, ShoppingStackParamList } from '../../../app/navigation/types';
import { colors, spacing } from '../../../design-system';
import { useAuth } from '../../auth/hooks/useAuth';
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

export function OrdersScreen({ navigation }: Props) {
  const rootNavigation = useNavigation<OrdersNavigationProp>();
  const { user } = useAuth();
  const { isAuthorized } = useRequireAuth(ORDERS_RETURN_TO);
  const {
    orders,
    totalOrders,
    totalPages,
    currentPage,
    isLoading,
    isPageLoading,
    error,
    retry,
    goToPreviousPage,
    goToNextPage,
    canGoPrevious,
    canGoNext,
  } = useOrders(user?.userId);

  if (!isAuthorized) {
    return (
      <View style={styles.centeredState}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.centeredState}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.stateText}>Loading orders...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centeredState}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.primaryButton} onPress={() => void retry()}>
          <Text style={styles.primaryButtonText}>Try again</Text>
        </Pressable>
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={styles.centeredState}>
        <Text style={styles.title}>No orders yet</Text>
        <Text style={styles.subtitle}>
          When you place an order, it will appear here.
        </Text>
        <Pressable style={styles.primaryButton} onPress={() => navigateToHomeTab(rootNavigation)}>
          <Text style={styles.primaryButtonText}>Continue Shopping</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <FlatList
      data={orders}
      keyExtractor={(item, index) => item._id ?? `order-${index}`}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <OrderListItem
          order={item}
          onPress={(orderId) => navigation.navigate('OrderDetail', { orderId })}
        />
      )}
      ListHeaderComponent={
        totalOrders > 0 ? (
          <Text style={styles.countText}>
            {totalOrders} {totalOrders === 1 ? 'order' : 'orders'}
          </Text>
        ) : null
      }
      ListFooterComponent={
        totalOrders > 0 || totalPages > 1 ? (
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
  countText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
    gap: spacing.md,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  stateText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  errorText: {
    fontSize: 14,
    color: colors.error,
    textAlign: 'center',
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: colors.secondary,
    borderRadius: 8,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minWidth: 180,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: colors.textInverse,
    fontSize: 15,
    fontWeight: '600',
  },
});
