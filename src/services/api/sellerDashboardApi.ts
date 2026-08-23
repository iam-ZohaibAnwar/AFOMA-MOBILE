import type {
  SellerDashboardOrder,
  SellerDashboardOrderCounts,
  SellerDashboardPayoutSummary,
} from '../../features/seller/dashboard/types';
import { apiGet } from './request';

/** GET /seller-dashboard/seller/{sellerId}/orders/count */
export async function getSellerDashboardOrderCounts(
  sellerId: string,
): Promise<SellerDashboardOrderCounts> {
  return apiGet<SellerDashboardOrderCounts>(
    `/seller-dashboard/seller/${encodeURIComponent(sellerId)}/orders/count`,
    undefined,
    'Failed to load order counts',
  );
}

/** GET /seller-dashboard/{sellerId}/pending-payouts */
export async function getSellerDashboardPayoutSummary(
  sellerId: string,
): Promise<SellerDashboardPayoutSummary> {
  return apiGet<SellerDashboardPayoutSummary>(
    `/seller-dashboard/${encodeURIComponent(sellerId)}/pending-payouts`,
    undefined,
    'Failed to load payout summary',
  );
}

/** GET /seller-dashboard/seller/{sellerId}/orders/latest */
export async function getSellerDashboardLatestOrders(
  sellerId: string,
): Promise<SellerDashboardOrder[]> {
  const response = await apiGet<SellerDashboardOrder[] | { orders?: SellerDashboardOrder[] }>(
    `/seller-dashboard/seller/${encodeURIComponent(sellerId)}/orders/latest`,
    undefined,
    'Failed to load recent orders',
  );

  if (Array.isArray(response)) {
    return response;
  }

  return response.orders ?? [];
}
