import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '../../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../../design-system';
import type { AdminCouponListItem } from '../types/adminCoupons';
import {
  formatAdminCouponDiscount,
  formatAdminCouponExpirationDate,
  formatAdminCouponType,
  formatAdminCouponUsage,
  getAdminCouponStatusLabel,
  isAdminCouponExpired,
} from '../utils/adminCouponsDisplay';

export interface AdminCouponCardProps {
  coupon: AdminCouponListItem;
  onPress: (coupon: AdminCouponListItem) => void;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <AppText variant="caption" color="textMuted">
        {label}
      </AppText>
      <AppText variant="bodySmall" style={styles.detailValue}>
        {value}
      </AppText>
    </View>
  );
}

export function AdminCouponCard({ coupon, onPress }: AdminCouponCardProps) {
  const couponId = coupon._id;
  const isExpired = isAdminCouponExpired(coupon.expirationDate);
  const statusLabel = getAdminCouponStatusLabel(coupon);

  return (
    <Pressable
      disabled={!couponId}
      onPress={() => onPress(coupon)}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      accessibilityRole="button"
      accessibilityLabel={`Coupon ${coupon.couponCode ?? 'details'}`}
    >
      <View style={styles.headerRow}>
        <AppText variant="bodyMedium" style={styles.code}>
          {coupon.couponCode || '—'}
        </AppText>
        <View style={[styles.statusBadge, isExpired ? styles.statusExpired : styles.statusActive]}>
          <AppText variant="caption" style={isExpired ? styles.statusExpiredText : styles.statusActiveText}>
            {statusLabel}
          </AppText>
        </View>
      </View>

      <View style={styles.detailsGrid}>
        <DetailRow label="Type" value={formatAdminCouponType(coupon.couponType)} />
        <DetailRow label="Discount" value={formatAdminCouponDiscount(coupon)} />
        <DetailRow
          label="Minimum cart"
          value={coupon.minimumCartAmount != null ? String(coupon.minimumCartAmount) : '—'}
        />
        <DetailRow label="Usage" value={formatAdminCouponUsage(coupon)} />
        <DetailRow label="Expires" value={formatAdminCouponExpirationDate(coupon.expirationDate)} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.large,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    padding: spacing.lg,
    gap: spacing.md,
  },
  cardPressed: {
    opacity: 0.92,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  code: {
    color: colors.textPrimary,
    fontWeight: '700',
    flex: 1,
  },
  statusBadge: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  statusActive: {
    backgroundColor: colors.successBg,
  },
  statusExpired: {
    backgroundColor: colors.errorBg,
  },
  statusActiveText: {
    color: colors.success,
    fontWeight: '600',
  },
  statusExpiredText: {
    color: colors.error,
    fontWeight: '600',
  },
  detailsGrid: {
    gap: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  detailValue: {
    color: colors.textPrimary,
    fontWeight: '600',
    textAlign: 'right',
    flexShrink: 1,
  },
});
