import type { SellerOrderDetail, SellerOrderSummary } from '../types/sellerOrder';
import {
  calculateOrderItemLineTotal,
  formatOrderMoney,
} from '../../../orders/utils/orderPricing';
import { getSellerOrderLineItems } from './sellerOrderMappers';

export function calculateSellerOrderItemsSubTotal(
  order: SellerOrderSummary | SellerOrderDetail,
): number {
  const lines = getSellerOrderLineItems(order);

  return lines.reduce(
    (sum, line) => sum + calculateOrderItemLineTotal(line, order, false, true),
    0,
  );
}

export function calculateSellerOrderShippingTotal(
  order: SellerOrderSummary | SellerOrderDetail,
): number {
  const lines = getSellerOrderLineItems(order);
  if (!lines.length) {
    return 0;
  }

  const seen = new Set<string>();
  return lines.reduce((total, line) => {
    const sellerId = line.productData?.seller?._id ?? line.productData?.seller?.id;
    const key = sellerId != null ? String(sellerId) : 'seller';
    if (seen.has(key)) {
      return total;
    }

    seen.add(key);
    const shippingRate = Number(line.shippingRate);
    return total + (Number.isFinite(shippingRate) ? shippingRate : 0);
  }, 0);
}

export function calculateSellerOrderGrandTotal(
  order: SellerOrderSummary | SellerOrderDetail,
): number {
  return calculateSellerOrderItemsSubTotal(order) + calculateSellerOrderShippingTotal(order);
}

export function formatSellerOrderTotal(order: SellerOrderSummary | SellerOrderDetail): string {
  const total = calculateSellerOrderGrandTotal(order);
  return formatOrderMoney(order, total);
}
