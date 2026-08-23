import { Pressable, StyleSheet, View } from 'react-native';

import { AppBadge } from '../../../../components/ui/AppBadge';
import { AppText } from '../../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../../design-system';
import { formatOrderDate, formatOrderDisplayId } from '../../../orders/utils/orderDisplay';
import type { AdminOrderListItem } from '../types/adminOrderManagement';
import {
  formatAdminOrderStatus,
  getAdminOrderCarrierLabel,
  getAdminOrderCustomerName,
  getAdminOrderSellerName,
  orderStatusBadgeVariant,
} from '../utils/adminOrderDisplay';

export interface AdminOrderCardProps {
  order: AdminOrderListItem;
  onPress: (order: AdminOrderListItem) => void;
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaRow}>
      <AppText variant="caption" color="textMuted">
        {label}
      </AppText>
      <AppText variant="bodySmall" style={styles.metaValue}>
        {value}
      </AppText>
    </View>
  );
}

export function AdminOrderCard({ order, onPress }: AdminOrderCardProps) {
  const orderId = order._id;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={!orderId}
      onPress={() => onPress(order)}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.headerRow}>
        <AppText variant="bodyMedium" style={styles.orderId}>
          {formatOrderDisplayId(orderId)}
        </AppText>
        <AppBadge
          label={formatAdminOrderStatus(order.status)}
          variant={orderStatusBadgeVariant(order.status)}
        />
      </View>

      <AppText variant="bodySmall" color="textSecondary">
        {formatOrderDate(order.createdAt)}
      </AppText>

      <View style={styles.metaBlock}>
        <MetaRow label="Customer" value={getAdminOrderCustomerName(order)} />
        <MetaRow label="Seller" value={getAdminOrderSellerName(order)} />
        <MetaRow label="Carrier" value={getAdminOrderCarrierLabel(order)} />
      </View>
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
  metaBlock: {
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  metaValue: {
    flex: 1,
    textAlign: 'right',
    color: colors.textPrimary,
  },
});
