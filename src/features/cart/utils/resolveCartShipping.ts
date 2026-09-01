import type { CartMap } from '../../../services/types/cart';
import type {
  CheckoutShippingOption,
  SellerShippingOptionsGroup,
} from '../../checkout/hooks/useCheckoutShippingRates';
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

/** True when Freightcom/API carrier options were stored on cart lines (web parity). */
export function cartHasCarrierShippingOptions(cart: CartMap): boolean {
  return Object.values(cart).some((line) => (line.shippingOptions?.length ?? 0) > 0);
}

export function toCadShippingFromDisplay(displayTotal: number, currencyRate = 1): number {
  const rate = currencyRate > 0 ? currencyRate : 1;
  return parseFloat((displayTotal / rate).toFixed(2));
}

/** Sum of per-seller shipping in display currency (after API rate × currencyRate). */
export function resolveCartShippingDisplay(
  cart: CartMap,
  selectedOptions: CheckoutShippingOption[] = [],
): number {
  if (selectedOptions.length > 0) {
    return selectedOptions.reduce((sum, option) => sum + option.rate, 0);
  }

  const selectedOptionsFromCart = extractSelectedShippingFromCart(cart);
  if (selectedOptionsFromCart.length > 0) {
    return selectedOptionsFromCart.reduce((sum, option) => sum + option.rate, 0);
  }

  return getCartShippingTotal(cart);
}

/**
 * CAD shipping for service-fee math and payment payloads (web AppShell / checkout.jsx).
 * Uses persisted fetchedShippingRate when set; otherwise converts display line totals.
 */
export function resolveCartShippingCad(
  cart: CartMap,
  totalShippingRate = 0,
  fetchedShippingRate = 0,
  selectedOptions: CheckoutShippingOption[] = [],
  currencyRate = 1,
): number {
  if (isCartShippingPending(cart, selectedOptions)) {
    return 0;
  }

  if (fetchedShippingRate > 0) {
    return fetchedShippingRate;
  }

  const displayTotal = resolveCartShippingDisplay(cart, selectedOptions);
  if (displayTotal > 0) {
    if (cartHasCarrierShippingOptions(cart) || selectedOptions.length > 0) {
      return toCadShippingFromDisplay(displayTotal, currencyRate);
    }

    return displayTotal;
  }

  if (totalShippingRate > 0) {
    if (cartHasCarrierShippingOptions(cart)) {
      return toCadShippingFromDisplay(totalShippingRate, currencyRate);
    }

    return totalShippingRate;
  }

  return 0;
}

/** Web AppShell.saveCart — totalShippingRate display, fetchedShippingRate CAD when API quotes exist. */
export function computePersistedShippingTotals(
  displayShippingTotal: number,
  cart: CartMap,
  currencyRate = 1,
): { totalShippingRate: number; fetchedShippingRate: number } {
  const totalShippingRate = parseFloat(displayShippingTotal.toFixed(2));

  if (cartHasCarrierShippingOptions(cart) && currencyRate > 0) {
    return {
      totalShippingRate,
      fetchedShippingRate: toCadShippingFromDisplay(totalShippingRate, currencyRate),
    };
  }

  return {
    totalShippingRate,
    fetchedShippingRate: totalShippingRate,
  };
}

/**
 * Repair stale carts where fetchedShippingRate was saved as display currency.
 * Web stores CAD in fetchedShippingRate when carrier options exist.
 */
export function normalizeStoredShippingRates(
  cart: CartMap,
  totalShippingRate: number,
  fetchedShippingRate: number,
  currencyRate = 1,
): { totalShippingRate: number; fetchedShippingRate: number } {
  if (
    !cartHasCarrierShippingOptions(cart) ||
    currencyRate <= 1 ||
    totalShippingRate <= 0
  ) {
    return { totalShippingRate, fetchedShippingRate };
  }

  const ratio = fetchedShippingRate / totalShippingRate;
  const looksLikeDuplicateDisplay =
    fetchedShippingRate > 0 && Math.abs(ratio - 1) < 0.001;

  if (looksLikeDuplicateDisplay) {
    return computePersistedShippingTotals(totalShippingRate, cart, currencyRate);
  }

  return { totalShippingRate, fetchedShippingRate };
}

export function resolveCartShippingOptions(cart: CartMap): CheckoutShippingOption[] {
  return extractSelectedShippingFromCart(cart);
}

/** True when shippable items exist but at least one seller lacks a selected shipping option. */
export function isCartShippingPending(
  cart: CartMap,
  selectedOptions: CheckoutShippingOption[] = [],
  rateGroups: SellerShippingOptionsGroup[] = [],
): boolean {
  if (!cartHasShippableItems(cart)) {
    return false;
  }

  const shippableSellerIds = getShippableSellerIds(cart);

  if (rateGroups.length > 0) {
    for (const sellerId of shippableSellerIds) {
      if (!rateGroups.some((group) => group.sellerId === sellerId)) {
        return true;
      }
    }
  }

  const resolvedSellerIds = getResolvedShippingSellerIds(cart, selectedOptions);

  for (const sellerId of shippableSellerIds) {
    if (!resolvedSellerIds.has(sellerId)) {
      return true;
    }
  }

  return false;
}
