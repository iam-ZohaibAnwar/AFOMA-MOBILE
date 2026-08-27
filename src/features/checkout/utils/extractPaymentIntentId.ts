/** Extracts `pi_…` from a Stripe PaymentIntent client secret. */
export function extractPaymentIntentId(clientSecret: string): string {
  const intentId = clientSecret.split('_secret_')[0]?.trim();

  if (!intentId?.startsWith('pi_')) {
    throw new Error('Invalid Stripe payment session');
  }

  return intentId;
}
