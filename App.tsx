import { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from './src/app/providers/AuthProvider';
import { PricingProvider } from './src/app/providers/PricingProvider';
import { StripeAppProvider } from './src/app/providers/StripeAppProvider';
import { preparePayPalAuthSession } from './src/features/checkout/utils/openPayPalAuthSession';
import { rootLinking } from './src/app/navigation/linking';
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
            <NavigationContainer linking={rootLinking}>
              <RootNavigator />
              <StatusBar style="dark" />
            </NavigationContainer>
          </PricingProvider>
        </AuthProvider>
      </StripeAppProvider>
    </SafeAreaProvider>
  );
}
