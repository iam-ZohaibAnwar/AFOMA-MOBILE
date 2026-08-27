import { useEffect } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { spacing } from '../../../design-system';
import { useMarketplaceChrome } from './MarketplaceChromeProvider';
import { MarketplaceFooterPill } from './MarketplaceFooterPill';
import {
  getMarketplaceFooterSafeInset,
  MARKETPLACE_FOOTER_BOTTOM_GAP,
} from './marketplaceFooterLayout';
import {
  getMarketplaceFooterNavFingerprint,
  shouldShowMarketplaceFooter,
} from './resolveMarketplaceActiveTab';

export function FloatingMarketplaceFooter() {
  const insets = useSafeAreaInsets();
  const { footerTranslateY, showFooter, rootNavState, footerAutoShowSuppressed } =
    useMarketplaceChrome();
  const bottomInset = getMarketplaceFooterSafeInset(insets.bottom);

  const navFingerprint = getMarketplaceFooterNavFingerprint(rootNavState);
  const isVisible = shouldShowMarketplaceFooter(rootNavState);

  useEffect(() => {
    if (!footerAutoShowSuppressed) {
      showFooter();
    }
  }, [footerAutoShowSuppressed, navFingerprint, showFooter]);

  if (!isVisible) {
    return null;
  }

  return (
    <View pointerEvents="box-none" style={styles.host}>
      <Animated.View
        style={{
          marginBottom: bottomInset + MARKETPLACE_FOOTER_BOTTOM_GAP,
          marginHorizontal: spacing.lg,
          transform: [{ translateY: footerTranslateY }],
        }}
      >
        <MarketplaceFooterPill />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    zIndex: 45,
  },
});
