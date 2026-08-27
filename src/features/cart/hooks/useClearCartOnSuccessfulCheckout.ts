import { useEffect, useRef } from 'react';

import type { CartMap } from '../../../services/types/cart';
import type { CheckoutCaptureResult } from '../../checkout/hooks/useCheckoutCapture';
import { removePurchasedItemsFromCart } from '../utils/cartUtils';

/**
 * Removes cart lines that were included in a successful checkout capture.
 * Defaults to all current cart line ids (full-cart checkout).
 */
export function useClearCartOnSuccessfulCheckout(
  captureResult: CheckoutCaptureResult | null,
  cart: CartMap,
  userId?: string,
  purchasedItemIds?: string[],
) {
  const clearedForOrderRef = useRef<string | null>(null);

  useEffect(() => {
    if (!captureResult) {
      return;
    }

    const orderKey = captureResult.paymentOrderId;
    if (!orderKey || clearedForOrderRef.current === orderKey) {
      return;
    }

    clearedForOrderRef.current = orderKey;

    const itemIds =
      purchasedItemIds && purchasedItemIds.length > 0
        ? purchasedItemIds
        : Object.keys(cart);

    void removePurchasedItemsFromCart(userId, cart, itemIds);
  }, [captureResult, cart, purchasedItemIds, userId]);
}
