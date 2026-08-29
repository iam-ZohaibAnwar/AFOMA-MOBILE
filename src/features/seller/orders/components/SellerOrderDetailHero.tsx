import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '../../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../../design-system';
import {
  formatOrderDisplayId,
  formatOrderPlacedDateTime,
} from '../../../orders/utils/orderDisplay';
import {
  getOrderStatusColor,
  getOrderStatusIconName,
  getOrderStatusLabel,
} from '../../../orders/utils/orderDetailDisplay';
import type { SellerOrderDetail } from '../types/sellerOrder';
import { formatSellerOrderStatus } from '../utils/sellerOrderMappers';

interface SellerOrderDetailHeroProps {
  order: SellerOrderDetail;
  orderId: string;
}

export function SellerOrderDetailHero({ order, orderId }: SellerOrderDetailHeroProps) {
  const statusLabel = getOrderStatusLabel(order.status) || formatSellerOrderStatus(order.status);
  const statusColor = getOrderStatusColor(order.status);
  const statusIcon = getOrderStatusIconName(order.status);

  return (
    <View style={styles.card}>
      <AppText variant="h3" style={styles.orderNumber}>
        Order #{formatOrderDisplayId(order._id ?? orderId)}
      </AppText>

      <View style={styles.statusRow}>
        <Ionicons name={statusIcon} size={14} color={statusColor} />
        <AppText variant="caption" style={[styles.statusText, { color: statusColor }]}>
          {statusLabel}
        </AppText>
      </View>

      <AppText variant="h2" style={styles.title}>
        Order Details
      </AppText>
      <AppText variant="bodySmall" color="textSecondary">
        Placed on {formatOrderPlacedDateTime(order.createdAt)}
      </AppText>

      <AppText variant="caption" color="textMuted" style={styles.hint}>
        Order status updates when you change line fulfillment below.
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.large,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  orderNumber: {
    color: colors.textPrimary,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statusText: {
    fontWeight: '700',
  },
  title: {
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  hint: {
    marginTop: spacing.xs,
  },
});
