import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { OrderSummary } from '../../../services/types/order';
import {
  formatOrderDate,
  formatOrderDisplayId,
  formatOrderStatus,
  formatOrderTotal,
} from '../utils/orderDisplay';

interface OrderListItemProps {
  order: OrderSummary;
  onPress: (orderId: string) => void;
}

export function OrderListItem({ order, onPress }: OrderListItemProps) {
  const orderId = order._id;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      disabled={!orderId}
      onPress={() => {
        if (orderId) {
          onPress(orderId);
        }
      }}
    >
      <View style={styles.headerRow}>
        <Text style={styles.orderIdLabel}>Order ID</Text>
        <Text style={styles.orderIdValue}>{formatOrderDisplayId(orderId)}</Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Date</Text>
        <Text style={styles.detailValue}>{formatOrderDate(order.createdAt)}</Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Total</Text>
        <Text style={styles.detailValue}>{formatOrderTotal(order)}</Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Status</Text>
        <Text style={styles.statusValue}>{formatOrderStatus(order.status)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FED7AA',
    gap: 10,
  },
  cardPressed: {
    opacity: 0.85,
  },
  headerRow: {
    gap: 4,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#FFEDD5',
  },
  orderIdLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  orderIdValue: {
    fontSize: 17,
    fontWeight: '700',
    color: '#172554',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#172554',
    textAlign: 'right',
    flexShrink: 1,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#047857',
    textAlign: 'right',
    flexShrink: 1,
  },
});
