import { Platform } from 'react-native';

/**
 * Korapay return URL for mobile — stays in the app via WebView interception.
 * No web storefront redirect; backend forwards this to Korapay when client=mobile.
 */
export function resolveKorapayMobileReturnUrl(): string {
  const configured = process.env.EXPO_PUBLIC_KORAPAY_RETURN_URL?.trim();
  if (configured) {
    return configured;
  }

  const query = Platform.OS === 'android' ? '?platform=android' : '?platform=ios';
  return `afoma://checkout/korapay${query}`;
}

/** URL sent to POST /korapay/initialize as redirect_url. */
export function resolveKorapayAuthRedirectUrl(): string {
  return resolveKorapayMobileReturnUrl();
}

/** @deprecated Use {@link resolveKorapayAuthRedirectUrl}. */
export function resolveKorapayMobileRedirectUrl(): string {
  return resolveKorapayAuthRedirectUrl();
}
