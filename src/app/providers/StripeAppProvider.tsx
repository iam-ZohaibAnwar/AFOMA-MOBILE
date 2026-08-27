import type { ReactNode } from 'react';
import { Platform } from 'react-native';
import { StripeProvider } from '@stripe/stripe-react-native';

import { env } from '../config/env';
import { isStripeConfigured } from '../utils/isStripeNativeSupported';
import { resolveStripeUrlScheme } from '../../features/checkout/utils/resolveStripeReturnUrl';
import { StripeCheckoutBridge } from './StripeCheckoutBridge';
import { StripeCheckoutContextProvider } from './StripeCheckoutContext';

export function StripeAppProvider({ children }: { children: ReactNode }) {
  if (!isStripeConfigured()) {
    return (
      <StripeCheckoutContextProvider value={null}>{children}</StripeCheckoutContextProvider>
    );
  }

  const merchantIdentifier =
    Platform.OS === 'ios' && env.stripeMerchantIdentifier
      ? env.stripeMerchantIdentifier
      : undefined;

  return (
    <StripeProvider
      publishableKey={env.stripePublishableKey}
      merchantIdentifier={merchantIdentifier}
      urlScheme={resolveStripeUrlScheme()}
    >
      <StripeCheckoutBridge>{children}</StripeCheckoutBridge>
    </StripeProvider>
  );
}
