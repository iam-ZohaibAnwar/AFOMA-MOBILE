import type { CartLineItem, CartMap } from '../../../services/types/cart';
import type {
  CheckoutShippingOption,
  SellerShippingOptionsGroup,
} from '../../checkout/hooks/useCheckoutShippingRates';
import { getProductSellerId } from '../../checkout/utils/cartShipping';

function buildShippingService(option: CheckoutShippingOption): CartLineItem['shippingService'] {
  return {
    value: String(option.option.service_id),
    label: option.label,
    carrier_name: option.option.carrier_name,
  };
}

function clearLineShipping(line: CartLineItem): CartLineItem | null {
  const hasAppliedShipping =
    (line.shippingRate ?? 0) > 0 ||
    Boolean(line.shippingService?.value) ||
    (line.shippingOptions?.length ?? 0) > 0;

  if (!hasAppliedShipping) {
    return null;
  }

  return {
    ...line,
    shippingRate: 0,
    shippingService: undefined,
    shippingOptions: [],
  };
}

export function applyShippingSelectionsToCart(
  cart: CartMap,
  selectedOptions: CheckoutShippingOption[],
  groups: SellerShippingOptionsGroup[],
  checkoutCart: CartMap = cart,
): CartMap {
  const selectedBySeller = new Map(selectedOptions.map((option) => [option.sellerId, option]));
  const groupOptionsBySeller = new Map(groups.map((group) => [group.sellerId, group.options.map((entry) => entry.option)]));
  const checkoutItemIds = new Set(Object.keys(checkoutCart));

  let changed = false;
  const nextCart: CartMap = {};

  for (const [itemId, line] of Object.entries(cart)) {
    const sellerId = getProductSellerId(line.productData?.seller);
    const isDownloadable = line.productData?.productType === 'Downloadable';

    if (!checkoutItemIds.has(itemId)) {
      const clearedLine = clearLineShipping(line);
      if (clearedLine) {
        changed = true;
        nextCart[itemId] = clearedLine;
      } else {
        nextCart[itemId] = line;
      }
      continue;
    }

    if (!sellerId || isDownloadable) {
      nextCart[itemId] = line;
      continue;
    }

    const selectedOption = selectedBySeller.get(sellerId);
    if (!selectedOption) {
      const clearedLine = clearLineShipping(line);
      if (clearedLine) {
        changed = true;
        nextCart[itemId] = clearedLine;
      } else {
        nextCart[itemId] = line;
      }
      continue;
    }

    const allOptions = groupOptionsBySeller.get(sellerId) ?? [];
    const nextLine: CartLineItem = {
      ...line,
      shippingRate: selectedOption.rate,
      shippingService: buildShippingService(selectedOption),
      shippingOptions: allOptions,
    };

    if (
      line.shippingRate !== nextLine.shippingRate ||
      JSON.stringify(line.shippingService) !== JSON.stringify(nextLine.shippingService)
    ) {
      changed = true;
    }

    nextCart[itemId] = nextLine;
  }

  return changed ? nextCart : cart;
}

/** Clear applied shipping so rates are recalculated after cart composition changes. */
export function invalidateCartShipping(cart: CartMap): CartMap {
  let changed = false;
  const nextCart: CartMap = {};

  for (const [itemId, line] of Object.entries(cart)) {
    if (line.productData?.productType === 'Downloadable') {
      nextCart[itemId] = line;
      continue;
    }

    const hasAppliedShipping =
      (line.shippingRate ?? 0) > 0 ||
      Boolean(line.shippingService?.value) ||
      (line.shippingOptions?.length ?? 0) > 0;

    if (!hasAppliedShipping) {
      nextCart[itemId] = line;
      continue;
    }

    changed = true;
    nextCart[itemId] = {
      ...line,
      shippingRate: 0,
      shippingService: undefined,
      shippingOptions: [],
    };
  }

  return changed ? nextCart : cart;
}

export function getCartShippingTotal(cart: CartMap): number {
  const sellerRates = new Map<string, number>();

  for (const line of Object.values(cart)) {
    const sellerId = getProductSellerId(line.productData?.seller);
    if (!sellerId || line.productData?.productType === 'Downloadable') {
      continue;
    }

    if (!sellerRates.has(sellerId)) {
      sellerRates.set(sellerId, line.shippingRate ?? 0);
    }
  }

  return Array.from(sellerRates.values()).reduce((sum, rate) => sum + rate, 0);
}
