import type { Product } from '../../../../services/types/product';

/** Approval workflow — independent from store visibility (`status` number on product). */
export type AdminProductApprovalFilter =
  | ''
  | 'Approved'
  | 'Pending'
  | 'Review'
  | 'Disapproved'
  | 'Draft';

/** Store visibility filter — maps to API query `status` (Active / Inactive). */
export type AdminProductInventoryFilter = '' | 'Active' | 'Inactive';

/** Inventory alert filter — maps to API query `stockAlert`. */
export type AdminProductStockAlertFilter = '' | 'outOfStock' | 'lowStock';

export const ADMIN_LOW_STOCK_THRESHOLD = 5;

export interface AdminProductListItem extends Product {}

export interface AdminProductListQuery {
  page: number;
  limit: number;
  search?: string;
  /** Approval filter — API param `productStatus`. */
  productStatus?: Exclude<AdminProductApprovalFilter, ''>;
  /** Store visibility filter — API param `status` (Active | Inactive). */
  inventoryStatus?: Exclude<AdminProductInventoryFilter, ''>;
  /** Inventory alert filter — API param `stockAlert` (outOfStock | lowStock). */
  stockAlert?: Exclude<AdminProductStockAlertFilter, ''>;
}

export interface AdminProductListResponse {
  products: AdminProductListItem[];
  totalProducts: number;
  totalPages: number;
}

export interface AdminProductManagementParams {
  /** Seed approval filter when navigating from dashboard pending count. */
  initialApprovalFilter?: Exclude<AdminProductApprovalFilter, ''>;
  /** Optional seed for store visibility filter. */
  initialInventoryFilter?: Exclude<AdminProductInventoryFilter, ''>;
  /** Seed inventory alert filter when navigating from dashboard stock cards. */
  initialStockAlertFilter?: Exclude<AdminProductStockAlertFilter, ''>;
  /** One-line context when opened from dashboard inventory alerts. */
  initialListNotice?: string;
  /** Bumps each dashboard inventory navigation so filters re-apply on an existing screen. */
  stockAlertRequestedAt?: number;
}

export type AdminProductDetail = Product;
