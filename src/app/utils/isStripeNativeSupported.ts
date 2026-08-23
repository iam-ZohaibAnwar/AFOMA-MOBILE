import Constants from 'expo-constants';

import { env } from '../config/env';

/** Stripe React Native needs a dev build; Expo Go does not include the native module. */
export function isStripeNativeSupported(): boolean {
  if (!env.stripePublishableKey) {
    return false;
  }

  return Constants.appOwnership !== 'expo';
}
