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
import { useAuth } from '../../auth/hooks/useAuth';
import { useRequireAuth } from '../../auth/hooks/useRequireAuth';
import { authReturnTo } from '../../auth/utils/authNavigation';
import { OrderListItem } from '../components/OrderListItem';
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
  const { orders, totalOrders, isLoading, error, retry } = useOrders(user?.userId);

  if (!isAuthorized) {
    return (
      <View style={styles.centeredState}>
        <ActivityIndicator size="large" color="#EA580C" />
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.centeredState}>
        <ActivityIndicator size="large" color="#EA580C" />
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
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 32,
  },
  countText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 4,
  },
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#FFF7ED',
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#172554',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 22,
  },
  stateText: {
    fontSize: 14,
    color: '#64748B',
  },
  errorText: {
    fontSize: 14,
    color: '#B91C1C',
    textAlign: 'center',
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: '#EA580C',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 18,
    minWidth: 180,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
