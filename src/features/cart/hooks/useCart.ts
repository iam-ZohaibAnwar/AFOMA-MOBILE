import { useCallback, useEffect, useMemo, useState } from 'react';

import { getErrorMessage } from '../../../services/api/errors';
import type { CartMap } from '../../../services/types/cart';
import {
  calculateSubTotal,
  getCartEntries,
  loadUserCart,
  persistCart,
  removeCartLine,
} from '../utils/cartUtils';

export function useCart(userId?: string) {
  const [cart, setCart] = useState<CartMap>({});
  const [totalShippingRate, setTotalShippingRate] = useState(0);
  const [fetchedShippingRate, setFetchedShippingRate] = useState(0);
  const [isLoading, setIsLoading] = useState(Boolean(userId));
  const [error, setError] = useState<string | null>(null);
  const [removingItemId, setRemovingItemId] = useState<string | null>(null);

  const loadCart = useCallback(async () => {
    if (!userId) {
      setCart({});
      setTotalShippingRate(0);
      setFetchedShippingRate(0);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await loadUserCart(userId);
      setCart(response.cart ?? {});
      setTotalShippingRate(response.totalShippingRate ?? 0);
      setFetchedShippingRate(response.fetchedShippingRate ?? 0);
    } catch (err) {
      setCart({});
      setError(getErrorMessage(err, 'Failed to load cart'));
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void loadCart();
  }, [loadCart]);

  const removeItem = useCallback(
    async (itemId: string) => {
      if (!userId) {
        return;
      }

      setRemovingItemId(itemId);
      setError(null);

      try {
        const nextCart = removeCartLine(cart, itemId);
        await persistCart(userId, nextCart, {
          totalShippingRate,
          fetchedShippingRate,
        });
        setCart(nextCart);
      } catch (err) {
        setError(getErrorMessage(err, 'Failed to remove item from cart'));
      } finally {
        setRemovingItemId(null);
      }
    },
    [cart, fetchedShippingRate, totalShippingRate, userId],
  );

  const entries = useMemo(() => getCartEntries(cart), [cart]);
  const subTotal = useMemo(() => calculateSubTotal(cart), [cart]);

  return {
    cart,
    entries,
    subTotal,
    totalShippingRate,
    fetchedShippingRate,
    isLoading,
    error,
    removingItemId,
    retry: loadCart,
    removeItem,
  };
}
