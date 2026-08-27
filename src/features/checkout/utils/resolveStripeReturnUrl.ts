/** Deep-link scheme from app.json (`expo.scheme`). */
export const APP_URL_SCHEME = 'afoma';

/** URL scheme for StripeProvider (3DS redirects). */
export function resolveStripeUrlScheme(): string {
  return APP_URL_SCHEME;
}

/** Return URL passed to Stripe Payment Sheet after card authentication. */
export function resolveStripeReturnUrl(): string {
  return `${APP_URL_SCHEME}://checkout/stripe-return`;
}
