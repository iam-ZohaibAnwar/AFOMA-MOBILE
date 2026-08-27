import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

import { MarketplaceFooterNav } from './MarketplaceFooterNav';
import type { MainTabParamList } from './types';

export function MarketplaceTabBarWithCartBadge({
  state,
  navigation,
  cartCount,
}: BottomTabBarProps & { cartCount: number }) {
  const activeRoute = state.routes[state.index];
  const marketplaceSegment =
    activeRoute.name === 'MarketplaceTab'
      ? (activeRoute.params as MainTabParamList['MarketplaceTab'])?.segment
      : activeRoute.name === 'ShopTab'
        ? 'category'
        : undefined;

  return (
    <MarketplaceFooterNav
      activeRouteName={activeRoute.name as keyof MainTabParamList}
      marketplaceSegment={marketplaceSegment}
      navigation={navigation}
      cartCount={cartCount}
    />
  );
}
