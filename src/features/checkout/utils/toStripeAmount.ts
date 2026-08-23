const ZERO_DECIMAL_CURRENCIES = new Set([
  'bif',
  'clp',
  'djf',
  'gnf',
  'jpy',
  'kmf',
  'krw',
  'mga',
  'pyg',
  'rwf',
  'vnd',
  'vuv',
  'xaf',
  'xof',
  'xpf',
]);

/** Stripe amounts are always in the smallest currency unit (web checkout parity). */
export function toStripeAmount(amount: number, currency: string): number {
  const currencyLower = currency.toLowerCase();

  if (ZERO_DECIMAL_CURRENCIES.has(currencyLower)) {
    return Math.round(amount);
  }

  return Math.round(Number(amount) * 100);
}
