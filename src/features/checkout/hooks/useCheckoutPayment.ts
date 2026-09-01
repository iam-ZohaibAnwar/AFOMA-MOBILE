import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Linking, Platform } from 'react-native';
import { PlatformPay } from '@stripe/stripe-react-native';
import * as WebBrowser from 'expo-web-browser';

import { useStripeCheckoutActions } from '../../../app/providers/StripeCheckoutContext';
import {
  isStripeCardCheckoutSupported,
  isStripePlatformPaySupported,
} from '../../../app/utils/isStripeNativeSupported';
import { colors } from '../../../design-system';

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
import { resolveKorapayAuthRedirectUrl } from '../utils/resolveKorapayMobileRedirectUrl';
import { buildStripeBillingDetails } from '../utils/buildStripeBillingDetails';
import { formatStripeCheckoutError } from '../utils/formatStripeCheckoutError';
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

export function isPayPalReturnRouteParams(params?: PaymentRoutePayPalParams): boolean {
  if (!params || params.cancel === 'true') {
    return false;
  }

  const token = params.token?.trim();
  const payerId = params.PayerID?.trim() || params.payerID?.trim();
  return Boolean(token || payerId);
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

interface StripePreparedCheckout {
  fingerprint: string;
  clientSecret: string;
}

function buildStripePrepareFingerprint(
  displayAmount: number,
  currency: string,
  params: CheckoutOrderParams,
): string {
  const address = params.shippingAddress;

  return [
    displayAmount.toFixed(2),
    currency.toUpperCase(),
    address.email.trim(),
    address.zip.trim(),
  ].join('|');
}

function buildStripePaymentSheetOptions(clientSecret: string, params: CheckoutOrderParams) {
  return {
    merchantDisplayName: 'AFOMA Marketplace',
    paymentIntentClientSecret: clientSecret,
    defaultBillingDetails: buildStripeBillingDetails(params),
    allowsDelayedPaymentMethods: false,
    link: {
      display: 'never' as const,
    },
    returnURL: resolveStripeReturnUrl(),
    appearance: {
      colors: {
        primary: colors.primary,
        background: colors.surfaceWhite,
        componentBackground: colors.surfaceWhite,
        componentBorder: colors.borderStrong,
        componentDivider: colors.border,
        primaryText: colors.textPrimary,
        secondaryText: colors.textSecondary,
        componentText: colors.textPrimary,
        placeholderText: colors.textSubtle,
        icon: colors.primary,
        error: colors.error,
      },
      shapes: {
        borderRadius: 12,
      },
    },
  };
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
  const stripePreparedRef = useRef<StripePreparedCheckout | null>(null);
  const stripePrefetchPromiseRef = useRef<Promise<boolean> | null>(null);
  const stripeCheckoutInFlightRef = useRef(false);
  const [isKorapayInitializing, setIsKorapayInitializing] = useState(false);
  const [isStripeConfirming, setIsStripeConfirming] = useState(false);
  const [applePaySupported, setApplePaySupported] = useState(Platform.OS === 'ios');
  const [isPayPalBrowserPending, setIsPayPalBrowserPending] = useState(false);
  const [isPayPalCapturing, setIsPayPalCapturing] = useState(false);
  const [isPayPalResuming, setIsPayPalResuming] = useState(false);
  const isPayPalFlowActiveRef = useRef(false);
  const isPayPalBrowserPendingRef = useRef(false);
  const resumePayPalInFlightRef = useRef(false);
  const memoryPendingSessionRef = useRef<PayPalPendingSession | null>(null);
  const pendingPayPalApprovalUrlRef = useRef<string | null>(null);
  const captureResultRef = useRef(captureResult);

  useEffect(() => {
    captureResultRef.current = captureResult;
  }, [captureResult]);

  const resetCheckoutPayment = useCallback(() => {
    resetOrderState();
    memoryPendingSessionRef.current = null;
    pendingPayPalApprovalUrlRef.current = null;
    void clearPayPalPendingSession();
    setKorapaySession(null);
    setCheckoutNotice(null);
    setIsPayPalBrowserPending(false);
    setIsPayPalCapturing(false);
    setIsStripeConfirming(false);
    isPayPalBrowserPendingRef.current = false;
    isPayPalFlowActiveRef.current = false;
  }, [resetOrderState]);

  const clearPayPalPendingFlow = useCallback((message?: string) => {
    memoryPendingSessionRef.current = null;
    pendingPayPalApprovalUrlRef.current = null;
    isPayPalFlowActiveRef.current = false;
    isPayPalBrowserPendingRef.current = false;
    setIsPayPalBrowserPending(false);
    setIsPayPalCapturing(false);
    if (message) {
      setCheckoutNotice(message);
    }
    void clearPayPalPendingSession();
    void WebBrowser.dismissBrowser();
  }, []);

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

    const approvalReturnUrl = pendingPayPalApprovalUrlRef.current;
    if (!approvalReturnUrl || !isPayPalApprovalCompleteUrl(approvalReturnUrl)) {
      return false;
    }

    resumePayPalInFlightRef.current = true;

    try {
      const success = await captureApprovedPayPalReturn(approvalReturnUrl, session, { quiet: true });
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

      try {
        const authResult = await openPayPalAuthSession(approvalUrl);

        if (authResult.status === 'cancelled') {
          clearPayPalPendingFlow('PayPal checkout was cancelled.');
          return false;
        }

        if (authResult.status === 'approved') {
          if (isPayPalCheckoutCancelledUrl(authResult.returnUrl)) {
            clearPayPalPendingFlow('PayPal checkout was cancelled.');
            return false;
          }

          if (!isPayPalApprovalCompleteUrl(authResult.returnUrl)) {
            setCheckoutNotice('PayPal payment was not completed. Please try again.');
            return false;
          }

          pendingPayPalApprovalUrlRef.current = authResult.returnUrl;
          return captureApprovedPayPalReturn(authResult.returnUrl, pendingSession);
        }

        clearPayPalPendingFlow('PayPal checkout was cancelled.');
        return false;
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
    [captureApprovedPayPalReturn, clearPayPalPendingFlow],
  );

  const resumePayPalFromReturnUrl = useCallback(
    async (returnUrl: string) => {
      if (resumePayPalInFlightRef.current || captureResult) {
        return false;
      }

      if (isPayPalCheckoutCancelledUrl(returnUrl)) {
        clearPayPalPendingFlow('PayPal checkout was cancelled.');
        return false;
      }

      if (!isPayPalApprovalCompleteUrl(returnUrl)) {
        return false;
      }

      pendingPayPalApprovalUrlRef.current = returnUrl;

      resumePayPalInFlightRef.current = true;
      setIsPayPalResuming(true);

      try {
        const pendingSession = await resolvePendingPayPalSession();
        return captureApprovedPayPalReturn(returnUrl, pendingSession);
      } finally {
        resumePayPalInFlightRef.current = false;
        setIsPayPalResuming(false);
      }
    },
    [captureApprovedPayPalReturn, captureResult, clearPayPalPendingFlow, resolvePendingPayPalSession],
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
      const payload = {
        ...buildCheckoutOrderPayload(params),
        redirect_url: resolveKorapayAuthRedirectUrl(),
      };
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
    setIsStripeConfirming(true);

    try {
      await captureCheckoutPayment(reference, params, 'korapay');
    } catch (err) {
      setCheckoutNotice(getErrorMessage(err, 'Failed to complete Korapay payment'));
    } finally {
      setIsStripeConfirming(false);
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

  const initializeStripePaymentSheet = useCallback(
    async (clientSecret: string, params: CheckoutOrderParams) => {
      if (!stripeActions) {
        throw new Error('Stripe payment could not be initialized');
      }

      const { error: initError } = await stripeActions.initPaymentSheet(
        buildStripePaymentSheetOptions(clientSecret, params),
      );

      if (initError) {
        throw new Error(
          formatStripeCheckoutError(
            initError.message,
            'Could not open secure card checkout',
          ),
        );
      }
    },
    [stripeActions],
  );

  const prepareStripeCardCheckout = useCallback(
    async (params: CheckoutOrderParams, displayAmount: number, currency: string) => {
      if (!isStripeCardCheckoutSupported() || !stripeActions) {
        return false;
      }

      const fingerprint = buildStripePrepareFingerprint(displayAmount, currency, params);
      if (stripePreparedRef.current?.fingerprint === fingerprint) {
        return true;
      }

      if (stripePrefetchPromiseRef.current) {
        return stripePrefetchPromiseRef.current;
      }

      const prepareTask = (async () => {
        try {
          const clientSecret = await createStripeClientSecret(displayAmount, currency);
          await initializeStripePaymentSheet(clientSecret, params);
          stripePreparedRef.current = { fingerprint, clientSecret };
          return true;
        } catch {
          stripePreparedRef.current = null;
          return false;
        } finally {
          stripePrefetchPromiseRef.current = null;
        }
      })();

      stripePrefetchPromiseRef.current = prepareTask;
      return prepareTask;
    },
    [createStripeClientSecret, initializeStripePaymentSheet, stripeActions],
  );

  const resolveStripeClientSecret = useCallback(
    async (params: CheckoutOrderParams, displayAmount: number, currency: string) => {
      const fingerprint = buildStripePrepareFingerprint(displayAmount, currency, params);
      const prepared = stripePreparedRef.current;

      if (prepared?.fingerprint === fingerprint) {
        return prepared.clientSecret;
      }

      if (stripePrefetchPromiseRef.current) {
        await stripePrefetchPromiseRef.current;
        if (stripePreparedRef.current?.fingerprint === fingerprint) {
          return stripePreparedRef.current.clientSecret;
        }
      }

      const ready = await prepareStripeCardCheckout(params, displayAmount, currency);
      if (!ready || stripePreparedRef.current?.fingerprint !== fingerprint) {
        throw new Error('Could not open secure card checkout');
      }

      return stripePreparedRef.current.clientSecret;
    },
    [prepareStripeCardCheckout],
  );

  const startStripeCardCheckout = useCallback(
    async (params: CheckoutOrderParams, displayAmount: number, currency: string) => {
      if (!isStripeCardCheckoutSupported() || !stripeActions) {
        setCheckoutNotice('Card payments are unavailable. Add EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY to continue.');
        return false;
      }

      if (stripeCheckoutInFlightRef.current) {
        return false;
      }

      stripeCheckoutInFlightRef.current = true;
      setCheckoutNotice(null);

      try {
        const clientSecret = await resolveStripeClientSecret(params, displayAmount, currency);
        const { error: presentError } = await stripeActions.presentPaymentSheet();

        if (presentError) {
          stripePreparedRef.current = null;

          if (presentError.code === 'Canceled') {
            setCheckoutNotice('Card payment was cancelled.');
            return false;
          }

          throw new Error(
            formatStripeCheckoutError(presentError.message, 'Card payment failed'),
          );
        }

        setIsStripeConfirming(true);

        const { paymentIntent, error: retrieveError } =
          await stripeActions.retrievePaymentIntent(clientSecret);

        if (retrieveError) {
          throw new Error(
            formatStripeCheckoutError(
              retrieveError.message,
              'Could not confirm card payment',
            ),
          );
        }

        if (paymentIntent?.status !== 'Succeeded' || !paymentIntent.id) {
          throw new Error('Card payment did not complete. Please try again.');
        }

        stripePreparedRef.current = null;

        const result = await captureCheckoutPayment(paymentIntent.id, params, 'stripe');

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
        stripeCheckoutInFlightRef.current = false;
        setIsStripeConfirming(false);
      }
    },
    [captureCheckoutPayment, resolveStripeClientSecret, stripeActions],
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

      if (stripeCheckoutInFlightRef.current) {
        return false;
      }

      stripeCheckoutInFlightRef.current = true;
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

        setIsStripeConfirming(true);

        await captureCheckoutPayment(paymentIntent.id, params, 'stripe');
        return true;
      } catch (err) {
        setCheckoutNotice(getErrorMessage(err, 'Apple Pay failed'));
        return false;
      } finally {
        stripeCheckoutInFlightRef.current = false;
        setIsStripeConfirming(false);
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

  const isPrePaymentProcessing = isPlacingOrder || isKorapayInitializing;

  const isProcessing =
    isPrePaymentProcessing ||
    isCapturing ||
    isStripeConfirming ||
    isPayPalBrowserPending ||
    isPayPalCapturing ||
    Boolean(korapaySession);

  return {
    isPlacingOrder,
    isCapturing,
    isStripeConfirming,
    isPayPalCapturing,
    isPayPalBrowserPending,
    isPayPalResuming,
    isKorapayInitializing,
    isPrePaymentProcessing,
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
    prepareStripeCardCheckout,
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
