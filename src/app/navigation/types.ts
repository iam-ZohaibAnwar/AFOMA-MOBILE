import type { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Login: undefined;
  OtpVerification: {
    email: string;
    otpToken: string;
  };
};

export type ShoppingStackParamList = {
  Home: undefined;
  Categories: undefined;
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
  };
  ProductDetail: {
    productId?: string;
    slug?: string;
  };
  Search: {
    query?: string;
  };
  Cart: undefined;
  Checkout: undefined;
  Orders: undefined;
  OrderDetail: {
    orderId: string;
  };
};

/** Authenticated app shell — currently hosts the public shopping flow. */
export type AppStackParamList = {
  Shopping: NavigatorScreenParams<ShoppingStackParamList>;
};

export type RootStackParamList = {
  Shopping: NavigatorScreenParams<ShoppingStackParamList>;
  Auth: NavigatorScreenParams<AuthStackParamList>;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export type ShoppingStackScreenName = keyof ShoppingStackParamList;
