import type { NavigationProp, ParamListBase } from '@react-navigation/native';

import type { MainTabParamList, ShoppingStackParamList } from '../../../app/navigation/types';
import type { AdminStackParamList } from '../../admin/navigation/adminTypes';
import type { AdminOrderListItem } from '../../admin/order-management/types/adminOrderManagement';
import type {
  AdminProductListItem,
  AdminProductManagementParams,
} from '../../admin/product-management/types/adminProductManagement';
import type { AdminEditableSellerSectionId, AdminSellerListItem } from '../../admin/seller-management/types/adminSellerManagement';
import type { AdminUserFormMode, AdminUserListItem } from '../../admin/user-management/types/adminUserManagement';
import type { AdminCommissionManagementParams } from '../../admin/commission/types/adminCommission';
import type { AdminCommissionRateSettingType } from '../../admin/settings/types/adminSettings';
import type { SellerStackParamList } from '../../../app/navigation/sellerTypes';

type ShoppingScreenName = Exclude<keyof ShoppingStackParamList, 'MainTabs'>;
type SellerScreenName = keyof SellerStackParamList;
type AdminScreenName = keyof AdminStackParamList;
export type NavLike = Pick<NavigationProp<ParamListBase>, 'getParent' | 'navigate'>;

export type AuthReturnTo =
  | {
      kind: 'tab';
      name: keyof MainTabParamList;
      params?: MainTabParamList[keyof MainTabParamList];
    }
  | {
      kind: 'screen';
      name: ShoppingScreenName;
      params?: ShoppingStackParamList[ShoppingScreenName];
    }
  | {
      kind: 'root';
      name: 'Seller';
      screen: SellerScreenName;
      params?: SellerStackParamList[SellerScreenName];
    }
  | {
      kind: 'root';
      name: 'Admin';
      screen: AdminScreenName;
      params?: AdminStackParamList[AdminScreenName];
    };

export const authReturnTo = {
  homeTab: (): AuthReturnTo => ({ kind: 'tab', name: 'MarketplaceTab', params: { segment: 'home' } }),
  accountTab: (): AuthReturnTo => ({ kind: 'tab', name: 'AccountTab' }),
  cartTab: (): AuthReturnTo => ({ kind: 'tab', name: 'CartTab' }),
  orders: (): AuthReturnTo => ({ kind: 'screen', name: 'Orders' }),
  checkout: (): AuthReturnTo => ({ kind: 'screen', name: 'Checkout' }),
  payment: (): AuthReturnTo => ({ kind: 'screen', name: 'Payment' }),
  accountDetails: (): AuthReturnTo => ({ kind: 'screen', name: 'AccountDetails' }),
  addressBook: (): AuthReturnTo => ({ kind: 'screen', name: 'AddressBook' }),
  referralEarnings: (): AuthReturnTo => ({ kind: 'screen', name: 'ReferralEarnings' }),
  termsConditions: (): AuthReturnTo => ({ kind: 'screen', name: 'TermsConditions' }),
  adminDashboard: (): AuthReturnTo => ({ kind: 'root', name: 'Admin', screen: 'AdminDashboard' }),
  adminProductManagement: (params?: AdminProductManagementParams): AuthReturnTo => ({
    kind: 'root',
    name: 'Admin',
    screen: 'AdminProductManagement',
    params,
  }),
  adminProductDetail: (productId: string, initialProduct?: AdminProductListItem): AuthReturnTo => ({
    kind: 'root',
    name: 'Admin',
    screen: 'AdminProductDetail',
    params: { productId, initialProduct },
  }),
  adminProductType: (sellerId?: string): AuthReturnTo => ({
    kind: 'root',
    name: 'Admin',
    screen: 'AdminProductType',
    params: sellerId ? { sellerId } : undefined,
  }),
  adminStandardProduct: (params?: { productId?: string; sellerId?: string }): AuthReturnTo => ({
    kind: 'root',
    name: 'Admin',
    screen: 'AdminStandardProduct',
    params,
  }),
  adminDownloadableProduct: (params?: { productId?: string; sellerId?: string }): AuthReturnTo => ({
    kind: 'root',
    name: 'Admin',
    screen: 'AdminDownloadableProduct',
    params,
  }),
  adminCustomizableProduct: (params?: { productId?: string; sellerId?: string }): AuthReturnTo => ({
    kind: 'root',
    name: 'Admin',
    screen: 'AdminCustomizableProduct',
    params,
  }),
  adminProductVariations: (productId: string, sellerId?: string): AuthReturnTo => ({
    kind: 'root',
    name: 'Admin',
    screen: 'AdminProductVariations',
    params: { productId, sellerId },
  }),
  adminProductAiListing: (
    productType: import('../../admin/product-management/types/adminProductAiPrefill').AdminProductAiListingType,
    sellerId?: string,
  ): AuthReturnTo => ({
    kind: 'root',
    name: 'Admin',
    screen: 'AdminProductAiListing',
    params: { productType, sellerId },
  }),
  adminOrderManagement: (): AuthReturnTo => ({
    kind: 'root',
    name: 'Admin',
    screen: 'AdminOrderManagement',
  }),
  adminOrderDetail: (orderId: string, initialOrder?: AdminOrderListItem): AuthReturnTo => ({
    kind: 'root',
    name: 'Admin',
    screen: 'AdminOrderDetail',
    params: { orderId, initialOrder },
  }),
  adminSellerManagement: (): AuthReturnTo => ({
    kind: 'root',
    name: 'Admin',
    screen: 'AdminSellerManagement',
  }),
  adminSellerDetail: (sellerId: string, initialSeller?: AdminSellerListItem): AuthReturnTo => ({
    kind: 'root',
    name: 'Admin',
    screen: 'AdminSellerDetail',
    params: { sellerId, initialSeller },
  }),
  adminSellerBasicInformation: (sellerId: string, initialSeller?: AdminSellerListItem): AuthReturnTo => ({
    kind: 'root',
    name: 'Admin',
    screen: 'AdminSellerBasicInformation',
    params: { sellerId, initialSeller },
  }),
  adminSellerBasicInformationEdit: (
    sellerId: string,
    initialSeller?: AdminSellerListItem,
  ): AuthReturnTo => ({
    kind: 'root',
    name: 'Admin',
    screen: 'AdminSellerBasicInformationEdit',
    params: { sellerId, initialSeller },
  }),
  adminCreateSeller: (): AuthReturnTo => ({
    kind: 'root',
    name: 'Admin',
    screen: 'AdminCreateSeller',
  }),
  adminSellerSection: (
    sellerId: string,
    sectionId: AdminEditableSellerSectionId,
    initialSeller?: AdminSellerListItem,
  ): AuthReturnTo => ({
    kind: 'root',
    name: 'Admin',
    screen: 'AdminSellerSection',
    params: { sellerId, sectionId, initialSeller },
  }),
  adminSellerSectionEdit: (
    sellerId: string,
    sectionId: AdminEditableSellerSectionId,
    initialSeller?: AdminSellerListItem,
  ): AuthReturnTo => ({
    kind: 'root',
    name: 'Admin',
    screen: 'AdminSellerSectionEdit',
    params: { sellerId, sectionId, initialSeller },
  }),
  adminUserManagement: (): AuthReturnTo => ({
    kind: 'root',
    name: 'Admin',
    screen: 'AdminUserManagement',
  }),
  adminUserDetail: (userId: string, initialUser?: AdminUserListItem): AuthReturnTo => ({
    kind: 'root',
    name: 'Admin',
    screen: 'AdminUserDetail',
    params: { userId, initialUser },
  }),
  adminUserForm: (params: {
    userId?: string;
    mode: AdminUserFormMode;
    initialUser?: AdminUserListItem;
  }): AuthReturnTo => ({
    kind: 'root',
    name: 'Admin',
    screen: 'AdminUserForm',
    params,
  }),
  adminCommission: (params?: AdminCommissionManagementParams): AuthReturnTo => ({
    kind: 'root',
    name: 'Admin',
    screen: 'AdminCommission',
    params,
  }),
  adminSettingsHub: (): AuthReturnTo => ({
    kind: 'root',
    name: 'Admin',
    screen: 'AdminSettingsHub',
  }),
  adminSettingsCommissionRates: (): AuthReturnTo => ({
    kind: 'root',
    name: 'Admin',
    screen: 'AdminSettingsCommissionRates',
  }),
  adminSettingsCommissionRate: (rateType: AdminCommissionRateSettingType): AuthReturnTo => ({
    kind: 'root',
    name: 'Admin',
    screen: 'AdminSettingsCommissionRate',
    params: { rateType },
  }),
  adminSettingsFeaturedShops: (): AuthReturnTo => ({
    kind: 'root',
    name: 'Admin',
    screen: 'AdminSettingsFeaturedShops',
  }),
  adminSettingsShippingConfig: (): AuthReturnTo => ({
    kind: 'root',
    name: 'Admin',
    screen: 'AdminSettingsShippingConfig',
  }),
  adminSettingsCsvExport: (): AuthReturnTo => ({
    kind: 'root',
    name: 'Admin',
    screen: 'AdminSettingsCsvExport',
  }),
  adminSettingsSellerShippingList: (): AuthReturnTo => ({
    kind: 'root',
    name: 'Admin',
    screen: 'AdminSettingsSellerShippingList',
  }),
  adminSettingsSellerShippingEdit: (
    sellerId: string,
    initialSeller?: AdminSellerListItem,
  ): AuthReturnTo => ({
    kind: 'root',
    name: 'Admin',
    screen: 'AdminSettingsSellerShippingEdit',
    params: { sellerId, initialSeller },
  }),
  adminGlobalAttributes: (): AuthReturnTo => ({
    kind: 'root',
    name: 'Admin',
    screen: 'AdminGlobalAttributes',
  }),
  adminReviews: (): AuthReturnTo => ({
    kind: 'root',
    name: 'Admin',
    screen: 'AdminReviews',
  }),
  adminReviewDetail: (reviewId: string): AuthReturnTo => ({
    kind: 'root',
    name: 'Admin',
    screen: 'AdminReviewDetail',
    params: { reviewId },
  }),
  adminCoupons: (): AuthReturnTo => ({
    kind: 'root',
    name: 'Admin',
    screen: 'AdminCoupons',
  }),
  adminCouponDetail: (couponId: string): AuthReturnTo => ({
    kind: 'root',
    name: 'Admin',
    screen: 'AdminCouponDetail',
    params: { couponId },
  }),
  adminCouponForm: (couponId?: string): AuthReturnTo => ({
    kind: 'root',
    name: 'Admin',
    screen: 'AdminCouponForm',
    params: couponId ? { couponId } : {},
  }),
  sellerAccount: (): AuthReturnTo => ({ kind: 'root', name: 'Seller', screen: 'SellerDashboard' }),
  sellerDashboard: (): AuthReturnTo => ({ kind: 'root', name: 'Seller', screen: 'SellerDashboard' }),
  sellerProducts: (): AuthReturnTo => ({ kind: 'root', name: 'Seller', screen: 'SellerProducts' }),
  sellerOrders: (): AuthReturnTo => ({ kind: 'root', name: 'Seller', screen: 'SellerOrders' }),
  sellerShippingConfig: (): AuthReturnTo => ({ kind: 'root', name: 'Seller', screen: 'SellerShippingConfig' }),
  sellerCoupons: (): AuthReturnTo => ({ kind: 'root', name: 'Seller', screen: 'SellerCoupons' }),
  sellerAttributes: (): AuthReturnTo => ({ kind: 'root', name: 'Seller', screen: 'SellerAttributes' }),
  sellerEarnings: (): AuthReturnTo => ({ kind: 'root', name: 'Seller', screen: 'SellerEarnings' }),
  sellerReviews: (): AuthReturnTo => ({ kind: 'root', name: 'Seller', screen: 'SellerReviews' }),
  sellerReviewDetail: (reviewId: string): AuthReturnTo => ({
    kind: 'root',
    name: 'Seller',
    screen: 'SellerReviewDetail',
    params: { reviewId },
  }),
  sellerProductType: (): AuthReturnTo => ({ kind: 'root', name: 'Seller', screen: 'SellerProductType' }),
  sellerSetup: (): AuthReturnTo => ({ kind: 'root', name: 'Seller', screen: 'SellerSetup' }),
  sellerPersonalInformation: (): AuthReturnTo => ({
    kind: 'root',
    name: 'Seller',
    screen: 'SellerPersonalInformation',
  }),
  sellerShopProfile: (): AuthReturnTo => ({ kind: 'root', name: 'Seller', screen: 'SellerShopProfile' }),
  sellerShopSettings: (): AuthReturnTo => ({ kind: 'root', name: 'Seller', screen: 'SellerShopSettings' }),
  orderDetail: (orderId: string): AuthReturnTo => ({
    kind: 'screen',
    name: 'OrderDetail',
    params: { orderId },
  }),
} as const;

export function getRootNavigation(navigation: NavLike) {
  let current: NavLike = navigation;

  while (current.getParent()) {
    current = current.getParent() as NavLike;
  }

  return current as NavigationProp<ParamListBase>;
}

function navigateToReturnTo(navigation: NavLike, returnTo: AuthReturnTo) {
  if (returnTo.kind === 'tab') {
    navigation.navigate('Shopping', {
      screen: 'MainTabs',
      params: {
        screen: returnTo.name,
        params: returnTo.params,
      },
    });
    return;
  }

  if (returnTo.kind === 'root') {
    navigation.navigate(returnTo.name, {
      screen: returnTo.screen,
      params: returnTo.params,
    });
    return;
  }

  navigation.navigate('Shopping', {
    screen: returnTo.name,
    params: returnTo.params,
  });
}

export function openAuthLogin(navigation: NavLike, returnTo?: AuthReturnTo) {
  const root = getRootNavigation(navigation);

  root.navigate('Auth', {
    screen: 'Login',
    params: returnTo ? { returnTo } : undefined,
  });
}

/** Close the auth modal, or fall back to the marketplace home tab. */
export function dismissAuthFlow(navigation: NavLike) {
  const root = getRootNavigation(navigation);

  if (root.canGoBack()) {
    root.goBack();
    return;
  }

  navigateToReturnTo(root, authReturnTo.homeTab());
}

/** Dismiss auth and always open the marketplace home tab (guest browsing). */
export function continueShoppingAsGuest(navigation: NavLike) {
  const root = getRootNavigation(navigation);

  if (root.canGoBack()) {
    root.goBack();
  }

  requestAnimationFrame(() => {
    navigateToReturnTo(root, authReturnTo.homeTab());
  });
}

export function completeAuthNavigation(navigation: NavLike, returnTo?: AuthReturnTo) {
  const root = getRootNavigation(navigation);

  if (returnTo) {
    if (root.canGoBack()) {
      root.goBack();
    }

    requestAnimationFrame(() => {
      navigateToReturnTo(root, returnTo);
    });
    return;
  }

  if (root.canGoBack()) {
    root.goBack();
    return;
  }

  navigateToReturnTo(root, authReturnTo.accountTab());
}
