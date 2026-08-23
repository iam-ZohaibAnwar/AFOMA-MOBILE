import { Linking } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

import {
  isPayPalApprovalCompleteUrl,
  isPayPalCheckoutCancelledUrl,
  isPayPalExternalReturnUrl,
} from './paypalReturnUrl';

export type PayPalAuthSessionResult =
  | { status: 'approved'; returnUrl: string }
  | { status: 'cancelled' }
  | { status: 'dismissed' };

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

/**
 * Opens PayPal in the system browser.
 *
 * The backend currently redirects buyers to the web storefront after approval,
 * which cannot reopen a local Expo Go build. After approving in PayPal, close
 * the browser tab — the app captures the approved order when the browser closes.
 */
export async function openPayPalAuthSession(approvalUrl: string): Promise<PayPalAuthSessionResult> {
  preparePayPalAuthSession();

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
    await WebBrowser.openBrowserAsync(approvalUrl, {
      showInRecents: true,
      createTask: false,
    });

    if (deepLinkResult) {
      return deepLinkResult;
    }

    return { status: 'dismissed' };
  } finally {
    subscription.remove();
  }
}

/** @deprecated Use openPayPalAuthSession */
export const openPayPalCheckoutBrowser = openPayPalAuthSession;
