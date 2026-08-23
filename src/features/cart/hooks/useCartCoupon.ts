import { useCallback, useEffect, useState } from 'react';

import { applyCoupon } from '../../../services/api/couponsApi';
import { getErrorMessage } from '../../../services/api/errors';
import type { CartMap } from '../../../services/types/cart';
import { normalizeCouponCode, validateCouponCode } from '../../../utils/couponCodeRules';
import { calculateSubTotal, persistCart } from '../utils/cartUtils';
import { useAppliedCoupon } from './useAppliedCoupon';

export function useCartCoupon(
  userId: string | undefined,
  email: string | undefined,
  cart: CartMap,
  shippingRates: { totalShippingRate: number; fetchedShippingRate: number },
  onCartUpdated: (cart: CartMap) => void,
) {
  const {
    appliedCoupon,
    isHydrated,
    persistAppliedCoupon,
    removeAppliedCoupon,
  } = useAppliedCoupon(userId);
  const [isApplying, setIsApplying] = useState(false);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  useEffect(() => {
    if (!isHydrated || !appliedCoupon?.couponCode) {
      return;
    }

    setCouponMessage((current) => current ?? 'Promo code applied.');
  }, [appliedCoupon?.couponCode, isHydrated]);

  const applyPromoCode = useCallback(
    async (couponCode: string) => {
      const trimmedCode = normalizeCouponCode(couponCode);
      const validationError = validateCouponCode(trimmedCode);

      if (validationError) {
        setCouponError(validationError);
        setCouponMessage(null);
        return;
      }

      if (!userId || !email) {
        return;
      }

      setIsApplying(true);
      setCouponError(null);
      setCouponMessage(null);

      try {
        const response = await applyCoupon({
          email,
          cart,
          couponCode: trimmedCode,
        });

        const updatedCart = response.updatedOrder?.clonedCart;
        const coupon = response.updatedOrder?.coupon;

        if (!updatedCart || !coupon) {
          throw new Error(response.message || 'Could not apply promo code.');
        }

        await persistCart(userId, updatedCart, shippingRates);
        onCartUpdated(updatedCart);
        await persistAppliedCoupon(coupon);
        setCouponMessage(response.message || 'Promo code applied.');
      } catch (err) {
        await persistAppliedCoupon(null);
        setCouponError(getErrorMessage(err, 'Failed to apply promo code'));
      } finally {
        setIsApplying(false);
      }
    },
    [cart, email, onCartUpdated, persistAppliedCoupon, shippingRates, userId],
  );

  const clearCoupon = useCallback(async () => {
    await removeAppliedCoupon();
    setCouponMessage(null);
    setCouponError(null);
  }, [removeAppliedCoupon]);

  const discountAmount = appliedCoupon?.discountAmount ?? 0;
  const discountedSubTotal = Math.max(0, calculateSubTotal(cart) - discountAmount);

  return {
    appliedCoupon,
    discountAmount,
    discountedSubTotal,
    isApplying,
    couponMessage,
    couponError,
    applyPromoCode,
    clearCoupon,
  };
}
