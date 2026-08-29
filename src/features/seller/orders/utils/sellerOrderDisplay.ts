import type { SellerOrderSummary } from '../types/sellerOrder';
import { formatCustomerName } from '../../../orders/utils/orderDisplay';
import { formatSellerOrderTotal } from './sellerOrderPricing';

export function getSellerOrderCustomerName(order: SellerOrderSummary): string {
  const fromUserInfo = formatCustomerName(order.userInfo);
  if (fromUserInfo) {
    return fromUserInfo;
  }

  const legacyName = (order.userInfo as { name?: string } | undefined)?.name?.trim();
  return legacyName || '—';
}

export function formatSellerOrderListTotal(order: SellerOrderSummary): string {
  return formatSellerOrderTotal(order);
}
