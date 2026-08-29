import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppDivider } from '../../../../components/ui/AppDivider';
import { AppText } from '../../../../components/ui/AppText';
import { colors, spacing } from '../../../../design-system';
import { OrderDetailCollapsibleSection } from '../../../orders/components/OrderDetailCollapsibleSection';
import { formatOrderMoney } from '../../../orders/utils/orderPricing';
import type { SellerOrderDetail } from '../types/sellerOrder';
import { formatSellerPaymentStatus } from '../utils/sellerOrderDetailDisplay';

interface SellerOrderPaymentSummaryCardProps {
  order: SellerOrderDetail;
  itemCount: number;
  subtotal: number;
  shipping: number;
  total: number;
  footer?: ReactNode;
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
  footer,
}: SellerOrderPaymentSummaryCardProps) {
  const paymentStatus = formatSellerPaymentStatus(order.paymentStatus);

  return (
    <OrderDetailCollapsibleSection
      title="Payment Summary"
      icon="cash-outline"
      variant="primary"
      initiallyExpanded
      collapsedPreview={
        <AppText variant="caption" style={styles.collapsedTotal} numberOfLines={1}>
          {formatOrderMoney(order, total)}
        </AppText>
      }
    >
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

      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </OrderDetailCollapsibleSection>
  );
}

const styles = StyleSheet.create({
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
  collapsedTotal: {
    color: colors.textInverse,
    fontWeight: '700',
  },
  scopeHint: {
    color: 'rgba(255,255,255,0.72)',
    marginTop: spacing.xs,
  },
  footer: {
    gap: spacing.sm,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.22)',
  },
});
