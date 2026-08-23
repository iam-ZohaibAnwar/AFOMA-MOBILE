import type { UserPricingInfo } from '../../../services/pricing/types';

const PAYPAL_USD_COUNTRIES = ['Pakistan', 'Nigeria'];

export function resolvePayPalCheckoutCurrency(
  userInfo: UserPricingInfo,
  shippingCountry?: string,
): string {
  const country = (shippingCountry || userInfo.country || '').trim();

  if (
    PAYPAL_USD_COUNTRIES.some(
      (blockedCountry) => blockedCountry.toLowerCase() === country.toLowerCase(),
    )
  ) {
    return 'USD';
  }

  return userInfo.currency ?? 'CAD';
}

export function resolvePayPalConversionRate(
  userInfo: UserPricingInfo,
  paypalCurrency: string,
): number {
  const displayCurrency = userInfo.currency ?? 'CAD';
  if (paypalCurrency === displayCurrency) {
    return userInfo.currencyRate ?? 1;
  }

  if (paypalCurrency === 'USD' && displayCurrency === 'CAD') {
    return userInfo.currencyRate ?? 1;
  }

  return userInfo.currencyRate ?? 1;
}
