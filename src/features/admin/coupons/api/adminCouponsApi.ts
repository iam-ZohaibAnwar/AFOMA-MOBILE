import { apiDelete, apiGet, apiPost, apiPut } from '../../../../services/api/request';
import type {
  AdminCouponDetailRecord,
  AdminCouponListItem,
  AdminCouponsListResponse,
  CreateAdminCouponApiResponse,
  CreateAdminCouponPayload,
  GetAdminCouponsParams,
  AdminCouponMutationResult,
  UpdateAdminCouponPayload,
} from '../types/adminCoupons';

/** GET /coupon — all coupons with populated createdBy. */
export async function getAdminAllCoupons(): Promise<AdminCouponListItem[]> {
  const response = await apiGet<AdminCouponListItem[] | { coupons?: AdminCouponListItem[] }>(
    '/coupon',
    undefined,
    'Failed to load coupons',
  );

  if (Array.isArray(response)) {
    return response;
  }

  return Array.isArray(response.coupons) ? response.coupons : [];
}

/** GET /notifications/send-all/:couponId — broadcast coupon notification. */
export async function notifyAdminCouponUsers(couponId: string): Promise<void> {
  await apiGet<void>(
    `/notifications/send-all/${encodeURIComponent(couponId)}`,
    undefined,
    'Failed to send coupon notification',
  );
}

export async function getAdminCouponsPage(
  adminUserId: string,
  params: GetAdminCouponsParams = {},
): Promise<AdminCouponsListResponse> {
  return apiGet<AdminCouponsListResponse>(
    `/coupon/created-by/${encodeURIComponent(adminUserId)}`,
    { params },
    'Failed to load coupons',
  );
}

export async function getAdminCouponById(couponId: string): Promise<AdminCouponDetailRecord> {
  return apiGet<AdminCouponDetailRecord>(
    `/coupon/${encodeURIComponent(couponId)}`,
    undefined,
    'Failed to load coupon',
  );
}

/**
 * POST /coupon
 * Parses `{ message, coupon }` and returns the created coupon record only.
 */
export async function createAdminCoupon(
  payload: CreateAdminCouponPayload,
): Promise<AdminCouponMutationResult> {
  const response = await apiPost<CreateAdminCouponApiResponse>(
    '/coupon',
    payload,
    undefined,
    'Failed to create coupon',
  );

  const coupon = response.coupon;
  if (!coupon?._id) {
    throw new Error('Coupon create did not return coupon data');
  }

  return {
    message: response.message,
    coupon,
  };
}

/** PUT /coupon/:id — flat coupon response. */
export async function updateAdminCoupon(
  couponId: string,
  payload: UpdateAdminCouponPayload,
): Promise<AdminCouponDetailRecord> {
  return apiPut<AdminCouponDetailRecord>(
    `/coupon/${encodeURIComponent(couponId)}`,
    payload,
    undefined,
    'Failed to update coupon',
  );
}

/** DELETE /coupon/:id — 204 empty body is success. */
export async function deleteAdminCoupon(couponId: string): Promise<void> {
  await apiDelete<void>(
    `/coupon/${encodeURIComponent(couponId)}`,
    undefined,
    'Failed to delete coupon',
  );
}
