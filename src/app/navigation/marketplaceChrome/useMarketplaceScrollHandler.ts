import { useCallback } from 'react';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

import { useMarketplaceChromeOptional } from './MarketplaceChromeProvider';

interface MarketplaceScrollHandlerOptions {
  /** When false, scrolling does not hide the floating footer (e.g. product detail). */
  hideFooterOnScroll?: boolean;
}

export function useMarketplaceScrollHandler(options?: MarketplaceScrollHandlerOptions) {
  const chrome = useMarketplaceChromeOptional();
  const hideFooterOnScroll = options?.hideFooterOnScroll ?? true;

  return useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (!chrome || !hideFooterOnScroll) {
        return;
      }

      chrome.reportScroll(event.nativeEvent.contentOffset.y);
    },
    [chrome, hideFooterOnScroll],
  );
}
export const marketplaceScrollProps = {
  scrollEventThrottle: 16,
} as const;
