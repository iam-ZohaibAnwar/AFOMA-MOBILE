import type { ApplyCouponRequest, ApplyCouponResponse } from '../types/coupon';
import { apiPost } from './request';

/** POST /coupon/apply-coupon */
export async function applyCoupon(body: ApplyCouponRequest): Promise<ApplyCouponResponse> {
  return apiPost<ApplyCouponResponse>('/coupon/apply-coupon', body, undefined, 'Failed to apply coupon');
}
