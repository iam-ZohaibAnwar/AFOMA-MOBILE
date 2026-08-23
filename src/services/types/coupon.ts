import type { CartMap } from './cart';

/**
 * Coupon types from cart apply flow.
 * TODO: Verify full coupon object returned in updatedOrder.coupon.
 */
export interface AppliedCoupon {
  couponCode?: string;
  discountAmount?: number;
  couponType?: 'percentage' | 'fixed' | string;
  createdBy?: {
    _id?: string;
    userId?: string;
    userRole?: string;
  };
}

export interface ApplyCouponRequest {
  email: string;
  cart: CartMap;
  couponCode: string;
}

export interface ApplyCouponResponse {
  message?: string;
  updatedOrder?: {
    clonedCart?: CartMap;
    coupon?: AppliedCoupon;
  };
}
