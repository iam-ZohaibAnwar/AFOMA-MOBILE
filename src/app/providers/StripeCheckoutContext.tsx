import { createContext, useContext, type ReactNode } from 'react';
import type { PaymentIntent, StripeError } from '@stripe/stripe-react-native';

export interface StripeCheckoutActions {
  confirmPayment: (
    paymentIntentClientSecret: string,
    params?: Parameters<
      ReturnType<typeof import('@stripe/stripe-react-native').useStripe>['confirmPayment']
    >[1],
  ) => Promise<{
    error?: StripeError;
    paymentIntent?: PaymentIntent;
  }>;
  confirmPlatformPayPayment: (
    clientSecret: string,
    params?: Parameters<
      ReturnType<
        typeof import('@stripe/stripe-react-native').useStripe
      >['confirmPlatformPayPayment']
    >[1],
  ) => Promise<{
    error?: StripeError;
    paymentIntent?: PaymentIntent;
  }>;
  isPlatformPaySupported: (
    params?: Parameters<
      ReturnType<
        typeof import('@stripe/stripe-react-native').useStripe
      >['isPlatformPaySupported']
    >[0],
  ) => Promise<boolean>;
}

const StripeCheckoutContext = createContext<StripeCheckoutActions | null>(null);

export function StripeCheckoutContextProvider({
  value,
  children,
}: {
  value: StripeCheckoutActions | null;
  children: ReactNode;
}) {
  return (
    <StripeCheckoutContext.Provider value={value}>{children}</StripeCheckoutContext.Provider>
  );
}

export function useStripeCheckoutActions(): StripeCheckoutActions | null {
  return useContext(StripeCheckoutContext);
}
