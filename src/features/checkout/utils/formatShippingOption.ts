import type { ShippingRateOption } from '../../../services/types/shipping';

export const SYNTHETIC_SHIPPING_CARRIERS = [
  'Hand Delivery',
  'Free Hand Delivery',
  'Flat Rate Shipping',
] as const;

export function isSyntheticShippingCarrier(carrierName?: string | null): boolean {
  if (!carrierName?.trim()) {
    return false;
  }

  return SYNTHETIC_SHIPPING_CARRIERS.includes(
    carrierName.trim() as (typeof SYNTHETIC_SHIPPING_CARRIERS)[number],
  );
}

export function getShippingMethodTitle(option: ShippingRateOption): string {
  const carrier = option.carrier_name?.trim();

  if (carrier && isSyntheticShippingCarrier(carrier)) {
    return carrier;
  }

  const service = option.service_name?.trim();
  if (service) {
    return carrier ? `${carrier} - ${service}` : service;
  }

  if (carrier) {
    return carrier;
  }

  return 'Shipping';
}

export function shouldShowShippingMethodPrice(
  option: ShippingRateOption,
  displayRate: number,
): boolean {
  if (option.carrier_name?.trim() === 'Free Hand Delivery') {
    return false;
  }

  if (isSyntheticShippingCarrier(option.carrier_name) && displayRate <= 0) {
    return false;
  }

  return true;
}

export function getShippingOptionId(sellerId: string, option: ShippingRateOption): string {
  return `${sellerId}:${String(option.service_id)}`;
}

export function formatShippingOptionLabel(option: ShippingRateOption): string {
  const rate = typeof option.rate === 'number' ? option.rate : 0;
  const currency = option.currency ?? 'CAD';
  const title = getShippingMethodTitle(option);

  if (isSyntheticShippingCarrier(option.carrier_name)) {
    if (rate <= 0) {
      return title;
    }

    return `${title} · ${currency} ${rate.toFixed(2)}`;
  }

  const priceLabel = rate > 0 ? `${currency} ${rate.toFixed(2)}` : 'Free Shipping';
  const carrier = option.carrier_name ?? 'Carrier';
  const service = option.service_name ? ` - ${option.service_name}` : '';

  return `${priceLabel} (${carrier}${service})`;
}

export function normalizeShippingRate(option: ShippingRateOption): number {
  const rate = typeof option.rate === 'number' ? option.rate : 0;
  return Number.isFinite(rate) ? rate : 0;
}

/** Cheapest rate first — matches backend `rateObj` sort after buyer currency is applied. */
export function sortShippingOptionsByRate<T extends { rate: number }>(options: T[]): T[] {
  return [...options].sort((left, right) => left.rate - right.rate);
}

export function getCheapestShippingOption<T extends { rate: number }>(
  options: T[],
): T | undefined {
  return sortShippingOptionsByRate(options)[0];
}

/** Web cart multiplies API rates by buyer currencyRate before storing selections. */
export function applyShippingRateCurrency(
  option: ShippingRateOption,
  currencyRate = 1,
  currency = 'CAD',
): ShippingRateOption {
  const convertedRate = parseFloat((normalizeShippingRate(option) * (currencyRate || 1)).toFixed(2));

  return {
    ...option,
    rate: convertedRate,
    currency,
  };
}
