import type { AdminProductCardAction } from '../../product-management/components/AdminProductCardActionsMenu';
import type { AdminCouponListItem } from '../types/adminCoupons';
import { isAdminCouponExpired } from './adminCouponsDisplay';

export function buildAdminCouponCardActions(coupon: AdminCouponListItem): AdminProductCardAction[] {
  const expired = isAdminCouponExpired(coupon.expirationDate);

  return [
    { id: 'view', label: 'View details' },
    { id: 'edit', label: 'Edit coupon' },
    { id: 'preview', label: 'Notify users', disabled: expired },
    { id: 'delete', label: 'Delete coupon', destructive: true },
  ];
}
