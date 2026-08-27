import { useCallback, useEffect, useMemo, useState } from 'react';

import { getErrorMessage } from '../../../services/api/errors';
import type { UserPricingInfo } from '../../../services/pricing/types';
import { loadGuestCart, saveGuestCart } from '../../../services/storage/cartStorage';
import type { CartMap } from '../../../services/types/cart';
import type { VariationAttributeSelection } from '../../products/utils/productVariations';
import {
  calculateSubTotal,
  getCartEntries,
  loadUserCart,
  persistCart,
  removeCartLine,
  replaceCartLineVariations,
  updateCartLineQuantity,
} from '../utils/cartUtils';
import { syncCartLinePrices } from '../utils/cartPricing';
import { getCartShippingTotal, invalidateCartShipping } from '../utils/applyShippingToCart';
import { getCartMemoryCache, setCartMemoryCache } from '../utils/cartMemoryCache';
import { notifyCartChanged, subscribeCartRefresh } from '../utils/cartRefresh';

const ZERO_SHIPPING_RATES = {
  totalShippingRate: 0,
  fetchedShippingRate: 0,
} as const;

export function useCart(userId?: string, userInfo?: UserPricingInfo) {
  const initialCache = getCartMemoryCache(userId);
  const [cart, setCart] = useState<CartMap>(initialCache?.cart ?? {});
  const [totalShippingRate, setTotalShippingRate] = useState(initialCache?.totalShippingRate ?? 0);
  const [fetchedShippingRate, setFetchedShippingRate] = useState(initialCache?.fetchedShippingRate ?? 0);
  const [isRefreshing, setIsRefreshing] = useState(
    !initialCache || Object.keys(initialCache.cart).length === 0,
  );
  const [error, setError] = useState<string | null>(null);
  const [removingItemId, setRemovingItemId] = useState<string | null>(null);
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);

  const loadCart = useCallback(async () => {
    const applyPricing = (cartData: CartMap) =>
      userInfo?.country ? syncCartLinePrices(cartData, userInfo) : cartData;

    let hasExistingItems = false;
    setCart((current) => {
      hasExistingItems = Object.keys(current).length > 0;
      return current;
    });

    if (!hasExistingItems) {
      setIsRefreshing(true);
    }

    setError(null);

    if (!userId) {
      try {
        const guestCart = applyPricing(await loadGuestCart());
        const lineShippingTotal = getCartShippingTotal(guestCart);
        setCart(guestCart);
        setTotalShippingRate(lineShippingTotal);
        setFetchedShippingRate(lineShippingTotal);
        setCartMemoryCache(userId, {
          cart: guestCart,
          totalShippingRate: lineShippingTotal,
          fetchedShippingRate: lineShippingTotal,
        });
      } catch (err) {
        if (!hasExistingItems) {
          setCart({});
          setError(getErrorMessage(err, 'Failed to load cart'));
        } else {
          setError(getErrorMessage(err, 'Unable to refresh cart. Showing saved items.'));
        }
      } finally {
        setIsRefreshing(false);
      }
      return;
    }

    try {
      const response = await loadUserCart(userId);
      const nextCart = applyPricing(response.cart ?? {});
      const nextTotalShipping = response.totalShippingRate ?? 0;
      const nextFetchedShipping = response.fetchedShippingRate ?? 0;
      setCart(nextCart);
      setTotalShippingRate(nextTotalShipping);
      setFetchedShippingRate(nextFetchedShipping);
      setCartMemoryCache(userId, {
        cart: nextCart,
        totalShippingRate: nextTotalShipping,
        fetchedShippingRate: nextFetchedShipping,
      });
    } catch (err) {
      if (!hasExistingItems) {
        setCart({});
        setError(getErrorMessage(err, 'Failed to load cart'));
      } else {
        setError(getErrorMessage(err, 'Unable to refresh cart. Showing saved items.'));
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [userId, userInfo]);

  useEffect(() => {
    const cached = getCartMemoryCache(userId);
    if (cached) {
      setCart(cached.cart);
      setTotalShippingRate(cached.totalShippingRate);
      setFetchedShippingRate(cached.fetchedShippingRate);
      setIsRefreshing(Object.keys(cached.cart).length === 0);
      return;
    }

    setCart({});
    setTotalShippingRate(0);
    setFetchedShippingRate(0);
    setIsRefreshing(true);
  }, [userId]);

  useEffect(() => {
    void loadCart();
  }, [loadCart]);

  useEffect(() => subscribeCartRefresh(() => {
    void loadCart();
  }), [loadCart]);

  const removeItem = useCallback(
    async (itemId: string) => {
      setRemovingItemId(itemId);
      setError(null);

      try {
        const nextCart = invalidateCartShipping(removeCartLine(cart, itemId));
        if (userId) {
          await persistCart(userId, nextCart, ZERO_SHIPPING_RATES);
        } else {
          await saveGuestCart(nextCart);
        }
        setCart(nextCart);
        setTotalShippingRate(ZERO_SHIPPING_RATES.totalShippingRate);
        setFetchedShippingRate(ZERO_SHIPPING_RATES.fetchedShippingRate);
        notifyCartChanged();
        setCartMemoryCache(userId, {
          cart: nextCart,
          ...ZERO_SHIPPING_RATES,
        });
      } catch (err) {
        setError(getErrorMessage(err, 'Failed to remove item from cart'));
      } finally {
        setRemovingItemId(null);
      }
    },
    [cart, userId],
  );

  const updateQuantity = useCallback(
    async (itemId: string, nextQuantity: number) => {
      if (nextQuantity < 1) {
        await removeItem(itemId);
        return;
      }

      setUpdatingItemId(itemId);
      setError(null);

      try {
        const nextCart = invalidateCartShipping(updateCartLineQuantity(cart, itemId, nextQuantity));
        if (userId) {
          await persistCart(userId, nextCart, ZERO_SHIPPING_RATES);
        } else {
          await saveGuestCart(nextCart);
        }
        setCart(nextCart);
        setTotalShippingRate(ZERO_SHIPPING_RATES.totalShippingRate);
        setFetchedShippingRate(ZERO_SHIPPING_RATES.fetchedShippingRate);
        notifyCartChanged();
        setCartMemoryCache(userId, {
          cart: nextCart,
          ...ZERO_SHIPPING_RATES,
        });
      } catch (err) {
        setError(getErrorMessage(err, 'Failed to update cart quantity'));
      } finally {
        setUpdatingItemId(null);
      }
    },
    [cart, removeItem, userId],
  );

  const updateVariations = useCallback(
    async (itemId: string, selectedVariations: VariationAttributeSelection[]) => {
      if (!userInfo) {
        setError('Unable to update options right now.');
        return;
      }

      setUpdatingItemId(itemId);
      setError(null);

      try {
        const nextCart = invalidateCartShipping(
          replaceCartLineVariations(cart, itemId, selectedVariations, userInfo),
        );
        if (userId) {
          await persistCart(userId, nextCart, ZERO_SHIPPING_RATES);
        } else {
          await saveGuestCart(nextCart);
        }
        setCart(nextCart);
        setTotalShippingRate(ZERO_SHIPPING_RATES.totalShippingRate);
        setFetchedShippingRate(ZERO_SHIPPING_RATES.fetchedShippingRate);
        notifyCartChanged();
        setCartMemoryCache(userId, {
          cart: nextCart,
          ...ZERO_SHIPPING_RATES,
        });
      } catch (err) {
        setError(getErrorMessage(err, 'Failed to update product options'));
        throw err;
      } finally {
        setUpdatingItemId(null);
      }
    },
    [cart, userId, userInfo],
  );

  const replaceCart = useCallback((nextCart: CartMap) => {
    setCart(nextCart);
    setCartMemoryCache(userId, {
      cart: nextCart,
      totalShippingRate,
      fetchedShippingRate,
    });
  }, [fetchedShippingRate, totalShippingRate, userId]);

  const setShippingTotals = useCallback((total: number, fetched: number) => {
    setTotalShippingRate(total);
    setFetchedShippingRate(fetched);

    const cached = getCartMemoryCache(userId);
    if (cached) {
      setCartMemoryCache(userId, {
        cart: cached.cart,
        totalShippingRate: total,
        fetchedShippingRate: fetched,
      });
    }
  }, [userId]);

  const entries = useMemo(() => getCartEntries(cart), [cart]);
  const subTotal = useMemo(() => calculateSubTotal(cart), [cart]);
  const isLoading = isRefreshing && entries.length === 0;

  return {
    cart,
    entries,
    subTotal,
    totalShippingRate,
    fetchedShippingRate,
    isRefreshing,
    isLoading,
    error,
    removingItemId,
    updatingItemId,
    retry: loadCart,
    removeItem,
    updateQuantity,
    updateVariations,
    replaceCart,
    setShippingTotals,
  };
}
