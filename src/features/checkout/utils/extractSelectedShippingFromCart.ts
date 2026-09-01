import type { CartLineItem, CartMap } from '../../../services/types/cart';
import type { ShippingRateOption } from '../../../services/types/shipping';
import type { CheckoutShippingOption } from '../hooks/useCheckoutShippingRates';
import { getProductSellerId, getProductSellerName } from './cartShipping';
import { getShippingMethodTitle, getShippingOptionId, normalizeShippingRate } from './formatShippingOption';

interface CartShippingService {
  value?: string | number;
  label?: string;
  carrier_name?: string;
}

function readShippingService(value: unknown): CartShippingService | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  return value as CartShippingService;
}

function readShippingOptions(value: unknown): ShippingRateOption[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is ShippingRateOption => Boolean(item && typeof item === 'object'));
}

function getSellerName(line: CartLineItem): string {
  return getProductSellerName(line.productData?.seller);
}

export function extractSelectedShippingFromCart(cart: CartMap): CheckoutShippingOption[] {
  const options: CheckoutShippingOption[] = [];
  const seenSellers = new Set<string>();

  for (const line of Object.values(cart)) {
    const sellerId = getProductSellerId(line.productData?.seller);

    if (!sellerId || line.productData?.productType === 'Downloadable' || seenSellers.has(sellerId)) {
      continue;
    }

    seenSellers.add(sellerId);

    const shippingService = readShippingService(line.shippingService);
    if (!shippingService?.value) {
      continue;
    }

    const serviceId = String(shippingService.value);
    const shippingOptions = readShippingOptions(line.shippingOptions);
    const matchingOption =
      shippingOptions.find((option) => String(option.service_id) === serviceId) ??
      ({
        service_id: serviceId,
        carrier_name: shippingService.carrier_name,
        service_name: '',
        rate: line.shippingRate,
      } satisfies ShippingRateOption);

    options.push({
      id: getShippingOptionId(sellerId, matchingOption),
      sellerId,
      sellerName: getSellerName(line),
      option: matchingOption,
      label: getShippingMethodTitle(matchingOption),
      rate: line.shippingRate ?? normalizeShippingRate(matchingOption),
    });
  }

  return options;
}
