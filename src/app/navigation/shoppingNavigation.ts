import type { NavigationProp, ParamListBase } from '@react-navigation/native';



type Nav = NavigationProp<ParamListBase>;



export function navigateToHomeTab(navigation: Nav) {

  navigation.navigate('MainTabs', {

    screen: 'MarketplaceTab',

    params: { segment: 'home' },

  });

}



export function navigateToBrowseTab(navigation: Nav) {

  navigation.navigate('MainTabs', {

    screen: 'MarketplaceTab',

    params: { segment: 'category' },

  });

}



export function navigateToSearch(navigation: Nav, query?: string) {

  navigation.navigate('Search', query ? { query } : undefined);

}



/** @deprecated Use navigateToSearch — search opens from the stack, not bottom tabs. */

export function navigateToSearchTab(navigation: Nav, query?: string) {

  navigateToSearch(navigation, query);

}



export function navigateToCartTab(navigation: Nav) {

  navigation.navigate('MainTabs', { screen: 'CartTab' });

}



export function navigateToAccountTab(navigation: Nav) {

  navigation.navigate('MainTabs', { screen: 'AccountTab' });

}



export function navigateToShop(navigation: Nav, slug: string) {
  const trimmed = slug.trim();
  if (!trimmed) {
    return;
  }

  navigation.navigate('Shop', { slug: trimmed });
}

