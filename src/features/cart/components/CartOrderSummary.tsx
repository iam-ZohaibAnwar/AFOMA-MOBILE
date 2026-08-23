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
}

function SummaryRow({
  label,
  value,
  valueColor,
  emphasized = false,
}: {
  label: string;
  value: string;
  valueColor?: string;
  emphasized?: boolean;
}) {
  return (
    <View style={styles.row}>
      <AppText variant={emphasized ? 'bodyMedium' : 'body'} color={emphasized ? 'textPrimary' : 'textSecondary'}>
        {label}
      </AppText>
      <AppText
        variant={emphasized ? 'h3' : 'bodyMedium'}
        style={valueColor ? { color: valueColor } : emphasized ? styles.totalValue : styles.value}
      >
        {value}
      </AppText>
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
}: CartOrderSummaryProps) {
  const subtotalLabel =
    typeof itemCount === 'number'
      ? `Sub total (${itemCount} ${itemCount === 1 ? 'item' : 'items'})`
      : 'Sub total';

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
      <SummaryRow label="Shipping" value={formatSummaryAmount(shippingAmount, currency)} />
      <SummaryRow label="Service charge" value={formatSummaryAmount(serviceChargeAmount, currency)} />
      <View style={styles.dashedDivider} />
      <SummaryRow
        label="Total amount"
        value={formatSummaryAmount(total, currency)}
        emphasized
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
  dashedDivider: {
    borderStyle: 'dashed',
    borderTopWidth: 1,
    borderTopColor: colors.borderStrong,
    marginVertical: spacing.xs,
  },
});
