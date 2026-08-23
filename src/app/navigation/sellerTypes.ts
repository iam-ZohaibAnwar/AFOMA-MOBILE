import type { SellerReviewListItem } from '../../features/seller/reviews/types/sellerReview';
import type { SellerSetupSectionId } from '../../features/seller/types/sellerProfile';

export type SellerStackParamList = {
  SellerAccount: undefined;
  SellerDashboard: undefined;
  SellerProducts: undefined;
  SellerProductType: undefined;
  SellerStandardProduct: { productId?: string } | undefined;
  SellerCustomizableProduct: { productId?: string } | undefined;
  SellerDownloadableProduct: { productId?: string } | undefined;
  SellerProductVariations: { productId: string };
  SellerOrders: undefined;
  SellerOrderDetail: { orderId: string };
  SellerShippingConfig: undefined;
  SellerCoupons: { notice?: string } | undefined;
  SellerCouponForm: { couponId?: string };
  SellerAttributes: undefined;
  SellerEarnings: { payoutStatus?: 'Pending' | 'Paid' } | undefined;
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
