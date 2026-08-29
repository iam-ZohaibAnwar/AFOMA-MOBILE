import type { SellerCouponStatusFilter } from '../types/sellerCoupon';

export const SELLER_COUPON_LIST_PAGE_SIZE = 10;

export const SELLER_COUPON_STATUS_TAB_OPTIONS: Array<{ value: SellerCouponStatusFilter; label: string }> = [
  { value: '', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'expired', label: 'Expired' },
];
