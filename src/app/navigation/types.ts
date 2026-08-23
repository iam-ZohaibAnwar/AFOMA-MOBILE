import type { NavigatorScreenParams } from '@react-navigation/native';

import type { AuthReturnTo } from '../../features/auth/utils/authNavigation';
import type { AdminStackParamList } from '../../features/admin/navigation/adminTypes';
import type { SellerStackParamList } from './sellerTypes';

export type AuthStackParamList = {
  Login: { returnTo?: AuthReturnTo } | undefined;
  OtpVerification: {
    email: string;
    otpToken: string;
    returnTo?: AuthReturnTo;
  };
  RegisterChoice: undefined;
  RegisterAccount: {
    accountType: 'buyer' | 'seller';
  };
  RegistrationSuccess: {
    accountType: 'buyer' | 'seller';
  };
};

export type MainTabParamList = {
  MarketplaceTab: { segment?: 'home' | 'category' } | undefined;
  CartTab: undefined;
  AccountTab: undefined;
};

export type ShoppingStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  SubCategories: {
    categoryId: string;
    categoryName?: string;
  };
  ChildCategories: {
    categoryId: string;
    subCategoryId: string;
    categoryName?: string;
    subCategoryName?: string;
  };
  ProductListing: {
    categoryId?: string;
    subCategoryId?: string;
    childCategoryId?: string;
    categoryName?: string;
    subCategoryName?: string;
    childCategoryName?: string;
    searchQuery?: string;
    title?: string;
    listingSource?: 'best' | 'newArrival' | 'discounted';
  };
  ProductDetail: {
    productId?: string;
    slug?: string;
  };
  Search: {
    query?: string;
  };
  Checkout: undefined;
  Payment: undefined;
  Orders: undefined;
  AccountDetails: undefined;
  AddressBook: undefined;
  ReferralEarnings: undefined;
  TermsConditions: undefined;
  OrderDetail: {
    orderId: string;
  };
  Shop: {
    slug: string;
  };
};

/** Authenticated app shell — currently hosts the public shopping flow. */
export type AppStackParamList = {
  Shopping: NavigatorScreenParams<ShoppingStackParamList>;
};

export type RootStackParamList = {
  Shopping: NavigatorScreenParams<ShoppingStackParamList>;
  Seller: NavigatorScreenParams<SellerStackParamList>;
  Admin: NavigatorScreenParams<AdminStackParamList>;
  Auth: NavigatorScreenParams<AuthStackParamList>;
  GetPaid:
    | {
        token?: string;
        commissionId?: string;
      }
    | undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export type ShoppingStackScreenName = keyof ShoppingStackParamList;
