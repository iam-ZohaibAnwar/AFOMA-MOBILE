import { StyleSheet, View } from 'react-native';

import {
  AdminProductDetailCardShell,
  AdminProductDetailMetricRow,
} from '../../../product-management/components/detail/AdminProductDetailCardShell';
import type { AdminCommissionDisplayRow } from '../../types/adminCommission';
import { formatAdminCommissionAmount } from '../../utils/adminCommissionFormatters';
import { getAdminCommissionPrimaryPayoutAmount } from '../../utils/adminCommissionListDisplay';

export interface AdminCommissionDetailAmountsCardProps {
  row: AdminCommissionDisplayRow;
}

export function AdminCommissionDetailAmountsCard({ row }: AdminCommissionDetailAmountsCardProps) {
  const primaryPayout = getAdminCommissionPrimaryPayoutAmount(row);

  return (
    <AdminProductDetailCardShell title="Amounts" icon="cash-outline" iconVariant="solid">
      <View style={styles.rows}>
        <AdminProductDetailMetricRow
          label="Commission amount"
          value={formatAdminCommissionAmount(row.commissionAmount)}
        />
        <AdminProductDetailMetricRow
          label={
            row.type === 'affiliate'
              ? 'Affiliate payout'
              : row.type === 'referral'
                ? 'Referral payout'
                : 'Seller payout'
          }
          value={formatAdminCommissionAmount(primaryPayout)}
        />
        {row.type === 'seller' && row.productNames !== '—' ? (
          <AdminProductDetailMetricRow label="Products" value={row.productNames} />
        ) : null}
      </View>
    </AdminProductDetailCardShell>
  );
}

const styles = StyleSheet.create({
  rows: {
    gap: 4,
  },
});
