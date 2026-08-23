import { apiDelete, apiGet, apiPost, apiPut } from '../../../../services/api/request';
import type {
  GetSellerCouponsParams,
  SaveSellerCouponPayload,
  SellerCoupon,
  SellerCouponsListResponse,
} from '../types/sellerCoupon';

export async function getSellerCouponsPage(
  userId: string,
  params: GetSellerCouponsParams = {},
): Promise<SellerCouponsListResponse> {
  return apiGet<SellerCouponsListResponse>(
    `/coupon/created-by/${encodeURIComponent(userId)}`,
    { params },
    'Failed to load coupons',
  );
}

export async function getSellerCoupon(couponId: string): Promise<SellerCoupon> {
  return apiGet<SellerCoupon>(
    `/coupon/${encodeURIComponent(couponId)}`,
    undefined,
    'Failed to load coupon',
  );
}

export async function createSellerCoupon(payload: SaveSellerCouponPayload): Promise<SellerCoupon> {
  return apiPost<SellerCoupon>('/coupon', payload, undefined, 'Failed to create coupon');
}

export async function updateSellerCoupon(
  couponId: string,
  payload: SaveSellerCouponPayload,
): Promise<SellerCoupon> {
  return apiPut<SellerCoupon>(
    `/coupon/${encodeURIComponent(couponId)}`,
    payload,
    undefined,
    'Failed to update coupon',
  );
}

export async function deleteSellerCoupon(couponId: string): Promise<void> {
  await apiDelete<void>(
    `/coupon/${encodeURIComponent(couponId)}`,
    undefined,
    'Failed to delete coupon',
  );
}
