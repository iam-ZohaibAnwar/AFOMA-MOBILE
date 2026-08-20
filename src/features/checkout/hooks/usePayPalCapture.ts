import { useCallback, useRef, useState } from 'react';

import {
  captureCheckoutOrder,
  extractCaptureOrderDetails,
} from '../../../services/api/ordersApi';
import { getErrorMessage } from '../../../services/api/errors';
import type { CaptureCheckoutOrderResponse } from '../../../services/types/order';
import {
  buildCaptureCheckoutOrderPayload,
  type CheckoutOrderParams,
} from '../utils/buildCheckoutOrderPayload';

export interface PayPalCaptureResult {
  paypalOrderId: string;
  response: CaptureCheckoutOrderResponse;
  details: Array<{ label: string; value: string }>;
}

export function usePayPalCapture() {
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureError, setCaptureError] = useState<string | null>(null);
  const [captureResult, setCaptureResult] = useState<PayPalCaptureResult | null>(null);
  const isSubmittingRef = useRef(false);

  const capturePayPalOrder = useCallback(
    async (paypalOrderId: string, params: CheckoutOrderParams) => {
      if (isSubmittingRef.current) {
        return null;
      }

      isSubmittingRef.current = true;
      setIsCapturing(true);
      setCaptureError(null);

      try {
        const payload = buildCaptureCheckoutOrderPayload(paypalOrderId, params);
        const response = await captureCheckoutOrder(payload);

        if (!response.success) {
          throw new Error(response.message || 'Payment capture failed');
        }

        const result: PayPalCaptureResult = {
          paypalOrderId,
          response,
          details: extractCaptureOrderDetails(response, paypalOrderId),
        };

        setCaptureResult(result);
        return result;
      } catch (err) {
        const message = getErrorMessage(err, 'Failed to capture PayPal payment');
        setCaptureError(message);
        return null;
      } finally {
        isSubmittingRef.current = false;
        setIsCapturing(false);
      }
    },
    [],
  );

  return {
    isCapturing,
    captureError,
    captureResult,
    capturePayPalOrder,
  };
}
