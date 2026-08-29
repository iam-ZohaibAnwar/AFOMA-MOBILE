export type SellerCouponType = 'percentage' | 'fixed';

export type SellerCouponStatusFilter = '' | 'active' | 'expired';

export interface SellerCoupon {
  _id?: string;
  couponCode: string;
  couponType: SellerCouponType | string;
  discountAmount: number;
  description?: string;
  minimumCartAmount: number;
  expirationDate: string;
  usageLimitPerCoupon: number;
  usageLimitPerCustomer: number;
  usageCount?: number;
  createdBy?: string | { _id?: string; userId?: string };
}

export interface SellerCouponFormValues {
  couponCode: string;
  couponType: SellerCouponType | '';
  description: string;
  discountAmount: string;
  minimumCartAmount: string;
  expirationDate: string;
  usageLimitPerCoupon: string;
  usageLimitPerCustomer: string;
}

export interface SellerCouponsListResponse {
  coupons?: SellerCoupon[];
  totalPages?: number;
  totalCoupons?: number;
  currentPage?: number;
}

export interface GetSellerCouponsParams {
  page?: number;
  limit?: number;
}

export interface SaveSellerCouponPayload {
  couponCode: string;
  couponType: SellerCouponType;
  description?: string;
  discountAmount: number;
  minimumCartAmount: number;
  expirationDate: string;
  usageLimitPerCoupon: number;
  usageLimitPerCustomer: number;
  createdBy: string;
}

export type SellerCouponFormErrors = Partial<Record<keyof SellerCouponFormValues, string>>;
