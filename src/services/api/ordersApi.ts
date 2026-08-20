import type {
  CaptureCheckoutOrderRequest,
  CaptureCheckoutOrderResponse,
  CreateCheckoutOrderRequest,
  CreateCheckoutOrderResponse,
  CustomerOrdersListResponse,
  OrderDetail,
} from '../types/order';
import { apiDelete, apiGet, apiPost } from './request';

export interface GetCustomerOrdersParams {
  page?: number;
  limit?: number;
  search?: string;
}

/** GET /orders/getOrders/ByUserId/{userId} */
export async function getOrdersByUserId(
  userId: string,
  params: GetCustomerOrdersParams = {},
): Promise<CustomerOrdersListResponse> {
  return apiGet<CustomerOrdersListResponse>(
    `/orders/getOrders/ByUserId/${encodeURIComponent(userId)}`,
    { params },
    'Failed to load orders',
  );
}

/** POST /paypal/createorder — creates checkout order before payment capture (web parity). */
export async function createCheckoutOrder(
  body: CreateCheckoutOrderRequest,
): Promise<CreateCheckoutOrderResponse> {
  return apiPost<CreateCheckoutOrderResponse>(
    '/paypal/createorder',
    body,
    undefined,
    'Failed to create order',
  );
}

export function extractCreatedOrderId(response: CreateCheckoutOrderResponse): string | undefined {
  return response.Data?.result?.id ?? response.orderId ?? response._id;
}

/** POST /paypal/captureorder — completes checkout payment (web parity). */
export async function captureCheckoutOrder(
  body: CaptureCheckoutOrderRequest,
): Promise<CaptureCheckoutOrderResponse> {
  return apiPost<CaptureCheckoutOrderResponse>(
    '/paypal/captureorder',
    body,
    undefined,
    'Failed to capture PayPal payment',
  );
}

export function extractCaptureOrderDetails(
  response: CaptureCheckoutOrderResponse,
  paypalOrderId: string,
): Array<{ label: string; value: string }> {
  const details: Array<{ label: string; value: string }> = [
    { label: 'PayPal Order ID', value: paypalOrderId },
  ];

  if (response.orderId) {
    details.push({ label: 'Order Reference', value: response.orderId });
  }

  if (response._id) {
    details.push({ label: 'Internal Order ID', value: response._id });
  }

  if (response.paymentId) {
    details.push({ label: 'Payment ID', value: response.paymentId });
  }

  if (response.status) {
    details.push({ label: 'Payment Status', value: response.status });
  }

  if (response.message) {
    details.push({ label: 'Message', value: response.message });
  }

  return details;
}

/** GET /orders/{orderId} — requires Bearer token (via api client interceptor) */
export async function getOrderById(orderId: string): Promise<OrderDetail> {
  return apiGet<OrderDetail>(`/orders/${encodeURIComponent(orderId)}`, undefined, 'Failed to load order');
}

/** DELETE /shipping/cancel-shipment/{orderId} — requires Bearer token */
export async function cancelOrderShipment(orderId: string): Promise<unknown> {
  return apiDelete<unknown>(
    `/shipping/cancel-shipment/${encodeURIComponent(orderId)}`,
    undefined,
    'Failed to cancel order shipment',
  );
}
