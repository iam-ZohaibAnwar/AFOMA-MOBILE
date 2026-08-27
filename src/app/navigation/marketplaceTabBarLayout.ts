import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getMarketplaceFooterContentInset } from './marketplaceChrome/marketplaceFooterLayout';

/** @deprecated Use floating footer dimensions from marketplaceChrome instead. */
export const MARKETPLACE_TAB_BAR_HEIGHT = 52;

export { getMarketplaceFooterSafeInset as getMarketplaceTabBarBottomInset } from './marketplaceChrome/marketplaceFooterLayout';

/** Total vertical space occupied by the floating marketplace footer. */
export function useMarketplaceFooterHeight(): number {
  const insets = useSafeAreaInsets();
  return getMarketplaceFooterContentInset(insets.bottom);
}
