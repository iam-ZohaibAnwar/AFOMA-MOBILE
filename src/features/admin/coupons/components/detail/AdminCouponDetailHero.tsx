import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '../../../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../../../design-system';
import { AdminProductStatusChip } from '../../../product-management/components/AdminProductStatusChip';
import type { AdminCouponListItem, AdminCouponListTabId } from '../../types/adminCoupons';
import {
  formatAdminCouponDiscount,
  formatAdminCouponExpirationDate,
  formatAdminCouponType,
  getAdminCouponCreatorName,
} from '../../utils/adminCouponsContent';
import {
  resolveAdminCouponListIcon,
  resolveAdminCouponListStatusChips,
} from '../../utils/adminCouponListDisplay';

export interface AdminCouponDetailHeroProps {
  coupon: AdminCouponListItem;
  listTab?: AdminCouponListTabId;
}

export function AdminCouponDetailHero({ coupon, listTab = 'admin' }: AdminCouponDetailHeroProps) {
  const statusChips = resolveAdminCouponListStatusChips(coupon);

  return (
    <View style={styles.hero}>
      <View style={[styles.iconWrap, { backgroundColor: colors.primary }]}>
        <Ionicons name={resolveAdminCouponListIcon()} size={28} color={colors.textInverse} />
      </View>

      <View style={styles.copy}>
        <AppText variant="h3" style={styles.code}>
          {coupon.couponCode?.trim() || 'Coupon'}
        </AppText>

        {listTab === 'seller' ? (
          <AppText variant="bodySmall" color="textSecondary">
            {getAdminCouponCreatorName(coupon)}
          </AppText>
        ) : null}

        <AppText variant="bodySmall" color="textSecondary">
          {formatAdminCouponType(coupon.couponType)} · {formatAdminCouponDiscount(coupon)}
        </AppText>

        <AppText variant="caption" color="textMuted">
          Expires {formatAdminCouponExpirationDate(coupon.expirationDate)}
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
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  code: {
    color: colors.textPrimary,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
});
