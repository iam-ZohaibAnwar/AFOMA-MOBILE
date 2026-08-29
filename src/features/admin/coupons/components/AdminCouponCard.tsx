import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '../../../../components/ui/AppText';
import { colors, radius, shadows, spacing } from '../../../../design-system';
import { AdminProductStatusChip } from '../../product-management/components/AdminProductStatusChip';
import type { AdminCouponListItem, AdminCouponListTabId } from '../types/adminCoupons';
import {
  formatAdminCouponDiscount,
  formatAdminCouponExpirationDate,
} from '../utils/adminCouponsContent';
import { formatAdminCouponUsage } from '../utils/adminCouponsDisplay';
import {
  getAdminCouponListSubtitle,
  resolveAdminCouponAccentColor,
  resolveAdminCouponListIcon,
  resolveAdminCouponListStatusChips,
} from '../utils/adminCouponListDisplay';

export interface AdminCouponCardProps {
  coupon: AdminCouponListItem;
  listTab: AdminCouponListTabId;
  onPress: (coupon: AdminCouponListItem) => void;
  onMenuPress: (coupon: AdminCouponListItem) => void;
  isBusy?: boolean;
}

export function AdminCouponCard({
  coupon,
  listTab,
  onPress,
  onMenuPress,
  isBusy = false,
}: AdminCouponCardProps) {
  const couponId = coupon._id;
  const accentColor = resolveAdminCouponAccentColor(coupon);
  const statusChips = resolveAdminCouponListStatusChips(coupon);
  const subtitle = getAdminCouponListSubtitle(coupon, listTab);

  return (
    <View style={styles.card}>
      <View style={[styles.accent, { backgroundColor: accentColor }]} />

      <Pressable
        accessibilityRole="button"
        disabled={!couponId || isBusy}
        onPress={() => onPress(coupon)}
        style={({ pressed }) => [styles.body, pressed && styles.cardPressed]}
      >
        <View style={[styles.iconWrap, { backgroundColor: colors.primary }]}>
          <Ionicons name={resolveAdminCouponListIcon()} size={22} color={colors.textInverse} />
        </View>

        <View style={styles.content}>
          <AppText variant="bodyMedium" style={styles.code} numberOfLines={1}>
            {coupon.couponCode?.trim() || 'Untitled coupon'}
          </AppText>

          <AppText variant="caption" color="textSecondary" numberOfLines={1}>
            {subtitle}
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

          <View style={styles.footerRow}>
            <View style={styles.metaBlock}>
              <AppText variant="caption" color="textSecondary" numberOfLines={1}>
                Expires {formatAdminCouponExpirationDate(coupon.expirationDate)}
              </AppText>
              <AppText variant="caption" color="textSecondary" numberOfLines={1}>
                Used {formatAdminCouponUsage(coupon)}
              </AppText>
            </View>

            <View style={styles.discountBlock}>
              <AppText variant="caption" color="textMuted" style={styles.metricLabel}>
                DISCOUNT
              </AppText>
              <AppText variant="bodyMedium" style={styles.discountValue} numberOfLines={1}>
                {formatAdminCouponDiscount(coupon)}
              </AppText>
            </View>
          </View>
        </View>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Coupon actions"
        disabled={!couponId || isBusy}
        onPress={() => onMenuPress(coupon)}
        style={({ pressed }) => [styles.menuButton, pressed && styles.menuButtonPressed]}
        hitSlop={8}
      >
        {isBusy ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <Ionicons name="ellipsis-vertical" size={18} color={colors.textMuted} />
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.large,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    position: 'relative',
    ...shadows.card,
  },
  accent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  body: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    paddingRight: spacing.md + 28,
    paddingLeft: spacing.md + 4,
  },
  cardPressed: {
    opacity: 0.92,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
    flexShrink: 0,
  },
  content: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  code: {
    color: colors.textPrimary,
    fontWeight: '700',
    paddingRight: spacing.xs,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  metaBlock: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  discountBlock: {
    flexShrink: 0,
    alignItems: 'flex-end',
    gap: 2,
    maxWidth: '42%',
  },
  metricLabel: {
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    textAlign: 'right',
  },
  discountValue: {
    color: colors.primary,
    fontWeight: '800',
    textAlign: 'right',
  },
  menuButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.sm,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  menuButtonPressed: {
    opacity: 0.75,
  },
});
