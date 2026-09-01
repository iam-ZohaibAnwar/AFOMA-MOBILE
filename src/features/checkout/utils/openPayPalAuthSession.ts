import { Linking } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

import { resolvePayPalAuthRedirectUrl } from './resolvePayPalMobileReturnUrl';
import {
  isPayPalApprovalCompleteUrl,
  isPayPalCheckoutCancelledUrl,
  isPayPalExternalReturnUrl,
} from './paypalReturnUrl';

export type PayPalAuthSessionResult =
  | { status: 'approved'; returnUrl: string }
  | { status: 'cancelled' };

/** Required on Android so auth sessions can finish cleanly. */
export function preparePayPalAuthSession(): void {
  WebBrowser.maybeCompleteAuthSession();
}

function readDeepLinkResult(url: string): PayPalAuthSessionResult | null {
  if (isPayPalCheckoutCancelledUrl(url)) {
    return { status: 'cancelled' };
  }

  if (isPayPalApprovalCompleteUrl(url)) {
    return { status: 'approved', returnUrl: url };
  }

  if (isPayPalExternalReturnUrl(url)) {
    return { status: 'approved', returnUrl: url };
  }

  return null;
}

function readAuthSessionResult(
  result: WebBrowser.WebBrowserAuthSessionResult,
): PayPalAuthSessionResult | null {
  if (result.type !== 'success' || !result.url) {
    return null;
  }

  return readDeepLinkResult(result.url);
}

/**
 * Opens PayPal in a system auth session (Safari / Chrome Custom Tab).
 * The browser auto-closes when PayPal redirects to the configured return URL prefix.
 */
export async function openPayPalAuthSession(approvalUrl: string): Promise<PayPalAuthSessionResult> {
  preparePayPalAuthSession();

  const redirectUrl = resolvePayPalAuthRedirectUrl();
  let deepLinkResult: PayPalAuthSessionResult | null = null;

  const subscription = Linking.addEventListener('url', ({ url }) => {
    const parsed = readDeepLinkResult(url);
    if (!parsed) {
      return;
    }

    deepLinkResult = parsed;
    void WebBrowser.dismissBrowser();
  });

  try {
    const result = await WebBrowser.openAuthSessionAsync(approvalUrl, redirectUrl, {
      showInRecents: true,
      createTask: false,
      preferEphemeralSession: false,
    });

    const sessionResult = readAuthSessionResult(result);
    if (sessionResult) {
      return sessionResult;
    }

    if (result.type === 'cancel' || result.type === 'dismiss') {
      if (deepLinkResult) {
        return deepLinkResult;
      }

      return { status: 'cancelled' };
    }

    if (deepLinkResult) {
      return deepLinkResult;
    }

    return { status: 'cancelled' };
  } finally {
    subscription.remove();
  }
}

/** @deprecated Use openPayPalAuthSession */
export const openPayPalCheckoutBrowser = openPayPalAuthSession;
