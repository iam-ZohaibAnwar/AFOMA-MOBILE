import type { CreateCheckoutOrderRequest } from '../types/order';
import { apiPost } from './request';

export interface CreateStripePaymentIntentRequest {
  amount: number;
  currency_code: string;
  productName: string;
}

export interface CreateStripePaymentIntentResponse {
  client_secret?: string;
  clientSecret?: string;
}

export interface InitializeKorapayResponse {
  success?: boolean;
  checkout_url?: string;
  reference?: string;
  message?: string;
}

/** POST /payments/payment/intent — Stripe card + Apple Pay (web checkout parity). */
export async function createStripePaymentIntent(
  body: CreateStripePaymentIntentRequest,
): Promise<CreateStripePaymentIntentResponse> {
  return apiPost<CreateStripePaymentIntentResponse>(
    '/payments/payment/intent',
    body,
    undefined,
    'Failed to initialize card payment',
  );
}

export function extractStripeClientSecret(
  response: CreateStripePaymentIntentResponse,
): string | undefined {
  return response.client_secret ?? response.clientSecret;
}

/** POST /korapay/initialize — hosted Korapay checkout (web checkout parity). */
export async function initializeKorapayCheckout(
  body: CreateCheckoutOrderRequest,
): Promise<InitializeKorapayResponse> {
  return apiPost<InitializeKorapayResponse>(
    '/korapay/initialize',
    body,
    undefined,
    'Failed to start Korapay checkout',
  );
}
