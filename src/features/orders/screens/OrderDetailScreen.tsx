import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';

import { ErrorState } from '../../../components/ecommerce/ErrorState';
import { AppDivider } from '../../../components/ui/AppDivider';
import { AppText } from '../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../design-system';
import type { ShoppingStackParamList } from '../../../app/navigation/types';
import {
  marketplaceScrollProps,
  useMarketplaceScrollHandler,
} from '../../../app/navigation/marketplaceChrome';
import { AdminOrderBuyerInfoSection } from '../../admin/order-management/components/AdminOrderBuyerInfoSection';
import { AdminOrderPaymentSummaryCard } from '../../admin/order-management/components/AdminOrderPaymentSummaryCard';
import type { AdminOrderDetail } from '../../admin/order-management/types/adminOrderManagement';
import { useRequireAuth } from '../../auth/hooks/useRequireAuth';
import { authReturnTo } from '../../auth/utils/authNavigation';
import { CustomerOrderActionsSection } from '../components/CustomerOrderActionsSection';
import { CustomerOrderDetailHero } from '../components/CustomerOrderDetailHero';
import { CustomerOrderDetailLineRow } from '../components/CustomerOrderDetailLineRow';
import { OrderDetailInfoRow } from '../components/OrderDetailInfoRow';
import { OrderDetailSection } from '../components/OrderDetailSection';
import { useCancelOrder } from '../hooks/useCancelOrder';
import { useOrderDetail } from '../hooks/useOrderDetail';
import {
  canCancelCustomerOrder,
  getCustomerOrderCancelDisabledReason,
} from '../utils/orderDisplay';
import {
  getOrderShippingMethodLabel,
  getOrderTrackingNumber,
} from '../utils/orderDetailDisplay';
import {
  calculateOrderGrandTotal,
  calculateOrderItemsSubTotal,
  calculateOrderServiceFees,
  calculateOrderShippingTotal,
} from '../utils/orderPricing';
import type { CartLineItem } from '../../../services/types/cart';

type Props = NativeStackScreenProps<ShoppingStackParamList, 'OrderDetail'>;

export function OrderDetailScreen({ route, navigation }: Props) {
  const { orderId, initialOrder } = route.params;
  const insets = useSafeAreaInsets();
  const onMarketplaceScroll = useMarketplaceScrollHandler();
  const returnTo = useMemo(
    () => authReturnTo.orderDetail(orderId, initialOrder),
    [initialOrder, orderId],
  );
  const { isAuthorized } = useRequireAuth(returnTo);
  const {
    order,
    isLoading,
    isRefreshing,
    error,
    isNotFound,
    refresh,
    syncSessionPatch,
    applyOrderUpdate,
  } = useOrderDetail(isAuthorized ? orderId : '', initialOrder);
  const [cancelSuccessMessage, setCancelSuccessMessage] = useState<string | null>(null);

  const handleCancelSuccess = useCallback(() => {
    setCancelSuccessMessage('Order cancelled successfully.');
    applyOrderUpdate({
      ...(order ?? initialOrder ?? {}),
      _id: orderId,
      status: 'Cancelled',
    });
    void refresh();
  }, [applyOrderUpdate, initialOrder, order, orderId, refresh]);

  const { cancelOrder, isCancelling, cancelError, clearCancelError } = useCancelOrder(
    orderId,
    handleCancelSuccess,
  );

  useFocusEffect(
    useCallback(() => {
      syncSessionPatch();
    }, [syncSessionPatch]),
  );

  const displayOrder = (order ?? initialOrder) as AdminOrderDetail | undefined;

  const handleCancelPress = useCallback(() => {
    if (!displayOrder || !canCancelCustomerOrder(displayOrder) || isCancelling) {
      return;
    }

    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'Keep Order', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            clearCancelError();
            void cancelOrder();
          },
        },
      ],
    );
  }, [cancelOrder, clearCancelError, displayOrder, isCancelling]);

  const handleCopyTracking = useCallback(async (trackingNumber: string) => {
    await Clipboard.setStringAsync(trackingNumber);
    Alert.alert('Copied', 'Tracking number copied to clipboard.');
  }, []);

  const handleContactSeller = useCallback(() => {
    navigation.navigate('ChatList');
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
  const cancellable = canCancelCustomerOrder(displayOrder);
  const cancelDisabledReason = getCustomerOrderCancelDisabledReason(displayOrder);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
      showsVerticalScrollIndicator={false}
      onScroll={onMarketplaceScroll}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={() => void refresh()}
          tintColor={colors.primary}
        />
      }
      {...marketplaceScrollProps}
    >
      <CustomerOrderDetailHero order={displayOrder} orderId={orderId} />

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

      {cancelSuccessMessage ? (
        <View style={styles.successBanner}>
          <AppText variant="bodySmall" color="success">
            {cancelSuccessMessage}
          </AppText>
        </View>
      ) : null}

      {cancelError ? (
        <ErrorState
          message={cancelError}
          actionLabel="Dismiss"
          onAction={clearCancelError}
          style={styles.inlineError}
        />
      ) : null}

      <AdminOrderBuyerInfoSection order={displayOrder} />

      {(shippingMethod || trackingNumber) && (
        <OrderDetailSection title="Shipping Info" icon="navigate-outline">
          {shippingMethod ? (
            <AppText variant="bodySmall" color="textSecondary">
              Method: {shippingMethod}
            </AppText>
          ) : null}
          {trackingNumber ? (
            <OrderDetailInfoRow
              label="Tracking Number"
              value={trackingNumber}
              valueColor={colors.primary}
              onCopy={() => void handleCopyTracking(trackingNumber)}
            />
          ) : null}
        </OrderDetailSection>
      )}

      <OrderDetailSection title={`Order Items (${lineItems.length})`} icon="cube-outline">
        {lineItems.length ? (
          <View style={styles.productList}>
            {lineItems.map((line: CartLineItem, index: number) => (
              <View key={`${line.productData?._id ?? 'line'}-${index}`}>
                <CustomerOrderDetailLineRow order={displayOrder} line={line} />
                {index < lineItems.length - 1 ? <AppDivider style={styles.itemDivider} /> : null}
              </View>
            ))}
          </View>
        ) : (
          <AppText variant="bodySmall" color="textMuted">
            No products found for this order.
          </AppText>
        )}
      </OrderDetailSection>

      <AdminOrderPaymentSummaryCard
        order={displayOrder}
        itemCount={itemCount}
        subtotal={subtotal}
        shipping={shipping}
        serviceFees={serviceFees}
        total={total}
      />

      <CustomerOrderActionsSection
        canCancel={cancellable}
        cancelDisabledReason={cancelDisabledReason ?? undefined}
        isCancelling={isCancelling}
        onContactSeller={handleContactSeller}
        onCancelOrder={handleCancelPress}
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
    gap: spacing.lg,
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
    borderRadius: radius.medium,
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
