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

function findActiveTab(state: NavState | undefined): keyof MainTabParamList | null {
  if (!state?.routes?.length) {
    return null;
  }

  const index = state.index ?? 0;
  const route = state.routes[index];
  if (!route) {
    return null;
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

function getMainTabsState(state: NavState | undefined): NavState | undefined {
  const shoppingState = getShoppingStackState(state);
  if (!shoppingState?.routes?.length) {
    return undefined;
  }

  const mainTabsRoute = shoppingState.routes.find((route) => route.name === 'MainTabs');
  return mainTabsRoute?.state as NavState | undefined;
}

function getActiveMainTabRoute(state: NavState | undefined) {
  const mainTabsState = getMainTabsState(state);
  if (!mainTabsState?.routes?.length) {
    return null;
  }

  return mainTabsState.routes[mainTabsState.index ?? 0] ?? null;
}

function resolveActiveMainTab(state: NavState | undefined): keyof MainTabParamList | null {
  const mainTabsState = getMainTabsState(state);
  if (mainTabsState) {
    return findActiveTab(mainTabsState);
  }

  const shoppingState = getShoppingStackState(state);
  return findActiveTab(shoppingState);
}

export function resolveMarketplaceTabSegment(
  state: NavState | undefined,
): MarketplaceTabSegment | undefined {
  const activeRoute = getActiveMainTabRoute(state);
  if (!activeRoute) {
    return undefined;
  }

  if (activeRoute.name === 'ShopTab') {
    return 'category';
  }

  if (activeRoute.name !== 'MarketplaceTab') {
    return undefined;
  }

  const params = activeRoute.params as MainTabParamList['MarketplaceTab'];
  return params?.segment === 'category' ? 'category' : 'home';
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
  return `${rootRoute?.key ?? ''}|${shoppingRoute}|${tab}|${segment}`;
}
