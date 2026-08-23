import { apiGet, apiPut } from '../../../../services/api/request';
import type {
  GetSellerOrdersParams,
  SellerOrderDetail,
  SellerOrderDetailResponse,
  SellerOrdersListResponse,
  SellerLineFulfillmentStatus,
} from '../types/sellerOrder';

export async function getSellerOrdersPage(
  sellerId: string,
  params: GetSellerOrdersParams = {},
): Promise<SellerOrdersListResponse> {
  return apiGet<SellerOrdersListResponse>(
    `/orders/sellerData/${encodeURIComponent(sellerId)}`,
    { params },
    'Failed to load seller orders',
  );
}

export async function getSellerOrderDetail(
  sellerId: string,
  orderId: string,
): Promise<SellerOrderDetail> {
  const response = await apiGet<SellerOrderDetailResponse>(
    `/orders/single/${encodeURIComponent(sellerId)}/${encodeURIComponent(orderId)}`,
    undefined,
    'Failed to load order',
  );

  const order = response.orders;
  if (!order?._id) {
    throw new Error('Order not found');
  }

  return order;
}

export async function updateSellerOrderLineShippingStatus(
  orderId: string,
  productId: string,
  shippingStatus: SellerLineFulfillmentStatus,
): Promise<void> {
  await apiPut<void>(
    `/orders/${encodeURIComponent(orderId)}/products/${encodeURIComponent(productId)}/shipping`,
    { shippingStatus },
    undefined,
    'Failed to update fulfillment status',
  );
}
