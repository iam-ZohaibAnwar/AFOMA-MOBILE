import { apiDelete, apiGet, apiPut } from '../../../../services/api/request';
import type {
  AdminLineFulfillmentMutationValue,
  AdminOrderStatusMutationValue,
} from '../types/adminOrderOperations';
import type {
  AdminOrderDetail,
  AdminOrderListItem,
  AdminOrderListQuery,
  AdminOrderListResponse,
} from '../types/adminOrderManagement';

function buildAdminOrderListParams(query: AdminOrderListQuery): Record<string, string | number> {
  const params: Record<string, string | number> = {
    page: query.page,
    limit: query.limit,
  };

  if (query.search) {
    params.search = query.search;
  }

  if (query.status) {
    params.status = query.status;
  }

  return params;
}

/** GET /orders — platform-wide admin order list (web parity). */
export async function getAdminOrderList(query: AdminOrderListQuery): Promise<AdminOrderListResponse> {
  const response = await apiGet<AdminOrderListResponse | AdminOrderListItem[]>(
    '/orders',
    { params: buildAdminOrderListParams(query) },
    'Failed to load orders',
  );

  if (Array.isArray(response)) {
    return {
      orders: response,
      totalOrders: response.length,
      totalPages: 1,
    };
  }

  const orders = Array.isArray(response.orders) ? response.orders : [];

  return {
    orders,
    totalOrders: response.totalOrders ?? orders.length,
    totalPages: response.totalPages ?? 1,
  };
}

/** GET /orders/{orderId} — admin order detail. */
export async function getAdminOrderById(orderId: string): Promise<AdminOrderDetail> {
  return apiGet<AdminOrderDetail>(
    `/orders/${encodeURIComponent(orderId)}`,
    undefined,
    'Failed to load order',
  );
}

/** PUT /orders/update/status/{orderId} */
export async function updateAdminOrderStatus(
  orderId: string,
  status: AdminOrderStatusMutationValue | string,
): Promise<void> {
  await apiPut<void>(
    `/orders/update/status/${encodeURIComponent(orderId)}`,
    { status },
    undefined,
    'Failed to update order status',
  );
}

/** PUT /orders/{orderId}/products/{productId}/shipping */
export async function updateAdminOrderLineShippingStatus(
  orderId: string,
  productId: string,
  shippingStatus: AdminLineFulfillmentMutationValue | string,
): Promise<void> {
  await apiPut<void>(
    `/orders/${encodeURIComponent(orderId)}/products/${encodeURIComponent(productId)}/shipping`,
    { shippingStatus },
    undefined,
    'Failed to update fulfillment status',
  );
}

/** DELETE /shipping/cancel-shipment/{orderId} */
export async function cancelAdminOrderShipment(orderId: string): Promise<void> {
  await apiDelete<void>(
    `/shipping/cancel-shipment/${encodeURIComponent(orderId)}`,
    undefined,
    'Failed to cancel shipment',
  );
}
