import type { Ionicons } from '@expo/vector-icons';
import type { CartLineItem } from '../../../services/types/cart';
import type { OrderDetail } from '../../../services/types/order';
import { colors } from '../../../design-system';
import {
  getOrderListStatusBadgeVariant,
  getOrderListStatusLabel,
} from './orderListDisplay';

export function getOrderStatusIconName(status?: string): keyof typeof Ionicons.glyphMap {
  const normalized = status?.trim() ?? '';

  if (normalized === 'Delivered') {
    return 'checkmark-circle';
  }

  if (
    normalized === 'Shipped' ||
    normalized === 'Dispatch' ||
    normalized === 'Dispatched' ||
    normalized === 'OutforDelivery'
  ) {
    return 'car-outline';
  }

  if (normalized === 'Processing') {
    return 'checkmark-circle-outline';
  }

  if (normalized === 'Pending') {
    return 'time-outline';
  }

  if (normalized === 'Cancelled' || normalized === 'Cancel order') {
    return 'close-circle-outline';
  }

  return 'ellipse-outline';
}

export function getOrderStatusLabel(status?: string): string {
  return getOrderListStatusLabel(status);
}

export function getOrderStatusColor(status?: string): string {
  const variant = getOrderListStatusBadgeVariant(status);
  if (variant === 'success') {
    return colors.success;
  }
  if (variant === 'warning') {
    return colors.warningText;
  }
  return colors.textSecondary;
}

export function getOrderShippingMethodLabel(order: OrderDetail): string | undefined {
  const method = order.shippingMethod?.trim();
  if (method) {
    return method;
  }

  const firstLine = order.cart?.[0];
  if (!firstLine) {
    return undefined;
  }

  if (firstLine.shippingRate === -1) {
    return 'Free Shipping';
  }

  const carrier = (firstLine.shippingService as { carrier_name?: string } | undefined)?.carrier_name;
  return carrier?.trim() || undefined;
}

export function getOrderTrackingNumber(order: OrderDetail): string | undefined {
  const tracking = order.shipmentId?.trim();
  return tracking || undefined;
}

export function getOrderPaymentMethodLabel(order: OrderDetail): string | undefined {
  const method = order.paymentMethod?.trim();
  if (method) {
    return method;
  }

  if (order.paymentStatus === 'PaymentDone') {
    return 'Payment completed';
  }

  return undefined;
}

export function formatOrderLineVariantLabel(line: CartLineItem): string | undefined {
  const variations = line.selectedVariations
    ?.filter((variation) => variation.attributeName && variation.attributeValue)
    .map((variation) => `${variation.attributeName}: ${variation.attributeValue}`);

  if (!variations?.length) {
    return undefined;
  }

  return variations.join(' · ');
}

export function getPrimaryOrderSellerId(order: OrderDetail): string | undefined {
  const sellerId = order.cart?.[0]?.productData?.seller?._id;
  if (sellerId == null || sellerId === '') {
    return undefined;
  }

  const value = String(sellerId).trim();
  return value || undefined;
}
