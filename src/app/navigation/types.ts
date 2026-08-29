import type { NavigatorScreenParams } from '@react-navigation/native';

import type { ReferralCommissionRecord } from '../../features/account/referral-earnings/types/referralEarning';
import type { AuthReturnTo } from '../../features/auth/utils/authNavigation';
import type { AdminStackParamList } from '../../features/admin/navigation/adminTypes';
import type { OrderSummary } from '../../services/types/order';
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
  ShopTab: { resetBrowseAt?: number } | undefined;
  CartTab: { highlightItemId?: string } | undefined;
  AccountTab: undefined;
};

export type ShoppingStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  SubCategories: {
    categoryId: string;
    categoryName?: string;
  };
  SubCategory: {
    categoryId: string;
    subCategoryId: string;
    categoryName?: string;
    subCategoryName?: string;
    /** Pre-select a child tab when opening from deep links or drawer. */
    initialChildCategoryId?: string;
  };
  ChildCategory: {
    categoryId: string;
    subCategoryId: string;
    childCategoryId: string;
    categoryName?: string;
    subCategoryName?: string;
    childCategoryName?: string;
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
    /** After guest login from "Message seller", reopen chat automatically. */
    openChat?: boolean;
  };
  Search: {
    query?: string;
  };
  Checkout: undefined;
  Payment:
    | {
        token?: string;
        PayerID?: string;
        payerID?: string;
        cancel?: string;
      }
    | undefined;
  Orders: undefined;
  AccountDetails: undefined;
  AddressBook: undefined;
  ReferralEarnings: { payoutStatus?: 'Pending' | 'Paid' } | undefined;
  ReferralEarningDetail: {
    commissionId: string;
    initialRecord?: ReferralCommissionRecord;
  };
  ChatList: undefined;
  ChatThread: {
    chatId?: string;
    receiverId?: string;
  };
  TermsConditions: undefined;
  NotificationPreferences: undefined;
  BellNotifications: undefined;
  OrderDetail: {
    orderId: string;
    initialOrder?: OrderSummary;
  };
  SellerShop: {
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
