import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { OrderLineItemRow } from '../components/OrderLineItemRow';
import { useOrderDetail } from '../hooks/useOrderDetail';
import {
  formatOrderDate,
  formatOrderDisplayId,
  formatOrderStatus,
  formatShippingAddressLines,
} from '../utils/orderDisplay';
import {
  calculateOrderGrandTotal,
  calculateOrderItemsSubTotal,
  calculateOrderShippingTotal,
  formatOrderMoney,
} from '../utils/orderPricing';
import type { ShoppingStackParamList } from '../../../app/navigation/types';

type Props = NativeStackScreenProps<ShoppingStackParamList, 'OrderDetail'>;

function SummaryRow({ label, value, emphasized = false }: {
  label: string;
  value: string;
  emphasized?: boolean;
}) {
  return (
    <View style={styles.summaryRow}>
      <Text style={emphasized ? styles.totalLabel : styles.summaryLabel}>{label}</Text>
      <Text style={emphasized ? styles.totalValue : styles.summaryValue}>{value}</Text>
    </View>
  );
}

export function OrderDetailScreen({ route }: Props) {
  const { orderId } = route.params;
  const { order, isLoading, error, retry } = useOrderDetail(orderId);

  if (isLoading) {
    return (
      <View style={styles.centeredState}>
        <ActivityIndicator size="large" color="#EA580C" />
        <Text style={styles.stateText}>Loading order...</Text>
      </View>
    );
  }

  if (error || !order) {
    return (
      <View style={styles.centeredState}>
        <Text style={styles.errorText}>{error ?? 'Order not found.'}</Text>
        <Pressable style={styles.primaryButton} onPress={() => void retry()}>
          <Text style={styles.primaryButtonText}>Try again</Text>
        </Pressable>
      </View>
    );
  }

  const subtotal = calculateOrderItemsSubTotal(order);
  const shipping = calculateOrderShippingTotal(order);
  const total = calculateOrderGrandTotal(order);
  const addressLines = formatShippingAddressLines(order.userInfo);

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.sectionBox}>
        <Text style={styles.sectionTitle}>Order Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Order ID</Text>
          <Text style={styles.infoValue}>{formatOrderDisplayId(order._id ?? orderId)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Order Date</Text>
          <Text style={styles.infoValue}>{formatOrderDate(order.createdAt)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Status</Text>
          <Text style={styles.statusValue}>{formatOrderStatus(order.status)}</Text>
        </View>
      </View>

      <View style={styles.sectionBox}>
        <Text style={styles.sectionTitle}>Products</Text>
        {order.cart?.length ? (
          order.cart.map((line, index) => (
            <OrderLineItemRow
              key={`${line.productData?._id ?? 'line'}-${index}`}
              line={line}
              order={order}
            />
          ))
        ) : (
          <Text style={styles.emptyText}>No products found for this order.</Text>
        )}
      </View>

      <View style={styles.sectionBox}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        <SummaryRow label="Subtotal" value={formatOrderMoney(order, subtotal)} />
        <SummaryRow label="Shipping" value={formatOrderMoney(order, shipping)} />
        <SummaryRow label="Total" value={formatOrderMoney(order, total)} emphasized />
      </View>

      <View style={styles.sectionBox}>
        <Text style={styles.sectionTitle}>Shipping Address</Text>
        {addressLines.map((line, index) => (
          <Text key={`${line}-${index}`} style={styles.addressLine}>
            {line}
          </Text>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
    paddingBottom: 32,
    backgroundColor: '#FFF7ED',
  },
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#FFF7ED',
    gap: 12,
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
  sectionBox: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FED7AA',
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#172554',
  },
  infoRow: {
    gap: 4,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#172554',
  },
  statusValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#047857',
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#475569',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#172554',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#172554',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#EA580C',
  },
  addressLine: {
    fontSize: 14,
    color: '#172554',
    lineHeight: 20,
  },
});
