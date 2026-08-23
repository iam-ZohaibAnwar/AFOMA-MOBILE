import { Platform } from 'react-native';

import { env } from '../../../app/config/env';

/** Deep link PayPal can return to once the backend supports a mobile return URL. */
export function resolvePayPalMobileReturnUrl(): string {
  const configured = process.env.EXPO_PUBLIC_PAYPAL_RETURN_URL?.trim();
  if (configured) {
    return configured;
  }

  const query = Platform.OS === 'android' ? '?platform=android' : '?platform=ios';
  return `afoma://checkout/paypal${query}`;
}

/** Cancel URL paired with {@link resolvePayPalMobileReturnUrl}. */
export function resolvePayPalMobileCancelUrl(): string {
  return `${resolvePayPalMobileReturnUrl()}&cancel=true`;
}

/** Storefront origin used when PayPal redirects to the website instead of the app. */
export function resolvePayPalStorefrontOrigin(): string | null {
  for (const candidate of [env.webUrl, env.apiUrl]) {
    if (!candidate) {
      continue;
    }

    try {
      const parsed = new URL(candidate);
      return `${parsed.protocol}//${parsed.host}`;
    } catch {
      const normalized = candidate.replace(/\/$/, '');
      if (normalized) {
        return normalized;
      }
    }
  }

  return null;
}
