import { env } from '../../../app/config/env';

function tryParseUrl(url: string): URL | null {
  try {
    return new URL(url);
  } catch {
    return null;
  }
}

export function extractKorapayReference(url: string): string | null {
  const parsed = tryParseUrl(url);
  if (!parsed) {
    return null;
  }

  const reference = parsed.searchParams.get('reference');
  return reference?.trim() ? reference.trim() : null;
}

export function isKorapayReturnUrl(url: string): boolean {
  const reference = extractKorapayReference(url);
  if (!reference) {
    return false;
  }

  const parsed = tryParseUrl(url);
  if (!parsed) {
    return false;
  }

  const host = parsed.hostname.toLowerCase();
  const path = parsed.pathname.toLowerCase();

  if (path.includes('redirect-page')) {
    return true;
  }

  if (host.includes('afomamarketplace.com')) {
    return true;
  }

  if (env.webUrl) {
    try {
      const webHost = new URL(env.webUrl).hostname.toLowerCase();
      if (host === webHost) {
        return true;
      }
    } catch {
      /* ignore invalid env url */
    }
  }

  return false;
}

export function isKorapayCheckoutCancelledUrl(url: string): boolean {
  const lower = url.toLowerCase();
  return lower.includes('cancel') || lower.includes('cancelled') || lower.includes('canceled');
}
