import { useCallback, type ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer, type NavigationState } from '@react-navigation/native';

import { rootLinking } from '../linking';
import { FloatingMarketplaceFooter } from './FloatingMarketplaceFooter';
import { FlyToCartOverlay } from './FlyToCartOverlay';
import { MarketplaceChromeProvider, useMarketplaceChrome } from './MarketplaceChromeProvider';
import { marketplaceNavigationRef } from './marketplaceNavigationRef';

function MarketplaceNavigationHost({ children }: { children: ReactNode }) {
  const { setRootNavigationState } = useMarketplaceChrome();

  const handleStateChange = useCallback(
    (state: NavigationState | undefined) => {
      setRootNavigationState(state);
    },
    [setRootNavigationState],
  );

  const handleReady = useCallback(() => {
    setRootNavigationState(marketplaceNavigationRef.getRootState());
  }, [setRootNavigationState]);

  return (
    <NavigationContainer
      ref={marketplaceNavigationRef}
      linking={rootLinking}
      onStateChange={handleStateChange}
      onReady={handleReady}
    >
      <View style={styles.root}>
        {children}
        <FlyToCartOverlay />
        <FloatingMarketplaceFooter />
      </View>
    </NavigationContainer>
  );
}

export function MarketplaceChromeShell({ children }: { children: ReactNode }) {
  return (
    <MarketplaceChromeProvider>
      <MarketplaceNavigationHost>{children}</MarketplaceNavigationHost>
    </MarketplaceChromeProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
