import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

import { ErrorState } from '../../../components/ecommerce/ErrorState';
import { AppButton } from '../../../components/ui/AppButton';
import { AppDivider } from '../../../components/ui/AppDivider';
import { AppText } from '../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../design-system';
import type { ShoppingStackParamList } from '../../../app/navigation/types';
import {
  marketplaceScrollProps,
  useMarketplaceScrollHandler,
} from '../../../app/navigation/marketplaceChrome';
import { useRequireAuth } from '../../auth/hooks/useRequireAuth';
import { authReturnTo } from '../../auth/utils/authNavigation';
import { OrderDetailInfoRow } from '../components/OrderDetailInfoRow';
import { OrderDetailSection } from '../components/OrderDetailSection';
import { OrderLineItemRow } from '../components/OrderLineItemRow';
import { useCancelOrder } from '../hooks/useCancelOrder';
import { useOrderDetail } from '../hooks/useOrderDetail';
import {
  canCancelCustomerOrder,
  formatOrderDateShort,
  formatOrderDisplayId,
  formatShippingAddressLines,
  getCustomerOrderCancelDisabledReason,
} from '../utils/orderDisplay';
import {
  getOrderPaymentMethodLabel,
  getOrderShippingMethodLabel,
  getOrderStatusColor,
  getOrderStatusIconName,
  getOrderStatusLabel,
  getOrderTrackingNumber,
} from '../utils/orderDetailDisplay';
import {
  calculateOrderGrandTotal,
  calculateOrderItemsSubTotal,
  calculateOrderServiceFees,
  calculateOrderShippingTotal,
  formatOrderMoney,
} from '../utils/orderPricing';

type Props = NativeStackScreenProps<ShoppingStackParamList, 'OrderDetail'>;

function SummaryRow({
  label,
  value,
  emphasized = false,
}: {
  label: string;
  value: string;
  emphasized?: boolean;
}) {
  return (
    <View style={styles.summaryRow}>
      <AppText
        variant={emphasized ? 'bodyMedium' : 'bodySmall'}
        color={emphasized ? 'textPrimary' : 'textSecondary'}
        style={emphasized ? styles.summaryLabelEmphasis : undefined}
      >
        {label}
      </AppText>
      <AppText
        variant={emphasized ? 'h3' : 'bodySmall'}
        style={emphasized ? styles.summaryTotal : styles.summaryValue}
      >
        {value}
      </AppText>
    </View>
  );
}

export function OrderDetailScreen({ route, navigation }: Props) {
  const { orderId } = route.params;
  const insets = useSafeAreaInsets();
  const onMarketplaceScroll = useMarketplaceScrollHandler();
  const returnTo = useMemo(() => authReturnTo.orderDetail(orderId), [orderId]);
  const { isAuthorized } = useRequireAuth(returnTo);
  const { order, isLoading, error, isNotFound, retry } = useOrderDetail(orderId);
  const [cancelSuccessMessage, setCancelSuccessMessage] = useState<string | null>(null);

  const { cancelOrder, isCancelling, cancelError, clearCancelError } = useCancelOrder(orderId, () => {
    setCancelSuccessMessage('Order cancelled successfully.');
    void retry();
  });

  const handleCancelPress = () => {
    if (!order || !canCancelCustomerOrder(order) || isCancelling) {
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
  };

  const handleCopyTracking = async (trackingNumber: string) => {
    await Clipboard.setStringAsync(trackingNumber);
    Alert.alert('Copied', 'Tracking number copied to clipboard.');
  };

  if (!isAuthorized) {
    return (
      <View style={[styles.centeredState, { paddingBottom: insets.bottom }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={[styles.centeredState, { paddingBottom: insets.bottom }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <AppText variant="bodySmall" color="textMuted">
          Loading order...
        </AppText>
      </View>
    );
  }

  if (error || !order) {
    return (
      <View style={[styles.centeredState, { paddingBottom: insets.bottom }]}>
        <ErrorState
          message={isNotFound ? 'Order not found.' : (error ?? 'Failed to load order.')}
          onAction={() => void retry()}
          style={styles.errorState}
        />
      </View>
    );
  }

  const subtotal = calculateOrderItemsSubTotal(order);
  const serviceFees = calculateOrderServiceFees(order);
  const shipping = calculateOrderShippingTotal(order);
  const total = calculateOrderGrandTotal(order);
  const shippingLines = formatShippingAddressLines(order.userInfo);
  const shippingMethod = getOrderShippingMethodLabel(order);
  const trackingNumber = getOrderTrackingNumber(order);
  const paymentMethod = getOrderPaymentMethodLabel(order);
  const statusLabel = getOrderStatusLabel(order.status);
  const statusColor = getOrderStatusColor(order.status);
  const statusIcon = getOrderStatusIconName(order.status);
  const handleDownloadInvoicePress = () => {
    Alert.alert(
      'Download Invoice',
      'Invoice download is not available yet. You can view your order summary on this screen.',
    );
  };

  const cancellable = canCancelCustomerOrder(order);
  const cancelDisabledReason = getCustomerOrderCancelDisabledReason(order);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + spacing['3xl'] },
      ]}
      showsVerticalScrollIndicator={false}
      onScroll={onMarketplaceScroll}
      {...marketplaceScrollProps}
    >
      <View style={styles.hero}>
        <AppText variant="h3" style={styles.heroTitle}>
          Order #{formatOrderDisplayId(order._id ?? orderId)}
        </AppText>
        <AppText variant="bodySmall" color="textSecondary">
          Placed on {formatOrderDateShort(order.createdAt)}
        </AppText>
        <View style={styles.statusRow}>
          <Ionicons name={statusIcon} size={16} color={statusColor} />
          <AppText variant="bodyMedium" style={[styles.statusLabel, { color: statusColor }]}>
            {statusLabel}
          </AppText>
        </View>
      </View>

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

      <OrderDetailSection title="Order Information" icon="information-circle-outline">
        <View style={styles.infoRows}>
          {shippingMethod ? (
            <OrderDetailInfoRow label="Shipping Method" value={shippingMethod} />
          ) : null}
          <OrderDetailInfoRow label="Order Status" value={statusLabel} valueColor={statusColor} />
          {trackingNumber ? (
            <OrderDetailInfoRow
              label="Tracking Number"
              value={trackingNumber}
              valueColor={colors.primary}
              onCopy={() => void handleCopyTracking(trackingNumber)}
            />
          ) : null}
        </View>
      </OrderDetailSection>

      <OrderDetailSection title="Items in Order" icon="cube-outline">
        {order.cart?.length ? (
          <View style={styles.productList}>
            {order.cart.map((line, index) => (
              <View key={`${line.productData?._id ?? 'line'}-${index}`}>
                <OrderLineItemRow line={line} order={order} />
                {index < order.cart!.length - 1 ? <AppDivider style={styles.itemDivider} /> : null}
              </View>
            ))}
          </View>
        ) : (
          <AppText variant="bodySmall" color="textMuted">
            No products found for this order.
          </AppText>
        )}
      </OrderDetailSection>

      <OrderDetailSection title="Shipping Address" icon="location-outline">
        {shippingLines.map((line, index) => (
          <AppText key={`${line}-${index}`} variant="bodySmall" style={styles.addressLine}>
            {line}
          </AppText>
        ))}
      </OrderDetailSection>

      <OrderDetailSection title="Payment Summary" icon="receipt-outline">
        <SummaryRow label="Subtotal" value={formatOrderMoney(order, subtotal)} />
        <SummaryRow label="Shipping" value={formatOrderMoney(order, shipping)} />
        <SummaryRow
          label="Service fees"
          value={serviceFees > 0 ? formatOrderMoney(order, serviceFees) : '—'}
        />
        <AppDivider style={styles.summaryDivider} />
        <SummaryRow label="Total" value={formatOrderMoney(order, total)} emphasized />
        {paymentMethod ? (
          <View style={styles.paymentMethodRow}>
            <Ionicons name="card-outline" size={16} color={colors.textSecondary} />
            <AppText variant="bodySmall" color="textSecondary">
              {paymentMethod}
            </AppText>
          </View>
        ) : null}
      </OrderDetailSection>

      <View style={styles.actions}>
        <AppButton
          label="Contact Seller"
          variant="outline"
          onPress={() => navigation.navigate('ChatList')}
        />
        <AppButton label="Download Invoice" onPress={handleDownloadInvoicePress} />
        <AppButton
          label="Cancel Order"
          variant="outline"
          disabled={!cancellable || isCancelling}
          loading={isCancelling}
          onPress={handleCancelPress}
          style={styles.cancelButton}
          labelStyle={styles.cancelButtonLabel}
        />
        {!cancellable && cancelDisabledReason ? (
          <AppText variant="caption" color="textMuted" style={styles.cancelHint}>
            {cancelDisabledReason}
          </AppText>
        ) : null}
      </View>
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
    padding: spacing.xl,
    backgroundColor: colors.background,
    gap: spacing.md,
  },
  errorState: {
    alignSelf: 'stretch',
    marginHorizontal: 0,
  },
  inlineError: {
    alignSelf: 'stretch',
    marginHorizontal: 0,
  },
  hero: {
    gap: spacing.xs,
  },
  heroTitle: {
    color: colors.textPrimary,
    fontWeight: '800',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  statusLabel: {
    fontWeight: '700',
  },
  successBanner: {
    backgroundColor: colors.successBg,
    borderRadius: radius.medium,
    borderWidth: 1,
    borderColor: colors.successSoft,
    padding: spacing.md,
  },
  infoRows: {
    gap: spacing.md,
  },
  productList: {
    gap: spacing.xs,
  },
  itemDivider: {
    marginVertical: spacing.sm,
  },
  addressLine: {
    color: colors.textPrimary,
    lineHeight: 22,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  summaryValue: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  summaryLabelEmphasis: {
    fontWeight: '700',
  },
  summaryTotal: {
    color: colors.primary,
    fontWeight: '800',
  },
  summaryDivider: {
    marginVertical: spacing.sm,
  },
  paymentMethodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  actions: {
    gap: spacing.sm,
    paddingTop: spacing.xs,
  },
  cancelButton: {
    borderColor: colors.error,
  },
  cancelButtonLabel: {
    color: colors.error,
  },
  cancelHint: {
    textAlign: 'center',
    lineHeight: 18,
  },
});
