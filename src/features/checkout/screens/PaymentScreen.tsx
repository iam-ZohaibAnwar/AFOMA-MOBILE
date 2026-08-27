import { useMemo, useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  isStripeCardCheckoutSupported,
  isStripePlatformPaySupported,
} from '../../../app/utils/isStripeNativeSupported';
import { AppButton } from '../../../components/ui/AppButton';
import { AppText } from '../../../components/ui/AppText';
import { usePricing } from '../../../app/providers/PricingProvider';
import { navigateToCartTab, navigateToHomeTab } from '../../../app/navigation/shoppingNavigation';
import type { RootStackParamList, ShoppingStackParamList } from '../../../app/navigation/types';
import { useAuth } from '../../auth/hooks/useAuth';
import { useRequireAuth } from '../../auth/hooks/useRequireAuth';
import { authReturnTo } from '../../auth/utils/authNavigation';
import { resolveAuthUserId } from '../../auth/utils/resolveAuthUserId';
import { useCart } from '../../cart/hooks/useCart';
import { useClearCartOnSuccessfulCheckout } from '../../cart/hooks/useClearCartOnSuccessfulCheckout';
import { useAppliedCoupon } from '../../cart/hooks/useAppliedCoupon';
import { getCartLineDisplayAmount, getCartSubtotalCad } from '../../cart/utils/cartPricing';
import { calculateCartTotals } from '../../cart/utils/cartTotals';
import { getCartItemCount } from '../../cart/utils/cartUtils';
import {
  isCartShippingPending,
  resolveCartShippingCad,
  resolveCartShippingOptions,
} from '../../cart/utils/resolveCartShipping';
import { resolveWebParityShippingTotal } from '../utils/buildCheckoutOrderPayload';
import { KorapayCheckoutWebView } from '../components/KorapayCheckoutWebView';
import { OrderSuccessSheet } from '../components/OrderSuccessSheet';
import { PayPalProcessingOverlay } from '../components/PayPalProcessingOverlay';
import { PaymentAddressSection } from '../components/PaymentAddressSection';
import type { PaymentMethodId } from '../components/PaymentMethodOption';
import { PaymentMethodSheet } from '../components/PaymentMethodSheet';
import { PaymentProductsSection } from '../components/PaymentProductsSection';
import { PaymentScreenHeader } from '../components/PaymentScreenHeader';
import { usesKorapayCheckout } from '../constants/checkoutPaymentMethods';
import { useCheckoutShippingAddress } from '../hooks/useCheckoutShippingAddress';
import {
  formatCheckoutPaymentFailure,
  getCheckoutPaymentErrorMessage,
  useCheckoutPayment,
} from '../hooks/useCheckoutPayment';
import { useGuestCheckoutIdentity } from '../hooks/useGuestCheckoutIdentity';
import type { CheckoutOrderParams } from '../utils/buildCheckoutOrderPayload';
import { maskEmail } from '../utils/maskEmail';
import { resolveCapturedOrderId } from '../utils/resolveCapturedOrderId';
import { validateShippingAddress } from '../utils/validateShippingAddress';

type Props = NativeStackScreenProps<ShoppingStackParamList, 'Payment'>;

type PaymentNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<ShoppingStackParamList, 'Payment'>,
  NativeStackNavigationProp<RootStackParamList>
>;

const PAYMENT_RETURN_TO = authReturnTo.payment();

export function PaymentScreen({ route }: Props) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<PaymentNavigationProp>();
  const { user, isAuthenticated } = useAuth();
  const { isAuthorized } = useRequireAuth(PAYMENT_RETURN_TO);
  const authUserId = resolveAuthUserId(user);
  const { userInfo } = usePricing();
  const currency = userInfo.currency ?? 'CAD';
  const currencyRate = userInfo.currencyRate ?? 1;
  const stripeConfigured = isStripeCardCheckoutSupported();
  const applePayBuildReady = isStripePlatformPaySupported();

  const { cart, entries, isLoading, error, retry, totalShippingRate, fetchedShippingRate } =
    useCart(authUserId, userInfo);
  const { appliedCoupon, removeAppliedCoupon } = useAppliedCoupon(authUserId);
  const { shippingAddress } = useCheckoutShippingAddress(user);
  const { resolveIdentityForAddress, establishGuestCheckout, isEstablishingGuest, guestError } =
    useGuestCheckoutIdentity(user);
  const checkoutPayment = useCheckoutPayment();
  const {
    isProcessing,
    isCapturing,
    orderError,
    captureError,
    checkoutNotice,
    captureResult,
    korapaySession,
    applePaySupported,
    checkApplePaySupport,
    startPayPalCheckout,
    startKorapayCheckout,
    completeKorapayCheckout,
    cancelKorapayCheckout,
    startStripeCardCheckout,
    startApplePayCheckout,
    retryCaptureForCreatedOrder,
    resumePayPalFromRouteParams,
    createdOrderId,
  } = checkoutPayment;

  const [selectedPayment, setSelectedPayment] = useState<PaymentMethodId>('paypal');
  const [formNotice, setFormNotice] = useState<string | null>(null);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);

  const showProcessingOverlay =
    checkoutPayment.isPayPalCapturing === true ||
    checkoutPayment.isStripeInitializing === true ||
    (isCapturing && !checkoutPayment.isPayPalCapturing && selectedPayment === 'stripe');

  const paymentError = getCheckoutPaymentErrorMessage(
    orderError,
    captureError,
    checkoutNotice,
    Boolean(captureResult),
  );

  useEffect(() => {
    void resumePayPalFromRouteParams(route.params);
  }, [resumePayPalFromRouteParams, route.params]);

  useEffect(() => {
    if (captureResult) {
      setShowOrderSuccess(true);
      if (authUserId) {
        void removeAppliedCoupon();
      }
    }
  }, [authUserId, captureResult, removeAppliedCoupon]);

  useClearCartOnSuccessfulCheckout(captureResult, cart, authUserId);

  useEffect(() => {
    void checkApplePaySupport();
  }, [checkApplePaySupport]);

  const showKorapay = usesKorapayCheckout(currency);

  useEffect(() => {
    if (showKorapay && selectedPayment === 'stripe') {
      setSelectedPayment('korapay');
      return;
    }

    if (!showKorapay && selectedPayment === 'korapay') {
      setSelectedPayment('stripe');
    }
  }, [selectedPayment, showKorapay]);

  const itemCount = getCartItemCount(cart);
  const subtotalCad = useMemo(() => getCartSubtotalCad(cart, userInfo), [cart, userInfo]);
  const selectedShippingOptions = useMemo(() => resolveCartShippingOptions(cart), [cart]);
  const shippingCad = useMemo(
    () =>
      resolveCartShippingCad(
        cart,
        totalShippingRate,
        fetchedShippingRate,
        selectedShippingOptions,
      ),
    [cart, fetchedShippingRate, selectedShippingOptions, totalShippingRate],
  );

  const discountAmount = appliedCoupon?.discountAmount ?? 0;
  const shippingPending = isCartShippingPending(cart, selectedShippingOptions);

  const totals = useMemo(
    () =>
      calculateCartTotals({
        subtotalCad,
        shippingCad,
        discountDisplay: discountAmount,
        currencyRate,
        shippingPending,
      }),
    [currencyRate, discountAmount, shippingCad, shippingPending, subtotalCad],
  );

  const checkoutIdentity = useMemo(
    () => resolveIdentityForAddress(shippingAddress),
    [resolveIdentityForAddress, shippingAddress],
  );
  const payerEmail = shippingAddress.email || user?.email || checkoutIdentity?.email;
  const maskedPayerEmail = maskEmail(payerEmail);

  const paymentMethods = useMemo(() => {
    const stripeEnabled = !showKorapay && stripeConfigured;
    const korapayEnabled = showKorapay;
    const applePayEnabled = Platform.OS === 'ios' && applePaySupported && applePayBuildReady;

    const methods: Array<{
      id: PaymentMethodId;
      label: string;
      subtitle?: string;
      disabled?: boolean;
    }> = [
      {
        id: 'paypal',
        label: 'PayPal',
        subtitle: maskedPayerEmail ?? 'Pay with your PayPal account',
      },
    ];

    if (!showKorapay) {
      methods.push({
        id: 'stripe',
        label: 'Debit / Credit Card',
        subtitle: stripeConfigured ? 'Secure Stripe checkout' : 'Stripe is not configured',
        disabled: !stripeEnabled,
      });
    }

    if (showKorapay) {
      methods.push({
        id: 'korapay',
        label: 'Korapay',
        subtitle: 'Local payment methods for Nigeria and Africa',
        disabled: !korapayEnabled,
      });
    }

    methods.push({
      id: 'applepay',
      label: 'Apple Pay',
      subtitle:
        Platform.OS !== 'ios'
          ? 'Available on iOS only'
          : applePayEnabled
            ? 'Fast checkout on iPhone'
            : applePayBuildReady
              ? 'Apple Pay is not available on this device'
              : 'Requires a development build',
      disabled: !applePayEnabled,
    });

    return methods;
  }, [applePayBuildReady, applePaySupported, maskedPayerEmail, showKorapay, stripeConfigured]);

  const productEntries = useMemo(
    () =>
      entries.map((entry) => ({
        id: entry.id,
        line: entry.line,
        displayLineTotal: getCartLineDisplayAmount(entry.line, cart, userInfo),
      })),
    [cart, entries, userInfo],
  );

  const buildCheckoutParams = (identity: CheckoutOrderParams['identity']): CheckoutOrderParams => ({
    identity,
    cart,
    shippingAddress,
    selectedOptions: selectedShippingOptions,
    totals: {
      subTotal: subtotalCad,
      shippingTotal: resolveWebParityShippingTotal(
        fetchedShippingRate,
        totalShippingRate,
        shippingCad,
      ),
      grandTotal: subtotalCad + shippingCad + totals.serviceChargeCad - discountAmount,
    },
    currency,
    conversionRate: currencyRate,
    couponCode: appliedCoupon?.couponCode,
  });

  const resolveCheckoutIdentity = async () => {
    if (isAuthenticated && checkoutIdentity) {
      return checkoutIdentity;
    }

    return establishGuestCheckout(shippingAddress);
  };

  const handleConfirmPayment = async () => {
    if (isProcessing || isEstablishingGuest) {
      return;
    }

    setFormNotice(null);

    const addressValidation = validateShippingAddress(shippingAddress);
    if (!addressValidation.isValid) {
      setFormNotice('Complete delivery details on the cart before paying.');
      return;
    }

    if (shippingPending) {
      setFormNotice('Select shipping options on the cart before paying.');
      return;
    }

    if (totals.displayTotal == null) {
      setFormNotice('Order total is not ready yet.');
      return;
    }

    const selectedMethod = paymentMethods.find((method) => method.id === selectedPayment);
    if (!selectedMethod || selectedMethod.disabled) {
      setFormNotice('Select an available payment method.');
      return;
    }

    try {
      const identity = await resolveCheckoutIdentity();
      const checkoutParams = buildCheckoutParams(identity);

      switch (selectedPayment) {
        case 'paypal':
          await startPayPalCheckout(checkoutParams);
          break;
        case 'stripe':
          await startStripeCardCheckout(checkoutParams, totals.displayTotal, currency);
          break;
        case 'korapay':
          await startKorapayCheckout(checkoutParams);
          break;
        case 'applepay':
          await startApplePayCheckout(checkoutParams, totals.displayTotal, currency);
          break;
        default:
          setFormNotice('This payment method is not available.');
      }
    } catch (err) {
      setFormNotice(formatCheckoutPaymentFailure(err, 'Failed to process payment'));
    }
  };

  const capturedOrderId = useMemo(() => resolveCapturedOrderId(captureResult), [captureResult]);

  const handleTrackOrder = () => {
    setShowOrderSuccess(false);

    if (capturedOrderId) {
      navigation.navigate('OrderDetail', { orderId: capturedOrderId });
      return;
    }

    navigation.navigate('Orders');
  };

  const handleContinueShopping = () => {
    setShowOrderSuccess(false);
    navigateToHomeTab(navigation);
  };

  const paymentFlowActive = Boolean(korapaySession);
  const checkoutCompleted = Boolean(captureResult);

  if (!isAuthorized) {
    return (
      <View style={[styles.centeredState, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.brandBlue} />
      </View>
    );
  }

  if (isLoading && !checkoutCompleted) {
    return (
      <View style={[styles.centeredState, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.brandBlue} />
        <AppText variant="bodySmall" color="textMuted">
          Loading payment...
        </AppText>
      </View>
    );
  }

  if (error && !checkoutCompleted) {
    return (
      <View style={[styles.centeredState, { paddingTop: insets.top }]}>
        <AppText variant="bodySmall" color="error">
          {error}
        </AppText>
        <AppButton label="Try again" onPress={() => void retry()} />
      </View>
    );
  }

  if (entries.length === 0 && !checkoutCompleted) {
    return (
      <View style={[styles.centeredState, { paddingTop: insets.top }]}>
        <AppText variant="h2">Nothing to pay for</AppText>
        <AppText variant="body" color="textSecondary" style={styles.centeredCopy}>
          Your cart is empty. Add items before checkout.
        </AppText>
        <AppButton label="Back to cart" onPress={() => navigateToCartTab(navigation)} fullWidth />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <PaymentScreenHeader
        onBack={() => {
          if (captureResult) {
            navigateToHomeTab(navigation);
            return;
          }

          if (navigation.canGoBack()) {
            navigation.goBack();
          } else {
            navigateToCartTab(navigation);
          }
        }}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <PaymentAddressSection address={shippingAddress} />
        <PaymentProductsSection entries={productEntries} currency={currency} />

        {shippingPending ? (
          <AppText variant="bodySmall" color="error">
            Shipping is not ready yet. Go back to the cart and select a delivery option.
          </AppText>
        ) : null}
        {guestError ? (
          <AppText variant="bodySmall" color="error">
            {guestError}
          </AppText>
        ) : null}
        {paymentError ? (
          <AppText variant="bodySmall" color="error">
            {paymentError}
          </AppText>
        ) : null}
        {createdOrderId && captureError && !captureResult ? (
          <AppButton
            label="Confirm PayPal payment"
            variant="secondary"
            onPress={() => void retryCaptureForCreatedOrder()}
            loading={checkoutPayment.isPayPalCapturing}
          />
        ) : null}
        {formNotice ? (
          <AppText variant="bodySmall" color="error">
            {formNotice}
          </AppText>
        ) : null}
      </ScrollView>

      {!captureResult ? (
        <PaymentMethodSheet
          methods={paymentMethods}
          selectedMethod={selectedPayment}
          onSelectMethod={setSelectedPayment}
          currency={currency}
          itemCount={itemCount}
          subTotal={totals.displaySubtotal}
          shippingAmount={totals.displayShipping}
          serviceChargeAmount={totals.displayServiceCharge}
          total={totals.displayTotal}
          confirmDisabled={totals.displayTotal == null || paymentFlowActive}
          confirmLoading={isProcessing || isEstablishingGuest}
          onConfirm={() => void handleConfirmPayment()}
        />
      ) : null}

      <PayPalProcessingOverlay visible={showProcessingOverlay} />

      <KorapayCheckoutWebView
        visible={Boolean(korapaySession)}
        checkoutUrl={korapaySession?.checkoutUrl ?? null}
        onComplete={() => void completeKorapayCheckout()}
        onCancel={cancelKorapayCheckout}
      />

      <OrderSuccessSheet
        visible={showOrderSuccess}
        onTrackOrder={handleTrackOrder}
        onContinueShopping={handleContinueShopping}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF7ED',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 20,
  },
  centeredState: {
    flex: 1,
    alignItems: 'stretch',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#FFF7ED',
    gap: 12,
  },
  centeredCopy: {
    textAlign: 'center',
  },
});
