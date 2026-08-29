import type { OrderSummary } from '../../../services/types/order';
import { formatOrderDisplayId } from './orderDisplay';
import { getOptionalOrderCartLines } from './orderListDisplay';
import { getProductDisplayName } from '../../products/utils/productDisplay';

export type OrderStatusTabId = 'all' | 'pending' | 'confirmed' | 'shipped';

export const ORDER_STATUS_TABS: Array<{ id: OrderStatusTabId; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'shipped', label: 'Shipped' },
];

export function orderMatchesStatusTab(status: string | undefined, tabId: OrderStatusTabId): boolean {
  if (tabId === 'all') {
    return true;
  }

  const normalized = status?.trim() ?? '';

  switch (tabId) {
    case 'pending':
      return normalized === 'Pending';
    case 'confirmed':
      return normalized === 'Processing';
    case 'shipped':
      return (
        normalized === 'Shipped' ||
        normalized === 'Dispatch' ||
        normalized === 'Dispatched' ||
        normalized === 'OutforDelivery'
      );
    default:
      return true;
  }
}

export function orderMatchesSearch(order: OrderSummary, query: string): boolean {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return true;
  }

  const orderId = order._id?.toLowerCase() ?? '';
  const displayId = formatOrderDisplayId(order._id).toLowerCase();
  if (orderId.includes(normalizedQuery) || displayId.includes(normalizedQuery)) {
    return true;
  }

  return getOptionalOrderCartLines(order).some((line) => {
    const product = line.productData;
    if (!product) {
      return false;
    }

    return getProductDisplayName(product).toLowerCase().includes(normalizedQuery);
  });
}

export function filterOrdersList(
  orders: OrderSummary[],
  tabId: OrderStatusTabId,
  searchQuery: string,
): OrderSummary[] {
  return orders.filter(
    (order) => orderMatchesStatusTab(order.status, tabId) && orderMatchesSearch(order, searchQuery),
  );
}
