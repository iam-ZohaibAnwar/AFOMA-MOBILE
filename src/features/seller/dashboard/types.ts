import type { OrderUserInfo } from '../../../services/types/order';

/** GET /seller-dashboard/seller/{sellerId}/orders/count */
export interface SellerDashboardOrderCounts {
  pendingOrdersCount?: number;
  dispatchedOrdersCount?: number;
  completedOrdersCount?: number;
}

/** GET /seller-dashboard/{sellerId}/pending-payouts */
export interface SellerDashboardPayoutSummary {
  totalPendingPayoutAmount?: number | string | null;
  totalPaidPayoutAmount?: number | string | null;
  totalCommissionsCount?: number;
  pendingCommissionsCount?: number;
  paidCommissionsCount?: number;
}

/** GET /seller-dashboard/seller/{sellerId}/orders/latest — order summary rows */
export interface SellerDashboardOrder {
  _id?: string;
  status?: string;
  paymentStatus?: string;
  createdAt?: string;
  userInfo?: OrderUserInfo;
}
