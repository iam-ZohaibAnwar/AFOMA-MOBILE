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

export interface AdminProductListItem extends Product {}

export interface AdminProductListQuery {
  page: number;
  limit: number;
  search?: string;
  /** Approval filter — API param `productStatus`. */
  productStatus?: Exclude<AdminProductApprovalFilter, ''>;
  /** Store visibility filter — API param `status` (Active | Inactive). */
  inventoryStatus?: Exclude<AdminProductInventoryFilter, ''>;
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
}

export type AdminProductDetail = Product;
