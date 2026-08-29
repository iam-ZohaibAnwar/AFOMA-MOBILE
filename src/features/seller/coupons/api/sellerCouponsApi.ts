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

const DEFAULT_PAGE_SIZE = 10;

/** Loads every page for client-side search/filter (seller-owned coupon sets are typically small). */
export async function getAllSellerCoupons(userId: string): Promise<SellerCoupon[]> {
  const firstPage = await getSellerCouponsPage(userId, { page: 1, limit: DEFAULT_PAGE_SIZE });
  const totalPages = Math.max(1, firstPage.totalPages ?? 1);
  let coupons = Array.isArray(firstPage.coupons) ? [...firstPage.coupons] : [];

  for (let page = 2; page <= totalPages; page += 1) {
    const response = await getSellerCouponsPage(userId, { page, limit: DEFAULT_PAGE_SIZE });
    if (Array.isArray(response.coupons)) {
      coupons = coupons.concat(response.coupons);
    }
  }

  return coupons;
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
