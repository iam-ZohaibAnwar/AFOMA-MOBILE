export const env = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? '',
  apiKey: process.env.EXPO_PUBLIC_API_KEY ?? '',
  webUrl: process.env.EXPO_PUBLIC_WEB_URL ?? '',
  paypalClientId: process.env.EXPO_PUBLIC_PAYPAL_CLIENT_ID ?? '',
  stripePublishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '',
  stripeMerchantIdentifier: process.env.EXPO_PUBLIC_STRIPE_MERCHANT_IDENTIFIER ?? '',
};
