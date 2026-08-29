import { StyleSheet, View } from 'react-native';

import {
  AdminProductDetailCardShell,
  AdminProductDetailMetricRow,
} from '../../../../admin/product-management/components/detail/AdminProductDetailCardShell';
import type { SellerCommissionRecord } from '../../types/sellerEarning';
import {
  formatPayoutStatus,
  formatSellerEarningAmount,
  formatSellerEarningCustomerName,
} from '../../utils/sellerEarningsDisplay';

export interface SellerEarningDetailAmountsCardProps {
  record: SellerCommissionRecord;
}

export function SellerEarningDetailAmountsCard({ record }: SellerEarningDetailAmountsCardProps) {
  return (
    <AdminProductDetailCardShell title="Amounts" icon="cash-outline" iconVariant="solid">
      <View style={styles.rows}>
        <AdminProductDetailMetricRow
          label="Seller payout"
          value={formatSellerEarningAmount(record.payoutAmount)}
        />
        <AdminProductDetailMetricRow
          label="Referral amount"
          value={formatSellerEarningAmount(record.referralAmount)}
        />
        <AdminProductDetailMetricRow label="Customer" value={formatSellerEarningCustomerName(record)} />
        <AdminProductDetailMetricRow label="Payout status" value={formatPayoutStatus(record.payoutStatus)} />
      </View>
    </AdminProductDetailCardShell>
  );
}

const styles = StyleSheet.create({
  rows: {
    gap: 4,
  },
});
