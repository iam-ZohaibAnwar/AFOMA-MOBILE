export const env = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? '',
  socketUrl: process.env.EXPO_PUBLIC_SOCKET_URL ?? process.env.EXPO_PUBLIC_API_URL ?? '',
  apiKey: process.env.EXPO_PUBLIC_API_KEY ?? '',
  storefrontUrl: process.env.EXPO_PUBLIC_STOREFRONT_URL ?? '',
  webUrl: process.env.EXPO_PUBLIC_WEB_URL ?? '',
  paypalClientId: process.env.EXPO_PUBLIC_PAYPAL_CLIENT_ID ?? '',
  stripePublishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '',
  stripeMerchantIdentifier: process.env.EXPO_PUBLIC_STRIPE_MERCHANT_IDENTIFIER ?? '',
};
