import { useStripe } from '@stripe/stripe-react-native';
import type { ReactNode } from 'react';

import { StripeCheckoutContextProvider } from './StripeCheckoutContext';

export function StripeCheckoutBridge({ children }: { children: ReactNode }) {
  const stripe = useStripe();

  return (
    <StripeCheckoutContextProvider
      value={{
        initPaymentSheet: stripe.initPaymentSheet,
        presentPaymentSheet: stripe.presentPaymentSheet,
        confirmPlatformPayPayment: stripe.confirmPlatformPayPayment,
        isPlatformPaySupported: stripe.isPlatformPaySupported,
        retrievePaymentIntent: stripe.retrievePaymentIntent,
      }}
    >
      {children}
    </StripeCheckoutContextProvider>
  );
}
