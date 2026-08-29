import type { Product } from '../../../../services/types/product';
import {
  formatProductApprovalStatus,
  formatProductInventoryStatus,
  formatProductListPrice,
  formatProductListStockLabel,
  getProductListCategoryLabel,
  isProductListDimmed,
  resolveProductListAccentColor,
  resolveProductListStatusChips,
  type ProductListStatusChip,
} from '../../../products/utils/productListDisplayShared';
import type {
  AdminProductApprovalFilter,
  AdminProductInventoryFilter,
  AdminProductListItem,
} from '../types/adminProductManagement';

export const ADMIN_PRODUCT_APPROVAL_FILTERS: Array<{
  label: string;
  value: AdminProductApprovalFilter;
}> = [
  { label: 'All approval statuses', value: '' },
  { label: 'Approved', value: 'Approved' },
  { label: 'Pending', value: 'Pending' },
  { label: 'In Review', value: 'Review' },
  { label: 'Disapproved', value: 'Disapproved' },
  { label: 'Draft', value: 'Draft' },
];

export const ADMIN_PRODUCT_INVENTORY_FILTERS: Array<{
  label: string;
  value: AdminProductInventoryFilter;
}> = [
  { label: 'All visibility statuses', value: '' },
  { label: 'Active', value: 'Active' },
  { label: 'Inactive', value: 'Inactive' },
];

export type AdminProductListTabId =
  | 'all'
  | 'approved'
  | 'pending'
  | 'review'
  | 'disapproved'
  | 'draft'
  | 'active'
  | 'inactive';

export interface AdminProductListTab {
  id: AdminProductListTabId;
  label: string;
  approval: AdminProductApprovalFilter;
  inventory: AdminProductInventoryFilter;
}

/** Primary list tabs — mirrors web admin product status filter menu. */
export const ADMIN_PRODUCT_LIST_TABS: AdminProductListTab[] = [
  { id: 'all', label: 'All', approval: '', inventory: '' },
  { id: 'approved', label: 'Approved', approval: 'Approved', inventory: '' },
  { id: 'pending', label: 'Pending', approval: 'Pending', inventory: '' },
  { id: 'review', label: 'Review', approval: 'Review', inventory: '' },
  { id: 'disapproved', label: 'Disapproved', approval: 'Disapproved', inventory: '' },
  { id: 'draft', label: 'Draft', approval: 'Draft', inventory: '' },
  { id: 'active', label: 'Active', approval: '', inventory: 'Active' },
  { id: 'inactive', label: 'Inactive', approval: '', inventory: 'Inactive' },
];

export const ADMIN_PRODUCT_LIST_TAB_OPTIONS = ADMIN_PRODUCT_LIST_TABS.map(({ id, label }) => ({
  label,
  value: id,
}));

export function getAdminProductListTab(tabId: AdminProductListTabId): AdminProductListTab {
  const tab = ADMIN_PRODUCT_LIST_TABS.find((entry) => entry.id === tabId);
  return tab ?? ADMIN_PRODUCT_LIST_TABS[0];
}

export function resolveAdminProductListTabId(
  approvalFilter: AdminProductApprovalFilter,
  inventoryFilter: AdminProductInventoryFilter,
): AdminProductListTabId | null {
  const match = ADMIN_PRODUCT_LIST_TABS.find(
    (tab) => tab.approval === approvalFilter && tab.inventory === inventoryFilter,
  );

  return match?.id ?? null;
}

export function formatAdminProductApprovalStatus(productStatus?: string): string {
  return formatProductApprovalStatus(productStatus);
}

export function formatAdminProductInventoryStatus(status?: number): string {
  return formatProductInventoryStatus(status);
}

export function formatAdminProductListPrice(product: Product): string {
  return formatProductListPrice(product);
}

export function getAdminProductCategoryLabel(product: Product): string {
  return getProductListCategoryLabel(product) ?? '—';
}

export function getAdminProductSellerUuid(product: AdminProductListItem): string {
  const uuid = product.seller?.uuid;
  if (uuid == null || uuid === '') {
    return '—';
  }

  return String(uuid);
}

export function getAdminProductSellerName(product: AdminProductListItem): string {
  const firstName = product.seller?.firstName?.trim();
  const lastName = product.seller?.lastName?.trim();
  const parts = [firstName, lastName].filter(Boolean);

  if (parts.length > 0) {
    return parts.join(' ');
  }

  return product.seller?.storeTitle?.trim() || '—';
}

export function approvalBadgeVariant(
  productStatus?: string,
): 'success' | 'warning' | 'neutral' {
  if (productStatus === 'Approved') {
    return 'success';
  }

  if (productStatus === 'Review' || productStatus === 'Pending') {
    return 'warning';
  }

  return 'neutral';
}

export function inventoryBadgeVariant(status?: number): 'success' | 'warning' | 'neutral' {
  if (status === 1) {
    return 'success';
  }

  if (status === 0) {
    return 'neutral';
  }

  return 'neutral';
}

export function resolveAdminProductAccentColor(product: AdminProductListItem): string {
  return resolveProductListAccentColor(product);
}

export function formatAdminProductStockLabel(product: AdminProductListItem): string | null {
  return formatProductListStockLabel(product);
}

export function getAdminProductSkuLabel(product: AdminProductListItem): string | null {
  const sku = product.sku?.trim();
  if (sku) {
    return sku;
  }

  const uuid = product.uuid;
  if (uuid != null && String(uuid).trim()) {
    return String(uuid).trim();
  }

  return null;
}

export function getAdminProductSubtitle(product: AdminProductListItem): string {
  const sellerName = getAdminProductSellerName(product);
  const sku = getAdminProductSkuLabel(product);

  if (sku) {
    return `${sellerName} · SKU: ${sku}`;
  }

  const productType = product.productType?.trim();
  if (productType) {
    return `${sellerName} · ${productType}`;
  }

  return sellerName;
}

export function isAdminProductDimmed(product: AdminProductListItem): boolean {
  return isProductListDimmed(product);
}

export interface AdminProductListStatusChip extends ProductListStatusChip {}

/** One primary lifecycle chip + optional stock chip — avoids duplicate approval/visibility badges. */
export function resolveAdminProductListStatusChips(
  product: AdminProductListItem,
): AdminProductListStatusChip[] {
  return resolveProductListStatusChips(product);
}
