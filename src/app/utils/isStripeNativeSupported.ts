import Constants from 'expo-constants';

import { env } from '../config/env';

export function isStripeConfigured(): boolean {
  return Boolean(env.stripePublishableKey?.trim());
}

/** Card checkout via Stripe Payment Sheet (supported in Expo Go + dev builds). */
export function isStripeCardCheckoutSupported(): boolean {
  return isStripeConfigured();
}

/** Apple Pay / Google Pay require a dev or store build — not Expo Go. */
export function isStripePlatformPaySupported(): boolean {
  return isStripeConfigured() && Constants.appOwnership !== 'expo';
}

/** @deprecated Use isStripeCardCheckoutSupported or isStripePlatformPaySupported */
export function isStripeNativeSupported(): boolean {
  return isStripeCardCheckoutSupported();
}
