import type { ProductShippingEstimateFormValues } from '../types/productShippingEstimate';
import type { ProductShippingEstimateCarrierResult } from '../../../../services/types/shipping';

export function parsePositiveDimension(value: string): number | null {
  const trimmed = value.trim().replace(/,/g, '.');
  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

export function dimensionsAreValid(values: ProductShippingEstimateFormValues): boolean {
  return (
    parsePositiveDimension(values.weight) != null &&
    parsePositiveDimension(values.length) != null &&
    parsePositiveDimension(values.width) != null &&
    parsePositiveDimension(values.height) != null
  );
}

export function validateProductShippingEstimateForm(
  values: ProductShippingEstimateFormValues,
): string | null {
  if (!values.destinationCountry.trim()) {
    return 'Select a destination country.';
  }

  if (!dimensionsAreValid(values)) {
    return 'Enter valid weight and dimensions before fetching an estimate.';
  }

  const quantity = Number(values.quantity.trim());
  if (!Number.isFinite(quantity) || quantity <= 0) {
    return 'Enter a valid quantity.';
  }

  const dispatchDays = values.dispatchDays.trim();
  if (dispatchDays && (!Number.isFinite(Number(dispatchDays)) || Number(dispatchDays) < 0)) {
    return 'Enter valid dispatch days.';
  }

  return null;
}

export function buildProductShippingEstimateRequest(params: {
  sellerId: string;
  values: ProductShippingEstimateFormValues;
  price?: string;
}) {
  const quantity = Number(params.values.quantity.trim()) || 1;
  const dispatchRaw = params.values.dispatchDays.trim();

  return {
    seller: params.sellerId,
    destinationCountry: params.values.destinationCountry.trim(),
    weight: parsePositiveDimension(params.values.weight)!,
    length: parsePositiveDimension(params.values.length)!,
    width: parsePositiveDimension(params.values.width)!,
    height: parsePositiveDimension(params.values.height)!,
    quantity,
    price: params.price?.trim() ? params.price.trim() : undefined,
    dispatchDays: dispatchRaw ? dispatchRaw : 0,
  };
}

export function formatEstimateAmount(
  result?: ProductShippingEstimateCarrierResult | null,
): string | null {
  if (!result || result.error) {
    return null;
  }

  const amount = result.shippingCostCad;
  if (amount == null || amount === '') {
    return null;
  }

  const numeric = Number(amount);
  if (!Number.isFinite(numeric)) {
    return `CAD ${amount}`;
  }

  return `CAD ${numeric.toFixed(2)}`;
}

export function formatEstimateError(result?: ProductShippingEstimateCarrierResult | null): string | null {
  return result?.error?.trim() || null;
}
