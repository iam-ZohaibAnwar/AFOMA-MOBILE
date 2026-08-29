import { StyleSheet, View } from 'react-native';

import { AppButton } from '../../../../../components/ui/AppButton';
import { AppText } from '../../../../../components/ui/AppText';
import { spacing } from '../../../../../design-system';
import { AdminProductDetailCardShell } from '../../../product-management/components/detail/AdminProductDetailCardShell';
import type { AdminCommissionDisplayRow } from '../../types/adminCommission';
import {
  canInitiateAdminCommissionPayout,
  canUpdateAdminCommissionPayoutStatus,
} from '../../utils/adminCommissionMutationGuards';
import { getInitiatePayoutButtonLabel } from '../../utils/adminCommissionFormatters';

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
    <AdminProductDetailCardShell title="Payout Actions" icon="send-outline" iconVariant="solid" accent>
      <View style={styles.body}>
        <AppText variant="bodySmall" color="textSecondary">
          Initiate a Korapay payout link email or manually update payout status.
        </AppText>

        <AppButton
          label={getInitiatePayoutButtonLabel(row, isInitiating)}
          variant="outline"
          disabled={!canInitiate}
          loading={isInitiating}
          onPress={onInitiatePress}
        />

        <AppButton
          label={isUpdatingStatus ? 'Updating status...' : 'Change payout status'}
          variant="secondary"
          disabled={!canUpdateStatus}
          loading={isUpdatingStatus}
          onPress={onStatusPress}
        />
      </View>
    </AdminProductDetailCardShell>
  );
}

const styles = StyleSheet.create({
  body: {
    gap: spacing.md,
  },
});
