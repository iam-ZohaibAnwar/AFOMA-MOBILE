import type { OrderUserInfo } from '../../../../services/types/order';

/** Server-side payout status filter — web parity. */
export type SellerEarningsPayoutStatusFilter = '' | 'Pending' | 'Paid';

export interface SellerCommissionSellerRef {
  _id?: string;
}

export interface SellerCommissionOrderRef {
  _id?: string;
  userInfo?: OrderUserInfo;
  cart?: unknown;
}

/** Commission row returned by GET /commission/seller/{sellerId}. */
export interface SellerCommissionRecord {
  _id?: string;
  payoutStatus?: string;
  payoutAmount?: number | string;
  referralAmount?: number | string;
  createdAt?: string;
  seller?: SellerCommissionSellerRef;
  orderId?: SellerCommissionOrderRef;
}

export interface SellerCommissionsQuery {
  page?: number;
  limit?: number;
  payoutStatus?: SellerEarningsPayoutStatusFilter;
}

export interface SellerCommissionsResponse {
  commissions?: SellerCommissionRecord[];
  totalPages?: number;
}

/** Seller-scoped cart line shown on an earnings card. */
export interface SellerEarningLineItem {
  productName: string;
  sku: string;
  quantity: string;
  lineTotal: string;
}
