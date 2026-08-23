import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ErrorState } from '../../../components/ecommerce/ErrorState';
import { AppButton } from '../../../components/ui/AppButton';
import { AppCard } from '../../../components/ui/AppCard';
import { AppDivider } from '../../../components/ui/AppDivider';
import { AppText } from '../../../components/ui/AppText';
import { colors, spacing } from '../../../design-system';
import type { ShoppingStackParamList } from '../../../app/navigation/types';
import { useRequireAuth } from '../../auth/hooks/useRequireAuth';
import { authReturnTo } from '../../auth/utils/authNavigation';
import { OrderLineItemRow } from '../components/OrderLineItemRow';
import { useCancelOrder } from '../hooks/useCancelOrder';
import { useOrderDetail } from '../hooks/useOrderDetail';
import {
  canCancelOrder,
  formatBillingAddressLines,
  formatCustomerEmail,
  formatCustomerName,
  formatOrderDate,
  formatOrderDisplayId,
  formatOrderStatus,
  formatShippingAddressLines,
} from '../utils/orderDisplay';
import {
  calculateOrderGrandTotal,
  calculateOrderItemsSubTotal,
  calculateOrderServiceFees,
  calculateOrderShippingTotal,
  formatOrderMoney,
} from '../utils/orderPricing';

type Props = NativeStackScreenProps<ShoppingStackParamList, 'OrderDetail'>;

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <AppText variant="caption" color="textMuted" style={styles.detailLabel}>
        {label}
      </AppText>
      <AppText variant="bodyMedium" style={styles.detailValue}>
        {value}
      </AppText>
    </View>
  );
}

function SummaryRow({ label, value, emphasized = false }: {
  label: string;
  value: string;
  emphasized?: boolean;
}) {
  return (
    <View style={styles.summaryRow}>
      <AppText variant={emphasized ? 'bodyMedium' : 'bodySmall'} color={emphasized ? 'textPrimary' : 'textSecondary'}>
        {label}
      </AppText>
      <AppText
        variant={emphasized ? 'bodyMedium' : 'bodySmall'}
        color={emphasized ? 'secondary' : 'textPrimary'}
        style={emphasized ? styles.summaryTotal : undefined}
      >
        {value}
      </AppText>
    </View>
  );
}

export function OrderDetailScreen({ route }: Props) {
  const { orderId } = route.params;
  const insets = useSafeAreaInsets();
  const returnTo = useMemo(() => authReturnTo.orderDetail(orderId), [orderId]);
  const { isAuthorized } = useRequireAuth(returnTo);
  const { order, isLoading, error, isNotFound, retry } = useOrderDetail(orderId);
  const [cancelSuccessMessage, setCancelSuccessMessage] = useState<string | null>(null);

  const { cancelOrder, isCancelling, cancelError, clearCancelError } = useCancelOrder(orderId, () => {
    setCancelSuccessMessage('Order cancelled successfully.');
    void retry();
  });

  const handleCancelPress = () => {
    if (!order || !canCancelOrder(order.status) || isCancelling) {
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
  const billingLines = formatBillingAddressLines(order.billing_address);
  const customerName = formatCustomerName(order.userInfo);
  const customerEmail = formatCustomerEmail(order.userInfo) ?? order.userInfo?.email;
  const cancellable = canCancelOrder(order.status);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + spacing.xxl },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <AppText variant="h3" style={styles.headerTitle}>
            Order {formatOrderDisplayId(order._id ?? orderId)}
          </AppText>
          <AppText variant="bodySmall" color="textSecondary">
            Placed {formatOrderDate(order.createdAt)}
          </AppText>
        </View>

        <AppButton
          label="Cancel"
          variant="outline"
          size="md"
          disabled={!cancellable || isCancelling}
          loading={isCancelling}
          onPress={handleCancelPress}
          style={styles.cancelButton}
          labelStyle={styles.cancelButtonLabel}
        />
      </View>

      {cancelSuccessMessage ? (
        <AppCard variant="flat" style={styles.banner}>
          <AppText variant="bodySmall" color="success">
            {cancelSuccessMessage}
          </AppText>
        </AppCard>
      ) : null}

      {cancelError ? (
        <ErrorState
          message={cancelError}
          actionLabel="Dismiss"
          onAction={clearCancelError}
          style={styles.inlineError}
        />
      ) : null}

      <AppCard variant="flat">
        <AppText variant="bodyMedium" style={styles.sectionTitle}>
          Order Information
        </AppText>
        <DetailRow label="Order ID" value={formatOrderDisplayId(order._id ?? orderId)} />
        <DetailRow label="Order Date" value={formatOrderDate(order.createdAt)} />
        <DetailRow label="Status" value={formatOrderStatus(order.status)} />
        {customerName ? <DetailRow label="Customer" value={customerName} /> : null}
        {customerEmail ? <DetailRow label="Email" value={customerEmail} /> : null}
      </AppCard>

      <AppCard variant="flat">
        <AppText variant="bodyMedium" style={styles.sectionTitle}>
          Products
        </AppText>
        {order.cart?.length ? (
          <View style={styles.productList}>
            {order.cart.map((line, index) => (
              <OrderLineItemRow
                key={`${line.productData?._id ?? 'line'}-${index}`}
                line={line}
                order={order}
              />
            ))}
          </View>
        ) : (
          <AppText variant="bodySmall" color="textMuted">
            No products found for this order.
          </AppText>
        )}
      </AppCard>

      <AppCard variant="flat">
        <AppText variant="bodyMedium" style={styles.sectionTitle}>
          Payment Details
        </AppText>
        <SummaryRow label="Item(s) total" value={formatOrderMoney(order, subtotal)} />
        <SummaryRow
          label="Service fees"
          value={serviceFees > 0 ? formatOrderMoney(order, serviceFees) : '—'}
        />
        <SummaryRow label="Shipping charges" value={formatOrderMoney(order, shipping)} />
        <AppDivider style={styles.summaryDivider} />
        <SummaryRow label="Total" value={formatOrderMoney(order, total)} emphasized />
      </AppCard>

      <AppCard variant="flat">
        <AppText variant="bodyMedium" style={styles.sectionTitle}>
          Shipping Information
        </AppText>
        {shippingLines.map((line, index) => (
          <AppText key={`${line}-${index}`} variant="bodySmall" style={styles.addressLine}>
            {line}
          </AppText>
        ))}
      </AppCard>

      {billingLines.length > 0 ? (
        <AppCard variant="flat">
          <AppText variant="bodyMedium" style={styles.sectionTitle}>
            Billing Information
          </AppText>
          {billingLines.map((line, index) => (
            <AppText key={`${line}-${index}`} variant="bodySmall" style={styles.addressLine}>
              {line}
            </AppText>
          ))}
        </AppCard>
      ) : null}
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  headerCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  cancelButton: {
    borderColor: colors.error,
    minWidth: 92,
  },
  cancelButtonLabel: {
    color: colors.error,
  },
  banner: {
    backgroundColor: colors.successBg,
    borderColor: colors.successSoft,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  detailRow: {
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  detailLabel: {
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  detailValue: {
    color: colors.textPrimary,
  },
  productList: {
    gap: spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  summaryTotal: {
    fontWeight: '700',
  },
  summaryDivider: {
    marginVertical: spacing.sm,
  },
  addressLine: {
    color: colors.textPrimary,
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
});
