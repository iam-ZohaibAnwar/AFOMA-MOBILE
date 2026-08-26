import type { CartMap } from '../../../services/types/cart';
import type { CheckoutIdentity } from '../types/checkoutIdentity';
import type { ShippingAddress } from '../types/shippingAddress';
import { groupCartBySeller } from './cartShipping';

/** Stable key for shipping rate requests — ignores applied shipping selections on cart lines. */
export function buildShippingRatesRequestKey(
  cart: CartMap,
  address: ShippingAddress,
  identity: CheckoutIdentity | null,
  canFetchRates: boolean,
  pricingCountry?: string,
): string {
  if (!canFetchRates || !identity?.email?.trim()) {
    return 'disabled';
  }

  const cartSignature = groupCartBySeller(cart)
    .map((group) => {
      const lines = group.lines
        .filter((line) => line.productData?.productType !== 'Downloadable')
        .map((line) => {
          const productId = line.productData?._id ?? '';
          const quantity = line.orderQuantiy ?? 1;
          const variationSignature = (line.selectedVariations ?? [])
            .map((variation) => `${variation.attributeName}=${variation.attributeValue}`)
            .sort()
            .join(';');
          return `${productId}:${quantity}:${variationSignature}`;
        })
        .sort()
        .join(',');

      return `${group.sellerId}[${lines}]`;
    })
    .sort()
    .join('|');

  const addressSignature = [
    address.country,
    address.state,
    address.city,
    address.zip,
    address.streetAddress,
    identity.countryCode,
    identity.stateCode,
    identity.email?.trim(),
  ]
    .map((part) => part?.trim() ?? '')
    .join('|');

  return `${cartSignature}::${addressSignature}::${pricingCountry?.trim() ?? ''}`;
}
