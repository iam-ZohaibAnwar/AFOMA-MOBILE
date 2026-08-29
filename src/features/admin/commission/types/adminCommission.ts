/** Server-side payout status filter — web admin commission parity. */
export type AdminCommissionPayoutStatusFilter = '' | 'Pending' | 'Paid';

/** Server-side recipient-role filter — distinct from acting admin JWT fullAccess. */
export type AdminCommissionRecipientRoleFilter = '' | 'seller' | 'affiliate' | 'referral';

export interface AdminCommissionPartyRef {
  _id?: string;
  firstName?: string;
  lastName?: string;
  countryCode?: string;
  country?: {
    value?: string;
    code?: string;
    isoCode?: string;
  };
}

export interface AdminCommissionCartItem {
  orderQuantiy?: number;
  basePrice?: number;
  totalAmount?: number;
  maxQuantity?: number;
  remark?: string;
  productData?: {
    _id?: string;
    productName?: string;
    sku?: string;
    productStatus?: string;
    seller?: AdminCommissionPartyRef;
  };
  shippingService?: {
    carrier_name?: string;
  };
  shippingRate?: number | string;
}

export interface AdminCommissionOrderRef {
  _id?: string;
  orderId?: string;
  cart?: AdminCommissionCartItem[];
  [key: string]: unknown;
}

/**
 * Raw commission document from GET /commission.
 * `orderId` may be populated (list) or a string id (GET /commission/:id).
 */
export interface AdminCommissionRecord {
  _id: string;
  orderId?: AdminCommissionOrderRef | string;
  seller?: AdminCommissionPartyRef;
  userId?: AdminCommissionPartyRef;
  commissionAmount?: number | string;
  payoutAmount?: number | string;
  affiliateAmount?: number | string;
  referralAmount?: number | string;
  payoutStatus?: string;
  isPayout?: boolean;
  payoutDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminCommissionListQuery {
  page: number;
  limit: number;
  search?: string;
  payoutStatus?: AdminCommissionPayoutStatusFilter;
  role?: AdminCommissionRecipientRoleFilter;
}

export interface AdminCommissionListResponse {
  commissions?: AdminCommissionRecord[];
  totalCommissions?: number;
  totalPages?: number;
  currentPage?: number;
  limit?: number;
}

export interface AdminCommissionTotalAmountResponse {
  totalCommission?: number | string;
}

export type AdminCommissionStatusMutation = 'Pending' | 'Paid';

export interface AdminCommissionUpdatePayoutStatusBody {
  newPayoutStatus: AdminCommissionStatusMutation;
}

export interface AdminCommissionPayoutLinkResponse {
  message?: string;
}

export type AdminCommissionActionKind = 'initiate' | 'status';

export interface AdminCommissionActionError {
  commissionId: string;
  kind: AdminCommissionActionKind;
  message: string;
}

export type AdminCommissionDisplayType = 'seller' | 'affiliate' | 'referral';

/**
 * Mapped display row from raw commission documents.
 * `commissionId` always comes from the source record `_id` — never synthetic.
 */
export interface AdminCommissionDisplayRow {
  /** Source commission document `_id` for Phase 3 mutations. */
  commissionId: string;
  orderId: string;
  orderDisplayId: string;
  type: AdminCommissionDisplayType;
  payoutStatus: string;
  isPayout: boolean;
  commissionAmount: number;
  payoutAmount?: number;
  affiliateAmount?: number;
  referralAmount?: number;
  recipientName: string;
  productNames: string;
  purchasedAt?: string;
  /** Stable FlatList key — commissionId + type (same order may yield multiple rows). */
  rowKey: string;
}

/** Navigation params — dashboard can preset payout-status filter. */
export type AdminCommissionManagementParams = {
  initialPayoutStatus?: Exclude<AdminCommissionPayoutStatusFilter, ''>;
};

export type AdminCommissionDetailParams = {
  commissionId: string;
  displayType: AdminCommissionDisplayType;
  initialRow?: AdminCommissionDisplayRow;
};
