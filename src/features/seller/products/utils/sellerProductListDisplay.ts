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
} from '../../../products/utils/productListDisplayShared';

export type SellerInventoryStatusFilter = '' | 'Active' | 'Inactive';

export type SellerApprovalStatusFilter =
  | ''
  | 'Approved'
  | 'Pending'
  | 'Review'
  | 'Disapproved'
  | 'Draft';

export type SellerProductListTabId =
  | 'all'
  | 'approved'
  | 'pending'
  | 'review'
  | 'disapproved'
  | 'draft'
  | 'active'
  | 'inactive';

export interface SellerProductListTab {
  id: SellerProductListTabId;
  label: string;
  approval: SellerApprovalStatusFilter;
  inventory: SellerInventoryStatusFilter;
}

/** Primary list tabs — mirrors web seller product status filters. */
export const SELLER_PRODUCT_LIST_TABS: SellerProductListTab[] = [
  { id: 'all', label: 'All', approval: '', inventory: '' },
  { id: 'approved', label: 'Approved', approval: 'Approved', inventory: '' },
  { id: 'pending', label: 'Pending', approval: 'Pending', inventory: '' },
  { id: 'review', label: 'Review', approval: 'Review', inventory: '' },
  { id: 'disapproved', label: 'Disapproved', approval: 'Disapproved', inventory: '' },
  { id: 'draft', label: 'Draft', approval: 'Draft', inventory: '' },
  { id: 'active', label: 'Active', approval: '', inventory: 'Active' },
  { id: 'inactive', label: 'Inactive', approval: '', inventory: 'Inactive' },
];

export const SELLER_PRODUCT_LIST_TAB_OPTIONS = SELLER_PRODUCT_LIST_TABS.map(({ id, label }) => ({
  label,
  value: id,
}));

export function getSellerProductListTab(tabId: SellerProductListTabId): SellerProductListTab {
  const tab = SELLER_PRODUCT_LIST_TABS.find((entry) => entry.id === tabId);
  return tab ?? SELLER_PRODUCT_LIST_TABS[0];
}

export function resolveSellerProductListTabId(
  approvalFilter: SellerApprovalStatusFilter,
  inventoryFilter: SellerInventoryStatusFilter,
): SellerProductListTabId | null {
  const match = SELLER_PRODUCT_LIST_TABS.find(
    (tab) => tab.approval === approvalFilter && tab.inventory === inventoryFilter,
  );

  return match?.id ?? null;
}

export const SELLER_APPROVAL_STATUS_FILTERS: Array<{ label: string; value: SellerApprovalStatusFilter }> = [
  { label: 'All approval statuses', value: '' },
  { label: 'Approved', value: 'Approved' },
  { label: 'Pending', value: 'Pending' },
  { label: 'In Review', value: 'Review' },
  { label: 'Disapproved', value: 'Disapproved' },
  { label: 'Draft', value: 'Draft' },
];

export const SELLER_INVENTORY_STATUS_FILTERS: Array<{ label: string; value: SellerInventoryStatusFilter }> = [
  { label: 'All inventory statuses', value: '' },
  { label: 'Active', value: 'Active' },
  { label: 'Inactive', value: 'Inactive' },
];

export function formatSellerListPrice(product: Product): string {
  return formatProductListPrice(product);
}

export function formatSellerApprovalStatus(productStatus?: string): string {
  return formatProductApprovalStatus(productStatus);
}

export function formatSellerInventoryStatus(status?: number): string {
  return formatProductInventoryStatus(status);
}

export function filterSellerProducts(
  products: Product[],
  searchTerm: string,
  approvalStatus: SellerApprovalStatusFilter,
  inventoryStatus: SellerInventoryStatusFilter,
): Product[] {
  let filtered = products;

  if (approvalStatus) {
    filtered = filtered.filter((product) => product.productStatus === approvalStatus);
  }

  if (inventoryStatus) {
    const statusValue = inventoryStatus === 'Active' ? 1 : 0;
    filtered = filtered.filter((product) => product.status === statusValue);
  }

  const term = searchTerm.trim().toLowerCase();
  if (term) {
    filtered = filtered.filter((product) =>
      product.productName?.toLowerCase().includes(term),
    );
  }

  return filtered;
}

export function getSellerProductCategoryLabel(product: Product): string | undefined {
  return getProductListCategoryLabel(product);
}

export function getSellerProductSkuLabel(product: Product): string | null {
  const sku = product.sku?.trim();
  return sku || null;
}

export function getSellerProductSubtitle(product: Product): string {
  const category = getSellerProductCategoryLabel(product);
  const sku = getSellerProductSkuLabel(product);
  const productType = product.productType?.trim();

  if (category && sku) {
    return `${category} · SKU: ${sku}`;
  }

  if (category && productType) {
    return `${category} · ${productType}`;
  }

  if (sku) {
    return `SKU: ${sku}`;
  }

  if (productType) {
    return productType;
  }

  return category ?? '—';
}

export const formatSellerProductStockLabel = formatProductListStockLabel;
export const isSellerProductDimmed = isProductListDimmed;
export const resolveSellerProductAccentColor = resolveProductListAccentColor;
export const resolveSellerProductListStatusChips = resolveProductListStatusChips;
