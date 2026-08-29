import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppDivider } from '../../../../components/ui/AppDivider';
import { AppText } from '../../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../../design-system';
import { formatOrderMoney } from '../../../orders/utils/orderPricing';
import type { SellerOrderDetail } from '../types/sellerOrder';
import { formatSellerPaymentStatus } from '../utils/sellerOrderDetailDisplay';

interface SellerOrderPaymentSummaryCardProps {
  order: SellerOrderDetail;
  itemCount: number;
  subtotal: number;
  shipping: number;
  total: number;
}

function SummaryRow({
  label,
  value,
  emphasized = false,
}: {
  label: string;
  value: string;
  emphasized?: boolean;
}) {
  return (
    <View style={styles.row}>
      <AppText variant={emphasized ? 'bodyMedium' : 'bodySmall'} style={styles.rowLabel}>
        {label}
      </AppText>
      <AppText
        variant={emphasized ? 'h3' : 'bodySmall'}
        style={emphasized ? styles.totalValue : styles.rowValue}
      >
        {value}
      </AppText>
    </View>
  );
}

export function SellerOrderPaymentSummaryCard({
  order,
  itemCount,
  subtotal,
  shipping,
  total,
}: SellerOrderPaymentSummaryCardProps) {
  const paymentStatus = formatSellerPaymentStatus(order.paymentStatus);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="receipt-outline" size={18} color={colors.textInverse} />
        <AppText variant="bodyMedium" style={styles.headerTitle}>
          Your Order Summary
        </AppText>
      </View>

      <SummaryRow
        label={`Subtotal (${itemCount} item${itemCount === 1 ? '' : 's'})`}
        value={formatOrderMoney(order, subtotal)}
      />
      <SummaryRow label="Shipping" value={formatOrderMoney(order, shipping)} />
      <SummaryRow label="Payment status" value={paymentStatus} />

      <AppDivider style={styles.divider} />

      <View style={styles.totalRow}>
        <AppText variant="caption" style={styles.totalLabel}>
          YOUR TOTAL
        </AppText>
        <AppText variant="h2" style={styles.totalValue}>
          {formatOrderMoney(order, total)}
        </AppText>
      </View>

      <AppText variant="caption" style={styles.scopeHint}>
        Totals reflect only your products in this order.
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primary,
    borderRadius: radius.large,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  headerTitle: {
    color: colors.textInverse,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  rowLabel: {
    color: 'rgba(255,255,255,0.82)',
    flex: 1,
  },
  rowValue: {
    color: colors.textInverse,
    fontWeight: '600',
  },
  divider: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    marginVertical: spacing.sm,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  totalLabel: {
    color: 'rgba(255,255,255,0.78)',
    letterSpacing: 0.8,
    fontWeight: '700',
    paddingBottom: 4,
  },
  totalValue: {
    color: colors.textInverse,
    fontWeight: '800',
  },
  scopeHint: {
    color: 'rgba(255,255,255,0.72)',
    marginTop: spacing.xs,
  },
});
