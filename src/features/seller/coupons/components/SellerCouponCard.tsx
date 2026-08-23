import { Alert, StyleSheet, View } from 'react-native';

import { AppButton } from '../../../../components/ui/AppButton';
import { AppText } from '../../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../../design-system';
import type { SellerCoupon } from '../types/sellerCoupon';
import {
  formatSellerCouponDiscount,
  formatSellerCouponExpiration,
  formatSellerCouponType,
  formatSellerCouponUsage,
} from '../utils/sellerCouponDisplay';

export interface SellerCouponCardProps {
  coupon: SellerCoupon;
  onEdit: (couponId: string) => void;
  onDelete: (coupon: SellerCoupon) => void;
  isDeleting?: boolean;
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

export function SellerCouponCard({
  coupon,
  onEdit,
  onDelete,
  isDeleting = false,
}: SellerCouponCardProps) {
  const couponId = coupon._id;
  const couponCode = coupon.couponCode || 'this coupon';

  const handleDeletePress = () => {
    if (!couponId || isDeleting) {
      return;
    }

    Alert.alert(
      'Delete coupon',
      `Are you sure you want to delete ${couponCode}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(coupon),
        },
      ],
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <AppText variant="bodyMedium" style={styles.code}>
          {coupon.couponCode || '—'}
        </AppText>
      </View>

      <View style={styles.detailsGrid}>
        <DetailRow label="Type" value={formatSellerCouponType(coupon.couponType)} />
        <DetailRow label="Discount" value={formatSellerCouponDiscount(coupon)} />
        <DetailRow
          label="Minimum cart"
          value={coupon.minimumCartAmount != null ? `$${coupon.minimumCartAmount}` : '—'}
        />
        <DetailRow label="Usage" value={formatSellerCouponUsage(coupon)} />
        <DetailRow
          label="Usage limit"
          value={coupon.usageLimitPerCoupon != null ? String(coupon.usageLimitPerCoupon) : '—'}
        />
        <DetailRow
          label="Per customer"
          value={
            coupon.usageLimitPerCustomer != null ? String(coupon.usageLimitPerCustomer) : '—'
          }
        />
        <DetailRow label="Expires" value={formatSellerCouponExpiration(coupon.expirationDate)} />
      </View>

      <View style={styles.actionsRow}>
        <AppButton
          label="Edit"
          variant="outline"
          size="md"
          disabled={!couponId || isDeleting}
          onPress={() => {
            if (couponId) {
              onEdit(couponId);
            }
          }}
          style={styles.actionButton}
        />
        <AppButton
          label={isDeleting ? 'Deleting...' : 'Delete'}
          variant="outline"
          size="md"
          loading={isDeleting}
          disabled={!couponId || isDeleting}
          onPress={handleDeletePress}
          style={styles.actionButton}
          labelStyle={styles.deleteLabel}
        />
      </View>
    </View>
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
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  actionButton: {
    flexGrow: 1,
    flexBasis: '48%',
  },
  deleteLabel: {
    color: colors.error,
  },
});
