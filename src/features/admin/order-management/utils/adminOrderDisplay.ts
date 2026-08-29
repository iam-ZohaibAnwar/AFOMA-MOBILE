import type { AdminOrderListItem } from '../types/adminOrderManagement';
import {
  formatCustomerName,
  formatSellerDisplayName,
} from '../../../orders/utils/orderDisplay';
import {
  formatSellerOrderStatus,
  getSellerOrderCarrierLabel,
  orderStatusBadgeVariant,
} from '../../../seller/orders/utils/sellerOrderMappers';

export { orderStatusBadgeVariant };

export const ADMIN_ORDER_STATUS_FILTERS = [
  { label: 'All', value: '' as const },
  { label: 'Processing', value: 'Processing' as const },
  { label: 'Pending', value: 'Pending' as const },
  { label: 'Shipped', value: 'Shipped' as const },
  { label: 'Delivered', value: 'Delivered' as const },
  { label: 'Cancelled', value: 'Cancelled' as const },
  { label: 'On hold', value: 'OnHold' as const },
  { label: 'Abandoned', value: 'Abandoned' as const },
  { label: 'Returned', value: 'Returned' as const },
];

/**
 * Display label for admin order status.
 * Passes through backend values with light normalization only — filter/mutation
 * contracts should be confirmed on staging before Phase 3 controls.
 */
export function formatAdminOrderStatus(status?: string): string {
  return formatSellerOrderStatus(status);
}

export function getAdminOrderCustomerName(order: AdminOrderListItem): string {
  const fromUserInfo = formatCustomerName(order.userInfo);
  if (fromUserInfo) {
    return fromUserInfo;
  }

  const legacyName = (order.userInfo as { name?: string } | undefined)?.name?.trim();
  return legacyName || '—';
}

export function getAdminOrderSellerName(order: AdminOrderListItem): string {
  const firstLine = order.cart?.[0];
  if (!firstLine) {
    return '—';
  }

  return formatSellerDisplayName(firstLine) ?? '—';
}

export function getAdminOrderCarrierLabel(order: AdminOrderListItem): string {
  return getSellerOrderCarrierLabel(order) ?? '—';
}

export function getAdminOrderRouteId(order: AdminOrderListItem): string | undefined {
  return order._id;
}
