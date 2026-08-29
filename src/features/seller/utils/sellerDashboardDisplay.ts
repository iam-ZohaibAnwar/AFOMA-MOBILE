import { formatCustomerName, formatOrderDate, formatOrderDisplayId } from '../../orders/utils/orderDisplay';
import type { AdminProductStatusChipTone } from '../../admin/product-management/components/AdminProductStatusChip';
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

export function hasPendingPayoutAmount(amount?: number | string | null): boolean {
  if (amount == null || amount === '') {
    return false;
  }

  const value = Number(amount);
  return Number.isFinite(value) && value > 0;
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

export function resolveSellerDashboardOrderStatusTone(status?: string): AdminProductStatusChipTone {
  const normalized = status?.trim().toLowerCase();

  if (normalized === 'delivered' || normalized === 'completed') {
    return 'success';
  }

  if (
    normalized === 'cancelled' ||
    normalized === 'returned' ||
    normalized === 'abandoned' ||
    normalized === 'onhold'
  ) {
    return 'danger';
  }

  if (normalized === 'processing' || normalized === 'pending' || normalized === 'outfordelivery') {
    return 'warning';
  }

  return 'neutral';
}

export function resolveSellerDashboardOrderStatusIcon(
  status?: string,
): 'checkmark-circle-outline' | 'close-circle-outline' | 'time-outline' | 'ellipse-outline' {
  const tone = resolveSellerDashboardOrderStatusTone(status);

  if (tone === 'success') {
    return 'checkmark-circle-outline';
  }

  if (tone === 'danger') {
    return 'close-circle-outline';
  }

  if (tone === 'warning') {
    return 'time-outline';
  }

  return 'ellipse-outline';
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
