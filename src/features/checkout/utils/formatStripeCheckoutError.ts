/** Maps Stripe SDK errors to clearer checkout messages. */
export function formatStripeCheckoutError(message: string | undefined, fallback: string): string {
  const normalized = message?.trim() ?? '';

  if (/no such payment.?intent/i.test(normalized)) {
    return 'Card checkout is misconfigured: Stripe keys do not match. Use the secret key from the same Stripe account as the app publishable key.';
  }

  return normalized || fallback;
}
