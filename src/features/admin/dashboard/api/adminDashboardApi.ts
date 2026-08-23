import { apiGet } from '../../../../services/api/request';
import type {
  AdminLatestProductsResponse,
  AdminLatestSellersResponse,
  AdminPendingOrdersCount,
  AdminPendingPayoutCount,
  AdminPendingProductCount,
  AdminPopularSearchTerm,
  AdminProductStockStatus,
  AdminSellerTotalCount,
  AdminTotalOrdersCount,
  AdminTotalSalesSummary,
  AdminUserCounts,
} from '../types/adminDashboard';

/** GET /admin-dashboard/total-sales — requires fullAccess on web client. */
export async function getAdminTotalSales(): Promise<AdminTotalSalesSummary> {
  return apiGet<AdminTotalSalesSummary>(
    '/admin-dashboard/total-sales',
    undefined,
    'Failed to load total sales',
  );
}

/** GET /admin-dashboard/user-counts */
export async function getAdminUserCounts(): Promise<AdminUserCounts> {
  return apiGet<AdminUserCounts>(
    '/admin-dashboard/user-counts',
    undefined,
    'Failed to load user counts',
  );
}

/** GET /admin-dashboard/product/stock-status */
export async function getAdminProductStockStatus(): Promise<AdminProductStockStatus> {
  return apiGet<AdminProductStockStatus>(
    '/admin-dashboard/product/stock-status',
    undefined,
    'Failed to load stock status',
  );
}

/** GET /admin-dashboard/seller/total-count */
export async function getAdminSellerTotalCount(): Promise<AdminSellerTotalCount> {
  return apiGet<AdminSellerTotalCount>(
    '/admin-dashboard/seller/total-count',
    undefined,
    'Failed to load seller count',
  );
}

/** GET /admin-dashboard/product/pending-count */
export async function getAdminPendingProductCount(): Promise<AdminPendingProductCount> {
  return apiGet<AdminPendingProductCount>(
    '/admin-dashboard/product/pending-count',
    undefined,
    'Failed to load pending product count',
  );
}

/** GET /admin-dashboard/count-pending-payouts */
export async function getAdminPendingPayoutCount(): Promise<AdminPendingPayoutCount> {
  return apiGet<AdminPendingPayoutCount>(
    '/admin-dashboard/count-pending-payouts',
    undefined,
    'Failed to load pending payout count',
  );
}

/** GET /admin-dashboard/count-orders */
export async function getAdminTotalOrdersCount(): Promise<AdminTotalOrdersCount> {
  return apiGet<AdminTotalOrdersCount>(
    '/admin-dashboard/count-orders',
    undefined,
    'Failed to load total orders count',
  );
}

/** GET /admin-dashboard/pending-orders/count */
export async function getAdminPendingOrdersCount(): Promise<AdminPendingOrdersCount> {
  return apiGet<AdminPendingOrdersCount>(
    '/admin-dashboard/pending-orders/count',
    undefined,
    'Failed to load pending orders count',
  );
}

/** GET /admin-dashboard/latest-sellers */
export async function getAdminLatestSellers(): Promise<AdminLatestSellersResponse> {
  return apiGet<AdminLatestSellersResponse>(
    '/admin-dashboard/latest-sellers',
    undefined,
    'Failed to load latest sellers',
  );
}

/** GET /admin-dashboard/last-four-products */
export async function getAdminLatestProducts(): Promise<AdminLatestProductsResponse> {
  return apiGet<AdminLatestProductsResponse>(
    '/admin-dashboard/last-four-products',
    undefined,
    'Failed to load latest products',
  );
}

/** GET /search/latest-popular-search-terms */
export async function getAdminPopularSearchTerms(): Promise<AdminPopularSearchTerm[]> {
  const response = await apiGet<AdminPopularSearchTerm[] | { data?: AdminPopularSearchTerm[] }>(
    '/search/latest-popular-search-terms',
    undefined,
    'Failed to load search terms',
  );

  if (Array.isArray(response)) {
    return response;
  }

  return response.data ?? [];
}
