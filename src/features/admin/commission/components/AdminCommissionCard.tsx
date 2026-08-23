import { StyleSheet, View } from 'react-native';

import { AppBadge } from '../../../../components/ui/AppBadge';
import { AppButton } from '../../../../components/ui/AppButton';
import { AppText } from '../../../../components/ui/AppText';
import { colors, spacing } from '../../../../design-system';
import type { AdminCommissionActionError, AdminCommissionDisplayRow } from '../types/adminCommission';
import {
  canInitiateAdminCommissionPayout,
  canUpdateAdminCommissionPayoutStatus,
} from '../utils/adminCommissionMutationGuards';
import {
  adminCommissionPayoutStatusBadgeVariant,
  adminCommissionRecipientTypeBadgeVariant,
  formatAdminCommissionAmount,
  formatAdminCommissionPayoutStatus,
  formatAdminCommissionPurchasedDate,
  formatAdminCommissionRecipientType,
  getAdminCommissionPayoutStateLabel,
  getInitiatePayoutButtonLabel,
} from '../utils/adminCommissionFormatters';

export interface AdminCommissionCardProps {
  row: AdminCommissionDisplayRow;
  initiatingCommissionId: string | null;
  updatingStatusCommissionId: string | null;
  actionError: AdminCommissionActionError | null;
  onInitiatePress: (row: AdminCommissionDisplayRow) => void;
  onStatusPress: (row: AdminCommissionDisplayRow) => void;
  onRetryAction: (row: AdminCommissionDisplayRow, kind: AdminCommissionActionError['kind']) => void;
  onDismissActionError: () => void;
}

function AmountRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.amountRow}>
      <AppText variant="bodySmall" color="textSecondary">
        {label}
      </AppText>
      <AppText variant="bodyMedium" style={styles.amountValue}>
        {value}
      </AppText>
    </View>
  );
}

export function AdminCommissionCard({
  row,
  initiatingCommissionId,
  updatingStatusCommissionId,
  actionError,
  onInitiatePress,
  onStatusPress,
  onRetryAction,
  onDismissActionError,
}: AdminCommissionCardProps) {
  const payoutStatus = formatAdminCommissionPayoutStatus(row.payoutStatus);
  const payoutStateLabel = getAdminCommissionPayoutStateLabel(row);
  const primaryPayoutAmount =
    row.type === 'affiliate'
      ? row.affiliateAmount
      : row.type === 'referral'
        ? row.referralAmount
        : row.payoutAmount;

  const isInitiating = initiatingCommissionId === row.commissionId;
  const isUpdatingStatus = updatingStatusCommissionId === row.commissionId;
  const canInitiate = canInitiateAdminCommissionPayout(row, initiatingCommissionId);
  const canUpdateStatus = canUpdateAdminCommissionPayoutStatus(row, updatingStatusCommissionId);
  const rowActionError = actionError?.commissionId === row.commissionId ? actionError : null;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.badges}>
          <AppBadge
            label={formatAdminCommissionRecipientType(row.type)}
            variant={adminCommissionRecipientTypeBadgeVariant(row.type)}
          />
          <AppBadge
            label={payoutStatus}
            variant={adminCommissionPayoutStatusBadgeVariant(row.payoutStatus)}
          />
        </View>
        <AppText variant="bodyMedium" style={styles.orderId}>
          {row.orderDisplayId}
        </AppText>
      </View>

      <AppText variant="bodySmall" color="textSecondary">
        {formatAdminCommissionRecipientType(row.type)}: {row.recipientName}
      </AppText>

      {row.type === 'seller' && row.productNames !== '—' ? (
        <AppText variant="bodySmall" color="textSecondary" numberOfLines={2}>
          {row.productNames}
        </AppText>
      ) : null}

      <View style={styles.amounts}>
        <AmountRow label="Commission" value={formatAdminCommissionAmount(row.commissionAmount)} />
        <AmountRow
          label={row.type === 'affiliate' ? 'Affiliate payout' : row.type === 'referral' ? 'Referral payout' : 'Payout'}
          value={formatAdminCommissionAmount(primaryPayoutAmount)}
        />
      </View>

      {payoutStateLabel ? (
        <AppText variant="caption" color="textSecondary">
          {payoutStateLabel}
        </AppText>
      ) : null}

      <AppText variant="caption" color="textMuted">
        {formatAdminCommissionPurchasedDate(row.purchasedAt)}
      </AppText>

      <View style={styles.actions}>
        <AppButton
          label={getInitiatePayoutButtonLabel(row, isInitiating)}
          variant="outline"
          disabled={!canInitiate}
          onPress={() => onInitiatePress(row)}
        />
        <AppButton
          label={isUpdatingStatus ? 'Updating...' : 'Payout status'}
          variant="ghost"
          disabled={!canUpdateStatus}
          onPress={() => onStatusPress(row)}
        />
      </View>

      {rowActionError ? (
        <View style={styles.actionError}>
          <AppText variant="bodySmall" color="textSecondary">
            {rowActionError.message}
          </AppText>
          <View style={styles.actionErrorButtons}>
            <AppButton
              label="Retry"
              variant="outline"
              onPress={() => onRetryAction(row, rowActionError.kind)}
            />
            <AppButton label="Dismiss" variant="ghost" onPress={onDismissActionError} />
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    flex: 1,
  },
  orderId: {
    color: colors.textPrimary,
  },
  amounts: {
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  amountValue: {
    color: colors.textPrimary,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  actionError: {
    gap: spacing.sm,
    marginTop: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  actionErrorButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
});
