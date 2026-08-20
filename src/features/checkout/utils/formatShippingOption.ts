import type { ShippingRateOption } from '../../../services/types/shipping';

export function getShippingOptionId(sellerId: string, option: ShippingRateOption): string {
  return `${sellerId}:${String(option.service_id)}`;
}

export function formatShippingOptionLabel(option: ShippingRateOption): string {
  const rate = typeof option.rate === 'number' ? option.rate : 0;
  const currency = option.currency ?? 'CAD';
  const priceLabel = rate > 0 ? `${currency} ${rate.toFixed(2)}` : 'Free Shipping';
  const carrier = option.carrier_name ?? 'Carrier';
  const service = option.service_name ? ` - ${option.service_name}` : '';

  return `${priceLabel} (${carrier}${service})`;
}

export function normalizeShippingRate(option: ShippingRateOption): number {
  const rate = typeof option.rate === 'number' ? option.rate : 0;
  return Number.isFinite(rate) ? rate : 0;
}
