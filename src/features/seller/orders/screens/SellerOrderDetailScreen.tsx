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
import type { SellerStackParamList } from '../../../../app/navigation/sellerTypes';
import { authReturnTo } from '../../../auth/utils/authNavigation';
import { OrderDetailCollapsibleSection } from '../../../orders/components/OrderDetailCollapsibleSection';
import {
  getOrderShippingMethodLabel,
  getOrderTrackingNumber,
} from '../../../orders/utils/orderDetailDisplay';
import { formatOrderMoney } from '../../../orders/utils/orderPricing';
import { useRequireSeller } from '../../hooks/useRequireSeller';
import { SellerOrderBuyerInfoSection } from '../components/SellerOrderBuyerInfoSection';
import { SellerOrderDetailHero } from '../components/SellerOrderDetailHero';
import { SellerOrderDetailLineRow } from '../components/SellerOrderDetailLineRow';
import { SellerOrderLineFulfillmentSection } from '../components/SellerOrderLineFulfillmentSection';
import { SellerOrderPaymentSummaryCard } from '../components/SellerOrderPaymentSummaryCard';
import { SellerOrderQuickActionsSection } from '../components/SellerOrderQuickActionsSection';
import { SellerPickupSheet } from '../components/SellerPickupSheet';
import { useSellerOrderDetail } from '../hooks/useSellerOrderDetail';
import { useSellerOrderOperations } from '../hooks/useSellerOrderOperations';
import { useSellerOrderShipping } from '../hooks/useSellerOrderShipping';
import type { SellerLineFulfillmentStatus, SellerOrderDetail } from '../types/sellerOrder';
import { getSellerOrderCarrierLabel, getSellerOrderLineItems } from '../utils/sellerOrderMappers';
import {
  calculateSellerOrderGrandTotal,
  calculateSellerOrderItemsSubTotal,
  calculateSellerOrderShippingTotal,
} from '../utils/sellerOrderPricing';
import { sellerOrderHasShippingOperations } from '../utils/sellerOrderShippingActions';

type Props = NativeStackScreenProps<SellerStackParamList, 'SellerOrderDetail'>;

export function SellerOrderDetailScreen({ route, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { orderId, initialOrder } = route.params;
  const returnTo = authReturnTo.sellerOrders();
  const { isAuthorized, sellerId } = useRequireSeller(returnTo);

  const { order, isLoading, isRefreshing, error, isNotFound, refresh, syncSessionPatch, applyOrderUpdate } =
    useSellerOrderDetail(isAuthorized ? sellerId : undefined, orderId, initialOrder);

  const displayOrder = (order ?? initialOrder) as SellerOrderDetail | undefined;

  const {
    updatingProductId,
    operationError,
    clearOperationError,
    changeLineFulfillmentStatus,
  } = useSellerOrderOperations(orderId, applyOrderUpdate, refresh);

  const shipping = useSellerOrderShipping(displayOrder ?? null, refresh);

  useFocusEffect(
    useCallback(() => {
      syncSessionPatch();
    }, [syncSessionPatch]),
  );

  const handleLineFulfillmentChange = useCallback(
    (productId: string, status: string) => {
      if (!displayOrder) {
        return;
      }

      clearOperationError();
      void changeLineFulfillmentStatus(
        displayOrder,
        productId,
        status as SellerLineFulfillmentStatus,
      );
    },
    [changeLineFulfillmentStatus, clearOperationError, displayOrder],
  );

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

  const lineItems = getSellerOrderLineItems(displayOrder);
  const itemCount = lineItems.reduce((sum, line) => sum + (line.orderQuantiy ?? 0), 0);
  const subtotal = calculateSellerOrderItemsSubTotal(displayOrder);
  const shippingTotal = calculateSellerOrderShippingTotal(displayOrder);
  const total = calculateSellerOrderGrandTotal(displayOrder);
  const shippingMethod = getOrderShippingMethodLabel(displayOrder);
  const trackingNumber = getOrderTrackingNumber(displayOrder);
  const carrier = getSellerOrderCarrierLabel(displayOrder);
  const hasShippingOps = sellerOrderHasShippingOperations(displayOrder);

  return (
    <>
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
        <SellerOrderDetailHero order={displayOrder} orderId={orderId} />

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

        {shipping.shippingError ? (
          <ErrorState
            message={shipping.shippingError}
            actionLabel="Dismiss"
            onAction={shipping.clearShippingError}
            style={styles.inlineError}
          />
        ) : null}

        {shipping.pickupSuccessMessage ? (
          <View style={styles.successBanner}>
            <AppText variant="bodySmall" color="success">
              {shipping.pickupSuccessMessage}
            </AppText>
          </View>
        ) : null}

        <SellerOrderBuyerInfoSection order={displayOrder} onContactBuyer={handleContactBuyer} />

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
            {shipping.shipmentContext?.trackingNumber &&
            shipping.shipmentContext.trackingNumber !== trackingNumber ? (
              <AppText variant="bodySmall" color="textSecondary">
                Shipment tracking: {shipping.shipmentContext.trackingNumber}
              </AppText>
            ) : null}
            {shipping.shipmentContext?.shipmentId ? (
              <AppText variant="bodySmall" color="textSecondary">
                Shipment ID: {shipping.shipmentContext.shipmentId}
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
                  <SellerOrderDetailLineRow order={displayOrder} line={line} />
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

        <SellerOrderLineFulfillmentSection
          order={displayOrder}
          lines={lineItems}
          updatingProductId={updatingProductId}
          onFulfillmentStatusChange={handleLineFulfillmentChange}
        />

        <SellerOrderPaymentSummaryCard
          order={displayOrder}
          itemCount={itemCount}
          subtotal={subtotal}
          shipping={shippingTotal}
          total={total}
          footer={
            hasShippingOps ? (
              <SellerOrderQuickActionsSection
                embedded
                shippingDisabled={displayOrder.status === 'Cancelled'}
                canDownloadLabel={shipping.canDownloadLabel}
                canPrintPackingSlip={shipping.canPrintPackingSlip}
                canSchedulePickup={shipping.canSchedulePickup}
                isOpeningLabel={shipping.isOpeningLabel}
                isOpeningInvoice={shipping.isOpeningInvoice}
                isGeneratingLabel={shipping.isGeneratingLabel}
                onDownloadLabel={() => {
                  shipping.clearShippingError();
                  void shipping.openShippingDocument('label');
                }}
                onPrintPackingSlip={() => {
                  shipping.clearShippingError();
                  void shipping.openShippingDocument('invoice');
                }}
                onSchedulePickup={() => {
                  shipping.clearPickupError();
                  shipping.openPickupSheet();
                }}
              />
            ) : null
          }
        />
      </ScrollView>

      <SellerPickupSheet
        visible={shipping.pickupSheetVisible}
        values={shipping.pickupForm}
        isSubmitting={shipping.isSchedulingPickup}
        error={shipping.pickupError}
        onClose={shipping.closePickupSheet}
        onChange={shipping.setPickupForm}
        onSubmit={() => void shipping.schedulePickup()}
      />
    </>
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
