/** African currencies that use Korapay instead of Stripe card (web checkout parity). */
export const KORAPAY_CURRENCIES = [
  'NGN',
  'GHS',
  'ZAR',
  'KES',
  'UGX',
  'TZS',
  'XOF',
  'RWF',
  'XAF',
] as const;

export type CheckoutPaymentMethod = 'paypal' | 'stripe' | 'korapay';

export function usesKorapayCheckout(currency: string): boolean {
  return KORAPAY_CURRENCIES.includes(currency.toUpperCase() as (typeof KORAPAY_CURRENCIES)[number]);
}
