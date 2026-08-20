import { useCallback, useRef, useState } from 'react';

import {
  createCheckoutOrder,
  extractCreatedOrderId,
} from '../../../services/api/ordersApi';
import { getErrorMessage } from '../../../services/api/errors';
import type { CartMap } from '../../../services/types/cart';
import type { AuthUser } from '../../auth/types';
import type { CheckoutShippingOption } from './useCheckoutShippingRates';
import type { ShippingAddress } from '../types/shippingAddress';
import {
  buildCheckoutOrderPayload,
  type CheckoutOrderTotals,
} from '../utils/buildCheckoutOrderPayload';

export function usePlaceOrder() {
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const isSubmittingRef = useRef(false);

  const placeOrder = useCallback(
    async (params: {
      user: AuthUser;
      cart: CartMap;
      shippingAddress: ShippingAddress;
      selectedOptions: CheckoutShippingOption[];
      totals: CheckoutOrderTotals;
    }) => {
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

        setCreatedOrderId(orderId);
        return orderId;
      } catch (err) {
        const message = getErrorMessage(err, 'Failed to place order');
        setOrderError(message);
        return null;
      } finally {
        isSubmittingRef.current = false;
        setIsPlacingOrder(false);
      }
    },
    [],
  );

  const resetOrderState = useCallback(() => {
    setOrderError(null);
    setCreatedOrderId(null);
  }, []);

  return {
    isPlacingOrder,
    orderError,
    createdOrderId,
    placeOrder,
    resetOrderState,
  };
}
