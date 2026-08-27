import type { BillingDetails } from '@stripe/stripe-react-native';

import type { CheckoutOrderParams } from './buildCheckoutOrderPayload';

export function buildStripeBillingDetails(params: CheckoutOrderParams): BillingDetails {
  const address = params.shippingAddress;
  const country = address.countryCode?.trim() || address.country.trim();

  return {
    name: address.name.trim() || undefined,
    email: address.email.trim() || undefined,
    phone: address.phone.trim() || undefined,
    address: {
      line1: address.streetAddress.trim() || undefined,
      city: address.city.trim() || undefined,
      state: address.stateCode?.trim() || address.state.trim() || undefined,
      postalCode: address.zip.trim() || undefined,
      country: country.length === 2 ? country.toUpperCase() : undefined,
    },
  };
}
