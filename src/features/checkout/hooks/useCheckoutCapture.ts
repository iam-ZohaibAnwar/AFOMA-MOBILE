import { useCallback, useRef, useState } from 'react';

import {
  captureCheckoutOrder,
  extractCaptureOrderDetails,
} from '../../../services/api/ordersApi';
import { getErrorMessage } from '../../../services/api/errors';
import type {
  CaptureCheckoutOrderResponse,
  CreateCheckoutOrderRequest,
} from '../../../services/types/order';
import type { CheckoutPaymentMethod } from '../constants/checkoutPaymentMethods';
import {
  buildCaptureCheckoutOrderPayload,
  buildCaptureCheckoutOrderPayloadFromCreate,
  type CheckoutOrderParams,
} from '../utils/buildCheckoutOrderPayload';

export interface CheckoutCaptureResult {
  paymentOrderId: string;
  paymentMethod: CheckoutPaymentMethod;
  response: CaptureCheckoutOrderResponse;
  details: Array<{ label: string; value: string }>;
}

/** @deprecated Use CheckoutCaptureResult */
export type PayPalCaptureResult = CheckoutCaptureResult;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function useCheckoutCapture() {
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureError, setCaptureError] = useState<string | null>(null);
  const [captureResult, setCaptureResult] = useState<CheckoutCaptureResult | null>(null);
  const isSubmittingRef = useRef(false);
  const captureResultRef = useRef<CheckoutCaptureResult | null>(null);

  const rememberCaptureResult = useCallback((result: CheckoutCaptureResult) => {
    captureResultRef.current = result;
    setCaptureResult(result);
    setCaptureError(null);
  }, []);

  const captureCheckoutPayment = useCallback(
    async (
      paymentOrderId: string,
      params: CheckoutOrderParams,
      paymentMethod: CheckoutPaymentMethod,
      createPayloadSnapshot?: CreateCheckoutOrderRequest | null,
    ) => {
      const existingResult = captureResultRef.current;
      if (existingResult?.paymentOrderId === paymentOrderId) {
        return existingResult;
      }

      while (isSubmittingRef.current) {
        await sleep(200);
        const completed = captureResultRef.current;
        if (completed?.paymentOrderId === paymentOrderId) {
          return completed;
        }
      }

      isSubmittingRef.current = true;
      setIsCapturing(true);
      if (!captureResultRef.current) {
        setCaptureError(null);
      }

      try {
        const payload = createPayloadSnapshot
          ? buildCaptureCheckoutOrderPayloadFromCreate(
              paymentOrderId,
              createPayloadSnapshot,
              paymentMethod,
            )
          : buildCaptureCheckoutOrderPayload(paymentOrderId, params, paymentMethod);
        const response = await captureCheckoutOrder(payload);

        if (response.success === false) {
          throw new Error(response.message || 'Payment capture failed');
        }

        if (!response.success && !response.orderId && !response._id && response.message) {
          throw new Error(response.message);
        }

        const result: CheckoutCaptureResult = {
          paymentOrderId,
          paymentMethod,
          response,
          details: extractCaptureOrderDetails(response, paymentOrderId, paymentMethod),
        };

        rememberCaptureResult(result);
        return result;
      } catch (err) {
        if (!captureResultRef.current) {
          const message = getErrorMessage(err, 'Failed to complete payment');
          setCaptureError(message);
        }
        return captureResultRef.current;
      } finally {
        isSubmittingRef.current = false;
        setIsCapturing(false);
      }
    },
    [rememberCaptureResult],
  );

  const capturePayPalOrderWithRetry = useCallback(
    async (
      paymentOrderId: string,
      params: CheckoutOrderParams,
      createPayloadSnapshot: CreateCheckoutOrderRequest,
      attempts = 3,
    ) => {
      for (let attempt = 0; attempt < attempts; attempt += 1) {
        const result = await captureCheckoutPayment(
          paymentOrderId,
          params,
          'paypal',
          createPayloadSnapshot,
        );

        if (result) {
          return result;
        }

        if (attempt < attempts - 1) {
          await sleep(1500);
        }
      }

      return null;
    },
    [captureCheckoutPayment],
  );

  const capturePayPalOrder = useCallback(
    async (paypalOrderId: string, params: CheckoutOrderParams) =>
      captureCheckoutPayment(paypalOrderId, params, 'paypal'),
    [captureCheckoutPayment],
  );

  return {
    isCapturing,
    captureError,
    captureResult,
    captureCheckoutPayment,
    capturePayPalOrderWithRetry,
    capturePayPalOrder,
  };
}

/** @deprecated Use useCheckoutCapture */
export const usePayPalCapture = useCheckoutCapture;
