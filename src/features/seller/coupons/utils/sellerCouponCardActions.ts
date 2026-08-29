import type { AdminProductCardAction } from '../../../admin/product-management/components/AdminProductCardActionsMenu';

export function buildSellerCouponCardActions(): AdminProductCardAction[] {
  return [
    { id: 'view', label: 'View details' },
    { id: 'edit', label: 'Edit coupon' },
    { id: 'delete', label: 'Delete coupon', destructive: true },
  ];
}
