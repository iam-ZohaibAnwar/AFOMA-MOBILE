import { env } from '../../../app/config/env';

export function getProductShareUrl(slug?: string, productId?: string): string | undefined {
  const routeId = slug?.trim() || productId?.trim();
  if (!routeId) {
    return undefined;
  }

  const base =
    env.webUrl?.replace(/\/$/, '') ||
    env.apiUrl?.replace(/\/$/, '') ||
    'https://afomamarketplace.com';

  return `${base}/product/${encodeURIComponent(routeId)}`;
}
