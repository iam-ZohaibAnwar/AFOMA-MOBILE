import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '../../../../components/ui/AppText';
import { colors, radius, shadows, spacing } from '../../../../design-system';
import { AdminProductStatusChip } from '../../../admin/product-management/components/AdminProductStatusChip';
import { formatReferralAmount } from '../../utils/referralEarningsDisplay';
import type { ReferralCommissionRecord } from '../types/referralEarning';
import {
  getReferralEarningCustomerName,
  getReferralEarningOrderLabel,
  getReferralEarningPurchasedDate,
  resolveReferralEarningAccentColor,
  resolveReferralEarningListIcon,
  resolveReferralEarningListStatusChips,
} from '../utils/referralEarningsListDisplay';

export interface ReferralEarningCardProps {
  record: ReferralCommissionRecord;
  onPress: (record: ReferralCommissionRecord) => void;
}

export function ReferralEarningCard({ record, onPress }: ReferralEarningCardProps) {
  const accentColor = resolveReferralEarningAccentColor(record);
  const statusChips = resolveReferralEarningListStatusChips(record);

  return (
    <View style={styles.card}>
      <View style={[styles.accent, { backgroundColor: accentColor }]} />

      <Pressable
        accessibilityRole="button"
        onPress={() => onPress(record)}
        style={({ pressed }) => [styles.body, pressed && styles.cardPressed]}
      >
        <View style={[styles.iconWrap, { backgroundColor: accentColor }]}>
          <Ionicons name={resolveReferralEarningListIcon()} size={22} color={colors.textInverse} />
        </View>

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <AppText variant="caption" color="textMuted" style={styles.orderLabel}>
              ORDER #{getReferralEarningOrderLabel(record)}
            </AppText>
            <AppText variant="caption" color="textSecondary">
              {getReferralEarningPurchasedDate(record)}
            </AppText>
          </View>

          <AppText variant="bodyMedium" style={styles.customerName} numberOfLines={1}>
            {getReferralEarningCustomerName(record)}
          </AppText>

          <AppText variant="caption" color="textSecondary" style={styles.subtitle}>
            Referred customer order
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
                REFERRAL
              </AppText>
              <AppText variant="h3" style={styles.amountValue}>
                {formatReferralAmount(record.referralAmount)}
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
  amountValue: {
    color: colors.primary,
    fontWeight: '800',
  },
});
