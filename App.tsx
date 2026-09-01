import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { MarketplaceChromeShell } from './src/app/navigation/marketplaceChrome';
import { AuthProvider } from './src/app/providers/AuthProvider';
import { CartProvider } from './src/app/providers/CartProvider';
import { PricingProvider } from './src/app/providers/PricingProvider';
import { StripeAppProvider } from './src/app/providers/StripeAppProvider';
import { preparePayPalAuthSession } from './src/features/checkout/utils/openPayPalAuthSession';
import { RootNavigator } from './src/app/navigation/RootNavigator';
import { prefetchCategoryTree } from './src/services/cache/categoryTreeCache';
import { PushNotificationBootstrap } from './src/services/push/PushNotificationBootstrap';

export default function App() {
  preparePayPalAuthSession();

  useEffect(() => {
    prefetchCategoryTree();
  }, []);

  return (
    <SafeAreaProvider>
      <KeyboardProvider preload={false}>
        <StripeAppProvider>
          <AuthProvider>
            <PushNotificationBootstrap />
            <PricingProvider>
              <CartProvider>
                <MarketplaceChromeShell>
                  <RootNavigator />
                </MarketplaceChromeShell>
                <StatusBar style="dark" />
              </CartProvider>
            </PricingProvider>
          </AuthProvider>
        </StripeAppProvider>
      </KeyboardProvider>
    </SafeAreaProvider>
  );
}
