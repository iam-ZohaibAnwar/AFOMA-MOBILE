import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '../../../../components/ui/AppText';
import { colors, spacing } from '../../../../design-system';
import { AdminProductStatusChip } from '../../../admin/product-management/components/AdminProductStatusChip';
import type { SellerDashboardOrder } from '../types';
import {
  formatDashboardCustomerName,
  formatDashboardOrderDate,
  formatDashboardOrderId,
  formatSellerDashboardOrderStatus,
  resolveSellerDashboardOrderStatusIcon,
  resolveSellerDashboardOrderStatusTone,
} from '../../utils/sellerDashboardDisplay';

export interface SellerDashboardOrderRowProps {
  order: SellerDashboardOrder;
  onPress?: () => void;
  showDivider?: boolean;
}

export function SellerDashboardOrderRow({ order, onPress, showDivider = true }: SellerDashboardOrderRowProps) {
  const statusLabel = formatSellerDashboardOrderStatus(order.status);
  const statusTone = resolveSellerDashboardOrderStatusTone(order.status);

  const content = (
    <>
      <View style={styles.main}>
        <AppText variant="bodyMedium" style={styles.orderId}>
          Order #{formatDashboardOrderId(order)}
        </AppText>
        <AppText variant="bodySmall" color="textSecondary" numberOfLines={1}>
          {formatDashboardCustomerName(order)}
        </AppText>
        <AppText variant="caption" color="textMuted">
          {formatDashboardOrderDate(order)}
        </AppText>
      </View>

      <View style={styles.meta}>
        <AdminProductStatusChip
          label={statusLabel}
          icon={resolveSellerDashboardOrderStatusIcon(order.status)}
          tone={statusTone}
        />
        {onPress ? <Ionicons name="chevron-forward" size={18} color={colors.textMuted} /> : null}
      </View>
    </>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [styles.row, showDivider && styles.rowDivider, pressed && styles.pressed]}
      >
        {content}
      </Pressable>
    );
  }

  return <View style={[styles.row, showDivider && styles.rowDivider]}>{content}</View>;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderStrong,
  },
  main: {
    flex: 1,
    gap: 2,
  },
  meta: {
    alignItems: 'flex-end',
    gap: spacing.xs,
    flexShrink: 0,
  },
  orderId: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.92,
  },
});
