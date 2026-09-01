import type {
  CheckoutShippingOption,
  SellerShippingOptionsGroup,
} from '../hooks/useCheckoutShippingRates';
import { getCheapestShippingOption } from './formatShippingOption';

interface CachedShippingRates {
  groups: SellerShippingOptionsGroup[];
  selectedOptionBySeller: Record<string, string>;
}

const shippingRatesMemoryCache = new Map<string, CachedShippingRates>();

export function getCachedShippingRates(requestKey: string): CachedShippingRates | null {
  if (requestKey === 'disabled') {
    return null;
  }

  return shippingRatesMemoryCache.get(requestKey) ?? null;
}

export function setCachedShippingRates(
  requestKey: string,
  groups: SellerShippingOptionsGroup[],
  selectedOptionBySeller: Record<string, string>,
): void {
  if (requestKey === 'disabled' || groups.length === 0) {
    return;
  }

  shippingRatesMemoryCache.set(requestKey, { groups, selectedOptionBySeller });
}

export function clearCachedShippingRates(): void {
  shippingRatesMemoryCache.clear();
}

export function mergeShippingRateGroup(
  current: SellerShippingOptionsGroup[],
  incoming: SellerShippingOptionsGroup,
): SellerShippingOptionsGroup[] {
  const withoutSeller = current.filter((group) => group.sellerId !== incoming.sellerId);
  return [...withoutSeller, incoming].sort((left, right) =>
    left.sellerName.localeCompare(right.sellerName),
  );
}

export function buildSelectedOptionsBySeller(
  groups: SellerShippingOptionsGroup[],
  current: Record<string, string>,
): Record<string, string> {
  const merged: Record<string, string> = {};

  for (const group of groups) {
    const selectedId = current[group.sellerId];
    const stillAvailable = group.options.some((option) => option.id === selectedId);
    const cheapest = getCheapestShippingOption(group.options);

    if (selectedId && stillAvailable) {
      merged[group.sellerId] = selectedId;
    } else if (cheapest) {
      merged[group.sellerId] = cheapest.id;
    }
  }

  return merged;
}

export type { CachedShippingRates };
