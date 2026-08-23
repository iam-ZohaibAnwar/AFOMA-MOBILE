export interface ProductShippingEstimatePrefill {
  weight: string;
  length: string;
  width: string;
  height: string;
  dispatchDays: string;
  quantity?: string;
  price?: string;
}

export interface ProductShippingEstimateFormValues {
  destinationCountry: string;
  weight: string;
  length: string;
  width: string;
  height: string;
  quantity: string;
  dispatchDays: string;
}

export function productShippingEstimateFormFromPrefill(
  prefill: ProductShippingEstimatePrefill,
): ProductShippingEstimateFormValues {
  return {
    destinationCountry: '',
    weight: prefill.weight.trim(),
    length: prefill.length.trim(),
    width: prefill.width.trim(),
    height: prefill.height.trim(),
    quantity: prefill.quantity?.trim() || '1',
    dispatchDays: prefill.dispatchDays.trim(),
  };
}
