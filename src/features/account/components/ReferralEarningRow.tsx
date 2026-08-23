import { StyleSheet, View } from 'react-native';

import { AppBadge } from '../../../components/ui/AppBadge';
import { AppText } from '../../../components/ui/AppText';
import { colors, spacing } from '../../../design-system';
import type { AffiliateCommissionRecord } from '../../../services/types/commission';
import {
  formatCommissionCustomerName,
  formatCommissionOrderId,
  formatPayoutStatus,
  formatReferralAmount,
  payoutStatusBadgeVariant,
} from '../utils/referralEarningsDisplay';

export interface ReferralEarningRowProps {
  record: AffiliateCommissionRecord;
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.field}>
      <AppText variant="caption" color="textSecondary">
        {label}
      </AppText>
      <AppText variant="bodyMedium" style={styles.fieldValue}>
        {value}
      </AppText>
    </View>
  );
}

export function ReferralEarningRow({ record }: ReferralEarningRowProps) {
  const payoutStatus = formatPayoutStatus(record.payoutStatus);

  return (
    <View style={styles.row}>
      <View style={styles.header}>
        <AppText variant="bodyMedium" style={styles.orderId}>
          {formatCommissionOrderId(record)}
        </AppText>
        <AppBadge label={payoutStatus} variant={payoutStatusBadgeVariant(record.payoutStatus)} />
      </View>

      <View style={styles.details}>
        <DetailField label="Referral amount" value={formatReferralAmount(record.referralAmount)} />
        <DetailField label="Customer" value={formatCommissionCustomerName(record)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: spacing.sm,
    paddingVertical: spacing.md,
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
    flex: 1,
  },
  details: {
    gap: spacing.sm,
  },
  field: {
    gap: 2,
  },
  fieldValue: {
    color: colors.textPrimary,
  },
});
