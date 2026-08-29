import { env } from '../app/config/env';

/**
 * Normalizes user profile image values from the API.
 * Backend may return a full URL (`imageUrl`) or a filename under `/userprofile/`.
 */
export function resolveUserProfileImageUrl(value?: string | null): string | undefined {
  const raw = value?.trim();
  if (!raw) {
    return undefined;
  }

  if (/^https?:\/\//i.test(raw)) {
    return raw;
  }

  const base = env.apiUrl.replace(/\/$/, '');
  if (!base) {
    return raw;
  }

  if (raw.startsWith('/')) {
    return `${base}${raw}`;
  }

  return `${base}/userprofile/${raw}`;
}
