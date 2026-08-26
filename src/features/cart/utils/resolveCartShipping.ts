import type { CartMap } from '../../../services/types/cart';
import type { CheckoutShippingOption } from '../../checkout/hooks/useCheckoutShippingRates';
import { extractSelectedShippingFromCart } from '../../checkout/utils/extractSelectedShippingFromCart';
import { getProductSellerId } from '../../checkout/utils/cartShipping';
import { cartHasShippableItems } from '../../checkout/utils/buildCheckoutOrderPayload';
import { getCartShippingTotal } from './applyShippingToCart';

function getShippableSellerIds(cart: CartMap): Set<string> {
  const sellerIds = new Set<string>();

  for (const line of Object.values(cart)) {
    const sellerId = getProductSellerId(line.productData?.seller);
    if (sellerId && line.productData?.productType !== 'Downloadable') {
      sellerIds.add(sellerId);
    }
  }

  return sellerIds;
}

function getResolvedShippingSellerIds(
  cart: CartMap,
  selectedOptions: CheckoutShippingOption[] = [],
): Set<string> {
  const sellerIds = new Set<string>();

  for (const option of extractSelectedShippingFromCart(cart)) {
    sellerIds.add(option.sellerId);
  }

  for (const option of selectedOptions) {
    sellerIds.add(option.sellerId);
  }

  return sellerIds;
}

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

/** True when shippable items exist but at least one seller lacks a selected shipping option. */
export function isCartShippingPending(
  cart: CartMap,
  selectedOptions: CheckoutShippingOption[] = [],
): boolean {
  if (!cartHasShippableItems(cart)) {
    return false;
  }

  const shippableSellerIds = getShippableSellerIds(cart);
  const resolvedSellerIds = getResolvedShippingSellerIds(cart, selectedOptions);

  for (const sellerId of shippableSellerIds) {
    if (!resolvedSellerIds.has(sellerId)) {
      return true;
    }
  }

  return false;
}
