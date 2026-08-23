import { StyleSheet, View } from 'react-native';

import { AppBadge } from '../../../../components/ui/AppBadge';
import { AppText } from '../../../../components/ui/AppText';
import { colors, spacing } from '../../../../design-system';
import type { SellerCommissionRecord } from '../types/sellerEarning';
import {
  formatPayoutStatus,
  formatSellerEarningAmount,
  formatSellerEarningCustomerName,
  formatSellerEarningDate,
  formatSellerEarningOrderId,
  getSellerEarningLineItems,
  payoutStatusBadgeVariant,
} from '../utils/sellerEarningsDisplay';

export interface SellerEarningCardProps {
  record: SellerCommissionRecord;
}

function AmountRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.amountRow}>
      <AppText variant="bodySmall" color="textSecondary">
        {label}
      </AppText>
      <AppText variant="bodyMedium" style={styles.amountValue}>
        {value}
      </AppText>
    </View>
  );
}

export function SellerEarningCard({ record }: SellerEarningCardProps) {
  const payoutStatus = formatPayoutStatus(record.payoutStatus);
  const lineItems = getSellerEarningLineItems(record);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <AppBadge label={payoutStatus} variant={payoutStatusBadgeVariant(record.payoutStatus)} />
        <AppText variant="bodyMedium" style={styles.orderId}>
          {formatSellerEarningOrderId(record)}
        </AppText>
      </View>

      <AppText variant="bodySmall" color="textSecondary">
        Customer: {formatSellerEarningCustomerName(record)}
      </AppText>

      {lineItems.length > 0 ? (
        <View style={styles.products}>
          {lineItems.map((item, index) => (
            <View key={`${item.productName}-${item.sku}-${index}`} style={styles.productBlock}>
              <AppText variant="bodyMedium" style={styles.productName}>
                {item.productName}
              </AppText>
              <AppText variant="bodySmall" color="textSecondary">
                Qty {item.quantity}
              </AppText>
            </View>
          ))}
        </View>
      ) : (
        <AppText variant="bodySmall" color="textMuted">
          No product details
        </AppText>
      )}

      <View style={styles.amounts}>
        <AmountRow label="Payout" value={formatSellerEarningAmount(record.payoutAmount)} />
        <AmountRow label="Referral" value={formatSellerEarningAmount(record.referralAmount)} />
      </View>

      <AppText variant="caption" color="textMuted">
        {formatSellerEarningDate(record)}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderStrong,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  orderId: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  products: {
    gap: spacing.sm,
  },
  productBlock: {
    gap: 2,
  },
  productName: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  amounts: {
    flexDirection: 'row',
    gap: spacing.xl,
  },
  amountRow: {
    gap: 2,
    flex: 1,
  },
  amountValue: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
});
