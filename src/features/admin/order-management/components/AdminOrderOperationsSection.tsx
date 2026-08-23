import { Alert, StyleSheet, View } from 'react-native';

import { SelectField } from '../../../../components/forms';
import { AppButton } from '../../../../components/ui/AppButton';
import { AppCard } from '../../../../components/ui/AppCard';
import { AppText } from '../../../../components/ui/AppText';
import { spacing } from '../../../../design-system';
import type { AdminOrderDetail } from '../types/adminOrderManagement';
import type { AdminOrderStatusMutationValue } from '../types/adminOrderOperations';
import {
  buildAdminOrderStatusOptions,
  canCancelAdminOrderShipment,
  canChangeAdminOrderStatus,
  isDestructiveAdminOrderStatus,
} from '../utils/adminOrderOperations';

export interface AdminOrderOperationsSectionProps {
  order: AdminOrderDetail;
  isUpdatingOrderStatus: boolean;
  isCancellingShipment: boolean;
  onOrderStatusChange: (status: AdminOrderStatusMutationValue | string) => void;
  onCancelShipment: () => void;
}

export function AdminOrderOperationsSection({
  order,
  isUpdatingOrderStatus,
  isCancellingShipment,
  onOrderStatusChange,
  onCancelShipment,
}: AdminOrderOperationsSectionProps) {
  const currentStatus = order.status?.trim() ?? '';
  const statusOptions = buildAdminOrderStatusOptions(currentStatus);
  const canEditStatus = canChangeAdminOrderStatus(order);
  const canCancel = canCancelAdminOrderShipment(order.status);

  const handleStatusChange = (nextStatus: string) => {
    if (nextStatus === currentStatus) {
      return;
    }

    const applyStatus = () => {
      onOrderStatusChange(nextStatus);
    };

    if (isDestructiveAdminOrderStatus(nextStatus)) {
      Alert.alert(
        'Cancel this order?',
        'This will set the order status to Cancelled.',
        [
          { text: 'Keep order', style: 'cancel' },
          { text: 'Cancel order', style: 'destructive', onPress: applyStatus },
        ],
      );
      return;
    }

    applyStatus();
  };

  const handleCancelShipmentPress = () => {
    Alert.alert(
      'Cancel shipment?',
      'This will cancel the shipment for this order. This action cannot be undone.',
      [
        { text: 'Keep shipment', style: 'cancel' },
        {
          text: 'Cancel shipment',
          style: 'destructive',
          onPress: onCancelShipment,
        },
      ],
    );
  };

  return (
    <AppCard>
      <AppText variant="label" style={styles.title}>
        Operations
      </AppText>
      <AppText variant="caption" color="textMuted" style={styles.note}>
        Status values follow the web admin mutation contract. Confirm staging enums before Phase 4 shipping ops.
      </AppText>

      <View style={styles.block}>
        <SelectField
          label="Order status"
          value={currentStatus}
          options={statusOptions}
          onChange={handleStatusChange}
          disabled={!canEditStatus || isUpdatingOrderStatus || isCancellingShipment}
          modalTitle="Change order status"
        />
        {!canEditStatus ? (
          <AppText variant="caption" color="textMuted">
            Order status cannot be changed after cancellation.
          </AppText>
        ) : null}
      </View>

      <AppButton
        label={isCancellingShipment ? 'Cancelling shipment...' : 'Cancel shipment'}
        variant="outline"
        loading={isCancellingShipment}
        disabled={!canCancel || isUpdatingOrderStatus || isCancellingShipment}
        onPress={handleCancelShipmentPress}
      />

      {!canCancel ? (
        <AppText variant="caption" color="textMuted">
          Shipment cancellation is unavailable for Shipped or Cancelled orders.
        </AppText>
      ) : null}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  title: {
    marginBottom: spacing.xs,
  },
  note: {
    marginBottom: spacing.md,
  },
  block: {
    marginBottom: spacing.md,
  },
});
