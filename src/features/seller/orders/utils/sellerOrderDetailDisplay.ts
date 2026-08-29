import type { CartLineItem } from '../../../../services/types/cart';
import type { SellerOrderDetail, SellerOrderSummary } from '../types/sellerOrder';
import { formatSellerLineFulfillmentStatus } from './sellerOrderMappers';

export {
  getAdminCustomerInitials as getSellerCustomerInitials,
  getAdminCustomerPhone as getSellerCustomerPhone,
  formatAdminPaymentStatus as formatSellerPaymentStatus,
} from '../../../admin/order-management/utils/adminOrderDetailDisplay';

export function formatSellerLineFulfillmentDisplay(line: CartLineItem): string {
  const productType = line.productData?.productType;
  if (productType === 'Downloadable') {
    return '—';
  }

  return formatSellerLineFulfillmentStatus(line.productData?.shippingStatus);
}

export function getSellerOrderItemQuantityTotal(order: SellerOrderDetail): number {
  const lines = order.filteredCart?.length ? order.filteredCart : order.cart ?? [];
  return lines.reduce((sum, line) => sum + (line.orderQuantiy ?? 0), 0);
}
