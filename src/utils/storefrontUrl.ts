import { env } from '../app/config/env';

const DEFAULT_STOREFRONT_URL = 'https://afomamarketplace.com';

/**
 * Public shopper site origin — web parity with NEXT_PUBLIC_URL.
 * Must NOT be the API/backend host (NEXT_PUBLIC_BASE_URL).
 */
export function getStorefrontBaseUrl(): string {
  const base = env.storefrontUrl?.trim().replace(/\/$/, '');
  return base || DEFAULT_STOREFRONT_URL;
}

export function buildStorefrontProductUrl(slug?: string, productId?: string): string | undefined {
  const routeId = slug?.trim() || productId?.trim();
  if (!routeId) {
    return undefined;
  }

  return `${getStorefrontBaseUrl()}/product/${encodeURIComponent(routeId)}`;
}

export function buildStorefrontPreviewUrl(slug?: string): string | undefined {
  const trimmed = slug?.trim();
  if (!trimmed) {
    return undefined;
  }

  return `${getStorefrontBaseUrl()}/preview/${encodeURIComponent(trimmed)}`;
}
