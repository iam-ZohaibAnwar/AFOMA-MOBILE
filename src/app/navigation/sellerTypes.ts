import type { SellerReviewListItem } from '../../features/seller/reviews/types/sellerReview';
import type { SellerCoupon } from '../../features/seller/coupons/types/sellerCoupon';
import type { SellerCommissionRecord } from '../../features/seller/earnings/types/sellerEarning';
import type { SellerOrderSummary } from '../../features/seller/orders/types/sellerOrder';
import type { SellerSetupSectionId } from '../../features/seller/types/sellerProfile';

export type SellerStackParamList = {
  SellerAccount: undefined;
  SellerDashboard: undefined;
  SellerProducts: undefined;
  SellerProductType: undefined;
  SellerProductSubtype: undefined;
  SellerStandardProduct: { productId?: string } | undefined;
  SellerCustomizableProduct: { productId?: string } | undefined;
  SellerDownloadableProduct: { productId?: string } | undefined;
  SellerProductVariations: { productId: string };
  SellerOrders: undefined;
  SellerOrderDetail: {
    orderId: string;
    initialOrder?: SellerOrderSummary;
  };
  SellerShippingConfig: undefined;
  SellerCoupons: { notice?: string } | undefined;
  SellerCouponDetail: {
    couponId: string;
    initialCoupon?: SellerCoupon;
  };
  SellerCouponForm: {
    couponId?: string;
    initialCoupon?: SellerCoupon;
  };
  SellerAttributes: undefined;
  SellerEarnings: { payoutStatus?: 'Pending' | 'Paid' } | undefined;
  SellerEarningDetail: {
    commissionId: string;
    initialRecord?: SellerCommissionRecord;
  };
  SellerReviews: undefined;
  SellerReviewDetail: {
    reviewId: string;
    initialReview?: SellerReviewListItem;
  };
  SellerSetup: undefined;
  SellerPersonalInformation: undefined;
  SellerShopProfile: undefined;
  SellerShopSettings: undefined;
  SellerSetupSection: {
    section: SellerSetupSectionId;
  };
};
