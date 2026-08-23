import type { CartMap } from '../../../services/types/cart';
import type { CheckoutShippingOption } from '../../checkout/hooks/useCheckoutShippingRates';
import { extractSelectedShippingFromCart } from '../../checkout/utils/extractSelectedShippingFromCart';
import { cartHasShippableItems } from '../../checkout/utils/buildCheckoutOrderPayload';
import { getCartShippingTotal } from './applyShippingToCart';

export function resolveCartShippingCad(
  cart: CartMap,
  totalShippingRate = 0,
  fetchedShippingRate = 0,
): number {
  const selectedOptions = extractSelectedShippingFromCart(cart);
  if (selectedOptions.length > 0) {
    return selectedOptions.reduce((sum, option) => sum + option.rate, 0);
  }

  const lineShippingTotal = getCartShippingTotal(cart);
  if (lineShippingTotal > 0) {
    return lineShippingTotal;
  }

  return fetchedShippingRate || totalShippingRate || 0;
}

export function resolveCartShippingOptions(
  cart: CartMap,
): CheckoutShippingOption[] {
  return extractSelectedShippingFromCart(cart);
}

export function isCartShippingPending(cart: CartMap, shippingCad: number): boolean {
  return cartHasShippableItems(cart) && shippingCad <= 0;
}
