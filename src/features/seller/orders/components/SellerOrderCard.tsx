import { Pressable, StyleSheet, View } from 'react-native';

import { AppBadge } from '../../../../components/ui/AppBadge';
import { AppText } from '../../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../../design-system';
import { formatCustomerName, formatOrderDate, formatOrderDisplayId } from '../../../orders/utils/orderDisplay';
import type { SellerOrderSummary } from '../types/sellerOrder';
import {
  formatSellerOrderStatus,
  getSellerOrderCarrierLabel,
  getSellerOrderItemCount,
  orderStatusBadgeVariant,
} from '../utils/sellerOrderMappers';

export interface SellerOrderCardProps {
  order: SellerOrderSummary;
  onPress: (orderId: string) => void;
}

export function SellerOrderCard({ order, onPress }: SellerOrderCardProps) {
  const orderId = order._id;
  const customerName = formatCustomerName(order.userInfo) ?? '—';
  const itemCount = getSellerOrderItemCount(order);
  const carrier = getSellerOrderCarrierLabel(order);

  return (
    <Pressable
      accessibilityRole="button"
      disabled={!orderId}
      onPress={() => {
        if (orderId) {
          onPress(orderId);
        }
      }}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.headerRow}>
        <AppText variant="bodyMedium" style={styles.orderId}>
          {formatOrderDisplayId(orderId)}
        </AppText>
        <AppBadge
          label={formatSellerOrderStatus(order.status)}
          variant={orderStatusBadgeVariant(order.status)}
        />
      </View>

      <AppText variant="bodySmall" color="textSecondary">
        {formatOrderDate(order.createdAt)}
      </AppText>

      <AppText variant="bodyMedium" style={styles.customerName}>
        {customerName}
      </AppText>

      <AppText variant="bodySmall" color="textSecondary">
        {itemCount === 1 ? '1 item' : `${itemCount} items`}
      </AppText>

      {carrier ? (
        <AppText variant="caption" color="textMuted">
          {carrier}
        </AppText>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.large,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  cardPressed: {
    opacity: 0.88,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  orderId: {
    color: colors.textPrimary,
    fontWeight: '700',
    flex: 1,
  },
  customerName: {
    color: colors.textPrimary,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
});
