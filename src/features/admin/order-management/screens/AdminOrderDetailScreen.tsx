import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { CartLineItem } from '../../../../services/types/cart';
import { ErrorState } from '../../../../components/ecommerce/ErrorState';
import { AppBadge } from '../../../../components/ui/AppBadge';
import { AppCard } from '../../../../components/ui/AppCard';
import { AppDivider } from '../../../../components/ui/AppDivider';
import { AppText } from '../../../../components/ui/AppText';
import { colors, spacing } from '../../../../design-system';
import type { AdminStackParamList } from '../../navigation/adminTypes';
import { useRequireAdmin } from '../../hooks/useRequireAdmin';
import { authReturnTo } from '../../../auth/utils/authNavigation';
import {
  formatBillingAddressLines,
  formatCustomerEmail,
  formatCustomerName,
  formatOrderDate,
  formatOrderDisplayId,
  formatShippingAddressLines,
} from '../../../orders/utils/orderDisplay';
import {
  calculateOrderGrandTotal,
  calculateOrderItemsSubTotal,
  calculateOrderServiceFees,
  calculateOrderShippingTotal,
  formatOrderMoney,
} from '../../../orders/utils/orderPricing';
import { AdminOrderLineItem } from '../components/AdminOrderLineItem';
import { AdminOrderOperationsSection } from '../components/AdminOrderOperationsSection';
import { AdminOrderShippingSection } from '../components/AdminOrderShippingSection';
import { useAdminOrderDetail } from '../hooks/useAdminOrderDetail';
import { useAdminOrderOperations } from '../hooks/useAdminOrderOperations';
import type { AdminOrderDetail } from '../types/adminOrderManagement';
import {
  formatAdminPaymentStatus,
  getAdminCustomerUserId,
} from '../utils/adminOrderDetailDisplay';
import {
  formatAdminOrderStatus,
  getAdminOrderCarrierLabel,
  orderStatusBadgeVariant,
} from '../utils/adminOrderDisplay';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminOrderDetail'>;

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
      >
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

function SectionHeader({ title }: { title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <AppText variant="label" color="textSecondary">
        {title}
      </AppText>
      <AppDivider />
    </View>
  );
}

export function AdminOrderDetailScreen({ route }: Props) {
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

  useFocusEffect(
    useCallback(() => {
      syncSessionPatch();
    }, [syncSessionPatch]),
  );

  const displayOrder = (order ?? initialOrder) as AdminOrderDetail | undefined;

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
  const shippingLines = formatShippingAddressLines(displayOrder.userInfo);
  const billingLines = formatBillingAddressLines(displayOrder.billing_address);
  const customerName =
    formatCustomerName(displayOrder.userInfo) ??
    (displayOrder.userInfo as { name?: string } | undefined)?.name?.trim() ??
    '—';
  const customerEmail = formatCustomerEmail(displayOrder.userInfo) ?? displayOrder.userInfo?.email ?? '—';
  const customerUserId = getAdminCustomerUserId(displayOrder);
  const paymentStatusLabel = formatAdminPaymentStatus(displayOrder.paymentStatus);
  const carrier = getAdminOrderCarrierLabel(displayOrder);
  const lineItems = displayOrder.cart ?? [];

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
      <AppCard style={styles.headerCard}>
        <View style={styles.headerRow}>
          <View style={styles.headerCopy}>
            <AppText variant="h3">Order {formatOrderDisplayId(displayOrder._id ?? orderId)}</AppText>
            <AppText variant="bodySmall" color="textSecondary">
              Placed {formatOrderDate(displayOrder.createdAt)}
            </AppText>
          </View>
          <AppBadge
            label={formatAdminOrderStatus(displayOrder.status)}
            variant={orderStatusBadgeVariant(displayOrder.status)}
          />
        </View>

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
      </AppCard>

      <SectionHeader title="Operations" />
      <AdminOrderOperationsSection
        order={displayOrder}
        isUpdatingOrderStatus={isUpdatingOrderStatus}
        isCancellingShipment={isCancellingShipment}
        onOrderStatusChange={handleOrderStatusChange}
        onCancelShipment={handleCancelShipment}
      />

      {operationError ? (
        <ErrorState
          message={operationError}
          actionLabel="Dismiss"
          onAction={clearOperationError}
          style={styles.inlineError}
        />
      ) : null}

      <SectionHeader title="Order summary" />
      <AppCard>
        <DetailRow label="Order status" value={formatAdminOrderStatus(displayOrder.status)} />
        <DetailRow label="Payment status" value={paymentStatusLabel} />
        <DetailRow label="Carrier" value={carrier} />
      </AppCard>

      <SectionHeader title="Customer" />
      <AppCard>
        <AppText variant="bodyMedium" style={styles.customerName}>
          {customerName}
        </AppText>
        <AppText variant="bodySmall" color="textSecondary">
          {customerEmail}
        </AppText>
        {customerUserId ? (
          <AppText variant="caption" color="textMuted" style={styles.customerMeta}>
            User ID: {customerUserId}
          </AppText>
        ) : null}
      </AppCard>

      <SectionHeader title="Products" />
      <View style={styles.productList}>
        {lineItems.length ? (
          lineItems.map((line: CartLineItem, index: number) => (
            <AdminOrderLineItem
              key={`${line.productData?._id ?? 'line'}-${index}`}
              order={displayOrder}
              line={line}
              isUpdatingFulfillment={updatingProductId === line.productData?._id}
              onFulfillmentStatusChange={handleLineFulfillmentChange}
            />
          ))
        ) : (
          <AppCard>
            <AppText variant="bodySmall" color="textMuted">
              No products found for this order.
            </AppText>
          </AppCard>
        )}
      </View>

      <SectionHeader title="Shipping operations" />
      <AdminOrderShippingSection
        order={displayOrder}
        onOrderUpdated={applyOrderUpdate}
        onRefresh={refresh}
      />

      <SectionHeader title="Payment details" />
      <AppCard>
        <SummaryRow label="Item(s) total" value={formatOrderMoney(displayOrder, subtotal)} />
        <SummaryRow
          label="Service fees"
          value={serviceFees > 0 ? formatOrderMoney(displayOrder, serviceFees) : '—'}
        />
        <SummaryRow label="Shipping charges" value={formatOrderMoney(displayOrder, shipping)} />
        <AppDivider style={styles.summaryDivider} />
        <SummaryRow label="Total" value={formatOrderMoney(displayOrder, total)} emphasized />
      </AppCard>

      <SectionHeader title="Delivery address" />
      <AppCard>
        {shippingLines.map((line, index) => (
          <AppText key={`${line}-${index}`} variant="bodySmall" style={styles.addressLine}>
            {line}
          </AppText>
        ))}
        {carrier && carrier !== '—' ? (
          <AppText variant="bodySmall" color="textSecondary" style={styles.carrierLine}>
            Carrier: {carrier}
          </AppText>
        ) : null}
      </AppCard>

      {billingLines.length > 0 ? (
        <>
          <SectionHeader title="Billing information" />
          <AppCard>
            {billingLines.map((line, index) => (
              <AppText key={`${line}-${index}`} variant="bodySmall" style={styles.addressLine}>
                {line}
              </AppText>
            ))}
          </AppCard>
        </>
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
    gap: spacing.sm,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },
  errorState: {
    alignSelf: 'stretch',
    marginHorizontal: 0,
  },
  headerCard: {
    gap: spacing.sm,
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
  inlineLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  inlineError: {
    alignSelf: 'stretch',
    marginHorizontal: 0,
  },
  sectionHeader: {
    gap: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  detailLabel: {
    flex: 1,
  },
  detailValue: {
    flex: 1.2,
    textAlign: 'right',
  },
  customerName: {
    fontWeight: '600',
    color: colors.textPrimary,
  },
  customerMeta: {
    marginTop: spacing.sm,
  },
  productList: {
    gap: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  summaryDivider: {
    marginVertical: spacing.sm,
  },
  summaryTotal: {
    fontWeight: '700',
  },
  addressLine: {
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  carrierLine: {
    marginTop: spacing.sm,
    fontWeight: '600',
  },
});
