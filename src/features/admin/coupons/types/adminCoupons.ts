export type AdminCouponType = 'percentage' | 'fixed';

export const ADMIN_COUPON_TYPES: AdminCouponType[] = ['percentage', 'fixed'];

export interface AdminCouponPopulatedUser {
  _id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  userRole?: string;
}

/** List items from GET /coupon/created-by/{id} — populated createdBy. */
export interface AdminCouponListItem {
  _id?: string;
  couponCode?: string;
  couponType?: AdminCouponType | string;
  discountAmount?: number;
  description?: string;
  minimumCartAmount?: number;
  expirationDate?: string;
  usageLimitPerCoupon?: number;
  usageLimitPerCustomer?: number;
  usageCount?: number;
  createdBy?: AdminCouponPopulatedUser | string;
  __v?: number;
}

/** GET /coupon/:id — same keys; createdBy typically string id. */
export type AdminCouponDetailRecord = AdminCouponListItem;

export interface AdminCouponsListResponse {
  message?: string;
  coupons?: AdminCouponListItem[];
  totalCount?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export interface GetAdminCouponsParams {
  page?: number;
  limit?: number;
}

export type AdminCouponListTabId = 'admin' | 'seller';

export type AdminCouponStatusFilter = '' | 'active' | 'expired';

export interface CreateAdminCouponPayload {
  couponCode: string;
  couponType: AdminCouponType;
  description?: string;
  discountAmount: number;
  minimumCartAmount: number;
  expirationDate: string;
  usageLimitPerCoupon: number;
  usageLimitPerCustomer: number;
  createdBy: string;
}

export type UpdateAdminCouponPayload = CreateAdminCouponPayload;

/** Raw POST response — parsed inside adminCouponsApi. */
export interface CreateAdminCouponApiResponse {
  message?: string;
  coupon?: AdminCouponDetailRecord;
}

export interface AdminCouponMutationResult {
  message?: string;
  coupon: AdminCouponDetailRecord;
}

export interface AdminCouponFormValues {
  couponCode: string;
  couponType: AdminCouponType | '';
  description: string;
  discountAmount: string;
  minimumCartAmount: string;
  expirationDate: string;
  usageLimitPerCoupon: string;
  usageLimitPerCustomer: string;
}
