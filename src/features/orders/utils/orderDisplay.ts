import type { CartLineItem } from '../../../services/types/cart';
import type { OrderDetail, OrderSummary, OrderUserInfo, OrderBillingAddress } from '../../../services/types/order';
import { ApiError } from '../../../services/api/errors';

export function formatOrderDisplayId(orderId?: string): string {
  if (!orderId) {
    return '—';
  }

  return `AM${orderId.substring(0, 6).toUpperCase()}`;
}

export function formatOrderDate(createdAt?: string): string {
  if (!createdAt) {
    return '—';
  }

  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function getOrderTotal(order: OrderSummary): number | undefined {
  if (order.totalAmount != null && order.totalAmount !== '') {
    const total = Number(order.totalAmount);
    if (Number.isFinite(total)) {
      return total;
    }
  }

  const subTotal = Number(order.subTotal);
  const shipping = Number(order.totalShippingRate ?? 0);

  if (Number.isFinite(subTotal)) {
    return subTotal + (Number.isFinite(shipping) ? shipping : 0);
  }

  return undefined;
}

export function formatOrderTotal(order: OrderSummary): string {
  const total = getOrderTotal(order);
  if (total === undefined) {
    return '—';
  }

  const currency = order.currency?.trim() || 'CAD';
  return `${currency} ${total.toFixed(2)}`;
}

export function formatOrderStatus(status?: string): string {
  return status?.trim() || '—';
}

export function getOrderRouteId(order: OrderSummary): string | undefined {
  return order._id;
}

export function formatShippingAddressLines(userInfo?: OrderUserInfo): string[] {
  if (!userInfo) {
    return ['Not added'];
  }

  const firstName = userInfo.firstName ?? userInfo.fname;
  const lastName = userInfo.lastName ?? userInfo.lname;
  const name = [firstName, lastName].filter(Boolean).join(' ').trim();

  const lines = [
    name || undefined,
    userInfo.streetAddress?.trim() || undefined,
    [userInfo.city, userInfo.state, userInfo.ZipCode ?? userInfo.zipcode]
      .filter(Boolean)
      .join(', ') || undefined,
    userInfo.country?.trim() || undefined,
  ].filter((line): line is string => Boolean(line));

  return lines.length > 0 ? lines : ['Not added'];
}

export function getOrderDetailRouteId(order: OrderDetail): string | undefined {
  return order._id;
}

/** Web parity: cancel disabled when order is Shipped or Cancelled. */
export function canCancelOrder(status?: string): boolean {
  const normalized = status?.trim();
  return normalized !== 'Shipped' && normalized !== 'Cancelled';
}

export function formatSellerDisplayName(line: CartLineItem): string | undefined {
  const seller = line.productData?.seller;
  if (!seller) {
    return undefined;
  }

  const name = [seller.firstName, seller.lastName].filter(Boolean).join(' ').trim();
  return name || seller.storeTitle || undefined;
}

export function formatSellerDisplayId(line: CartLineItem): string | undefined {
  const uuid = line.productData?.seller?.uuid;
  if (uuid == null || uuid === '') {
    return undefined;
  }

  const value = String(uuid).trim();
  return value || undefined;
}

export function formatLineVariations(line: CartLineItem): string[] {
  if (!line.selectedVariations?.length) {
    return [];
  }

  return line.selectedVariations
    .filter((variation) => variation.attributeName && variation.attributeValue)
    .map((variation) => `${variation.attributeName}: ${variation.attributeValue}`);
}

export function isDownloadableLine(line: CartLineItem): boolean {
  const productType = line.productData?.productType?.toLowerCase();
  return productType === 'downloadable';
}

export function getDownloadableProductUrl(line: CartLineItem): string | undefined {
  const url = line.productData?.downloadableLink?.featuredProductUrl;
  if (url == null || url === '') {
    return undefined;
  }

  const value = String(url).trim();
  return value || undefined;
}

export function formatBillingAddressLines(billing?: OrderBillingAddress): string[] {
  if (!billing) {
    return [];
  }

  const name = [billing.name?.given_name, billing.name?.surname].filter(Boolean).join(' ').trim();
  const lines = [
    name || undefined,
    billing.email_address?.trim() || undefined,
    billing.address?.country_code?.trim() || undefined,
  ].filter((line): line is string => Boolean(line));

  return lines;
}

export function formatCustomerEmail(userInfo?: OrderUserInfo): string | undefined {
  return userInfo?.email?.trim() || undefined;
}

export function formatCustomerName(userInfo?: OrderUserInfo): string | undefined {
  const firstName = userInfo?.firstName ?? userInfo?.fname;
  const lastName = userInfo?.lastName ?? userInfo?.lname;
  const name = [firstName, lastName].filter(Boolean).join(' ').trim();
  return name || undefined;
}

export function isOrderNotFoundError(error: unknown): boolean {
  return error instanceof ApiError && error.statusCode === 404;
}
