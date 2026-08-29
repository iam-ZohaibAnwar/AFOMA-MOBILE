import type { Ionicons } from '@expo/vector-icons';

import { colors } from '../../../../design-system';
import type { AdminProductStatusChipTone } from '../../product-management/components/AdminProductStatusChip';
import type {
  AdminCouponListItem,
  AdminCouponListTabId,
  AdminCouponStatusFilter,
} from '../types/adminCoupons';
import {
  formatAdminCouponExpirationDate,
  formatAdminCouponType,
  getAdminCouponCreatedById,
  getAdminCouponCreatorName,
  isPopulatedAdminCouponUser,
} from './adminCouponsContent';
import {
  getAdminCouponStatusLabel,
  isAdminCouponExpired,
} from './adminCouponsDisplay';

export function resolveAdminCouponAccentColor(
  coupon: Pick<AdminCouponListItem, 'expirationDate'>,
): string {
  return isAdminCouponExpired(coupon.expirationDate) ? colors.textMuted : colors.primary;
}

export function resolveAdminCouponListIcon(): keyof typeof Ionicons.glyphMap {
  return 'gift-outline';
}

export function resolveAdminCouponListStatusChips(coupon: AdminCouponListItem) {
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

export function getAdminCouponListSubtitle(
  coupon: AdminCouponListItem,
  listTab: AdminCouponListTabId,
): string {
  const typeLabel = formatAdminCouponType(coupon.couponType);

  if (listTab === 'seller') {
    const sellerName = getAdminCouponCreatorName(coupon);
    return `${sellerName} · ${typeLabel}`;
  }

  return typeLabel;
}

export function filterAdminCouponsByTab(
  coupons: AdminCouponListItem[],
  listTab: AdminCouponListTabId,
  adminUserId?: string,
): AdminCouponListItem[] {
  if (!adminUserId) {
    return listTab === 'admin' ? coupons : [];
  }

  return coupons.filter((coupon) => {
    const creatorId = getAdminCouponCreatedById(coupon);
    if (listTab === 'admin') {
      return creatorId === adminUserId;
    }

    return Boolean(creatorId && creatorId !== adminUserId);
  });
}

export function filterAdminCouponsByStatus(
  coupons: AdminCouponListItem[],
  statusFilter: AdminCouponStatusFilter,
): AdminCouponListItem[] {
  if (!statusFilter) {
    return coupons;
  }

  return coupons.filter((coupon) => {
    const expired = isAdminCouponExpired(coupon.expirationDate);
    return statusFilter === 'expired' ? expired : !expired;
  });
}

export function filterAdminCouponsBySearch(
  coupons: AdminCouponListItem[],
  searchTerm: string,
): AdminCouponListItem[] {
  const query = searchTerm.trim().toLowerCase();
  if (!query) {
    return coupons;
  }

  return coupons.filter((coupon) => {
    const creatorName = isPopulatedAdminCouponUser(coupon.createdBy)
      ? getAdminCouponCreatorName(coupon)
      : '';

    const haystack = [
      coupon.couponCode,
      coupon.description,
      coupon.couponType,
      creatorName,
      formatAdminCouponExpirationDate(coupon.expirationDate),
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(query);
  });
}

export function getAdminCouponMenuTitle(coupon: AdminCouponListItem): string {
  return coupon.couponCode?.trim() || 'Coupon';
}
