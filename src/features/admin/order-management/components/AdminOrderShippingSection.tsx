import { StyleSheet, View } from 'react-native';

import { AppButton } from '../../../../components/ui/AppButton';
import { AppCard } from '../../../../components/ui/AppCard';
import { AppText } from '../../../../components/ui/AppText';
import { colors, spacing } from '../../../../design-system';
import type { AdminOrderDetail } from '../types/adminOrderManagement';
import { useAdminOrderShipping } from '../hooks/useAdminOrderShipping';
import { formatAdminShipmentPaymentStatus } from '../utils/adminOrderDetailDisplay';
import {
  adminOrderHasShippingOperations,
  getAdminShippingSummary,
  hasAdminFreightcomLabel,
} from '../utils/adminOrderShipping';

export interface AdminOrderShippingSectionProps {
  order: AdminOrderDetail;
  onOrderUpdated: (order: AdminOrderDetail) => void;
  onRefresh: () => Promise<void>;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <AppText variant="caption" color="textMuted" style={styles.label}>
        {label}
      </AppText>
      <AppText variant="bodySmall" style={styles.value}>
        {value}
      </AppText>
    </View>
  );
}

export function AdminOrderShippingSection({
  order,
  onOrderUpdated,
  onRefresh,
}: AdminOrderShippingSectionProps) {
  const summary = getAdminShippingSummary(order);
  const shippingDisabled = order.status === 'Cancelled';

  const {
    shipmentContext,
    shipmentDetails,
    isPayingShipment,
    isLoadingDetails,
    isOpeningLabel,
    isOpeningInvoice,
    isGeneratingLabel,
    payError,
    shippingError,
    paySuccessMessage,
    showFreightcomLabelAction,
    showConsignmentLabelAction,
    showConsignmentInvoiceAction,
    showGenerateLabelAction,
    clearPayError,
    clearShippingError,
    payShipment,
    loadShipmentDetails,
    openShippingDocument,
  } = useAdminOrderShipping(order, onOrderUpdated, onRefresh);

  if (!adminOrderHasShippingOperations(order) || !shipmentContext) {
    return (
      <AppCard>
        <AppText variant="label" style={styles.sectionTitle}>
          Shipping operations
        </AppText>
        <AppText variant="bodySmall" color="textMuted">
          No consignment or shipment data on this order.
        </AppText>
      </AppCard>
    );
  }

  const shipmentPayment = formatAdminShipmentPaymentStatus(summary.consignment?.paymentPaid);
  const freightcomLabelReady = hasAdminFreightcomLabel(shipmentDetails);

  return (
    <AppCard>
      <AppText variant="label" style={styles.sectionTitle}>
        Shipping operations
      </AppText>
      <AppText variant="caption" color="textMuted" style={styles.note}>
        Shipment payment, details, and labels are separate from order-status operations.
      </AppText>

      {shipmentContext.carrierName ? (
        <DetailRow label="Carrier" value={shipmentContext.carrierName} />
      ) : null}
      {shipmentContext.trackingNumber ? (
        <DetailRow label="Tracking" value={shipmentContext.trackingNumber} />
      ) : null}
      {shipmentContext.shipmentId ? (
        <DetailRow label="Shipment ID" value={shipmentContext.shipmentId} />
      ) : null}
      {summary.consignment?.shipmentId ? (
        <DetailRow label="Consignment shipment ID" value={summary.consignment.shipmentId} />
      ) : null}
      {shipmentPayment ? <DetailRow label="Shipment payment" value={shipmentPayment} /> : null}

      {summary.canPay ? (
        <AppButton
          label={isPayingShipment ? 'Paying shipment...' : 'Pay shipment'}
          onPress={() => {
            clearPayError();
            void payShipment();
          }}
          loading={isPayingShipment}
          disabled={shippingDisabled || isPayingShipment}
          style={styles.actionButton}
        />
      ) : null}

      {paySuccessMessage ? (
        <AppText variant="bodySmall" color="success">
          {paySuccessMessage}
        </AppText>
      ) : null}

      {payError ? (
        <AppText variant="caption" color="error">
          {payError}
        </AppText>
      ) : null}

      {shipmentContext.kind === 'freightcom' ? (
        <View style={styles.actionsBlock}>
          <AppText variant="caption" color="textMuted" style={styles.blockLabel}>
            Shipping details
          </AppText>
          <AppButton
            label={isLoadingDetails ? 'Loading details...' : 'Load shipping details'}
            variant="outline"
            loading={isLoadingDetails}
            disabled={shippingDisabled || isLoadingDetails}
            onPress={() => {
              clearShippingError();
              void loadShipmentDetails();
            }}
          />
          {freightcomLabelReady ? (
            <AppText variant="caption" color="textSecondary">
              Label available from shipment details.
            </AppText>
          ) : shipmentDetails ? (
            <AppText variant="caption" color="textMuted">
              Details loaded. Label not available yet.
            </AppText>
          ) : null}
        </View>
      ) : null}

      <View style={styles.actionsBlock}>
        <AppText variant="caption" color="textMuted" style={styles.blockLabel}>
          Labels & documents
        </AppText>

        {showConsignmentLabelAction ? (
          <AppButton
            label={isOpeningLabel ? 'Opening label...' : 'Open shipping label'}
            variant="outline"
            loading={isOpeningLabel}
            disabled={shippingDisabled || isOpeningLabel || isOpeningInvoice || isGeneratingLabel}
            onPress={() => {
              clearShippingError();
              void openShippingDocument('label');
            }}
          />
        ) : null}

        {showConsignmentInvoiceAction ? (
          <AppButton
            label={isOpeningInvoice ? 'Opening invoice...' : 'Open invoice'}
            variant="outline"
            loading={isOpeningInvoice}
            disabled={shippingDisabled || isOpeningLabel || isOpeningInvoice || isGeneratingLabel}
            onPress={() => {
              clearShippingError();
              void openShippingDocument('invoice');
            }}
          />
        ) : null}

        {showFreightcomLabelAction ? (
          <AppButton
            label={isOpeningLabel ? 'Opening label...' : 'Open shipping label'}
            variant="outline"
            loading={isOpeningLabel}
            disabled={shippingDisabled || isOpeningLabel || isOpeningInvoice || isGeneratingLabel}
            onPress={() => {
              clearShippingError();
              void openShippingDocument('label');
            }}
          />
        ) : null}

        {showGenerateLabelAction ? (
          <AppButton
            label={isGeneratingLabel ? 'Generating label...' : 'Generate shipping label'}
            variant="outline"
            loading={isGeneratingLabel}
            disabled={shippingDisabled || isOpeningLabel || isOpeningInvoice || isGeneratingLabel}
            onPress={() => {
              clearShippingError();
              void openShippingDocument('label');
            }}
          />
        ) : null}

        {!showConsignmentLabelAction &&
        !showConsignmentInvoiceAction &&
        !showFreightcomLabelAction &&
        !showGenerateLabelAction ? (
          <AppText variant="bodySmall" color="textMuted">
            No label or document actions are available for this shipment type yet.
          </AppText>
        ) : null}
      </View>

      {shippingError ? (
        <AppText variant="caption" color="error">
          {shippingError}
        </AppText>
      ) : null}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    marginBottom: spacing.xs,
  },
  note: {
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  label: {
    flex: 1,
  },
  value: {
    flex: 1.2,
    textAlign: 'right',
    color: colors.textPrimary,
  },
  actionButton: {
    marginTop: spacing.md,
  },
  actionsBlock: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  blockLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
});
