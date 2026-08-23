import { Platform, type ReactNode } from 'react';
import { StripeProvider } from '@stripe/stripe-react-native';

import { env } from '../config/env';
import { isStripeNativeSupported } from '../utils/isStripeNativeSupported';
import { StripeCheckoutBridge } from './StripeCheckoutBridge';
import { StripeCheckoutContextProvider } from './StripeCheckoutContext';

export function StripeAppProvider({ children }: { children: ReactNode }) {
  if (!isStripeNativeSupported()) {
    return (
      <StripeCheckoutContextProvider value={null}>{children}</StripeCheckoutContextProvider>
    );
  }

  const merchantIdentifier =
    Platform.OS === 'ios' && env.stripeMerchantIdentifier
      ? env.stripeMerchantIdentifier
      : undefined;

  return (
    <StripeProvider publishableKey={env.stripePublishableKey} merchantIdentifier={merchantIdentifier}>
      <StripeCheckoutBridge>{children}</StripeCheckoutBridge>
    </StripeProvider>
  );
}
