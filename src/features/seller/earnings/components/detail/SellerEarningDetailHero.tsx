import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '../../../../../components/ui/AppText';
import { colors, spacing } from '../../../../../design-system';
import { AdminProductStatusChip } from '../../../../admin/product-management/components/AdminProductStatusChip';
import type { SellerCommissionRecord } from '../../types/sellerEarning';
import {
  formatSellerEarningCustomerName,
  formatSellerEarningOrderId,
} from '../../utils/sellerEarningsDisplay';
import {
  getSellerEarningPurchasedDate,
  resolveSellerEarningListIcon,
  resolveSellerEarningListStatusChips,
} from '../../utils/sellerEarningsListDisplay';

export interface SellerEarningDetailHeroProps {
  record: SellerCommissionRecord;
}

export function SellerEarningDetailHero({ record }: SellerEarningDetailHeroProps) {
  const statusChips = resolveSellerEarningListStatusChips(record);

  return (
    <View style={styles.hero}>
      <View style={styles.iconWrap}>
        <Ionicons name={resolveSellerEarningListIcon()} size={28} color={colors.textInverse} />
      </View>

      <View style={styles.copy}>
        <AppText variant="caption" color="textMuted" style={styles.orderLabel}>
          ORDER #{formatSellerEarningOrderId(record)}
        </AppText>
        <AppText variant="h3" style={styles.customerName}>
          {formatSellerEarningCustomerName(record)}
        </AppText>
        <AppText variant="bodySmall" color="textSecondary">
          Seller earnings
        </AppText>
        <AppText variant="caption" color="textMuted">
          {getSellerEarningPurchasedDate(record)}
        </AppText>

        {statusChips.length > 0 ? (
          <View style={styles.chipsRow}>
            {statusChips.map((chip) => (
              <AdminProductStatusChip
                key={chip.id}
                label={chip.label}
                icon={chip.icon}
                tone={chip.tone}
              />
            ))}
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  orderLabel: {
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  customerName: {
    color: colors.textPrimary,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
});
