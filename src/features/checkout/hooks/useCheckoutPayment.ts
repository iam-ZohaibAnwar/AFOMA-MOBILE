import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Linking, Platform } from 'react-native';
import { PlatformPay } from '@stripe/stripe-react-native';
import * as WebBrowser from 'expo-web-browser';

import { useStripeCheckoutActions } from '../../../app/providers/StripeCheckoutContext';
import {
  isStripeCardCheckoutSupported,
  isStripePlatformPaySupported,
} from '../../../app/utils/isStripeNativeSupported';

import { getErrorMessage } from '../../../services/api/errors';
import {
  createStripePaymentIntent,
  extractStripeClientSecret,
  initializeKorapayCheckout,
} from '../../../services/api/paymentsApi';
import { extractPayPalApprovalUrl } from '../../../services/api/ordersApi';
import {
  clearPayPalPendingSession,
  loadPayPalPendingSession,
  savePayPalPendingSession,
  type PayPalPendingSession,
} from '../../../services/storage/paypalPendingSessionStorage';
import type { CreateCheckoutOrderRequest } from '../../../services/types/order';
import { buildCheckoutOrderPayload, type CheckoutOrderParams } from '../utils/buildCheckoutOrderPayload';
import { buildStripeBillingDetails } from '../utils/buildStripeBillingDetails';
import { extractPaymentIntentId } from '../utils/extractPaymentIntentId';
import { openPayPalAuthSession } from '../utils/openPayPalAuthSession';
import {
  isPayPalApprovalCompleteUrl,
  isPayPalCheckoutCancelledUrl,
  resolvePayPalOrderIdForCapture,
} from '../utils/paypalReturnUrl';
import { resolvePayPalCheckoutCurrency, resolvePayPalConversionRate } from '../utils/paypalCheckoutCurrency';
import { resolveStripeReturnUrl } from '../utils/resolveStripeReturnUrl';
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

export interface PaymentRoutePayPalParams {
  token?: string;
  PayerID?: string;
  payerID?: string;
  cancel?: string;
}

function buildReturnUrlFromRouteParams(params: PaymentRoutePayPalParams): string | null {
  if (params.cancel === 'true') {
    return 'afoma://checkout/paypal?cancel=true';
  }

  const token = params.token?.trim();
  const payerId = params.PayerID?.trim() || params.payerID?.trim();

  if (!token && !payerId) {
    return null;
  }

  const query = new URLSearchParams();
  if (token) {
    query.set('token', token);
  }
  if (payerId) {
    query.set('PayerID', payerId);
  }

  return `afoma://checkout/paypal?${query.toString()}`;
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
  const [checkoutNotice, setCheckoutNotice] = useState<string | null>(null);
  const [isStripeInitializing, setIsStripeInitializing] = useState(false);
  const [isKorapayInitializing, setIsKorapayInitializing] = useState(false);
  const [applePaySupported, setApplePaySupported] = useState(Platform.OS === 'ios');
  const [isPayPalBrowserPending, setIsPayPalBrowserPending] = useState(false);
  const [isPayPalCapturing, setIsPayPalCapturing] = useState(false);
  const isPayPalFlowActiveRef = useRef(false);
  const isPayPalBrowserPendingRef = useRef(false);
  const resumePayPalInFlightRef = useRef(false);
  const memoryPendingSessionRef = useRef<PayPalPendingSession | null>(null);
  const captureResultRef = useRef(captureResult);

  useEffect(() => {
    captureResultRef.current = captureResult;
  }, [captureResult]);

  const resetCheckoutPayment = useCallback(() => {
    resetOrderState();
    memoryPendingSessionRef.current = null;
    void clearPayPalPendingSession();
    setKorapaySession(null);
    setCheckoutNotice(null);
    setIsPayPalBrowserPending(false);
    isPayPalBrowserPendingRef.current = false;
    isPayPalFlowActiveRef.current = false;
  }, [resetOrderState]);

  const resolvePendingPayPalSession = useCallback(async (): Promise<PayPalPendingSession | null> => {
    if (memoryPendingSessionRef.current) {
      return memoryPendingSessionRef.current;
    }

    const stored = await loadPayPalPendingSession();
    if (stored) {
      memoryPendingSessionRef.current = stored;
    }

    return stored;
  }, []);

  const captureApprovedPayPalReturn = useCallback(
    async (
      returnUrl: string | undefined,
      fallbackSession: PayPalPendingSession | null,
      options?: { quiet?: boolean },
    ) => {
      if (captureResultRef.current?.paymentMethod === 'paypal') {
        memoryPendingSessionRef.current = null;
        await clearPayPalPendingSession();
        return true;
      }

      const memoryContext = getLastPayPalCaptureContext();
      const pendingSession = fallbackSession ?? memoryPendingSessionRef.current ?? (await loadPayPalPendingSession());

      const orderId = pendingSession?.orderId ?? memoryContext?.orderId;
      const checkoutParams = pendingSession?.checkoutParams ?? memoryContext?.checkoutParams;
      const createPayload = pendingSession?.createPayload ?? memoryContext?.createPayload;

      if (!orderId || !checkoutParams || !createPayload) {
        if (!options?.quiet) {
          setCheckoutNotice('PayPal payment was approved, but checkout details were lost. Please contact support if you were charged.');
        }
        return false;
      }

      setIsPayPalBrowserPending(false);
      isPayPalBrowserPendingRef.current = false;
      setIsPayPalCapturing(true);
      setCheckoutNotice(null);

      try {
        const captureOrderId = resolvePayPalOrderIdForCapture(orderId, returnUrl);
        const result = await capturePayPalOrderWithRetry(
          captureOrderId,
          checkoutParams,
          createPayload,
          3,
        );

        if (!result) {
          if (!options?.quiet && !captureResultRef.current) {
            setCheckoutNotice(
              returnUrl
                ? 'PayPal approved your payment, but order confirmation failed. Please contact support if you were charged.'
                : 'PayPal payment could not be confirmed. If you were charged, contact support.',
            );
          }
          return Boolean(captureResultRef.current);
        }

        memoryPendingSessionRef.current = null;
        await clearPayPalPendingSession();
        setCheckoutNotice(null);
        return true;
      } catch (err) {
        if (!options?.quiet && !captureResultRef.current) {
          setCheckoutNotice(getErrorMessage(err, 'Failed to complete PayPal payment'));
        }
        return Boolean(captureResultRef.current);
      } finally {
        isPayPalFlowActiveRef.current = false;
        setIsPayPalCapturing(false);
      }
    },
    [capturePayPalOrderWithRetry, getLastPayPalCaptureContext],
  );

  const tryAutoCapturePendingPayPal = useCallback(async () => {
    if (
      resumePayPalInFlightRef.current ||
      captureResult ||
      isPayPalCapturing ||
      !isPayPalBrowserPendingRef.current
    ) {
      return false;
    }

    const session = memoryPendingSessionRef.current ?? (await loadPayPalPendingSession());
    if (!session) {
      return false;
    }

    resumePayPalInFlightRef.current = true;

    try {
      const success = await captureApprovedPayPalReturn(undefined, session, { quiet: true });
      if (success) {
        isPayPalFlowActiveRef.current = false;
        isPayPalBrowserPendingRef.current = false;
        setIsPayPalBrowserPending(false);
        void WebBrowser.dismissBrowser();
      }
      return success;
    } finally {
      resumePayPalInFlightRef.current = false;
    }
  }, [captureApprovedPayPalReturn, captureResult, isPayPalCapturing]);

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

      const pendingSession: PayPalPendingSession = {
        orderId,
        approvalUrl,
        createPayload,
        checkoutParams: params,
        startedAt: Date.now(),
      };

      memoryPendingSessionRef.current = pendingSession;
      await savePayPalPendingSession(pendingSession);
      isPayPalFlowActiveRef.current = true;
      isPayPalBrowserPendingRef.current = true;
      setIsPayPalBrowserPending(true);
      setCheckoutNotice(
        'PayPal opens in your browser so you can paste credentials and use saved passwords. Return here after approving payment.',
      );

      try {
        const authResult = await openPayPalAuthSession(approvalUrl);

        if (authResult.status === 'cancelled') {
          setCheckoutNotice('PayPal checkout was cancelled.');
          memoryPendingSessionRef.current = null;
          await clearPayPalPendingSession();
          return false;
        }

        if (authResult.status === 'approved') {
          if (isPayPalCheckoutCancelledUrl(authResult.returnUrl)) {
            setCheckoutNotice('PayPal checkout was cancelled.');
            memoryPendingSessionRef.current = null;
            await clearPayPalPendingSession();
            return false;
          }

          if (!isPayPalApprovalCompleteUrl(authResult.returnUrl)) {
            setCheckoutNotice('PayPal payment was not completed. Please try again.');
            return false;
          }

          return captureApprovedPayPalReturn(authResult.returnUrl, pendingSession);
        }

        return captureApprovedPayPalReturn(undefined, pendingSession);
      } catch (err) {
        setCheckoutNotice(getErrorMessage(err, 'Failed to complete PayPal payment'));
        return false;
      } finally {
        isPayPalFlowActiveRef.current = false;
        isPayPalBrowserPendingRef.current = false;
        setIsPayPalBrowserPending(false);
        void WebBrowser.dismissBrowser();
      }
    },
    [captureApprovedPayPalReturn],
  );

  const resumePayPalFromReturnUrl = useCallback(
    async (returnUrl: string) => {
      if (resumePayPalInFlightRef.current || captureResult) {
        return false;
      }

      if (isPayPalCheckoutCancelledUrl(returnUrl)) {
        setCheckoutNotice('PayPal checkout was cancelled.');
        memoryPendingSessionRef.current = null;
        await clearPayPalPendingSession();
        return false;
      }

      if (!isPayPalApprovalCompleteUrl(returnUrl)) {
        return false;
      }

      resumePayPalInFlightRef.current = true;

      try {
        const pendingSession = await resolvePendingPayPalSession();
        return captureApprovedPayPalReturn(returnUrl, pendingSession);
      } finally {
        resumePayPalInFlightRef.current = false;
      }
    },
    [captureApprovedPayPalReturn, captureResult, resolvePendingPayPalSession],
  );

  const resumePayPalFromRouteParams = useCallback(
    async (params?: PaymentRoutePayPalParams) => {
      if (!params) {
        return false;
      }

      const returnUrl = buildReturnUrlFromRouteParams(params);
      if (!returnUrl) {
        return false;
      }

      return resumePayPalFromReturnUrl(returnUrl);
    },
    [resumePayPalFromReturnUrl],
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

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        void tryAutoCapturePendingPayPal();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [tryAutoCapturePendingPayPal]);

  useEffect(() => {
    const handleIncomingUrl = (url: string) => {
      if (!url.includes('checkout/paypal') && !url.includes('thank-you') && !url.includes('payment-success')) {
        return;
      }

      void resumePayPalFromReturnUrl(url);
    };

    void Linking.getInitialURL().then((initialUrl) => {
      if (initialUrl) {
        handleIncomingUrl(initialUrl);
      }
    });

    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleIncomingUrl(url);
    });

    return () => {
      subscription.remove();
    };
  }, [resumePayPalFromReturnUrl]);

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
      if (!isStripeCardCheckoutSupported() || !stripeActions) {
        setCheckoutNotice('Card payments are unavailable. Add EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY to continue.');
        return false;
      }

      setIsStripeInitializing(true);
      setCheckoutNotice(null);

      try {
        const clientSecret = await createStripeClientSecret(displayAmount, currency);
        const { error: initError } = await stripeActions.initPaymentSheet({
          merchantDisplayName: 'AFOMA Marketplace',
          paymentIntentClientSecret: clientSecret,
          defaultBillingDetails: buildStripeBillingDetails(params),
          allowsDelayedPaymentMethods: false,
          returnURL: resolveStripeReturnUrl(),
          appearance: {
            colors: {
              primary: '#1F628E',
              background: '#FFFFFF',
              componentBackground: '#FFFFFF',
              componentBorder: '#E2E8F0',
              componentDivider: '#FED7AA',
              primaryText: '#172554',
              secondaryText: '#475569',
              placeholderText: '#94A3B8',
              icon: '#1F628E',
            },
            shapes: {
              borderRadius: 12,
            },
          },
        });

        if (initError) {
          throw new Error(initError.message || 'Could not open secure card checkout');
        }

        setIsStripeInitializing(false);

        const { error: presentError } = await stripeActions.presentPaymentSheet();

        if (presentError) {
          if (presentError.code === 'Canceled') {
            setCheckoutNotice('Card payment was cancelled.');
            return false;
          }

          throw new Error(presentError.message || 'Card payment failed');
        }

        const paymentIntentId = extractPaymentIntentId(clientSecret);
        const result = await captureCheckoutPayment(paymentIntentId, params, 'stripe');

        if (!result) {
          if (!captureResultRef.current) {
            setCheckoutNotice('Your card was charged, but order confirmation failed. Check My Orders or contact support.');
          }
          return Boolean(captureResultRef.current);
        }

        setCheckoutNotice(null);
        return true;
      } catch (err) {
        if (!captureResultRef.current) {
          setCheckoutNotice(getErrorMessage(err, 'Could not complete card payment'));
        }
        return Boolean(captureResultRef.current);
      } finally {
        setIsStripeInitializing(false);
      }
    },
    [captureCheckoutPayment, createStripeClientSecret, stripeActions],
  );

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
      if (!isStripePlatformPaySupported() || !stripeActions) {
        setCheckoutNotice('Apple Pay requires a development build. Use card or PayPal in Expo Go.');
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
    const pendingSession = await resolvePendingPayPalSession();

    const orderId = pendingSession?.orderId ?? context?.orderId;
    const checkoutParams = pendingSession?.checkoutParams ?? context?.checkoutParams;
    const createPayload = pendingSession?.createPayload ?? context?.createPayload;

    if (!orderId || !checkoutParams || !createPayload) {
      setCheckoutNotice('No PayPal order is available to confirm.');
      return false;
    }

    setCheckoutNotice(null);
    setIsPayPalCapturing(true);

    try {
      const result = await capturePayPalOrderWithRetry(
        orderId,
        checkoutParams,
        createPayload,
        3,
      );

      if (!result) {
        setCheckoutNotice('PayPal payment could not be confirmed. If you were charged, contact support.');
        return false;
      }

      memoryPendingSessionRef.current = null;
      await clearPayPalPendingSession();
      return true;
    } finally {
      setIsPayPalCapturing(false);
    }
  }, [capturePayPalOrderWithRetry, getLastPayPalCaptureContext, resolvePendingPayPalSession]);

  const isProcessing =
    isPlacingOrder ||
    isCapturing ||
    isPayPalBrowserPending ||
    isPayPalCapturing ||
    isStripeInitializing ||
    isKorapayInitializing ||
    Boolean(korapaySession);

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
    applePaySupported,
    checkApplePaySupport,
    startPayPalCheckout,
    continuePayPalCheckout,
    resumePayPalFromRouteParams,
    resumePayPalFromReturnUrl,
    startKorapayCheckout,
    completeKorapayCheckout,
    cancelKorapayCheckout,
    startStripeCardCheckout,
    startApplePayCheckout,
    retryCaptureForCreatedOrder,
    resetCheckoutPayment,
  };
}

export function getCheckoutPaymentErrorMessage(
  orderError: string | null,
  captureError: string | null,
  checkoutNotice: string | null,
  hasSuccessfulCapture = false,
  fallback = 'Failed to process payment',
): string | null {
  if (hasSuccessfulCapture) {
    return null;
  }

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
