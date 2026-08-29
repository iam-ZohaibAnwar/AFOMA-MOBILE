import { StyleSheet, View } from 'react-native';

import { AppDivider } from '../../../../../components/ui/AppDivider';
import { AppText } from '../../../../../components/ui/AppText';
import { spacing } from '../../../../../design-system';
import {
  AdminProductDetailCardShell,
  AdminProductDetailMetricRow,
} from '../../../../admin/product-management/components/detail/AdminProductDetailCardShell';
import type { SellerCommissionRecord } from '../../types/sellerEarning';
import { getSellerEarningLineItems } from '../../utils/sellerEarningsDisplay';

export interface SellerEarningDetailLineItemsCardProps {
  record: SellerCommissionRecord;
}

export function SellerEarningDetailLineItemsCard({ record }: SellerEarningDetailLineItemsCardProps) {
  const lineItems = getSellerEarningLineItems(record);

  return (
    <AdminProductDetailCardShell title="Order items" icon="cube-outline" iconVariant="solid">
      {lineItems.length ? (
        <View style={styles.list}>
          {lineItems.map((item, index) => (
            <View key={`${item.sku}-${item.productName}-${index}`}>
              <AppText variant="bodyMedium" style={styles.productName}>
                {item.productName}
              </AppText>
              <AdminProductDetailMetricRow label="SKU" value={item.sku} />
              <AdminProductDetailMetricRow label="Quantity" value={item.quantity} />
              <AdminProductDetailMetricRow label="Line total" value={`CA$${item.lineTotal}`} />
              {index < lineItems.length - 1 ? <AppDivider style={styles.divider} /> : null}
            </View>
          ))}
        </View>
      ) : (
        <AppText variant="bodySmall" color="textMuted">
          No product details for this earning.
        </AppText>
      )}
    </AdminProductDetailCardShell>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
  },
  productName: {
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  divider: {
    marginVertical: spacing.sm,
  },
});
