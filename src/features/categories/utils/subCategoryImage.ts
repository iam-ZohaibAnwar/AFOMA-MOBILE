import { env } from '../../../app/config/env';

const PLACEHOLDER_PATH = '/placeholder.jpg';

function getAssetBaseUrl(): string {
  return env.apiUrl.replace(/\/$/, '');
}

/**
 * Public URL for a subcategory hero image — mirrors web `getSubCategoryImageSrc`.
 * Assets are served from the same host as the storefront/API base URL.
 */
export function getSubCategoryImageUrl(slug: string | undefined | null): string {
  const base = getAssetBaseUrl();
  if (!base) {
    return PLACEHOLDER_PATH;
  }

  if (slug == null) {
    return `${base}${PLACEHOLDER_PATH}`;
  }

  const trimmed = String(slug).trim();
  if (trimmed === '') {
    return `${base}${PLACEHOLDER_PATH}`;
  }

  return `${base}/assets/Sub-Category%20Images/${encodeURIComponent(trimmed)}.jpg`;
}

export function getCategoryPlaceholderImageUrl(): string {
  const base = getAssetBaseUrl();
  return base ? `${base}${PLACEHOLDER_PATH}` : PLACEHOLDER_PATH;
}
