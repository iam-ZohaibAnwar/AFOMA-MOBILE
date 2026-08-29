import type { AdminCommissionDetailParams, AdminCommissionManagementParams } from '../commission/types/adminCommission';
import type { AdminProductManagementParams } from '../product-management/types/adminProductManagement';
import type { AdminCommissionRateSettingType } from '../settings/types/adminSettings';
import type { AdminEditableSellerSectionId, AdminSellerListItem } from '../seller-management/types/adminSellerManagement';
import type {
  AdminUserFormMode,
  AdminUserListItem,
} from '../user-management/types/adminUserManagement';

export type AdminStackParamList = {
  AdminDashboard: undefined;
  AdminProductManagement: AdminProductManagementParams | undefined;
  AdminProductDetail: {
    productId: string;
    productType?: string;
    initialProduct?: import('../product-management/types/adminProductManagement').AdminProductListItem;
  };
  AdminCreateListing: { sellerId?: string } | undefined;
  AdminProductType: import('../product-management/types/adminProductCreate').AdminProductCreateParams;
  AdminProductSubtype: import('../product-management/types/adminProductCreate').AdminProductSubtypeParams;
  AdminStandardProduct:
    | {
        productId?: string;
        sellerId?: string;
        initialProduct?: import('../product-management/types/adminProductManagement').AdminProductListItem;
      }
    | undefined;
  AdminDownloadableProduct:
    | {
        productId?: string;
        sellerId?: string;
        initialProduct?: import('../product-management/types/adminProductManagement').AdminProductListItem;
      }
    | undefined;
  AdminCustomizableProduct:
    | {
        productId?: string;
        sellerId?: string;
        initialProduct?: import('../product-management/types/adminProductManagement').AdminProductListItem;
      }
    | undefined;
  AdminProductVariations: {
    productId: string;
    sellerId?: string;
    initialProductName?: string;
    initialImages?: Array<{ imageUrl?: string; altText?: string }>;
  };
  AdminProductAiListing: {
    productType: import('../product-management/types/adminProductAiPrefill').AdminProductAiListingType;
    sellerId?: string;
  };
  AdminOrderManagement: undefined;
  AdminOrderDetail: {
    orderId: string;
    initialOrder?: import('../order-management/types/adminOrderManagement').AdminOrderListItem;
  };
  AdminSellerManagement: undefined;
  AdminSellerDetail: {
    sellerId: string;
    initialSeller?: AdminSellerListItem;
  };
  AdminSellerBasicInformation: {
    sellerId: string;
    initialSeller?: AdminSellerListItem;
  };
  AdminSellerBasicInformationEdit: {
    sellerId: string;
    initialSeller?: AdminSellerListItem;
  };
  AdminCreateSeller: undefined;
  AdminSellerSection: {
    sellerId: string;
    sectionId: AdminEditableSellerSectionId;
    initialSeller?: AdminSellerListItem;
  };
  AdminSellerSectionEdit: {
    sellerId: string;
    sectionId: AdminEditableSellerSectionId;
    initialSeller?: AdminSellerListItem;
  };
  AdminUserManagement: undefined;
  AdminUserDetail: {
    userId: string;
    initialUser?: AdminUserListItem;
  };
  AdminUserForm: {
    userId?: string;
    mode: AdminUserFormMode;
    initialUser?: AdminUserListItem;
  };
  AdminCommission: AdminCommissionManagementParams | undefined;
  AdminCommissionDetail: AdminCommissionDetailParams;
  AdminSettingsHub: undefined;
  AdminSettingsCommissionRates: undefined;
  AdminSettingsCommissionRate: {
    rateType: AdminCommissionRateSettingType;
  };
  AdminSettingsFeaturedShops: undefined;
  AdminSettingsShippingConfig: undefined;
  AdminSettingsCsvExport: undefined;
  AdminSettingsSellerShippingList: undefined;
  AdminSettingsSellerShippingEdit: {
    sellerId: string;
    initialSeller?: AdminSellerListItem;
  };
  AdminGlobalAttributes: undefined;
  AdminReviews: undefined;
  AdminReviewDetail: {
    reviewId: string;
    initialReview?: import('../reviews/types/adminReviews').AdminReviewListItem;
    listTab?: import('../reviews/types/adminReviews').AdminReviewListTabId;
  };
  AdminCoupons: { notice?: string } | undefined;
  AdminCouponDetail: {
    couponId: string;
    initialCoupon?: import('../coupons/types/adminCoupons').AdminCouponListItem;
  };
  AdminCouponForm: {
    couponId?: string;
    initialCoupon?: import('../coupons/types/adminCoupons').AdminCouponListItem;
  };
};
