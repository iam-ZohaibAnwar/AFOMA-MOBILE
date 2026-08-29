import type {
  AdminCouponDetailRecord,
  AdminCouponListItem,
  AdminCouponType,
  CreateAdminCouponPayload,
  UpdateAdminCouponPayload,
} from '../types/adminCoupons';

export function isPopulatedAdminCouponUser(
  createdBy: AdminCouponListItem['createdBy'],
): createdBy is Exclude<AdminCouponListItem['createdBy'], string | undefined> {
  return Boolean(createdBy && typeof createdBy === 'object');
}

export function getAdminCouponCreatedById(
  coupon: Pick<AdminCouponListItem, 'createdBy'>,
): string | undefined {
  if (isPopulatedAdminCouponUser(coupon.createdBy)) {
    return coupon.createdBy._id?.trim() || undefined;
  }

  if (typeof coupon.createdBy === 'string' && coupon.createdBy.trim()) {
    return coupon.createdBy.trim();
  }

  return undefined;
}

export function getAdminCouponCreatorName(
  coupon: Pick<AdminCouponListItem, 'createdBy'>,
): string {
  if (!isPopulatedAdminCouponUser(coupon.createdBy)) {
    return 'Unknown seller';
  }

  const firstName = coupon.createdBy.firstName?.trim() ?? '';
  const lastName = coupon.createdBy.lastName?.trim() ?? '';
  const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();

  if (fullName) {
    return fullName;
  }

  return coupon.createdBy.email?.trim() || 'Unknown seller';
}

/**
 * Preserve populated list references when patching from PUT/detail
 * (which returns string createdBy only).
 */
export function patchAdminCouponListItem(
  existing: AdminCouponListItem,
  updated: AdminCouponDetailRecord,
): AdminCouponListItem {
  return {
    ...existing,
    ...updated,
    createdBy: isPopulatedAdminCouponUser(existing.createdBy)
      ? existing.createdBy
      : updated.createdBy,
  };
}

export function patchAdminCouponInList(
  coupons: AdminCouponListItem[],
  couponId: string,
  updated: AdminCouponDetailRecord,
): AdminCouponListItem[] {
  return coupons.map((coupon) => {
    if (coupon._id !== couponId) {
      return coupon;
    }

    return patchAdminCouponListItem(coupon, updated);
  });
}

export function removeAdminCouponFromList(
  coupons: AdminCouponListItem[],
  couponId: string,
): AdminCouponListItem[] {
  return coupons.filter((coupon) => coupon._id !== couponId);
}

/** Detail display merges populated initialCoupon with unpopulated GET/PUT updates. */
export function mergeAdminCouponDetail(
  initialCoupon: AdminCouponListItem | undefined,
  remoteCoupon: AdminCouponDetailRecord | null,
): AdminCouponListItem | null {
  if (!initialCoupon && !remoteCoupon) {
    return null;
  }

  if (!remoteCoupon) {
    return initialCoupon ?? null;
  }

  if (!initialCoupon) {
    return remoteCoupon;
  }

  return patchAdminCouponListItem(initialCoupon, remoteCoupon);
}

export function formatAdminCouponType(couponType?: string | null): string {
  if (!couponType?.trim()) {
    return '—';
  }

  const normalized = couponType.trim().toLowerCase();
  if (normalized === 'percentage') {
    return 'Percentage';
  }

  if (normalized === 'fixed') {
    return 'Fixed';
  }

  return couponType.trim();
}

export function formatAdminCouponDiscount(
  coupon: Pick<AdminCouponListItem, 'couponType' | 'discountAmount'>,
): string {
  if (coupon.discountAmount == null || Number.isNaN(Number(coupon.discountAmount))) {
    return '—';
  }

  const amount = Number(coupon.discountAmount);
  const type = coupon.couponType?.toString().toLowerCase();

  if (type === 'percentage') {
    return `${amount}%`;
  }

  return String(amount);
}

export function formatAdminCouponExpirationDate(expirationDate?: string | null): string {
  if (!expirationDate?.trim()) {
    return '—';
  }

  const parsed = new Date(expirationDate);
  if (Number.isNaN(parsed.getTime())) {
    return expirationDate.trim();
  }

  return parsed.toISOString().split('T')[0] ?? '—';
}

export function toAdminCouponExpirationInputValue(expirationDate?: string | null): string {
  if (!expirationDate?.trim()) {
    return '';
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(expirationDate.trim())) {
    return expirationDate.trim();
  }

  const parsed = new Date(expirationDate);
  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return parsed.toISOString().split('T')[0];
}

/**
 * Build PUT payload preserving owner id from detail/list merge.
 * Prevents accidental ownership reassignment during V1 edits.
 */
export function buildAdminCouponUpdatePayload(
  coupon: AdminCouponListItem,
  values: Omit<CreateAdminCouponPayload, 'createdBy'>,
): UpdateAdminCouponPayload {
  const createdBy = getAdminCouponCreatedById(coupon);
  if (!createdBy) {
    throw new Error('Cannot update coupon without a createdBy owner id');
  }

  return {
    ...values,
    createdBy,
  };
}

export function isAdminCouponType(value: string): value is AdminCouponType {
  return value === 'percentage' || value === 'fixed';
}
