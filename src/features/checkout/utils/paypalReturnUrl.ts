import { env } from '../../../app/config/env';

const MERCHANT_HOSTS = ['afomamarketplace.com'];

function tryParseUrl(url: string): URL | null {
  try {
    return new URL(url);
  } catch {
    return null;
  }
}

function getConfiguredMerchantHosts(): string[] {
  const hosts = new Set<string>(MERCHANT_HOSTS);

  for (const candidate of [env.webUrl, env.apiUrl]) {
    if (!candidate) {
      continue;
    }

    try {
      hosts.add(new URL(candidate).hostname.toLowerCase());
    } catch {
      // Ignore invalid env URLs.
    }
  }

  return Array.from(hosts);
}

function isMerchantHost(hostname: string): boolean {
  const normalized = hostname.toLowerCase();
  return getConfiguredMerchantHosts().some(
    (host) => normalized === host || normalized.endsWith(`.${host}`),
  );
}

function isPayPalHost(hostname: string): boolean {
  return hostname.toLowerCase().includes('paypal.com');
}

function isAppReturnHost(hostname: string): boolean {
  return hostname.toLowerCase() === 'afoma';
}

function isAppReturnUrl(url: string): boolean {
  return url.trim().toLowerCase().startsWith('afoma://');
}

function readPayerId(parsed: URL): string | undefined {
  const payerId =
    parsed.searchParams.get('PayerID') ??
    parsed.searchParams.get('payerID') ??
    parsed.searchParams.get('PayerId') ??
    parsed.searchParams.get('paymentId');

  return payerId?.trim() ? payerId.trim() : undefined;
}

function readPayPalToken(parsed: URL): string | undefined {
  const token = parsed.searchParams.get('token') ?? parsed.searchParams.get('Token');
  return token?.trim() ? token.trim() : undefined;
}

export function isPayPalCheckoutUrl(url: string): boolean {
  const parsed = tryParseUrl(url);
  if (!parsed) {
    return false;
  }

  return isPayPalHost(parsed.hostname);
}

export function isPayPalCheckoutCancelledUrl(url: string): boolean {
  const parsed = tryParseUrl(url);
  if (!parsed) {
    return false;
  }

  if (parsed.searchParams.get('cancel') === 'true') {
    return true;
  }

  const path = parsed.pathname.toLowerCase();

  if (isPayPalHost(parsed.hostname)) {
    return path.includes('/cancel') || path.endsWith('cancel');
  }

  if (isMerchantHost(parsed.hostname)) {
    return path.includes('/cancel') || path.includes('payment-cancel');
  }

  return false;
}

/** Approval is complete once PayPal adds PayerID/paymentId to the URL. */
export function isPayPalApprovalCompleteUrl(url: string): boolean {
  const parsed = tryParseUrl(url);
  if (!parsed || isPayPalCheckoutCancelledUrl(url)) {
    return false;
  }

  const hostname = parsed.hostname.toLowerCase();
  const path = parsed.pathname.toLowerCase();

  if (readPayerId(parsed)) {
    return true;
  }

  if (isAppReturnUrl(url) && readPayPalToken(parsed)) {
    return true;
  }

  if (isAppReturnHost(hostname) && readPayPalToken(parsed)) {
    return true;
  }

  if (isPayPalHost(hostname)) {
    if (
      path.includes('/webapps/hermes') ||
      path.includes('/checkoutweb/return') ||
      path.includes('/checkoutweb/approve') ||
      path.includes('/signin/return')
    ) {
      return Boolean(readPayPalToken(parsed));
    }
  }

  if (isMerchantHost(hostname)) {
    if (path.includes('thank-you') || path.includes('payment-success')) {
      return true;
    }

    return Boolean(readPayerId(parsed));
  }

  return false;
}

/** PayPal redirected back to the storefront or app deep link. */
export function isPayPalExternalReturnUrl(url: string): boolean {
  const parsed = tryParseUrl(url);
  if (!parsed || isPayPalCheckoutCancelledUrl(url)) {
    return false;
  }

  const hostname = parsed.hostname.toLowerCase();

  if (isPayPalHost(hostname)) {
    return false;
  }

  return isAppReturnUrl(url) || isAppReturnHost(hostname) || isMerchantHost(hostname);
}

export interface PayPalReturnContext {
  orderId?: string;
  payerId?: string;
}

export function extractPayPalReturnContext(url: string): PayPalReturnContext | null {
  const parsed = tryParseUrl(url);
  if (!parsed) {
    return null;
  }

  const payerId = readPayerId(parsed);
  const orderId = readPayPalToken(parsed);

  if (!payerId && !orderId) {
    return null;
  }

  return {
    orderId: orderId ?? undefined,
    payerId: payerId ?? undefined,
  };
}

export function resolvePayPalOrderIdForCapture(
  sessionOrderId: string,
  returnUrl?: string,
): string {
  if (!returnUrl) {
    return sessionOrderId;
  }

  const context = extractPayPalReturnContext(returnUrl);
  return context?.orderId ?? sessionOrderId;
}
