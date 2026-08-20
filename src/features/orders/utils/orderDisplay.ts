import type { OrderDetail, OrderSummary, OrderUserInfo } from '../../../services/types/order';

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
