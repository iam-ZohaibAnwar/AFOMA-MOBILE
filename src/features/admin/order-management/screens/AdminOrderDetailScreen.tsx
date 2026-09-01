import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { CartLineItem } from '../../../../services/types/cart';
import { ErrorState } from '../../../../components/ecommerce/ErrorState';
import { AppDivider } from '../../../../components/ui/AppDivider';
import { AppText } from '../../../../components/ui/AppText';
import { colors, spacing } from '../../../../design-system';
import type { AdminStackParamList } from '../../navigation/adminTypes';
import { useRequireAdmin } from '../../hooks/useRequireAdmin';
import { authReturnTo } from '../../../auth/utils/authNavigation';
import { OrderDetailCollapsibleSection } from '../../../orders/components/OrderDetailCollapsibleSection';
import {
  getOrderShippingMethodLabel,
  getOrderTrackingNumber,
} from '../../../orders/utils/orderDetailDisplay';
import { formatOrderMoney } from '../../../orders/utils/orderPricing';
import {
  calculateOrderGrandTotal,
  calculateOrderItemsSubTotal,
  calculateOrderServiceFees,
  calculateOrderShippingTotal,
} from '../../../orders/utils/orderPricing';
import { AdminOrderBuyerInfoSection } from '../components/AdminOrderBuyerInfoSection';
import { AdminOrderDetailHero } from '../components/AdminOrderDetailHero';
import { AdminOrderDetailLineRow } from '../components/AdminOrderDetailLineRow';
import { AdminOrderLineFulfillmentSection } from '../components/AdminOrderLineFulfillmentSection';
import { AdminOrderPaymentSummaryCard } from '../components/AdminOrderPaymentSummaryCard';
import { AdminOrderQuickActionsSection } from '../components/AdminOrderQuickActionsSection';
import { useAdminOrderDetail } from '../hooks/useAdminOrderDetail';
import { useAdminOrderOperations } from '../hooks/useAdminOrderOperations';
import { useAdminOrderShipping } from '../hooks/useAdminOrderShipping';
import type { AdminOrderDetail } from '../types/adminOrderManagement';
import {
  adminOrderHasShippingOperations,
  canPayAdminShipment,
  getAdminShippingSummary,
} from '../utils/adminOrderShipping';
import { getAdminOrderCarrierLabel } from '../utils/adminOrderDisplay';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminOrderDetail'>;

export function AdminOrderDetailScreen({ route, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { orderId, initialOrder } = route.params;
  const returnTo = authReturnTo.adminOrderDetail(orderId, initialOrder);
  const { isAuthorized } = useRequireAdmin(returnTo);

  const { order, isLoading, isRefreshing, error, isNotFound, refresh, syncSessionPatch, applyOrderUpdate } =
    useAdminOrderDetail(isAuthorized ? orderId : undefined, initialOrder);

  const {
    isUpdatingOrderStatus,
    updatingProductId,
    isCancellingShipment,
    operationError,
    clearOperationError,
    changeOrderStatus,
    changeLineFulfillmentStatus,
    cancelShipment,
  } = useAdminOrderOperations(orderId, applyOrderUpdate);

  const displayOrder = (order ?? initialOrder) as AdminOrderDetail | undefined;

  const {
    shipmentContext,
    isPayingShipment,
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
    openShippingDocument,
  } = useAdminOrderShipping(displayOrder ?? null, applyOrderUpdate, refresh);

  useFocusEffect(
    useCallback(() => {
      syncSessionPatch();
    }, [syncSessionPatch]),
  );

  const handleOrderStatusChange = useCallback(
    (status: string) => {
      if (!displayOrder) {
        return;
      }

      clearOperationError();
      void changeOrderStatus(displayOrder, status);
    },
    [changeOrderStatus, clearOperationError, displayOrder],
  );

  const handleLineFulfillmentChange = useCallback(
    (productId: string, shippingStatus: string) => {
      if (!displayOrder) {
        return;
      }

      clearOperationError();
      void changeLineFulfillmentStatus(displayOrder, productId, shippingStatus);
    },
    [changeLineFulfillmentStatus, clearOperationError, displayOrder],
  );

  const handleCancelShipment = useCallback(() => {
    if (!displayOrder) {
      return;
    }

    clearOperationError();
    void cancelShipment(displayOrder);
  }, [cancelShipment, clearOperationError, displayOrder]);

  const handleContactBuyer = useCallback(() => {
    navigation.getParent()?.navigate('Shopping', { screen: 'ChatList' });
  }, [navigation]);

  if (!isAuthorized) {
    return <View style={[styles.screen, { paddingTop: insets.top }]} />;
  }

  if (error && !displayOrder) {
    return (
      <View style={[styles.centeredState, { paddingBottom: insets.bottom }]}>
        <ErrorState
          message={isNotFound ? 'Order not found.' : error}
          onAction={() => void refresh()}
          style={styles.errorState}
        />
      </View>
    );
  }

  if (!displayOrder) {
    return (
      <View style={[styles.centeredState, { paddingBottom: insets.bottom }]}>
        <ActivityIndicator size="small" color={colors.primary} />
        <AppText variant="bodySmall" color="textSecondary">
          Loading order...
        </AppText>
      </View>
    );
  }

  const subtotal = calculateOrderItemsSubTotal(displayOrder);
  const serviceFees = calculateOrderServiceFees(displayOrder);
  const shipping = calculateOrderShippingTotal(displayOrder);
  const total = calculateOrderGrandTotal(displayOrder);
  const lineItems = displayOrder.cart ?? [];
  const itemCount = lineItems.reduce((sum, line) => sum + (line.orderQuantiy ?? 0), 0);
  const shippingMethod = getOrderShippingMethodLabel(displayOrder);
  const trackingNumber = getOrderTrackingNumber(displayOrder);
  const carrier = getAdminOrderCarrierLabel(displayOrder);
  const shippingSummary = getAdminShippingSummary(displayOrder);
  const hasShippingOps = adminOrderHasShippingOperations(displayOrder);
  const showShippingQuickActions =
    hasShippingOps && displayOrder.status?.trim() !== 'Cancelled';
  const canDownloadLabel =
    showConsignmentLabelAction || showFreightcomLabelAction || showGenerateLabelAction;
  const canPrintPackingSlip = showConsignmentInvoiceAction;
  const canPayShipment = canPayAdminShipment(displayOrder);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={() => void refresh()}
          tintColor={colors.primary}
        />
      }
    >
      <AdminOrderDetailHero
        order={displayOrder}
        orderId={orderId}
        isUpdatingOrderStatus={isUpdatingOrderStatus}
        isCancellingShipment={isCancellingShipment}
        onOrderStatusChange={handleOrderStatusChange}
        onCancelShipment={handleCancelShipment}
      />

      {isLoading ? (
        <View style={styles.inlineLoading}>
          <ActivityIndicator size="small" color={colors.primary} />
          <AppText variant="caption" color="textSecondary">
            Refreshing order details...
          </AppText>
        </View>
      ) : null}

      {error ? (
        <ErrorState message={error} onAction={() => void refresh()} style={styles.inlineError} />
      ) : null}

      {operationError ? (
        <ErrorState
          message={operationError}
          actionLabel="Dismiss"
          onAction={clearOperationError}
          style={styles.inlineError}
        />
      ) : null}

      {payError ? (
        <ErrorState message={payError} actionLabel="Dismiss" onAction={clearPayError} style={styles.inlineError} />
      ) : null}

      {shippingError ? (
        <ErrorState
          message={shippingError}
          actionLabel="Dismiss"
          onAction={clearShippingError}
          style={styles.inlineError}
        />
      ) : null}

      {paySuccessMessage ? (
        <View style={styles.successBanner}>
          <AppText variant="bodySmall" color="success">
            {paySuccessMessage}
          </AppText>
        </View>
      ) : null}

      <AdminOrderBuyerInfoSection order={displayOrder} onContactBuyer={handleContactBuyer} />

      {(shippingMethod || trackingNumber || (carrier && carrier !== '—')) && (
        <OrderDetailCollapsibleSection
          title="Shipping Info"
          icon="navigate-outline"
          collapsedPreview={
            trackingNumber ? (
              <AppText variant="caption" color="textSecondary" numberOfLines={1}>
                {trackingNumber}
              </AppText>
            ) : (
              <AppText variant="caption" color="textSecondary" numberOfLines={1}>
                {shippingMethod ?? carrier}
              </AppText>
            )
          }
        >
          {shippingMethod ? (
            <AppText variant="bodySmall" color="textSecondary">
              Method: {shippingMethod}
            </AppText>
          ) : null}
          {carrier && carrier !== '—' ? (
            <AppText variant="bodySmall" color="textSecondary">
              Carrier: {carrier}
            </AppText>
          ) : null}
          {trackingNumber ? (
            <AppText variant="bodySmall" color="textSecondary">
              Tracking: {trackingNumber}
            </AppText>
          ) : null}
          {shipmentContext?.trackingNumber && shipmentContext.trackingNumber !== trackingNumber ? (
            <AppText variant="bodySmall" color="textSecondary">
              Shipment tracking: {shipmentContext.trackingNumber}
            </AppText>
          ) : null}
          {shippingSummary.consignment?.shipmentId ? (
            <AppText variant="bodySmall" color="textSecondary">
              Consignment ID: {shippingSummary.consignment.shipmentId}
            </AppText>
          ) : null}
        </OrderDetailCollapsibleSection>
      )}

      <OrderDetailCollapsibleSection
        title={`Order Items (${lineItems.length})`}
        icon="cube-outline"
        collapsedPreview={
          <AppText variant="caption" color="textSecondary" numberOfLines={1}>
            {formatOrderMoney(displayOrder, subtotal)}
          </AppText>
        }
      >
        {lineItems.length ? (
          <View style={styles.productList}>
            {lineItems.map((line: CartLineItem, index: number) => (
              <View key={`${line.productData?._id ?? 'line'}-${index}`}>
                <AdminOrderDetailLineRow order={displayOrder} line={line} />
                {index < lineItems.length - 1 ? <AppDivider style={styles.itemDivider} /> : null}
              </View>
            ))}
          </View>
        ) : (
          <AppText variant="bodySmall" color="textMuted">
            No products found for this order.
          </AppText>
        )}
      </OrderDetailCollapsibleSection>

      <AdminOrderLineFulfillmentSection
        order={displayOrder}
        lines={lineItems}
        updatingProductId={updatingProductId}
        onFulfillmentStatusChange={handleLineFulfillmentChange}
      />

      <AdminOrderPaymentSummaryCard
        order={displayOrder}
        itemCount={itemCount}
        subtotal={subtotal}
        shipping={shipping}
        serviceFees={serviceFees}
        total={total}
        footer={
          showShippingQuickActions ? (
            <AdminOrderQuickActionsSection
              embedded
              canDownloadLabel={canDownloadLabel}
              canPrintPackingSlip={canPrintPackingSlip}
              canPayShipment={canPayShipment}
              isOpeningLabel={isOpeningLabel}
              isOpeningInvoice={isOpeningInvoice}
              isGeneratingLabel={isGeneratingLabel}
              isPayingShipment={isPayingShipment}
              onDownloadLabel={() => {
                clearShippingError();
                void openShippingDocument('label');
              }}
              onPrintPackingSlip={() => {
                clearShippingError();
                void openShippingDocument('invoice');
              }}
              onPayShipment={() => {
                clearPayError();
                void payShipment();
              }}
            />
          ) : null
        }
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },
  errorState: {
    alignSelf: 'stretch',
    marginHorizontal: 0,
  },
  inlineLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  inlineError: {
    alignSelf: 'stretch',
    marginHorizontal: 0,
  },
  successBanner: {
    backgroundColor: colors.successBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.successSoft,
    padding: spacing.md,
  },
  productList: {
    gap: spacing.xs,
  },
  itemDivider: {
    marginVertical: spacing.xs,
  },
});
