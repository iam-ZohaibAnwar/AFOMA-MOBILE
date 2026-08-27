import { Platform } from 'react-native';

import { env } from '../../../app/config/env';

function appendQueryParam(baseUrl: string, key: string, value: string): string {
  const separator = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${separator}${key}=${encodeURIComponent(value)}`;
}

/** Deep link PayPal can return to after buyer approval. */
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
  return appendQueryParam(resolvePayPalMobileReturnUrl(), 'cancel', 'true');
}

/**
 * Redirect URL prefix for `WebBrowser.openAuthSessionAsync`.
 * Must match the return_url sent to PayPal (see backend resolvePayPalMobileApplicationContext).
 */
export function resolvePayPalAuthRedirectUrl(): string {
  const mobileReturnUrl = resolvePayPalMobileReturnUrl();

  if (mobileReturnUrl.startsWith('afoma://')) {
    return 'afoma://checkout/paypal';
  }

  const explicit = process.env.EXPO_PUBLIC_PAYPAL_AUTH_REDIRECT_URL?.trim();
  if (explicit) {
    return explicit;
  }

  const origin = resolvePayPalStorefrontOrigin();
  if (origin) {
    return origin;
  }

  return mobileReturnUrl;
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
