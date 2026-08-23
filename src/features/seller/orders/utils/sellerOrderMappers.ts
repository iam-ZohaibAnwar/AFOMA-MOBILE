import type { CartLineItem } from '../../../../services/types/cart';
import type { SellerOrderDetail, SellerOrderStatusFilter, SellerOrderSummary } from '../types/sellerOrder';

export const SELLER_ORDER_STATUS_FILTERS: Array<{ label: string; value: SellerOrderStatusFilter }> = [
  { label: 'All statuses', value: '' },
  { label: 'Processing', value: 'Processing' },
  { label: 'Pending', value: 'Pending' },
  { label: 'Dispatched', value: 'Dispatched' },
  { label: 'Delivered', value: 'Delivered' },
  { label: 'Cancelled', value: 'Cancelled' },
  { label: 'On hold', value: 'OnHold' },
  { label: 'Abandoned', value: 'Abandoned' },
  { label: 'Returned', value: 'Returned' },
];

export const SELLER_LINE_FULFILLMENT_OPTIONS = [
  { label: 'Processing', value: 'Processing' },
  { label: 'Dispatched', value: 'Dispatch' },
  { label: 'Returned', value: 'Returned' },
  { label: 'Cancelled', value: 'Cancelled' },
] as const;

export function getSellerOrderLineItems(order: SellerOrderSummary | SellerOrderDetail): CartLineItem[] {
  if ('filteredCart' in order && order.filteredCart?.length) {
    return order.filteredCart;
  }

  return order.cart ?? [];
}

export function getSellerOrderItemCount(order: SellerOrderSummary | SellerOrderDetail): number {
  return getSellerOrderLineItems(order).length;
}

export function getSellerOrderCarrierLabel(order: SellerOrderSummary | SellerOrderDetail): string | undefined {
  const firstLine = getSellerOrderLineItems(order)[0];
  if (!firstLine) {
    return undefined;
  }

  if (firstLine.shippingRate === -1) {
    return 'Free Shipping';
  }

  const carrier = (firstLine.shippingService as { carrier_name?: string } | undefined)?.carrier_name;
  return carrier?.trim() || undefined;
}

/** Display label for order-level status (distinct from line fulfillment). */
export function formatSellerOrderStatus(status?: string): string {
  const normalized = status?.trim();
  if (!normalized) {
    return '—';
  }

  if (normalized === 'OutforDelivery') {
    return 'Out for Delivery';
  }

  if (normalized === 'Cancelled' || normalized === 'Cancel order') {
    return 'Cancelled';
  }

  if (normalized === 'OnHold') {
    return 'On Hold';
  }

  if (normalized === 'Dispatch') {
    return 'Dispatched';
  }

  return normalized;
}

/** Display label for per-product fulfillment status. */
export function formatSellerLineFulfillmentStatus(status?: string): string {
  const normalized = status?.trim();
  if (!normalized) {
    return '—';
  }

  if (normalized === 'Dispatch') {
    return 'Dispatched';
  }

  if (normalized === 'OutforDelivery') {
    return 'Out for Delivery';
  }

  if (normalized === 'Cancelled' || normalized === 'Cancel order') {
    return 'Cancelled';
  }

  if (normalized === 'OnHold') {
    return 'On Hold';
  }

  return normalized;
}

export function isSellerOrderCancelled(order?: SellerOrderSummary | SellerOrderDetail): boolean {
  return order?.status === 'Cancelled';
}

export function canUpdateLineFulfillmentStatus(
  order: SellerOrderSummary | SellerOrderDetail,
  line: CartLineItem,
): boolean {
  if (isSellerOrderCancelled(order)) {
    return false;
  }

  const productType = line.productData?.productType;
  if (productType === 'Downloadable') {
    return false;
  }

  const shippingStatus = line.productData?.shippingStatus;
  return shippingStatus !== 'Dispatch' && shippingStatus !== 'Cancelled';
}

export function orderStatusBadgeVariant(
  status?: string,
): 'success' | 'warning' | 'neutral' {
  if (status === 'Delivered') {
    return 'success';
  }

  if (
    status === 'Processing' ||
    status === 'Pending' ||
    status === 'Dispatched' ||
    status === 'Dispatch' ||
    status === 'Shipped' ||
    status === 'OutforDelivery'
  ) {
    return 'warning';
  }

  return 'neutral';
}
