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
import { spacing, colors } from '../../../design-system';
import { usePricing } from '../../../app/providers/PricingProvider';
import {
  marketplaceScrollProps,
  useMarketplaceScrollHandler,
} from '../../../app/navigation/marketplaceChrome';
import { navigateToCartTab } from '../../../app/navigation/shoppingNavigation';
import type { RootStackParamList, ShoppingStackParamList } from '../../../app/navigation/types';
import { useAuth } from '../../auth/hooks/useAuth';
import { authReturnTo } from '../../auth/utils/authNavigation';
import { useRequireCheckoutAccess } from '../hooks/useRequireCheckoutAccess';
import { resolveAuthUserId } from '../../auth/utils/resolveAuthUserId';
import { useCart } from '../../cart/hooks/useCart';
import { useClearCartOnSuccessfulCheckout } from '../../cart/hooks/useClearCartOnSuccessfulCheckout';
import { useAppliedCoupon } from '../../cart/hooks/useAppliedCoupon';
import { getCartSubtotalCad } from '../../cart/utils/cartPricing';
import { calculateCartTotals } from '../../cart/utils/cartTotals';
import {
  isCartShippingPending,
  resolveCartShippingCad,
  resolveCartShippingOptions,
} from '../../cart/utils/resolveCartShipping';
import { resolveWebParityShippingTotal } from '../utils/buildCheckoutOrderPayload';
import { CheckoutStepIndicator } from '../components/CheckoutStepIndicator';
import { CheckoutProcessingLoader } from '../components/CheckoutProcessingLoader';
import { PaymentEditCartLink } from '../components/PaymentEditCartLink';
import { KorapayCheckoutWebView } from '../components/KorapayCheckoutWebView';
import { OrderSuccessSheet } from '../components/OrderSuccessSheet';
import type { PaymentMethodId } from '../components/PaymentMethodOption';
import { PaymentMethodPicker, type PaymentMethodPickerItem } from '../components/PaymentMethodPicker';
import { PaymentMethodPickerFooter } from '../components/PaymentMethodPickerFooter';
import { PaymentScreenHeader } from '../components/PaymentScreenHeader';
import { usesKorapayCheckout } from '../constants/checkoutPaymentMethods';
import { useCheckoutShippingAddress } from '../hooks/useCheckoutShippingAddress';
import {
  formatCheckoutPaymentFailure,
  getCheckoutPaymentErrorMessage,
  isPayPalReturnRouteParams,
  useCheckoutPayment,
} from '../hooks/useCheckoutPayment';

import { useGuestCheckoutIdentity } from '../hooks/useGuestCheckoutIdentity';
import type { CheckoutOrderParams } from '../utils/buildCheckoutOrderPayload';
import { maskEmail } from '../utils/maskEmail';
import { resolveCapturedOrderId } from '../utils/resolveCapturedOrderId';
import {
  resetStackAfterCheckoutToHome,
  resetStackAfterCheckoutToOrderDetail,
  resetStackAfterCheckoutToOrders,
} from '../utils/checkoutCompletionNavigation';
import { validateShippingAddress } from '../utils/validateShippingAddress';

type Props = NativeStackScreenProps<ShoppingStackParamList, 'Payment'>;

type PaymentNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<ShoppingStackParamList, 'Payment'>,
  NativeStackNavigationProp<RootStackParamList>
>;

const PAYMENT_RETURN_TO = authReturnTo.payment();

export function PaymentScreen(props: Props) {
  return <PaymentScreenBody {...props} />;
}

function PaymentScreenBody({ route }: Props) {
  const insets = useSafeAreaInsets();
  const onMarketplaceScroll = useMarketplaceScrollHandler();
  const navigation = useNavigation<PaymentNavigationProp>();
  const { user, isAuthenticated } = useAuth();
  const { isAuthorized } = useRequireCheckoutAccess(PAYMENT_RETURN_TO);
  const authUserId = resolveAuthUserId(user);
  const { userInfo } = usePricing();
  const currency = userInfo.currency ?? 'CAD';
  const currencyRate = userInfo.currencyRate ?? 1;
  const stripeConfigured = isStripeCardCheckoutSupported();
  const applePayBuildReady = isStripePlatformPaySupported();

  const { cart, entries, isLoading, error, retry, totalShippingRate, fetchedShippingRate } =
    useCart();
  const { appliedCoupon, removeAppliedCoupon } = useAppliedCoupon(authUserId);
  const { shippingAddress } = useCheckoutShippingAddress(user);
  const { resolveIdentityForAddress, establishGuestCheckout, isEstablishingGuest, guestError } =
    useGuestCheckoutIdentity(user);
  const checkoutPayment = useCheckoutPayment();
  const {
    isProcessing,
    isCapturing,
    prepareStripeCardCheckout,
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
    isPayPalBrowserPending,
    isPayPalCapturing,
    isPayPalResuming,
    isStripeConfirming,
  } = checkoutPayment;

  const [selectedPayment, setSelectedPayment] = useState<PaymentMethodId>('paypal');
  const [formNotice, setFormNotice] = useState<string | null>(null);

  const hasPayPalReturnParams = isPayPalReturnRouteParams(route.params);

  const paymentError = getCheckoutPaymentErrorMessage(
    orderError,
    captureError,
    checkoutNotice,
    Boolean(captureResult),
  );

  const isConfirmingOrder =
    isCapturing || isPayPalCapturing || isPayPalResuming || isStripeConfirming;

  const showProcessingOverlay =
    !paymentError &&
    !captureResult &&
    (hasPayPalReturnParams || isConfirmingOrder);

  const processingVariant =
    isPayPalCapturing || isPayPalResuming || hasPayPalReturnParams || selectedPayment === 'paypal'
      ? 'paypal'
      : selectedPayment === 'stripe' || selectedPayment === 'applepay'
        ? 'stripe'
        : 'default';

  const hidePaymentFooter = Boolean(captureResult) || isConfirmingOrder || isPayPalBrowserPending;

  const showOrderSuccess = Boolean(captureResult);

  useEffect(() => {
    void resumePayPalFromRouteParams(route.params);
  }, [resumePayPalFromRouteParams, route.params]);

  useEffect(() => {
    if (!captureResult || !authUserId) {
      return;
    }

    void removeAppliedCoupon();
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

  const subtotalCad = useMemo(() => getCartSubtotalCad(cart, userInfo), [cart, userInfo]);
  const selectedShippingOptions = useMemo(() => resolveCartShippingOptions(cart), [cart]);
  const shippingCad = useMemo(
    () =>
      resolveCartShippingCad(
        cart,
        totalShippingRate,
        fetchedShippingRate,
        selectedShippingOptions,
        currencyRate,
      ),
    [cart, currencyRate, fetchedShippingRate, selectedShippingOptions, totalShippingRate],
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

  const paymentMethods = useMemo((): PaymentMethodPickerItem[] => {
    const stripeEnabled = !showKorapay && stripeConfigured;
    const korapayEnabled = showKorapay;
    const applePayEnabled = Platform.OS === 'ios' && applePaySupported && applePayBuildReady;

    const methods: PaymentMethodPickerItem[] = [];

    if (Platform.OS === 'ios') {
      methods.push({
        id: 'applepay',
        label: 'Apple Pay',
        subtitle: applePayEnabled
          ? 'Fast checkout on iPhone'
          : applePayBuildReady
            ? 'Apple Pay is not available on this device'
            : 'Requires a development build',
        disabled: !applePayEnabled,
        icon: 'logo-apple',
      });
    }

    methods.push({
      id: 'paypal',
      label: 'PayPal',
      subtitle: maskedPayerEmail ?? 'Pay with your PayPal account',
      icon: 'logo-paypal',
      external: true,
    });

    if (!showKorapay) {
      methods.push({
        id: 'stripe',
        label: 'Credit / Debit Card',
        subtitle: stripeConfigured ? 'Visa, Mastercard, and more' : 'Stripe is not configured',
        disabled: !stripeEnabled,
        icon: 'card-outline',
      });
    }

    if (showKorapay) {
      methods.push({
        id: 'korapay',
        label: 'Korapay',
        subtitle: 'Local payment methods for Nigeria and Africa',
        disabled: !korapayEnabled,
        icon: 'wallet-outline',
        external: true,
      });
    }

    return methods;
  }, [applePayBuildReady, applePaySupported, maskedPayerEmail, showKorapay, stripeConfigured]);

  const defaultPaymentMethod = useMemo((): PaymentMethodId => {
    const applePayOption = paymentMethods.find((method) => method.id === 'applepay');
    if (applePayOption && !applePayOption.disabled) {
      return 'applepay';
    }

    return 'paypal';
  }, [paymentMethods]);

  useEffect(() => {
    setSelectedPayment((current) => {
      const currentOption = paymentMethods.find((method) => method.id === current);
      if (currentOption && !currentOption.disabled) {
        return current;
      }

      return defaultPaymentMethod;
    });
  }, [defaultPaymentMethod, paymentMethods]);

  const handleBackPress = () => {
    if (captureResult) {
      resetStackAfterCheckoutToHome(navigation);
      return;
    }

    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigateToCartTab(navigation);
    }
  };

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
      grandTotal:
        subtotalCad +
        resolveWebParityShippingTotal(fetchedShippingRate, totalShippingRate, shippingCad) +
        totals.serviceChargeCad -
        discountAmount / (currencyRate > 0 ? currencyRate : 1),
    },
    currency,
    conversionRate: currencyRate,
    couponCode: appliedCoupon?.couponCode,
  });

  useEffect(() => {
    if (
      selectedPayment !== 'stripe' ||
      !stripeConfigured ||
      shippingPending ||
      totals.displayTotal == null
    ) {
      return;
    }

    const identity = resolveIdentityForAddress(shippingAddress);
    if (!identity) {
      return;
    }

    void prepareStripeCardCheckout(buildCheckoutParams(identity), totals.displayTotal, currency);
  }, [
    selectedPayment,
    stripeConfigured,
    shippingPending,
    totals.displayTotal,
    currency,
    shippingAddress,
    resolveIdentityForAddress,
    prepareStripeCardCheckout,
    cart,
    appliedCoupon,
    selectedShippingOptions,
    subtotalCad,
    shippingCad,
    discountAmount,
    currencyRate,
    fetchedShippingRate,
    totalShippingRate,
  ]);

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
    if (capturedOrderId) {
      resetStackAfterCheckoutToOrderDetail(navigation, capturedOrderId);
      return;
    }

    resetStackAfterCheckoutToOrders(navigation);
  };

  const handleContinueShopping = () => {
    resetStackAfterCheckoutToHome(navigation);
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
      <PaymentScreenHeader onBack={handleBackPress} />

      <View style={styles.stepsWrap}>
        <CheckoutStepIndicator currentStep="payment" />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onScroll={onMarketplaceScroll}
        {...marketplaceScrollProps}
      >
        <PaymentEditCartLink onPress={() => navigateToCartTab(navigation)} />

        <PaymentMethodPicker
          methods={paymentMethods}
          selectedMethod={selectedPayment}
          onSelectMethod={setSelectedPayment}
        />

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
        {paymentError && !showProcessingOverlay ? (
          <AppText variant="bodySmall" color="error">
            {paymentError}
          </AppText>
        ) : null}
        {createdOrderId && captureError && !captureResult ? (
          <AppButton
            label="Confirm PayPal payment"
            variant="primary"
            onPress={() => void retryCaptureForCreatedOrder()}
            loading={isPayPalCapturing}
          />
        ) : null}
        {formNotice ? (
          <AppText variant="bodySmall" color="error">
            {formNotice}
          </AppText>
        ) : null}
      </ScrollView>

      {!hidePaymentFooter ? (
        <PaymentMethodPickerFooter
          currency={currency}
          total={totals.displayTotal}
          shippingPending={shippingPending}
          onContinue={() => void handleConfirmPayment()}
          continueDisabled={
            totals.displayTotal == null || paymentFlowActive || isProcessing || isEstablishingGuest
          }
          hasFooterTabs
        />
      ) : null}

      <KorapayCheckoutWebView
        visible={Boolean(korapaySession)}
        checkoutUrl={korapaySession?.checkoutUrl ?? null}
        onComplete={() => void completeKorapayCheckout()}
        onCancel={cancelKorapayCheckout}
      />

      {showProcessingOverlay ? (
        <CheckoutProcessingLoader overlay variant={processingVariant} />
      ) : null}

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
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  stepsWrap: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.lg,
  },
  centeredState: {
    flex: 1,
    alignItems: 'stretch',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
    gap: spacing.md,
  },
  centeredCopy: {
    textAlign: 'center',
  },
});
