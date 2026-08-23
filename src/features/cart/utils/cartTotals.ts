/**
 * Stripe service fee used on web cart/checkout:
 * (subtotal + shipping) * 3% + $0.30
 */
export function calculateServiceChargeCad(subtotalCad: number, shippingCad: number): number {
  const subtotal = Number.isFinite(subtotalCad) ? subtotalCad : 0;
  const shipping = Number.isFinite(shippingCad) ? shippingCad : 0;
  return parseFloat(((subtotal + shipping) * 0.03 + 0.3).toFixed(2));
}

export function toDisplayAmount(amountCad: number, currencyRate = 1): number {
  return parseFloat((amountCad * currencyRate).toFixed(2));
}

export interface CartTotalsInput {
  subtotalCad: number;
  shippingCad: number;
  discountDisplay?: number;
  currencyRate?: number;
  shippingPending?: boolean;
}

export interface CartTotalsResult {
  displaySubtotal: number;
  displayShipping: number | null;
  displayServiceCharge: number | null;
  displayDiscount: number;
  displayTotal: number | null;
  serviceChargeCad: number;
}

export function calculateCartTotals({
  subtotalCad,
  shippingCad,
  discountDisplay = 0,
  currencyRate = 1,
  shippingPending = false,
}: CartTotalsInput): CartTotalsResult {
  const displaySubtotal = toDisplayAmount(subtotalCad, currencyRate);
  const displayDiscount = discountDisplay;

  if (shippingPending) {
    return {
      displaySubtotal,
      displayShipping: null,
      displayServiceCharge: null,
      displayDiscount,
      displayTotal: null,
      serviceChargeCad: calculateServiceChargeCad(subtotalCad, 0),
    };
  }

  const serviceChargeCad = calculateServiceChargeCad(subtotalCad, shippingCad);
  const displayShipping = toDisplayAmount(shippingCad, currencyRate);
  const displayServiceCharge = toDisplayAmount(serviceChargeCad, currencyRate);
  const displayTotal = Math.max(
    0,
    parseFloat((displaySubtotal - displayDiscount + displayShipping + displayServiceCharge).toFixed(2)),
  );

  return {
    displaySubtotal,
    displayShipping,
    displayServiceCharge,
    displayDiscount,
    displayTotal,
    serviceChargeCad,
  };
}
