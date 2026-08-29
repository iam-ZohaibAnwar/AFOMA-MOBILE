import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '../../../../components/ui/AppText';
import { colors, radius, shadows, spacing } from '../../../../design-system';
import { AdminProductStatusChip } from '../../product-management/components/AdminProductStatusChip';
import type { AdminCommissionDisplayRow } from '../types/adminCommission';
import {
  formatAdminCommissionAmount,
  formatAdminCommissionOrderDisplayId,
  formatAdminCommissionPurchasedDate,
} from '../utils/adminCommissionFormatters';
import {
  getAdminCommissionListSubtitle,
  getAdminCommissionPrimaryPayoutAmount,
  resolveAdminCommissionAccentColor,
  resolveAdminCommissionListStatusChips,
  resolveAdminCommissionTypeIcon,
} from '../utils/adminCommissionListDisplay';

export interface AdminCommissionCardProps {
  row: AdminCommissionDisplayRow;
  onPress: (row: AdminCommissionDisplayRow) => void;
  onMenuPress: (row: AdminCommissionDisplayRow) => void;
  isBusy?: boolean;
}

export function AdminCommissionCard({
  row,
  onPress,
  onMenuPress,
  isBusy = false,
}: AdminCommissionCardProps) {
  const accentColor = resolveAdminCommissionAccentColor(row.type);
  const statusChips = resolveAdminCommissionListStatusChips(row);
  const subtitle = getAdminCommissionListSubtitle(row);
  const payoutAmount = getAdminCommissionPrimaryPayoutAmount(row);

  return (
    <View style={styles.card}>
      <View style={[styles.accent, { backgroundColor: accentColor }]} />

      <Pressable
        accessibilityRole="button"
        disabled={isBusy}
        onPress={() => onPress(row)}
        style={({ pressed }) => [styles.body, pressed && styles.cardPressed]}
      >
        <View style={[styles.iconWrap, { backgroundColor: accentColor }]}>
          <Ionicons name={resolveAdminCommissionTypeIcon(row.type)} size={22} color={colors.textInverse} />
        </View>

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <AppText variant="caption" color="textMuted" style={styles.orderLabel}>
              ORDER #{formatAdminCommissionOrderDisplayId(row.orderId)}
            </AppText>
            <AppText variant="caption" color="textSecondary">
              {formatAdminCommissionPurchasedDate(row.purchasedAt)}
            </AppText>
          </View>

          <AppText variant="bodyMedium" style={styles.recipientName} numberOfLines={1}>
            {row.recipientName}
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
                COMMISSION
              </AppText>
              <AppText variant="h3" style={styles.commissionValue}>
                {formatAdminCommissionAmount(row.commissionAmount)}
              </AppText>
            </View>

            <View style={styles.amountBlock}>
              <AppText variant="caption" color="textMuted" style={styles.amountLabel}>
                PAYOUT
              </AppText>
              <AppText variant="bodyMedium" style={styles.payoutValue}>
                {formatAdminCommissionAmount(payoutAmount)}
              </AppText>
            </View>

            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </View>
        </View>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Commission actions"
        disabled={isBusy}
        onPress={() => onMenuPress(row)}
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
  recipientName: {
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
  commissionValue: {
    color: colors.primary,
    fontWeight: '800',
  },
  payoutValue: {
    color: colors.textPrimary,
    fontWeight: '700',
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
