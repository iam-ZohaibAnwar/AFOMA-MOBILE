export type CheckoutConfirmingVariant = 'stripe' | 'paypal' | 'default';

const CONFIRMING_TITLES: Record<CheckoutConfirmingVariant, string> = {
  stripe: 'Confirming your payment',
  paypal: 'Confirming with PayPal',
  default: 'Finishing your order',
};

const CONFIRMING_MESSAGES: Record<CheckoutConfirmingVariant, string[]> = {
  stripe: [
    'Securing your card payment…',
    'Confirming with your bank…',
    'Creating your order…',
  ],
  paypal: [
    'Confirming your PayPal payment…',
    'Creating your order…',
    'Almost done…',
  ],
  default: ['Creating your order…', 'Just a moment…', 'Almost done…'],
};

export function getCheckoutConfirmingTitle(variant: CheckoutConfirmingVariant): string {
  return CONFIRMING_TITLES[variant];
}

export function getCheckoutConfirmingMessages(variant: CheckoutConfirmingVariant): string[] {
  return CONFIRMING_MESSAGES[variant];
}

export function getCheckoutSuccessTitle(): string {
  return 'Order successful';
}

export function getCheckoutSuccessMessage(): string {
  return 'Your order will be packed by the seller and should arrive within 3 to 4 business days.';
}

export function getCheckoutPayButtonLoadingLabel(input: {
  isEstablishingGuest?: boolean;
  selectedPayment?: string;
  isPlacingOrder?: boolean;
  isKorapayInitializing?: boolean;
}): string {
  if (input.isEstablishingGuest) {
    return 'Preparing checkout…';
  }

  if (input.isKorapayInitializing && input.selectedPayment === 'korapay') {
    return 'Opening Korapay…';
  }

  if (input.isPlacingOrder && input.selectedPayment === 'paypal') {
    return 'Connecting to PayPal…';
  }

  return 'One moment…';
}
