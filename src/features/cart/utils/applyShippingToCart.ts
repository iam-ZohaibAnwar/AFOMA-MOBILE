import type { CartLineItem, CartMap } from '../../../services/types/cart';
import type {
  CheckoutShippingOption,
  SellerShippingOptionsGroup,
} from '../../checkout/hooks/useCheckoutShippingRates';

function buildShippingService(option: CheckoutShippingOption): CartLineItem['shippingService'] {
  return {
    value: String(option.option.service_id),
    label: option.label,
    carrier_name: option.option.carrier_name,
  };
}

export function applyShippingSelectionsToCart(
  cart: CartMap,
  selectedOptions: CheckoutShippingOption[],
  groups: SellerShippingOptionsGroup[],
): CartMap {
  const selectedBySeller = new Map(selectedOptions.map((option) => [option.sellerId, option]));
  const groupOptionsBySeller = new Map(groups.map((group) => [group.sellerId, group.options.map((entry) => entry.option)]));

  let changed = false;
  const nextCart: CartMap = {};

  for (const [itemId, line] of Object.entries(cart)) {
    const sellerId = line.productData?.seller?._id;
    const isDownloadable = line.productData?.productType === 'Downloadable';

    if (!sellerId || isDownloadable) {
      nextCart[itemId] = line;
      continue;
    }

    const selectedOption = selectedBySeller.get(sellerId);
    if (!selectedOption) {
      nextCart[itemId] = line;
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

export function getCartShippingTotal(cart: CartMap): number {
  const sellerRates = new Map<string, number>();

  for (const line of Object.values(cart)) {
    const sellerId = line.productData?.seller?._id;
    if (!sellerId || line.productData?.productType === 'Downloadable') {
      continue;
    }

    if (!sellerRates.has(sellerId)) {
      sellerRates.set(sellerId, line.shippingRate ?? 0);
    }
  }

  return Array.from(sellerRates.values()).reduce((sum, rate) => sum + rate, 0);
}
