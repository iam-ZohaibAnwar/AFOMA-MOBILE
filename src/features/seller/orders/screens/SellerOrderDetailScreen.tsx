import { useCallback } from 'react';

import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useSafeAreaInsets } from 'react-native-safe-area-context';



import { ErrorState } from '../../../../components/ecommerce/ErrorState';

import { AppCard } from '../../../../components/ui/AppCard';

import { AppDivider } from '../../../../components/ui/AppDivider';

import { AppText } from '../../../../components/ui/AppText';

import { colors, spacing } from '../../../../design-system';

import type { SellerStackParamList } from '../../../../app/navigation/sellerTypes';

import { authReturnTo } from '../../../auth/utils/authNavigation';

import {

  formatBillingAddressLines,

  formatCustomerEmail,

  formatCustomerName,

  formatOrderDate,

  formatOrderDisplayId,

  formatShippingAddressLines,

} from '../../../orders/utils/orderDisplay';

import { useRequireSeller } from '../../hooks/useRequireSeller';

import { SellerOrderLineItem } from '../components/SellerOrderLineItem';

import { SellerOrderShippingSection } from '../components/SellerOrderShippingSection';

import { SellerOrderStatusBadge } from '../components/SellerOrderStatusBadge';

import { useSellerOrderDetail } from '../hooks/useSellerOrderDetail';

import { useSellerOrderShipping } from '../hooks/useSellerOrderShipping';

import type { SellerLineFulfillmentStatus } from '../types/sellerOrder';

import {

  getSellerOrderCarrierLabel,

  getSellerOrderLineItems,

} from '../utils/sellerOrderMappers';

import {

  getSellerShipmentContext,

  hasSellerShipmentOperations,

} from '../utils/sellerOrderShippingMappers';



type Props = NativeStackScreenProps<SellerStackParamList, 'SellerOrderDetail'>;



const DETAIL_RETURN_TO = authReturnTo.sellerOrders();



function SectionHeader({ title }: { title: string }) {

  return (

    <View style={styles.sectionHeader}>

      <AppText variant="bodyMedium" style={styles.sectionTitle}>

        {title}

      </AppText>

      <AppDivider />

    </View>

  );

}



export function SellerOrderDetailScreen({ route }: Props) {

  const { orderId } = route.params;

  const insets = useSafeAreaInsets();

  const { isAuthorized, sellerId } = useRequireSeller(DETAIL_RETURN_TO);

  const {

    order,

    isLoading,

    error,

    isNotFound,

    updatingProductId,

    updateError,

    clearUpdateError,

    updateLineFulfillmentStatus,

    refresh,

  } = useSellerOrderDetail(isAuthorized ? sellerId : undefined, orderId);



  const shipping = useSellerOrderShipping(order, refresh);



  const handleFulfillmentChange = useCallback(

    (productId: string, status: SellerLineFulfillmentStatus) => {

      void updateLineFulfillmentStatus(productId, status);

    },

    [updateLineFulfillmentStatus],

  );



  if (!isAuthorized) {

    return (

      <View style={styles.centeredState}>

        <ActivityIndicator size="large" color={colors.primary} />

      </View>

    );

  }



  if (isLoading && !order) {

    return (

      <View style={styles.centeredState}>

        <ActivityIndicator size="large" color={colors.primary} />

        <AppText variant="bodySmall" color="textSecondary">

          Loading order...

        </AppText>

      </View>

    );

  }



  if (error && !order) {

    return (

      <View style={styles.centeredState}>

        <ErrorState

          message={isNotFound ? 'Order not found.' : error}

          onAction={() => void refresh()}

        />

      </View>

    );

  }



  if (!order) {

    return null;

  }



  const lineItems = getSellerOrderLineItems(order);

  const carrier = getSellerOrderCarrierLabel(order);

  const shippingLines = formatShippingAddressLines(order.userInfo);

  const billingLines = formatBillingAddressLines(order.billing_address);

  const customerName = formatCustomerName(order.userInfo) ?? '—';

  const customerEmail = formatCustomerEmail(order.userInfo) ?? '—';

  const shipmentContext = getSellerShipmentContext(order);

  const showOperationalShipping = hasSellerShipmentOperations(order) && shipmentContext;



  return (

    <ScrollView

      style={styles.screen}

      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}

      showsVerticalScrollIndicator={false}

    >

      <SectionHeader title="Order" />

      <AppCard variant="flat" style={styles.block}>

        <View style={styles.orderHeader}>

          <AppText variant="bodyMedium" style={styles.orderId}>

            {formatOrderDisplayId(order._id)}

          </AppText>

          <SellerOrderStatusBadge status={order.status} />

        </View>

        <AppText variant="bodySmall" color="textSecondary">

          {formatOrderDate(order.createdAt)}

        </AppText>

        <AppText variant="caption" color="textMuted" style={styles.orderStatusHint}>

          Order status reflects the overall order lifecycle.

        </AppText>

      </AppCard>



      <SectionHeader title="Customer" />

      <AppCard variant="flat" style={styles.block}>

        <AppText variant="bodyMedium" style={styles.customerName}>

          {customerName}

        </AppText>

        <AppText variant="bodySmall" color="textSecondary">

          {customerEmail}

        </AppText>

      </AppCard>



      <SectionHeader title="Products" />

      <View style={styles.productsList}>

        {lineItems.map((line, index) => {

          const key = line.productData?._id ?? `line-${index}`;

          return (

            <SellerOrderLineItem

              key={key}

              order={order}

              line={line}

              isUpdating={updatingProductId === line.productData?._id}

              onFulfillmentStatusChange={handleFulfillmentChange}

            />

          );

        })}

      </View>



      {updateError ? (

        <ErrorState message={updateError} onAction={clearUpdateError} style={styles.inlineError} />

      ) : null}



      {shippingLines.length > 0 ? (

        <>

          <SectionHeader title="Delivery address" />

          <AppCard variant="flat" style={styles.block}>

            {shippingLines.map((line) => (

              <AppText key={line} variant="bodySmall" color="textSecondary">

                {line}

              </AppText>

            ))}

            {carrier ? (

              <AppText variant="bodySmall" color="textSecondary" style={styles.carrier}>

                Carrier: {carrier}

              </AppText>

            ) : null}

          </AppCard>

        </>

      ) : null}



      {showOperationalShipping ? (

        <>

          <SectionHeader title="Shipping" />

          <SellerOrderShippingSection

            order={order}

            shipmentContext={shipmentContext}

            shipping={shipping}

          />

        </>

      ) : null}



      {billingLines.length > 0 ? (

        <>

          <SectionHeader title="Billing" />

          <AppCard variant="flat" style={styles.block}>

            {billingLines.map((line) => (

              <AppText key={line} variant="bodySmall" color="textSecondary">

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

    gap: spacing.md,

    padding: spacing.xl,

    backgroundColor: colors.background,

  },

  sectionHeader: {

    gap: spacing.sm,

  },

  sectionTitle: {

    color: colors.textPrimary,

    fontWeight: '700',

  },

  block: {

    gap: spacing.sm,

  },

  orderHeader: {

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-between',

    gap: spacing.md,

  },

  orderId: {

    fontWeight: '700',

    color: colors.textPrimary,

    flex: 1,

  },

  orderStatusHint: {

    marginTop: spacing.xs,

  },

  customerName: {

    fontWeight: '600',

    color: colors.textPrimary,

  },

  productsList: {

    gap: spacing.md,

  },

  carrier: {

    marginTop: spacing.sm,

    fontWeight: '600',

  },

  inlineError: {

    marginHorizontal: 0,

  },

});


