import type { CartMap } from '../../../services/types/cart';
import type { ShippingRateOption } from '../../../services/types/shipping';
import type {
  CheckoutShippingOption,
  SellerShippingOptionsGroup,
} from '../hooks/useCheckoutShippingRates';
import { getProductSellerId, getProductSellerName, groupCartBySeller } from './cartShipping';
import { extractSelectedShippingFromCart } from './extractSelectedShippingFromCart';
import {
  formatShippingOptionLabel,
  getCheapestShippingOption,
  getShippingOptionId,
  normalizeShippingRate,
  sortShippingOptionsByRate,
} from './formatShippingOption';

function readStoredShippingOptions(value: unknown): ShippingRateOption[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is ShippingRateOption => Boolean(item && typeof item === 'object'));
}

/** Rebuild rate groups from persisted cart lines — avoids refetch when nothing changed. */
export function buildShippingGroupsFromCart(cart: CartMap): {
  groups: SellerShippingOptionsGroup[];
  selectedOptionBySeller: Record<string, string>;
} {
  const selectedFromCart = extractSelectedShippingFromCart(cart);
  const selectedBySeller = new Map(selectedFromCart.map((option) => [option.sellerId, option]));
  const groups: SellerShippingOptionsGroup[] = [];
  const selectedOptionBySeller: Record<string, string> = {};

  for (const sellerGroup of groupCartBySeller(cart)) {
    const shippableLines = sellerGroup.lines.filter(
      (line) => line.productData?.productType !== 'Downloadable',
    );

    if (shippableLines.length === 0) {
      continue;
    }

    const storedOptions = readStoredShippingOptions(
      shippableLines.find((line) => (line.shippingOptions?.length ?? 0) > 0)?.shippingOptions,
    );

    if (storedOptions.length === 0) {
      continue;
    }

    const options: CheckoutShippingOption[] = sortShippingOptionsByRate(
      storedOptions
        .filter((option) => option?.service_id != null)
        .map((option) => ({
          id: getShippingOptionId(sellerGroup.sellerId, option),
          sellerId: sellerGroup.sellerId,
          sellerName: sellerGroup.sellerName,
          option,
          label: formatShippingOptionLabel(option),
          rate: normalizeShippingRate(option),
        })),
    );

    if (options.length === 0) {
      continue;
    }

    groups.push({
      sellerId: sellerGroup.sellerId,
      sellerName: sellerGroup.sellerName,
      options,
    });

    const selected = selectedBySeller.get(sellerGroup.sellerId);
    if (selected && options.some((option) => option.id === selected.id)) {
      selectedOptionBySeller[sellerGroup.sellerId] = selected.id;
      continue;
    }

    const cheapest = getCheapestShippingOption(options);
    if (cheapest) {
      selectedOptionBySeller[sellerGroup.sellerId] = cheapest.id;
    }
  }

  return { groups, selectedOptionBySeller };
}
