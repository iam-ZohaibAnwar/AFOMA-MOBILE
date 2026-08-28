import type { NavigationState, PartialState } from '@react-navigation/native';

import type { MainTabParamList } from '../types';

export type MarketplaceTabSegment = NonNullable<MainTabParamList['MarketplaceTab']>['segment'];

const TAB_ROUTE_NAMES = new Set<keyof MainTabParamList>([
  'MarketplaceTab',
  'ShopTab',
  'CartTab',
  'AccountTab',
]);

type NavState = NavigationState | PartialState<NavigationState>;
type NavRoute = NonNullable<NavState['routes']>[number];

type MainTabsNestedParams = {
  screen?: keyof MainTabParamList;
  params?: MainTabParamList[keyof MainTabParamList];
};

function findActiveTab(state: NavState | undefined): keyof MainTabParamList | null {
  if (!state?.routes?.length) {
    return null;
  }

  const index = state.index ?? 0;
  const route = state.routes[index];
  if (!route) {
    return null;
  }

  if (route.name === 'MainTabs') {
    return resolveMainTabNameFromMainTabsRoute(route);
  }

  if (TAB_ROUTE_NAMES.has(route.name as keyof MainTabParamList)) {
    return route.name as keyof MainTabParamList;
  }

  if (route.state) {
    return findActiveTab(route.state as NavState);
  }

  return null;
}

function getShoppingStackState(state: NavState | undefined): NavState | undefined {
  if (!state?.routes?.length) {
    return undefined;
  }

  const rootRoute = state.routes[state.index ?? 0];
  if (rootRoute?.name !== 'Shopping') {
    return undefined;
  }

  return rootRoute.state as NavState | undefined;
}

function getMainTabsRoute(state: NavState | undefined): NavRoute | null {
  const shoppingState = getShoppingStackState(state);
  if (!shoppingState?.routes?.length) {
    return null;
  }

  const activeShoppingRoute = shoppingState.routes[shoppingState.index ?? 0];
  if (activeShoppingRoute?.name === 'MainTabs') {
    return activeShoppingRoute;
  }

  return shoppingState.routes.find((route) => route.name === 'MainTabs') ?? null;
}

function getMainTabsState(state: NavState | undefined): NavState | undefined {
  return getMainTabsRoute(state)?.state as NavState | undefined;
}

function resolveMainTabNameFromMainTabsRoute(mainTabsRoute: NavRoute): keyof MainTabParamList {
  const nestedState = mainTabsRoute.state as NavState | undefined;
  if (nestedState?.routes?.length) {
    const tab = findActiveTab(nestedState);
    if (tab) {
      return tab;
    }
  }

  const params = mainTabsRoute.params as MainTabsNestedParams | undefined;
  if (params?.screen && TAB_ROUTE_NAMES.has(params.screen)) {
    return params.screen;
  }

  return 'MarketplaceTab';
}

function getActiveMainTabRoute(state: NavState | undefined): NavRoute | null {
  const mainTabsRoute = getMainTabsRoute(state);
  if (!mainTabsRoute) {
    return null;
  }

  const tabName = resolveMainTabNameFromMainTabsRoute(mainTabsRoute);
  const nestedState = mainTabsRoute.state as NavState | undefined;

  if (nestedState?.routes?.length) {
    const activeRoute = nestedState.routes[nestedState.index ?? 0];
    if (activeRoute?.name === tabName) {
      return activeRoute;
    }

    const matchedRoute = nestedState.routes.find((route) => route.name === tabName);
    if (matchedRoute) {
      return matchedRoute;
    }
  }

  const params = mainTabsRoute.params as MainTabsNestedParams | undefined;
  if (params?.screen === tabName) {
    return {
      key: `${mainTabsRoute.key}-${tabName}-pending`,
      name: tabName,
      params: params.params,
    };
  }

  return {
    key: `${mainTabsRoute.key}-${tabName}-fallback`,
    name: tabName,
  };
}

function resolveActiveMainTab(state: NavState | undefined): keyof MainTabParamList | null {
  const mainTabsRoute = getMainTabsRoute(state);
  if (!mainTabsRoute) {
    return null;
  }

  return resolveMainTabNameFromMainTabsRoute(mainTabsRoute);
}

function resolveMarketplaceSegmentFromMainTabsRoute(
  mainTabsRoute: NavRoute,
  tabName: keyof MainTabParamList,
): MarketplaceTabSegment | undefined {
  if (tabName === 'ShopTab') {
    return 'category';
  }

  if (tabName !== 'MarketplaceTab') {
    return undefined;
  }

  const activeRoute = getActiveMainTabRouteFromMainTabs(mainTabsRoute, tabName);
  const routeParams = activeRoute?.params as MainTabParamList['MarketplaceTab'];
  if (routeParams?.segment === 'category') {
    return 'category';
  }

  const nestedParams = (mainTabsRoute.params as MainTabsNestedParams | undefined)?.params as
    | MainTabParamList['MarketplaceTab']
    | undefined;
  if (nestedParams?.segment === 'category') {
    return 'category';
  }

  return 'home';
}

function getActiveMainTabRouteFromMainTabs(
  mainTabsRoute: NavRoute,
  tabName: keyof MainTabParamList,
): NavRoute | null {
  const nestedState = mainTabsRoute.state as NavState | undefined;
  if (!nestedState?.routes?.length) {
    return null;
  }

  const activeRoute = nestedState.routes[nestedState.index ?? 0];
  if (activeRoute?.name === tabName) {
    return activeRoute;
  }

  return nestedState.routes.find((route) => route.name === tabName) ?? null;
}

export function resolveMarketplaceTabSegment(
  state: NavState | undefined,
): MarketplaceTabSegment | undefined {
  const mainTabsRoute = getMainTabsRoute(state);
  if (!mainTabsRoute) {
    return undefined;
  }

  const tabName = resolveMainTabNameFromMainTabsRoute(mainTabsRoute);
  return resolveMarketplaceSegmentFromMainTabsRoute(mainTabsRoute, tabName);
}

export function resolveMarketplaceActiveTab(
  state: NavState | undefined,
): keyof MainTabParamList | null {
  if (!state?.routes?.length) {
    return null;
  }

  const rootIndex = state.index ?? 0;
  const rootRoute = state.routes[rootIndex];
  if (!rootRoute) {
    return null;
  }

  if (rootRoute.name === 'Auth') {
    return 'AccountTab';
  }

  if (rootRoute.name === 'Shopping') {
    return resolveActiveMainTab(state);
  }

  return null;
}

const FOOTER_SUPPRESSED_SHOPPING_ROUTES = new Set([
  'ProductDetail',
  'ChatThread',
]);

function getActiveShoppingRouteName(state: NavState | undefined): string | null {
  if (!state?.routes?.length) {
    return null;
  }

  const rootRoute = state.routes[state.index ?? 0];
  if (rootRoute?.name !== 'Shopping') {
    return null;
  }

  const shoppingState = rootRoute.state as NavState | undefined;
  if (!shoppingState?.routes?.length) {
    return null;
  }

  const activeShoppingRoute = shoppingState.routes[shoppingState.index ?? 0];
  return activeShoppingRoute?.name ?? null;
}

export function shouldShowMarketplaceFooter(state: NavState | undefined): boolean {
  if (!state?.routes?.length) {
    return false;
  }

  const rootRoute = state.routes[state.index ?? 0];
  if (rootRoute?.name !== 'Shopping' && rootRoute?.name !== 'Auth') {
    return false;
  }

  return !isMarketplaceFooterSuppressedRoute(state);
}

export function isMarketplaceFooterSuppressedRoute(state: NavState | undefined): boolean {
  const routeName = getActiveShoppingRouteName(state);
  return routeName != null && FOOTER_SUPPRESSED_SHOPPING_ROUTES.has(routeName);
}

/** @deprecated Use isMarketplaceFooterSuppressedRoute — kept for callers that only check product detail. */
export function isProductDetailRouteActive(state: NavState | undefined): boolean {
  return getActiveShoppingRouteName(state) === 'ProductDetail';
}

/** Main tabs where the floating footer must stay visible (checkout path). */
const FOOTER_PINNED_TABS = new Set<keyof MainTabParamList>(['CartTab']);

export function shouldPinMarketplaceFooter(state: NavState | undefined): boolean {
  const tab = resolveMarketplaceActiveTab(state);
  return tab != null && FOOTER_PINNED_TABS.has(tab);
}

/** Changes when root route, shopping stack screen, or main tab changes — used to restore the footer. */
export function getMarketplaceFooterNavFingerprint(state: NavState | undefined): string {
  if (!state?.routes?.length) {
    return '';
  }

  const rootRoute = state.routes[state.index ?? 0];
  const tab = resolveMarketplaceActiveTab(state) ?? '';
  const segment = resolveMarketplaceTabSegment(state) ?? '';
  const shoppingRoute = getActiveShoppingRouteName(state) ?? '';
  const mainTabsParams = (getMainTabsRoute(state)?.params as MainTabsNestedParams | undefined)?.screen ?? '';
  return `${rootRoute?.key ?? ''}|${shoppingRoute}|${tab}|${segment}|${mainTabsParams}`;
}
