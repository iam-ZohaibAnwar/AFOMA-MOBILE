import type { CartLineItem } from '../../../../services/types/cart';
import type { SellerOrderDetail, SellerOrderSummary } from '../types/sellerOrder';
import {
  canUpdateLineFulfillmentStatus,
  formatSellerLineFulfillmentStatus,
  SELLER_LINE_FULFILLMENT_OPTIONS,
} from './sellerOrderMappers';
import { getSellerOrderLineItems } from './sellerOrderMappers';

export interface SellerSelectOption {
  label: string;
  value: string;
}

const SELLER_LINE_FULFILLMENT_SET = new Set<string>(
  SELLER_LINE_FULFILLMENT_OPTIONS.map((option) => option.value),
);

export function buildSellerLineFulfillmentOptions(currentStatus?: string): SellerSelectOption[] {
  const normalized = currentStatus?.trim();
  if (!normalized || SELLER_LINE_FULFILLMENT_SET.has(normalized)) {
    return [...SELLER_LINE_FULFILLMENT_OPTIONS];
  }

  return [
    {
      label: `${formatSellerLineFulfillmentStatus(normalized)} (current)`,
      value: normalized,
    },
    ...SELLER_LINE_FULFILLMENT_OPTIONS,
  ];
}

export function canUpdateSellerLineFulfillment(
  order: SellerOrderSummary | SellerOrderDetail,
  line: CartLineItem,
): boolean {
  return canUpdateLineFulfillmentStatus(order, line);
}

export function isDestructiveSellerLineFulfillment(value: string): boolean {
  return value === 'Cancelled';
}

export function patchSellerOrderLineShippingStatus(
  order: SellerOrderDetail,
  productId: string,
  shippingStatus: string,
): SellerOrderDetail {
  const patchLine = (line: CartLineItem) => {
    if (line.productData?._id !== productId) {
      return line;
    }

    return {
      ...line,
      productData: line.productData
        ? { ...line.productData, shippingStatus }
        : line.productData,
    };
  };

  return {
    ...order,
    cart: order.cart?.map(patchLine),
    filteredCart: order.filteredCart?.map(patchLine),
  };
}

export function toSellerOrderListPatch(order: SellerOrderDetail): Partial<SellerOrderSummary> {
  const lines = getSellerOrderLineItems(order);

  return {
    _id: order._id,
    status: order.status,
    paymentStatus: order.paymentStatus,
    createdAt: order.createdAt,
    userInfo: order.userInfo,
    cart: lines,
    currency: order.currency,
    conversionRate: order.conversionRate,
  };
}
