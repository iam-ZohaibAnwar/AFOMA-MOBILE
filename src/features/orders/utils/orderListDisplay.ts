import type { CartLineItem } from '../../../services/types/cart';
import type { OrderSummary } from '../../../services/types/order';
import {
  formatSellerOrderStatus,
  orderStatusBadgeVariant,
} from '../../seller/orders/utils/sellerOrderMappers';
import {
  getProductDisplayName,
  getProductImageUrl,
} from '../../products/utils/productDisplay';
import { formatOrderDate, formatOrderDisplayId, formatOrderTotal } from './orderDisplay';

/** Reads cart lines when the list API includes them; does not assume they exist. */
export function getOptionalOrderCartLines(order: OrderSummary): CartLineItem[] {
  if (!Array.isArray(order.cart)) {
    return [];
  }

  return order.cart.filter((line) => line?.productData);
}

function getLineQuantity(line: CartLineItem): number {
  const qty = Number(line.orderQuantiy);
  return Number.isFinite(qty) && qty > 0 ? qty : 1;
}

export function getOrderListItemCount(order: OrderSummary): number | undefined {
  const lines = getOptionalOrderCartLines(order);
  if (lines.length === 0) {
    return undefined;
  }

  const totalQty = lines.reduce((sum, line) => sum + getLineQuantity(line), 0);
  return totalQty > 0 ? totalQty : undefined;
}

export function getOrderListPrimaryTitle(order: OrderSummary): string {
  const lines = getOptionalOrderCartLines(order);
  const firstProduct = lines[0]?.productData;

  if (!firstProduct) {
    return `Order · ${formatOrderDate(order.createdAt)}`;
  }

  const firstName = getProductDisplayName(firstProduct);
  if (lines.length <= 1) {
    return firstName;
  }

  return `${firstName} + ${lines.length - 1} more`;
}

export function getOrderListThumbnailUrl(order: OrderSummary): string | undefined {
  const firstProduct = getOptionalOrderCartLines(order)[0]?.productData;
  if (!firstProduct) {
    return undefined;
  }

  return getProductImageUrl(firstProduct);
}

const ORDER_LIST_PREVIEW_MAX = 3;

export function getOrderListPreviewImages(
  order: OrderSummary,
  maxVisible = ORDER_LIST_PREVIEW_MAX,
): { images: string[]; overflowCount: number } {
  const lines = getOptionalOrderCartLines(order);
  const images = lines
    .map((line) => (line.productData ? getProductImageUrl(line.productData) : undefined))
    .filter((url): url is string => Boolean(url));

  if (images.length <= maxVisible) {
    return { images, overflowCount: 0 };
  }

  return {
    images: images.slice(0, maxVisible),
    overflowCount: images.length - maxVisible,
  };
}

/** Dev-only snapshot of the list preview data path for one order. */
export function getOrderListPreviewDebug(order: OrderSummary) {
  const lines = getOptionalOrderCartLines(order);

  return {
    hasCart: order.cart != null,
    cartIsArray: Array.isArray(order.cart),
    cartLength: Array.isArray(order.cart) ? order.cart.length : 0,
    linesWithProductData: lines.length,
    productName: lines[0]?.productData?.productName ?? null,
    imageUrl: lines[0]?.productData?.images?.[0]?.imageUrl ?? null,
    itemCount: getOrderListItemCount(order) ?? null,
    primaryTitle: getOrderListPrimaryTitle(order),
  };
}

export function getOrderListSubtitle(order: OrderSummary): string {
  const dateLabel = formatOrderDate(order.createdAt);
  const itemCount = getOrderListItemCount(order);

  if (itemCount === undefined) {
    // Date lives in the fallback primary title when cart preview is unavailable.
    return '';
  }

  const itemLabel = itemCount === 1 ? '1 item' : `${itemCount} items`;
  return `${dateLabel} · ${itemLabel}`;
}

export function getOrderListStatusLabel(status?: string): string {
  return formatSellerOrderStatus(status);
}

export function getOrderListStatusBadgeVariant(status?: string) {
  return orderStatusBadgeVariant(status);
}

export function getOrderListAccessibilityLabel(order: OrderSummary): string {
  const orderId = formatOrderDisplayId(order._id);
  const status = getOrderListStatusLabel(order.status);
  const total = formatOrderTotal(order);
  const title = getOrderListPrimaryTitle(order);

  return `Order ${orderId}, ${title}, ${total}, ${status}. View order details.`;
}
