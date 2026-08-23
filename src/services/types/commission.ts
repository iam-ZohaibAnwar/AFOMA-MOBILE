import type { OrderUserInfo } from './order';

export interface CommissionOrderRef {
  _id?: string;
  userInfo?: OrderUserInfo;
}

/** Commission row returned by GET /commission/affiliate/{id}. */
export interface AffiliateCommissionRecord {
  _id?: string;
  payoutStatus?: string;
  referralAmount?: number | string;
  affiliateAmount?: number | string;
  commissionAmount?: number | string;
  payoutAmount?: number | string;
  createdAt?: string;
  orderId?: CommissionOrderRef;
  userId?: {
    _id?: string;
    firstName?: string;
    lastName?: string;
  };
}

export interface AffiliateCommissionsResponse {
  commissions?: AffiliateCommissionRecord[];
  totalCommissionAmount?: number;
  totalCount?: number;
  totalPages?: number;
}

export interface AffiliateCommissionsQuery {
  page?: number;
  limit?: number;
  payoutStatus?: string;
}
