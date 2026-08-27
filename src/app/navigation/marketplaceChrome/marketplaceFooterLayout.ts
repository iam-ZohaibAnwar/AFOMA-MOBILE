import { Platform } from 'react-native';

import { spacing } from '../../../design-system';

/** Icon row height inside the floating pill. */
export const MARKETPLACE_FOOTER_PILL_HEIGHT = 52;

/** Gap between pill bottom and screen safe area. */
export const MARKETPLACE_FOOTER_BOTTOM_GAP = spacing.sm;

export function getMarketplaceFooterSafeInset(safeAreaBottom: number): number {
  return Math.max(safeAreaBottom, Platform.OS === 'android' ? 8 : 0);
}

/** Total vertical space to reserve so content clears the floating footer. */
export function getMarketplaceFooterContentInset(safeAreaBottom: number): number {
  return (
    MARKETPLACE_FOOTER_PILL_HEIGHT +
    MARKETPLACE_FOOTER_BOTTOM_GAP +
    getMarketplaceFooterSafeInset(safeAreaBottom)
  );
}
