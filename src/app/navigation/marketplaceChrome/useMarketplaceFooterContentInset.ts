import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useMarketplaceChromeOptional } from './MarketplaceChromeProvider';
import { getMarketplaceFooterContentInset } from './marketplaceFooterLayout';

export function useMarketplaceFooterContentInset(): number {
  const insets = useSafeAreaInsets();
  const chrome = useMarketplaceChromeOptional();
  return chrome?.footerContentInset ?? getMarketplaceFooterContentInset(insets.bottom);
}
