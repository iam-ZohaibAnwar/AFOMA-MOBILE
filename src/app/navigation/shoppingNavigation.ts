import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';

type Nav = NavigationProp<ParamListBase>;

function navigateToMarketplaceSegment(navigation: Nav, segment: 'home' | 'category') {
  navigation.dispatch(
    CommonActions.navigate('MainTabs', {
      screen: 'MarketplaceTab',
      params: { segment },
    }),
  );
}
export function navigateToHomeTab(navigation: Nav) {
  navigateToMarketplaceSegment(navigation, 'home');
}

export function navigateToCategoryTab(navigation: Nav) {
  navigateToMarketplaceSegment(navigation, 'category');
}



export function navigateToBrowseTab(navigation: Nav) {
  navigateToCategoryTab(navigation);
}



export function navigateToSearch(navigation: Nav, query?: string) {
  navigation.navigate('Search', query ? { query } : {});
}



/** @deprecated Use navigateToSearch — search opens from the stack, not bottom tabs. */

export function navigateToSearchTab(navigation: Nav, query?: string) {

  navigateToSearch(navigation, query);

}



export function navigateToShopTab(navigation: Nav, _options?: { resetBrowse?: boolean }) {
  navigateToCategoryTab(navigation);
}

export function navigateToCartTab(
  navigation: Nav,
  params?: { highlightItemId?: string },
) {
  navigation.navigate('MainTabs', {
    screen: 'CartTab',
    params,
  });
}



export function navigateToAccountTab(navigation: Nav) {

  navigation.navigate('MainTabs', { screen: 'AccountTab' });

}



export function navigateToShop(navigation: Nav, slug: string) {
  const trimmed = slug.trim();
  if (!trimmed) {
    return;
  }

  navigation.navigate('SellerShop', { slug: trimmed });
}

