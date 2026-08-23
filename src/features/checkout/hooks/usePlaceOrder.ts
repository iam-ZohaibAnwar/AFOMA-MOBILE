import { useCallback, useRef, useState } from 'react';

import {
  createCheckoutOrder,
  extractCreatedOrderId,
  extractPayPalApprovalUrl,
} from '../../../services/api/ordersApi';
import { getErrorMessage } from '../../../services/api/errors';
import type { CreateCheckoutOrderRequest } from '../../../services/types/order';
import {
  buildCheckoutOrderPayload,
  type CheckoutOrderParams,
} from '../utils/buildCheckoutOrderPayload';

export interface PlaceOrderResult {
  orderId: string;
  approvalUrl: string;
  createPayload: CreateCheckoutOrderRequest;
  checkoutParams: CheckoutOrderParams;
}

export function usePlaceOrder() {
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const isSubmittingRef = useRef(false);
  const lastCreatePayloadRef = useRef<CreateCheckoutOrderRequest | null>(null);
  const lastCheckoutParamsRef = useRef<CheckoutOrderParams | null>(null);

  const placeOrder = useCallback(async (params: CheckoutOrderParams): Promise<PlaceOrderResult | null> => {
    if (isSubmittingRef.current) {
      return null;
    }

    isSubmittingRef.current = true;
    setIsPlacingOrder(true);
    setOrderError(null);

    try {
      const payload = buildCheckoutOrderPayload(params);
      const response = await createCheckoutOrder(payload);
      const orderId = extractCreatedOrderId(response);

      if (!orderId) {
        throw new Error(response.message || 'Order was created but no order ID was returned.');
      }

      const approvalUrl = extractPayPalApprovalUrl(response, orderId);
      lastCreatePayloadRef.current = payload;
      lastCheckoutParamsRef.current = params;
      setCreatedOrderId(orderId);
      return { orderId, approvalUrl, createPayload: payload, checkoutParams: params };
    } catch (err) {
      const message = getErrorMessage(err, 'Failed to place order');
      setOrderError(message);
      return null;
    } finally {
      isSubmittingRef.current = false;
      setIsPlacingOrder(false);
    }
  }, []);

  const resetOrderState = useCallback(() => {
    setOrderError(null);
    setCreatedOrderId(null);
    lastCreatePayloadRef.current = null;
    lastCheckoutParamsRef.current = null;
  }, []);

  const getLastPayPalCaptureContext = useCallback(() => {
    if (!createdOrderId || !lastCreatePayloadRef.current || !lastCheckoutParamsRef.current) {
      return null;
    }

    return {
      orderId: createdOrderId,
      createPayload: lastCreatePayloadRef.current,
      checkoutParams: lastCheckoutParamsRef.current,
    };
  }, [createdOrderId]);

  return {
    isPlacingOrder,
    orderError,
    createdOrderId,
    placeOrder,
    resetOrderState,
    getLastPayPalCaptureContext,
  };
}
