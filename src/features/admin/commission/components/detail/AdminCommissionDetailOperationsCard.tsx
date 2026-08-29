import { StyleSheet, View } from 'react-native';

import { AppButton } from '../../../../../components/ui/AppButton';
import { spacing } from '../../../../../design-system';
import type { AdminCommissionDisplayRow } from '../../types/adminCommission';
import { getInitiatePayoutButtonLabel } from '../../utils/adminCommissionFormatters';
import {
  canInitiateAdminCommissionPayout,
  canUpdateAdminCommissionPayoutStatus,
} from '../../utils/adminCommissionMutationGuards';

export interface AdminCommissionDetailOperationsCardProps {
  row: AdminCommissionDisplayRow;
  initiatingCommissionId: string | null;
  updatingStatusCommissionId: string | null;
  onInitiatePress: () => void;
  onStatusPress: () => void;
}

export function AdminCommissionDetailOperationsCard({
  row,
  initiatingCommissionId,
  updatingStatusCommissionId,
  onInitiatePress,
  onStatusPress,
}: AdminCommissionDetailOperationsCardProps) {
  const isInitiating = initiatingCommissionId === row.commissionId;
  const isUpdatingStatus = updatingStatusCommissionId === row.commissionId;
  const canInitiate = canInitiateAdminCommissionPayout(row, initiatingCommissionId);
  const canUpdateStatus =
    row.payoutStatus !== 'Paid' &&
    canUpdateAdminCommissionPayoutStatus(row, updatingStatusCommissionId);

  return (
    <View style={styles.actions}>
      <AppButton
        label={getInitiatePayoutButtonLabel(row, isInitiating)}
        variant="primary"
        disabled={!canInitiate}
        loading={isInitiating}
        onPress={onInitiatePress}
        fullWidth
      />
      <AppButton
        label={isUpdatingStatus ? 'Updating status…' : 'Change payout status'}
        variant="outline"
        disabled={!canUpdateStatus}
        loading={isUpdatingStatus}
        onPress={onStatusPress}
        fullWidth
      />
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: spacing.md,
    paddingTop: spacing.xs,
  },
});
