import { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { SelectField } from '../../../../components/forms';
import { AppButton } from '../../../../components/ui/AppButton';
import { AppText } from '../../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../../design-system';
import {
  formatOrderDisplayId,
  formatOrderPlacedDateTime,
} from '../../../orders/utils/orderDisplay';
import {
  getOrderStatusColor,
  getOrderStatusIconName,
  getOrderStatusLabel,
} from '../../../orders/utils/orderDetailDisplay';
import type { AdminOrderDetail } from '../types/adminOrderManagement';
import { formatAdminOrderStatus } from '../utils/adminOrderDisplay';
import {
  buildAdminOrderStatusOptions,
  canCancelAdminOrderShipment,
  canChangeAdminOrderStatus,
  isDestructiveAdminOrderStatus,
} from '../utils/adminOrderOperations';

interface AdminOrderDetailHeroProps {
  order: AdminOrderDetail;
  orderId: string;
  isUpdatingOrderStatus: boolean;
  isCancellingShipment: boolean;
  onOrderStatusChange: (status: string) => void;
  onCancelShipment: () => void;
}

export function AdminOrderDetailHero({
  order,
  orderId,
  isUpdatingOrderStatus,
  isCancellingShipment,
  onOrderStatusChange,
  onCancelShipment,
}: AdminOrderDetailHeroProps) {
  const currentStatus = order.status?.trim() ?? '';
  const [draftStatus, setDraftStatus] = useState(currentStatus);
  const statusOptions = buildAdminOrderStatusOptions(currentStatus);
  const canEditStatus = canChangeAdminOrderStatus(order);
  const canCancelShipment = canCancelAdminOrderShipment(order.status);
  const hasChanges = draftStatus !== currentStatus;
  const statusLabel = getOrderStatusLabel(order.status) || formatAdminOrderStatus(order.status);
  const statusColor = getOrderStatusColor(order.status);
  const statusIcon = getOrderStatusIconName(order.status);

  useEffect(() => {
    setDraftStatus(currentStatus);
  }, [currentStatus]);

  const handleSave = () => {
    if (!hasChanges || !draftStatus) {
      return;
    }

    const applyStatus = () => {
      onOrderStatusChange(draftStatus);
    };

    if (isDestructiveAdminOrderStatus(draftStatus)) {
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
        { text: 'Cancel shipment', style: 'destructive', onPress: onCancelShipment },
      ],
    );
  };

  return (
    <View style={styles.card}>
      <AppText variant="h3" style={styles.orderNumber}>
        Order #{formatOrderDisplayId(order._id ?? orderId)}
      </AppText>

      <View style={styles.statusRow}>
        <Ionicons name={statusIcon} size={14} color={statusColor} />
        <AppText variant="caption" style={[styles.statusText, { color: statusColor }]}>
          {statusLabel}
        </AppText>
      </View>

      <AppText variant="h2" style={styles.title}>
        Order Details
      </AppText>
      <AppText variant="bodySmall" color="textSecondary">
        Placed on {formatOrderPlacedDateTime(order.createdAt)}
      </AppText>

      <View style={styles.editorBlock}>
        <SelectField
          label="Order status"
          value={draftStatus}
          options={statusOptions}
          onChange={setDraftStatus}
          disabled={!canEditStatus || isUpdatingOrderStatus}
          modalTitle="Change order status"
        />
        {!canEditStatus ? (
          <AppText variant="caption" color="textMuted">
            Order status cannot be changed after cancellation.
          </AppText>
        ) : null}
      </View>

      <AppButton
        label={isUpdatingOrderStatus ? 'Saving...' : 'Save Changes'}
        onPress={handleSave}
        loading={isUpdatingOrderStatus}
        disabled={!canEditStatus || !hasChanges || isUpdatingOrderStatus || isCancellingShipment}
        fullWidth
      />

      <AppButton
        label={isCancellingShipment ? 'Cancelling shipment...' : 'Cancel Shipment'}
        variant="outline"
        onPress={handleCancelShipmentPress}
        loading={isCancellingShipment}
        disabled={!canCancelShipment || isUpdatingOrderStatus || isCancellingShipment}
        fullWidth
        style={styles.cancelButton}
        labelStyle={canCancelShipment ? styles.cancelButtonLabel : undefined}
      />
      {!canCancelShipment ? (
        <AppText variant="caption" color="textMuted">
          Shipment cancellation is unavailable for Shipped or Cancelled orders.
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.large,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  orderNumber: {
    color: colors.textPrimary,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statusText: {
    fontWeight: '700',
  },
  title: {
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  editorBlock: {
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  cancelButton: {
    marginTop: spacing.xs,
  },
  cancelButtonLabel: {
    color: colors.error,
  },
});
