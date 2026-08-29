import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '../../../../../components/ui/AppText';
import { colors, spacing } from '../../../../../design-system';
import { AdminProductStatusChip } from '../../../product-management/components/AdminProductStatusChip';
import type { AdminCommissionDisplayRow } from '../../types/adminCommission';
import {
  formatAdminCommissionOrderDisplayId,
  formatAdminCommissionPurchasedDate,
  formatAdminCommissionRecipientType,
  getAdminCommissionPayoutStateLabel,
} from '../../utils/adminCommissionFormatters';
import {
  resolveAdminCommissionListStatusChips,
  resolveAdminCommissionTypeIcon,
} from '../../utils/adminCommissionListDisplay';

export interface AdminCommissionDetailHeroProps {
  row: AdminCommissionDisplayRow;
}

export function AdminCommissionDetailHero({ row }: AdminCommissionDetailHeroProps) {
  const statusChips = resolveAdminCommissionListStatusChips(row);
  const payoutStateLabel = getAdminCommissionPayoutStateLabel(row);

  return (
    <View style={styles.hero}>
      <View style={styles.iconWrap}>
        <Ionicons name={resolveAdminCommissionTypeIcon(row.type)} size={28} color={colors.textInverse} />
      </View>

      <View style={styles.copy}>
        <AppText variant="caption" color="textMuted" style={styles.orderLabel}>
          ORDER #{formatAdminCommissionOrderDisplayId(row.orderId)}
        </AppText>
        <AppText variant="h3" style={styles.recipientName}>
          {row.recipientName}
        </AppText>
        <AppText variant="bodySmall" color="textSecondary">
          {formatAdminCommissionRecipientType(row.type)} commission
        </AppText>
        <AppText variant="caption" color="textMuted">
          {formatAdminCommissionPurchasedDate(row.purchasedAt)}
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

        {payoutStateLabel ? (
          <AppText variant="bodySmall" color="textSecondary" style={styles.stateLabel}>
            {payoutStateLabel}
          </AppText>
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
  recipientName: {
    color: colors.textPrimary,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  stateLabel: {
    marginTop: spacing.xs,
  },
});
