import { StyleSheet, View } from 'react-native';

import { AppText } from '../../../../components/ui/AppText';
import { colors, spacing } from '../../../../design-system';
import type { SellerDashboardOrder } from '../types';
import {
  formatDashboardCustomerName,
  formatDashboardOrderDate,
  formatDashboardOrderId,
  formatSellerDashboardOrderStatus,
} from '../../utils/sellerDashboardDisplay';

export interface SellerDashboardOrderRowProps {
  order: SellerDashboardOrder;
}

export function SellerDashboardOrderRow({ order }: SellerDashboardOrderRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.main}>
        <AppText variant="bodyMedium" style={styles.orderId}>
          {formatDashboardOrderId(order)}
        </AppText>
        <AppText variant="bodySmall" color="textSecondary">
          {formatDashboardCustomerName(order)}
        </AppText>
      </View>
      <View style={styles.meta}>
        <AppText variant="bodySmall" style={styles.status}>
          {formatSellerDashboardOrderStatus(order.status)}
        </AppText>
        <AppText variant="caption" color="textMuted">
          {formatDashboardOrderDate(order)}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderStrong,
  },
  main: {
    flex: 1,
    gap: 2,
  },
  meta: {
    alignItems: 'flex-end',
    gap: 2,
    maxWidth: '42%',
  },
  orderId: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  status: {
    color: colors.textPrimary,
    textAlign: 'right',
  },
});
