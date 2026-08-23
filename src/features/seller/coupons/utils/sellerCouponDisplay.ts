import type { SellerCoupon, SellerCouponType } from '../types/sellerCoupon';

export function formatSellerCouponType(type?: SellerCouponType | string): string {
  if (type === 'percentage') {
    return 'Percentage';
  }

  if (type === 'fixed') {
    return 'Fixed';
  }

  return type ? String(type) : '—';
}

export function formatSellerCouponDiscount(coupon: SellerCoupon): string {
  const amount = coupon.discountAmount;

  if (coupon.couponType === 'percentage') {
    return `${amount}%`;
  }

  return `$${amount}`;
}

export function formatSellerCouponExpiration(value?: string): string {
  if (!value) {
    return '—';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatSellerCouponUsage(coupon: SellerCoupon): string {
  const used = coupon.usageCount ?? 0;
  const limit = coupon.usageLimitPerCoupon ?? 0;
  return `${used} / ${limit}`;
}
