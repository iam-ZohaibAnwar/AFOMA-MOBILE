import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { PlatformPay } from '@stripe/stripe-react-native';

import { useStripeCheckoutActions } from '../../../app/providers/StripeCheckoutContext';
import { isStripeNativeSupported } from '../../../app/utils/isStripeNativeSupported';

import { getErrorMessage } from '../../../services/api/errors';
import {
  createStripePaymentIntent,
  extractStripeClientSecret,
  initializeKorapayCheckout,
} from '../../../services/api/paymentsApi';
import { extractPayPalApprovalUrl } from '../../../services/api/ordersApi';
import type { CreateCheckoutOrderRequest } from '../../../services/types/order';
import { buildCheckoutOrderPayload, type CheckoutOrderParams } from '../utils/buildCheckoutOrderPayload';
import { openPayPalAuthSession } from '../utils/openPayPalAuthSession';
import {
  isPayPalApprovalCompleteUrl,
  isPayPalCheckoutCancelledUrl,
  resolvePayPalOrderIdForCapture,
} from '../utils/paypalReturnUrl';
import { resolvePayPalCheckoutCurrency, resolvePayPalConversionRate } from '../utils/paypalCheckoutCurrency';
import { toStripeAmount } from '../utils/toStripeAmount';
import { useCheckoutCapture } from './useCheckoutCapture';
import { usePlaceOrder } from './usePlaceOrder';

export interface PayPalApprovalSession {
  orderId: string;
  approvalUrl: string;
  params: CheckoutOrderParams;
}

export interface KorapayCheckoutSession {
  checkoutUrl: string;
  reference: string;
  params: CheckoutOrderParams;
}

export interface StripeCardSession {
  clientSecret: string;
  params: CheckoutOrderParams;
}

export function useCheckoutPayment() {
  const {
    isPlacingOrder,
    orderError,
    createdOrderId,
    placeOrder,
    resetOrderState,
    getLastPayPalCaptureContext,
  } = usePlaceOrder();
  const {
    isCapturing,
    captureError,
    captureResult,
    captureCheckoutPayment,
    capturePayPalOrderWithRetry,
  } = useCheckoutCapture();
  const stripeActions = useStripeCheckoutActions();

  const [korapaySession, setKorapaySession] = useState<KorapayCheckoutSession | null>(null);
  const [stripeCardSession, setStripeCardSession] = useState<StripeCardSession | null>(null);
  const [checkoutNotice, setCheckoutNotice] = useState<string | null>(null);
  const [isStripeInitializing, setIsStripeInitializing] = useState(false);
  const [isKorapayInitializing, setIsKorapayInitializing] = useState(false);
  const [applePaySupported, setApplePaySupported] = useState(Platform.OS === 'ios');
  const [isPayPalBrowserPending, setIsPayPalBrowserPending] = useState(false);
  const [isPayPalCapturing, setIsPayPalCapturing] = useState(false);
  const isPayPalFlowActiveRef = useRef(false);

  const resetCheckoutPayment = useCallback(() => {
    resetOrderState();
    setKorapaySession(null);
    setStripeCardSession(null);
    setCheckoutNotice(null);
    setIsPayPalBrowserPending(false);
    isPayPalFlowActiveRef.current = false;
  }, [resetOrderState]);

  const runPayPalBrowserCheckout = useCallback(
    async (
      orderId: string,
      approvalUrl: string,
      params: CheckoutOrderParams,
      createPayload: CreateCheckoutOrderRequest,
    ) => {
      if (isPayPalFlowActiveRef.current) {
        return false;
      }

      isPayPalFlowActiveRef.current = true;
      setIsPayPalBrowserPending(true);
      setCheckoutNotice(
        'Complete payment in PayPal, then close the browser to return to the app.',
      );

      try {
        const authResult = await openPayPalAuthSession(approvalUrl);

        if (authResult.status === 'cancelled') {
          setCheckoutNotice('PayPal checkout was cancelled.');
          return false;
        }

        if (authResult.status === 'approved') {
          if (isPayPalCheckoutCancelledUrl(authResult.returnUrl)) {
            setCheckoutNotice('PayPal checkout was cancelled.');
            return false;
          }

          if (!isPayPalApprovalCompleteUrl(authResult.returnUrl)) {
            setCheckoutNotice('PayPal payment was not completed. Please try again.');
            return false;
          }
        }

        setIsPayPalBrowserPending(false);
        setIsPayPalCapturing(true);
        setCheckoutNotice(null);

        const captureOrderId = resolvePayPalOrderIdForCapture(
          orderId,
          authResult.status === 'approved' ? authResult.returnUrl : undefined,
        );
        const retryAttempts = authResult.status === 'dismissed' ? 3 : 1;
        const result = await capturePayPalOrderWithRetry(
          captureOrderId,
          params,
          createPayload,
          retryAttempts,
        );
        if (!result) {
          setCheckoutNotice(
            authResult.status === 'dismissed'
              ? 'PayPal payment could not be confirmed. If you were charged, contact support.'
              : 'PayPal approved your payment, but order confirmation failed. Please contact support if you were charged.',
          );
          return false;
        }

        return true;
      } catch (err) {
        setCheckoutNotice(getErrorMessage(err, 'Failed to complete PayPal payment'));
        return false;
      } finally {
        isPayPalFlowActiveRef.current = false;
        setIsPayPalBrowserPending(false);
        setIsPayPalCapturing(false);
      }
    },
    [capturePayPalOrderWithRetry],
  );

  const startPayPalCheckout = useCallback(
    async (params: CheckoutOrderParams) => {
      setCheckoutNotice(null);

      const paypalCurrency = resolvePayPalCheckoutCurrency(
        { currency: params.currency, currencyRate: params.conversionRate, country: params.shippingAddress.country },
        params.shippingAddress.country,
      );
      const paypalConversionRate = resolvePayPalConversionRate(
        { currency: params.currency, currencyRate: params.conversionRate, country: params.shippingAddress.country },
        paypalCurrency,
      );

      const paypalParams: CheckoutOrderParams = {
        ...params,
        currency: paypalCurrency,
        conversionRate: paypalConversionRate,
        displayCurrency: params.currency,
        displayConversionRate: params.conversionRate,
      };

      const orderResult = await placeOrder(paypalParams);
      if (!orderResult) {
        return false;
      }

      return runPayPalBrowserCheckout(
        orderResult.orderId,
        orderResult.approvalUrl,
        paypalParams,
        orderResult.createPayload,
      );
    },
    [placeOrder, runPayPalBrowserCheckout],
  );

  const startKorapayCheckout = useCallback(async (params: CheckoutOrderParams) => {
    setIsKorapayInitializing(true);
    setCheckoutNotice(null);

    try {
      const payload = buildCheckoutOrderPayload(params);
      const response = await initializeKorapayCheckout(payload);

      if (!response.success || !response.checkout_url || !response.reference) {
        throw new Error(response.message || 'Could not start Korapay checkout');
      }

      setKorapaySession({
        checkoutUrl: response.checkout_url,
        reference: response.reference,
        params,
      });
      return true;
    } catch (err) {
      setCheckoutNotice(getErrorMessage(err, 'Could not start Korapay checkout'));
      return false;
    } finally {
      setIsKorapayInitializing(false);
    }
  }, []);

  const completeKorapayCheckout = useCallback(async () => {
    if (!korapaySession) {
      return;
    }

    const { reference, params } = korapaySession;
    setKorapaySession(null);

    try {
      await captureCheckoutPayment(reference, params, 'korapay');
    } catch (err) {
      setCheckoutNotice(getErrorMessage(err, 'Failed to complete Korapay payment'));
    }
  }, [captureCheckoutPayment, korapaySession]);

  const cancelKorapayCheckout = useCallback(() => {
    setKorapaySession(null);
    setCheckoutNotice('Korapay checkout was cancelled.');
  }, []);

  const createStripeClientSecret = useCallback(async (displayAmount: number, currency: string) => {
    const response = await createStripePaymentIntent({
      amount: toStripeAmount(displayAmount, currency),
      currency_code: currency.toLowerCase(),
      productName: 'Product',
    });

    const clientSecret = extractStripeClientSecret(response);
    if (!clientSecret) {
      throw new Error('Stripe payment could not be initialized');
    }

    return clientSecret;
  }, []);

  const startStripeCardCheckout = useCallback(
    async (params: CheckoutOrderParams, displayAmount: number, currency: string) => {
      if (!isStripeNativeSupported() || !stripeActions) {
        setCheckoutNotice('Card payments require a development build. PayPal is available in Expo Go.');
        return false;
      }

      setIsStripeInitializing(true);
      setCheckoutNotice(null);

      try {
        const clientSecret = await createStripeClientSecret(displayAmount, currency);
        setStripeCardSession({ clientSecret, params });
        return true;
      } catch (err) {
        setCheckoutNotice(getErrorMessage(err, 'Could not start card payment'));
        return false;
      } finally {
        setIsStripeInitializing(false);
      }
    },
    [createStripeClientSecret, stripeActions],
  );

  const completeStripeCardPayment = useCallback(
    async (billing: { name: string; email: string }) => {
      if (!stripeCardSession || !stripeActions) {
        return;
      }

      const { clientSecret, params } = stripeCardSession;

      try {
        const { error, paymentIntent } = await stripeActions.confirmPayment(clientSecret, {
          paymentMethodType: 'Card',
          paymentMethodData: {
            billingDetails: {
              name: billing.name,
              email: billing.email,
            },
          },
        });

        if (error) {
          throw new Error(error.message || 'Card payment failed');
        }

        if (paymentIntent?.status !== 'Succeeded' || !paymentIntent.id) {
          throw new Error('Card payment was not completed');
        }

        setStripeCardSession(null);
        await captureCheckoutPayment(paymentIntent.id, params, 'stripe');
      } catch (err) {
        setCheckoutNotice(getErrorMessage(err, 'Card payment failed'));
      }
    },
    [captureCheckoutPayment, stripeActions, stripeCardSession],
  );

  const cancelStripeCardCheckout = useCallback(() => {
    setStripeCardSession(null);
    setCheckoutNotice('Card payment was cancelled.');
  }, []);

  const checkApplePaySupport = useCallback(async () => {
    if (Platform.OS !== 'ios' || !stripeActions) {
      setApplePaySupported(false);
      return false;
    }

    try {
      const supported = await stripeActions.isPlatformPaySupported();
      setApplePaySupported(supported);
      return supported;
    } catch {
      setApplePaySupported(false);
      return false;
    }
  }, [stripeActions]);

  const startApplePayCheckout = useCallback(
    async (params: CheckoutOrderParams, displayAmount: number, currency: string) => {
      if (!isStripeNativeSupported() || !stripeActions) {
        setCheckoutNotice('Apple Pay requires a development build. PayPal is available in Expo Go.');
        return false;
      }

      setIsStripeInitializing(true);
      setCheckoutNotice(null);

      try {
        const supported = await checkApplePaySupport();
        if (!supported) {
          throw new Error('Apple Pay is not available on this device');
        }

        const clientSecret = await createStripeClientSecret(displayAmount, currency);
        const { error, paymentIntent } = await stripeActions.confirmPlatformPayPayment(clientSecret, {
          applePay: {
            cartItems: [
              {
                label: 'AFOMA Order',
                amount: displayAmount.toFixed(2),
                paymentType: PlatformPay.PaymentType.Immediate,
              },
            ],
            merchantCountryCode: 'CA',
            currencyCode: currency.toUpperCase(),
          },
        });

        if (error) {
          throw new Error(error.message || 'Apple Pay failed');
        }

        if (paymentIntent?.status !== 'Succeeded' || !paymentIntent.id) {
          throw new Error('Apple Pay was not completed');
        }

        await captureCheckoutPayment(paymentIntent.id, params, 'stripe');
        return true;
      } catch (err) {
        setCheckoutNotice(getErrorMessage(err, 'Apple Pay failed'));
        return false;
      } finally {
        setIsStripeInitializing(false);
      }
    },
    [
      captureCheckoutPayment,
      checkApplePaySupport,
      createStripeClientSecret,
      stripeActions,
    ],
  );

  const continuePayPalCheckout = useCallback(
    async (paypalOrderId: string, params: CheckoutOrderParams) => {
      setCheckoutNotice(null);
      const context = getLastPayPalCaptureContext();
      const checkoutParams = context?.checkoutParams ?? params;
      const createPayload = context?.createPayload ?? buildCheckoutOrderPayload(checkoutParams);

      return runPayPalBrowserCheckout(
        paypalOrderId,
        extractPayPalApprovalUrl({}, paypalOrderId),
        checkoutParams,
        createPayload,
      );
    },
    [getLastPayPalCaptureContext, runPayPalBrowserCheckout],
  );

  const retryCaptureForCreatedOrder = useCallback(async () => {
    const context = getLastPayPalCaptureContext();
    if (!context) {
      setCheckoutNotice('No PayPal order is available to confirm.');
      return false;
    }

    setCheckoutNotice(null);
    setIsPayPalCapturing(true);

    try {
      const result = await capturePayPalOrderWithRetry(
        context.orderId,
        context.checkoutParams,
        context.createPayload,
        3,
      );

      if (!result) {
        setCheckoutNotice('PayPal payment could not be confirmed. If you were charged, contact support.');
        return false;
      }

      return true;
    } finally {
      setIsPayPalCapturing(false);
    }
  }, [capturePayPalOrderWithRetry, getLastPayPalCaptureContext]);

  const isProcessing =
    isPlacingOrder ||
    isCapturing ||
    isPayPalBrowserPending ||
    isPayPalCapturing ||
    isStripeInitializing ||
    isKorapayInitializing ||
    Boolean(korapaySession) ||
    Boolean(stripeCardSession);

  return {
    isPlacingOrder,
    isCapturing,
    isPayPalCapturing,
    isPayPalBrowserPending,
    isStripeInitializing,
    isKorapayInitializing,
    isOpeningPayPal: isPayPalBrowserPending,
    isProcessing,
    orderError,
    captureError,
    captureResult,
    createdOrderId,
    checkoutNotice,
    korapaySession,
    stripeCardSession,
    applePaySupported,
    checkApplePaySupport,
    startPayPalCheckout,
    continuePayPalCheckout,
    startKorapayCheckout,
    completeKorapayCheckout,
    cancelKorapayCheckout,
    startStripeCardCheckout,
    completeStripeCardPayment,
    cancelStripeCardCheckout,
    startApplePayCheckout,
    retryCaptureForCreatedOrder,
    resetCheckoutPayment,
  };
}

export function getCheckoutPaymentErrorMessage(
  orderError: string | null,
  captureError: string | null,
  checkoutNotice: string | null,
  fallback = 'Failed to process payment',
): string | null {
  return orderError || captureError || checkoutNotice || null;
}

export function formatCheckoutPaymentFailure(err: unknown, fallback: string): string {
  return getErrorMessage(err, fallback);
}

/** @deprecated Use useCheckoutPayment */
export const usePayPalCheckout = useCheckoutPayment;

/** @deprecated Use getCheckoutPaymentErrorMessage */
export const getPayPalCheckoutErrorMessage = getCheckoutPaymentErrorMessage;

/** @deprecated Use formatCheckoutPaymentFailure */
export const formatPayPalCheckoutFailure = formatCheckoutPaymentFailure;
