import type { CartLineItem } from '../../../../services/types/cart';
import type { AdminOrderDetail, AdminOrderListItem } from '../types/adminOrderManagement';
import type {
  AdminLineFulfillmentMutationValue,
  AdminOrderStatusMutationValue,
  AdminSelectOption,
} from '../types/adminOrderOperations';
import { formatAdminOrderStatus } from './adminOrderDisplay';
import { formatSellerLineFulfillmentStatus } from '../../../seller/orders/utils/sellerOrderMappers';

export const ADMIN_ORDER_STATUS_MUTATION_OPTIONS: AdminSelectOption[] = [
  { label: 'Pending', value: 'Pending' },
  { label: 'Processing', value: 'Processing' },
  { label: 'Shipped', value: 'Shipped' },
  { label: 'Delivered', value: 'Delivered' },
  { label: 'Returned', value: 'Returned' },
  { label: 'Cancelled', value: 'Cancelled' },
];

export const ADMIN_LINE_FULFILLMENT_MUTATION_OPTIONS: AdminSelectOption[] = [
  { label: 'Processing', value: 'Processing' },
  { label: 'Dispatched', value: 'Dispatch' },
  { label: 'Returned', value: 'Returned' },
  { label: 'Cancelled', value: 'Cancelled' },
];

const ADMIN_ORDER_STATUS_MUTATION_SET = new Set<string>(
  ADMIN_ORDER_STATUS_MUTATION_OPTIONS.map((option) => option.value),
);

const ADMIN_LINE_FULFILLMENT_MUTATION_SET = new Set<string>(
  ADMIN_LINE_FULFILLMENT_MUTATION_OPTIONS.map((option) => option.value),
);

export function isAdminOrderStatusMutationValue(
  value: string,
): value is AdminOrderStatusMutationValue {
  return ADMIN_ORDER_STATUS_MUTATION_SET.has(value);
}

export function isAdminLineFulfillmentMutationValue(
  value: string,
): value is AdminLineFulfillmentMutationValue {
  return ADMIN_LINE_FULFILLMENT_MUTATION_SET.has(value);
}

export function buildAdminOrderStatusOptions(currentStatus?: string): AdminSelectOption[] {
  const normalized = currentStatus?.trim();
  if (!normalized || ADMIN_ORDER_STATUS_MUTATION_SET.has(normalized)) {
    return ADMIN_ORDER_STATUS_MUTATION_OPTIONS;
  }

  return [
    {
      label: `${formatAdminOrderStatus(normalized)} (current)`,
      value: normalized,
    },
    ...ADMIN_ORDER_STATUS_MUTATION_OPTIONS,
  ];
}

export function buildAdminLineFulfillmentOptions(currentStatus?: string): AdminSelectOption[] {
  const normalized = currentStatus?.trim();
  if (!normalized || ADMIN_LINE_FULFILLMENT_MUTATION_SET.has(normalized)) {
    return ADMIN_LINE_FULFILLMENT_MUTATION_OPTIONS;
  }

  return [
    {
      label: `${formatSellerLineFulfillmentStatus(normalized)} (current)`,
      value: normalized,
    },
    ...ADMIN_LINE_FULFILLMENT_MUTATION_OPTIONS,
  ];
}

export function canCancelAdminOrderShipment(status?: string): boolean {
  const normalized = status?.trim();
  return normalized !== 'Cancelled' && normalized !== 'Shipped';
}

export function canChangeAdminOrderStatus(order?: AdminOrderListItem | null): boolean {
  return order?.status?.trim() !== 'Cancelled';
}

export function canUpdateAdminLineFulfillment(
  order: AdminOrderListItem,
  line: CartLineItem,
): boolean {
  if (!canChangeAdminOrderStatus(order)) {
    return false;
  }

  if (line.productData?.productType === 'Downloadable') {
    return false;
  }

  return Boolean(line.productData?._id);
}

export function isDestructiveAdminOrderStatus(value: string): boolean {
  return value === 'Cancelled';
}

export function isDestructiveAdminLineFulfillment(value: string): boolean {
  return value === 'Cancelled';
}

export function patchAdminOrderStatus(
  order: AdminOrderDetail,
  status: string,
): AdminOrderDetail {
  return { ...order, status };
}

export function patchAdminOrderLineShippingStatus(
  order: AdminOrderDetail,
  productId: string,
  shippingStatus: string,
): AdminOrderDetail {
  return {
    ...order,
    cart: order.cart?.map((line) => {
      if (line.productData?._id !== productId) {
        return line;
      }

      return {
        ...line,
        productData: line.productData
          ? { ...line.productData, shippingStatus }
          : line.productData,
      };
    }),
  };
}

export function toAdminOrderListPatch(order: AdminOrderDetail): Partial<AdminOrderListItem> {
  return {
    _id: order._id,
    status: order.status,
    paymentStatus: order.paymentStatus,
    createdAt: order.createdAt,
    userInfo: order.userInfo,
    cart: order.cart,
    currency: order.currency,
    conversionRate: order.conversionRate,
  };
}
