import { formatCustomerName, formatOrderDate, formatOrderDisplayId } from '../../orders/utils/orderDisplay';
import type { SellerDashboardOrder } from '../dashboard/types';

export function formatDashboardCount(value?: number | null): string {
  if (value == null || Number.isNaN(Number(value))) {
    return '—';
  }

  return String(value);
}

export function formatDashboardPayoutAmount(amount?: number | string | null): string {
  if (amount == null || amount === '') {
    return '0.00';
  }

  const value = Number(amount);
  if (!Number.isFinite(value)) {
    return '0.00';
  }

  return value.toFixed(2);
}

/** Web parity for seller dashboard order status labels. */
export function formatSellerDashboardOrderStatus(status?: string): string {
  const normalized = status?.trim();
  if (!normalized) {
    return '—';
  }

  if (normalized === 'OutforDelivery') {
    return 'Out for Delivery';
  }

  if (normalized === 'Cancelled') {
    return 'Cancel Order';
  }

  if (normalized === 'OnHold') {
    return 'On Hold';
  }

  return normalized;
}

export function filterDashboardLatestOrders(orders: SellerDashboardOrder[]): SellerDashboardOrder[] {
  return orders.filter((order) => order.paymentStatus !== 'PaymentPending');
}

export function formatDashboardOrderId(order: SellerDashboardOrder): string {
  return formatOrderDisplayId(order._id);
}

export function formatDashboardOrderDate(order: SellerDashboardOrder): string {
  return formatOrderDate(order.createdAt);
}

export function formatDashboardCustomerName(order: SellerDashboardOrder): string {
  return formatCustomerName(order.userInfo) ?? '—';
}
