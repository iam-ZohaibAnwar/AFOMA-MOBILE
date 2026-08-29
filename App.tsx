import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { MarketplaceChromeShell } from './src/app/navigation/marketplaceChrome';
import { AuthProvider } from './src/app/providers/AuthProvider';
import { CartProvider } from './src/app/providers/CartProvider';
import { PricingProvider } from './src/app/providers/PricingProvider';
import { StripeAppProvider } from './src/app/providers/StripeAppProvider';
import { preparePayPalAuthSession } from './src/features/checkout/utils/openPayPalAuthSession';
import { RootNavigator } from './src/app/navigation/RootNavigator';
import { prefetchCategoryTree } from './src/services/cache/categoryTreeCache';

export default function App() {
  preparePayPalAuthSession();

  useEffect(() => {
    prefetchCategoryTree();
  }, []);

  return (
    <SafeAreaProvider>
      <StripeAppProvider>
        <AuthProvider>
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
    </SafeAreaProvider>
  );
}
