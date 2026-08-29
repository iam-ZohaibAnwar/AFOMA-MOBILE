import { StyleSheet, View } from 'react-native';

import {
  AdminProductDetailCardShell,
  AdminProductDetailMetricRow,
} from '../../../../admin/product-management/components/detail/AdminProductDetailCardShell';
import {
  formatCommissionCustomerName,
  formatPayoutStatus,
  formatReferralAmount,
  formatReferralEarningDate,
} from '../../../utils/referralEarningsDisplay';
import type { ReferralCommissionRecord } from '../../types/referralEarning';

export interface ReferralEarningDetailAmountsCardProps {
  record: ReferralCommissionRecord;
}

export function ReferralEarningDetailAmountsCard({ record }: ReferralEarningDetailAmountsCardProps) {
  return (
    <AdminProductDetailCardShell title="Commission details" icon="cash-outline" iconVariant="solid">
      <View style={styles.rows}>
        <AdminProductDetailMetricRow
          label="Referral amount"
          value={formatReferralAmount(record.referralAmount)}
        />
        <AdminProductDetailMetricRow label="Customer" value={formatCommissionCustomerName(record)} />
        <AdminProductDetailMetricRow label="Payout status" value={formatPayoutStatus(record.payoutStatus)} />
        <AdminProductDetailMetricRow label="Order date" value={formatReferralEarningDate(record)} />
      </View>
    </AdminProductDetailCardShell>
  );
}

const styles = StyleSheet.create({
  rows: {
    gap: 4,
  },
});
