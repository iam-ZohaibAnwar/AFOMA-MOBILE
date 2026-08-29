import { CommonActions } from '@react-navigation/native';

import type { MainTabParamList } from '../types';
import { marketplaceNavigationRef } from './marketplaceNavigationRef';
import type { MarketplaceTabSegment } from './resolveMarketplaceActiveTab';

export type MarketplaceFooterTabTarget =
  | { routeName: 'CartTab' | 'AccountTab' | 'ShopTab' }
  | { routeName: 'MarketplaceTab'; segment: MarketplaceTabSegment };

export function navigateMarketplaceFooterTab(target: MarketplaceFooterTabTarget): boolean {
  if (!marketplaceNavigationRef.isReady()) {
    return false;
  }

  if (target.routeName === 'MarketplaceTab') {
    marketplaceNavigationRef.dispatch(
      CommonActions.navigate('Shopping', {
        screen: 'MainTabs',
        params: {
          screen: 'MarketplaceTab',
          params: { segment: target.segment },
        },
      }),
    );
    return true;
  }

  marketplaceNavigationRef.dispatch(
    CommonActions.navigate('Shopping', {
      screen: 'MainTabs',
      params: { screen: target.routeName },
    }),
  );

  return true;
}
