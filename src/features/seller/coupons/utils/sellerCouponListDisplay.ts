import type { Ionicons } from '@expo/vector-icons';

import { colors } from '../../../../design-system';
import type { AdminProductStatusChipTone } from '../../../admin/product-management/components/AdminProductStatusChip';
import {
  formatAdminCouponExpirationDate,
  formatAdminCouponType,
} from '../../../admin/coupons/utils/adminCouponsContent';
import {
  getAdminCouponStatusLabel,
  isAdminCouponExpired,
} from '../../../admin/coupons/utils/adminCouponsDisplay';
import type { SellerCoupon, SellerCouponStatusFilter } from '../types/sellerCoupon';

export function resolveSellerCouponAccentColor(
  coupon: Pick<SellerCoupon, 'expirationDate'>,
): string {
  return isAdminCouponExpired(coupon.expirationDate) ? colors.textMuted : colors.primary;
}

export function resolveSellerCouponListIcon(): keyof typeof Ionicons.glyphMap {
  return 'gift-outline';
}

export function resolveSellerCouponListStatusChips(coupon: SellerCoupon) {
  const expired = isAdminCouponExpired(coupon.expirationDate);

  return [
    {
      id: 'status',
      label: getAdminCouponStatusLabel(coupon),
      icon: (expired ? 'close-circle-outline' : 'checkmark-circle-outline') as keyof typeof Ionicons.glyphMap,
      tone: (expired ? 'warning' : 'success') as AdminProductStatusChipTone,
    },
  ];
}

export function getSellerCouponListSubtitle(coupon: SellerCoupon): string {
  return formatAdminCouponType(coupon.couponType);
}

export function filterSellerCouponsByStatus(
  coupons: SellerCoupon[],
  statusFilter: SellerCouponStatusFilter,
): SellerCoupon[] {
  if (!statusFilter) {
    return coupons;
  }

  return coupons.filter((coupon) => {
    const expired = isAdminCouponExpired(coupon.expirationDate);
    return statusFilter === 'expired' ? expired : !expired;
  });
}

export function filterSellerCouponsBySearch(
  coupons: SellerCoupon[],
  searchTerm: string,
): SellerCoupon[] {
  const query = searchTerm.trim().toLowerCase();
  if (!query) {
    return coupons;
  }

  return coupons.filter((coupon) => {
    const haystack = [
      coupon.couponCode,
      coupon.description,
      coupon.couponType,
      formatAdminCouponExpirationDate(coupon.expirationDate),
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(query);
  });
}

export function getSellerCouponMenuTitle(coupon: SellerCoupon): string {
  return coupon.couponCode?.trim() || 'Coupon';
}

export function removeSellerCouponFromList(
  coupons: SellerCoupon[],
  couponId: string,
): SellerCoupon[] {
  return coupons.filter((coupon) => coupon._id !== couponId);
}

export function patchSellerCouponInList(
  coupons: SellerCoupon[],
  couponId: string,
  patch: SellerCoupon,
): SellerCoupon[] {
  return coupons.map((coupon) => (coupon._id === couponId ? { ...coupon, ...patch } : coupon));
}
