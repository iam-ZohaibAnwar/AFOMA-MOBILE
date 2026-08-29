import type { OrderSummary } from '../../../services/types/order';
import { formatOrderDisplayId } from './orderDisplay';
import { getOptionalOrderCartLines } from './orderListDisplay';
import { getProductDisplayName } from '../../products/utils/productDisplay';

export type CustomerOrderStatusFilter =
  | ''
  | 'Processing'
  | 'Pending'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled';

export const CUSTOMER_ORDER_STATUS_FILTERS: Array<{
  label: string;
  value: CustomerOrderStatusFilter;
}> = [
  { label: 'All', value: '' },
  { label: 'Processing', value: 'Processing' },
  { label: 'Pending', value: 'Pending' },
  { label: 'Shipped', value: 'Shipped' },
  { label: 'Delivered', value: 'Delivered' },
  { label: 'Cancelled', value: 'Cancelled' },
];

const IN_TRANSIT_STATUSES = new Set(['Shipped', 'Dispatch', 'Dispatched', 'OutforDelivery']);

export function filterCustomerOrdersList(
  orders: OrderSummary[],
  statusFilter: CustomerOrderStatusFilter,
  searchQuery: string,
): OrderSummary[] {
  let filtered = orders;

  if (statusFilter) {
    filtered = filtered.filter((order) => {
      const status = order.status?.trim() ?? '';
      if (statusFilter === 'Shipped') {
        return IN_TRANSIT_STATUSES.has(status);
      }
      return status === statusFilter;
    });
  }

  const term = searchQuery.trim().toLowerCase();
  if (!term) {
    return filtered;
  }

  return filtered.filter((order) => {
    const orderId = order._id?.toLowerCase() ?? '';
    const displayId = formatOrderDisplayId(order._id).toLowerCase();
    if (orderId.includes(term) || displayId.includes(term)) {
      return true;
    }

    return getOptionalOrderCartLines(order).some((line) => {
      const product = line.productData;
      if (!product) {
        return false;
      }

      return getProductDisplayName(product).toLowerCase().includes(term);
    });
  });
}
