import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '../../../components/ui/AppText';
import { colors, spacing } from '../../../design-system';
import { formatProductPrice } from '../../products/utils/productDisplay';

export interface CartOrderSummaryProps {
  currency?: string;
  itemCount?: number;
  subTotal: number;
  discountAmount?: number;
  shippingAmount?: number | null;
  serviceChargeAmount?: number | null;
  total?: number | null;
  shippingPending?: boolean;
}

function SummaryRow({
  label,
  value,
  valueColor,
  emphasized = false,
}: {
  label: string;
  value: ReactNode;
  valueColor?: string;
  emphasized?: boolean;
}) {
  const valueContent =
    typeof value === 'string' ? (
      <AppText
        variant={emphasized ? 'h3' : 'bodyMedium'}
        style={valueColor ? { color: valueColor } : emphasized ? styles.totalValue : styles.value}
      >
        {value}
      </AppText>
    ) : (
      value
    );

  return (
    <View style={styles.row}>
      <AppText variant={emphasized ? 'bodyMedium' : 'body'} color={emphasized ? 'textPrimary' : 'textSecondary'}>
        {label}
      </AppText>
      {valueContent}
    </View>
  );
}

function formatSummaryAmount(amount: number | null | undefined, currency: string): string {
  if (amount == null) {
    return '—';
  }

  if (amount <= 0) {
    return formatProductPrice(0, currency);
  }

  return formatProductPrice(amount, currency);
}

export function CartOrderSummary({
  currency = 'CAD',
  itemCount,
  subTotal,
  discountAmount = 0,
  shippingAmount = null,
  serviceChargeAmount = null,
  total = null,
  shippingPending = false,
}: CartOrderSummaryProps) {
  const subtotalLabel =
    typeof itemCount === 'number'
      ? `Subtotal (${itemCount} ${itemCount === 1 ? 'item' : 'items'})`
      : 'Subtotal';

  return (
    <View style={styles.section}>
      <SummaryRow label={subtotalLabel} value={formatProductPrice(subTotal, currency)} />
      {discountAmount > 0 ? (
        <SummaryRow
          label="Discount"
          value={`-${formatProductPrice(discountAmount, currency)}`}
          valueColor={colors.success}
        />
      ) : null}
      <SummaryRow
        label="Shipping"
        value={formatSummaryAmount(shippingPending ? null : shippingAmount, currency)}
      />
      <SummaryRow
        label="Estimated tax & fees"
        value={formatSummaryAmount(shippingPending ? null : serviceChargeAmount, currency)}
      />
      <View style={styles.divider} />
      <SummaryRow
        label="Total"
        value={formatSummaryAmount(shippingPending ? null : total, currency)}
        emphasized
        valueColor={colors.textPrimary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  value: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  totalValue: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  divider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderStrong,
    marginVertical: spacing.xs,
  },
});
