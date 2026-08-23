import type { AdminCouponListItem } from '../types/adminCoupons';
import {
  formatAdminCouponDiscount,
  formatAdminCouponExpirationDate,
  formatAdminCouponType,
} from './adminCouponsContent';

export function formatAdminCouponUsage(coupon: Pick<AdminCouponListItem, 'usageCount' | 'usageLimitPerCoupon'>): string {
  if (coupon.usageCount == null && coupon.usageLimitPerCoupon == null) {
    return '—';
  }

  const used = coupon.usageCount ?? 0;
  const limit = coupon.usageLimitPerCoupon ?? '—';
  return `${used} / ${limit}`;
}

export function isAdminCouponExpired(expirationDate?: string | null): boolean {
  if (!expirationDate?.trim()) {
    return false;
  }

  const parsed = new Date(expirationDate);
  if (Number.isNaN(parsed.getTime())) {
    return false;
  }

  const today = new Date();
  const todayUtc = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  const expiryUtc = new Date(
    Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate()),
  );

  return expiryUtc.getTime() < todayUtc.getTime();
}

export function getAdminCouponStatusLabel(coupon: Pick<AdminCouponListItem, 'expirationDate'>): string {
  return isAdminCouponExpired(coupon.expirationDate) ? 'Expired' : 'Active';
}

export {
  formatAdminCouponDiscount,
  formatAdminCouponExpirationDate,
  formatAdminCouponType,
};
