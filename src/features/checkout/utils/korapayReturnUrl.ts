function tryParseUrl(url: string): URL | null {
  try {
    return new URL(url);
  } catch {
    return null;
  }
}

export function isKorapayDeepLinkUrl(url: string): boolean {
  return url.trim().toLowerCase().startsWith('afoma://checkout/korapay');
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

  if (isKorapayDeepLinkUrl(url)) {
    return true;
  }

  // Web checkout only (not used by the mobile app).
  if (url.toLowerCase().includes('redirect-page')) {
    return true;
  }

  return false;
}

export function isKorapayCheckoutCancelledUrl(url: string): boolean {
  const lower = url.toLowerCase();
  return lower.includes('cancel') || lower.includes('cancelled') || lower.includes('canceled');
}
