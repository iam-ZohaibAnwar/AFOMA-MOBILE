import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '../../../../components/ui/AppText';
import { colors, radius, shadows, spacing } from '../../../../design-system';
import { AdminProductStatusChip } from '../../../admin/product-management/components/AdminProductStatusChip';
import type { SellerCommissionRecord } from '../types/sellerEarning';
import {
  formatSellerEarningAmount,
  formatSellerEarningCustomerName,
  formatSellerEarningOrderId,
} from '../utils/sellerEarningsDisplay';
import {
  getSellerEarningListSubtitle,
  getSellerEarningPurchasedDate,
  resolveSellerEarningAccentColor,
  resolveSellerEarningListIcon,
  resolveSellerEarningListStatusChips,
} from '../utils/sellerEarningsListDisplay';

export interface SellerEarningCardProps {
  record: SellerCommissionRecord;
  onPress: (record: SellerCommissionRecord) => void;
}

export function SellerEarningCard({ record, onPress }: SellerEarningCardProps) {
  const accentColor = resolveSellerEarningAccentColor(record);
  const statusChips = resolveSellerEarningListStatusChips(record);
  const subtitle = getSellerEarningListSubtitle(record);

  return (
    <View style={styles.card}>
      <View style={[styles.accent, { backgroundColor: accentColor }]} />

      <Pressable
        accessibilityRole="button"
        onPress={() => onPress(record)}
        style={({ pressed }) => [styles.body, pressed && styles.cardPressed]}
      >
        <View style={[styles.iconWrap, { backgroundColor: accentColor }]}>
          <Ionicons name={resolveSellerEarningListIcon()} size={22} color={colors.textInverse} />
        </View>

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <AppText variant="caption" color="textMuted" style={styles.orderLabel}>
              ORDER #{formatSellerEarningOrderId(record)}
            </AppText>
            <AppText variant="caption" color="textSecondary">
              {getSellerEarningPurchasedDate(record)}
            </AppText>
          </View>

          <AppText variant="bodyMedium" style={styles.customerName} numberOfLines={1}>
            {formatSellerEarningCustomerName(record)}
          </AppText>

          <AppText variant="caption" color="textSecondary" numberOfLines={2} style={styles.subtitle}>
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
            <View style={styles.amountBlock}>
              <AppText variant="caption" color="textMuted" style={styles.amountLabel}>
                PAYOUT
              </AppText>
              <AppText variant="h3" style={styles.payoutValue}>
                {formatSellerEarningAmount(record.payoutAmount)}
              </AppText>
            </View>

            <View style={styles.amountBlock}>
              <AppText variant="caption" color="textMuted" style={styles.amountLabel}>
                REFERRAL
              </AppText>
              <AppText variant="bodyMedium" style={styles.referralValue}>
                {formatSellerEarningAmount(record.referralAmount)}
              </AppText>
            </View>

            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </View>
        </View>
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
    paddingRight: spacing.md,
    paddingLeft: spacing.md + 4,
  },
  cardPressed: {
    opacity: 0.92,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.medium,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
    flexShrink: 0,
  },
  content: {
    flex: 1,
    gap: spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  orderLabel: {
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  customerName: {
    color: colors.textPrimary,
    fontWeight: '700',
    paddingRight: spacing.xs,
  },
  subtitle: {
    lineHeight: 18,
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
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  amountBlock: {
    flex: 1,
    gap: 2,
  },
  amountLabel: {
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  payoutValue: {
    color: colors.primary,
    fontWeight: '800',
  },
  referralValue: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
});
