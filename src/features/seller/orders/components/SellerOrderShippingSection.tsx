import { StyleSheet, View } from 'react-native';

import { AppButton } from '../../../../components/ui/AppButton';
import { AppCard } from '../../../../components/ui/AppCard';
import { AppText } from '../../../../components/ui/AppText';
import { colors, spacing } from '../../../../design-system';
import type { SellerOrderDetail } from '../types/sellerOrder';
import type { SellerShipmentContext } from '../types/sellerOrderShipping';
import { isSellerOrderCancelled } from '../utils/sellerOrderMappers';
import { SellerPickupSheet } from './SellerPickupSheet';
import type { useSellerOrderShipping } from '../hooks/useSellerOrderShipping';

type ShippingHookState = ReturnType<typeof useSellerOrderShipping>;

export interface SellerOrderShippingSectionProps {
  order: SellerOrderDetail;
  shipmentContext: SellerShipmentContext;
  shipping: ShippingHookState;
}

export function SellerOrderShippingSection({
  order,
  shipmentContext,
  shipping,
}: SellerOrderShippingSectionProps) {
  const actionsDisabled = isSellerOrderCancelled(order);
  const {
    isDownloadingLabel,
    isDownloadingInvoice,
    isSchedulingPickup,
    pickupSheetVisible,
    pickupForm,
    setPickupForm,
    labelError,
    pickupError,
    pickupSuccessMessage,
    openPickupSheet,
    closePickupSheet,
    downloadLabel,
    schedulePickup,
    clearLabelError,
    clearPickupError,
  } = shipping;

  return (
    <>
      <AppCard variant="flat" style={styles.block}>
        {shipmentContext.carrierName ? (
          <View style={styles.row}>
            <AppText variant="caption" color="textMuted" style={styles.label}>
              Carrier
            </AppText>
            <AppText variant="bodyMedium" style={styles.value}>
              {shipmentContext.carrierName}
            </AppText>
          </View>
        ) : null}

        {shipmentContext.trackingNumber ? (
          <View style={styles.row}>
            <AppText variant="caption" color="textMuted" style={styles.label}>
              Tracking
            </AppText>
            <AppText variant="bodyMedium" style={styles.value}>
              {shipmentContext.trackingNumber}
            </AppText>
          </View>
        ) : null}

        <View style={styles.actions}>
          <AppButton
            label={isDownloadingLabel ? 'Opening label...' : 'Download label'}
            variant="outline"
            loading={isDownloadingLabel}
            disabled={actionsDisabled || isDownloadingLabel || isDownloadingInvoice}
            onPress={() => {
              clearLabelError();
              void downloadLabel('label');
            }}
          />

          {shipmentContext.supportsExtraLabel ? (
            <AppButton
              label={isDownloadingInvoice ? 'Opening invoice...' : 'Download invoice'}
              variant="outline"
              loading={isDownloadingInvoice}
              disabled={actionsDisabled || isDownloadingLabel || isDownloadingInvoice}
              onPress={() => {
                clearLabelError();
                void downloadLabel('invoice');
              }}
            />
          ) : null}

          {shipmentContext.supportsPickup ? (
            <AppButton
              label="Schedule pickup"
              variant="outline"
              disabled={actionsDisabled || isSchedulingPickup}
              onPress={() => {
                clearPickupError();
                openPickupSheet();
              }}
            />
          ) : null}
        </View>

        {labelError ? (
          <AppText variant="caption" color="error">
            {labelError}
          </AppText>
        ) : null}

        {pickupSuccessMessage ? (
          <AppText variant="bodySmall" color="success">
            ✓ {pickupSuccessMessage}
          </AppText>
        ) : null}
      </AppCard>

      <SellerPickupSheet
        visible={pickupSheetVisible}
        values={pickupForm}
        isSubmitting={isSchedulingPickup}
        error={pickupError}
        onClose={closePickupSheet}
        onChange={setPickupForm}
        onSubmit={() => void schedulePickup()}
      />
    </>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: spacing.md,
  },
  row: {
    gap: spacing.xs,
  },
  label: {
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  value: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});
