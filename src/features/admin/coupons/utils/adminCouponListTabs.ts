import type { AdminCouponListTabId, AdminCouponStatusFilter } from '../types/adminCoupons';

export const ADMIN_COUPON_LIST_PAGE_SIZE = 10;

export const ADMIN_COUPON_LIST_TAB_OPTIONS: Array<{ value: AdminCouponListTabId; label: string }> = [
  { value: 'admin', label: 'Admin coupons' },
  { value: 'seller', label: 'Seller coupons' },
];

export const ADMIN_COUPON_STATUS_TAB_OPTIONS: Array<{ value: AdminCouponStatusFilter; label: string }> = [
  { value: '', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'expired', label: 'Expired' },
];
