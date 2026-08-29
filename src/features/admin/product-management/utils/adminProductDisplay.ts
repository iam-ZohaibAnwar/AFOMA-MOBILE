import type { Product } from '../../../../services/types/product';
import { colors } from '../../../../design-system';
import {
  formatSellerApprovalStatus,
  formatSellerInventoryStatus,
  formatSellerListPrice,
  getSellerProductCategoryLabel,
} from '../../../seller/products/utils/sellerProductListDisplay';
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
  return formatSellerApprovalStatus(productStatus);
}

export function formatAdminProductInventoryStatus(status?: number): string {
  return formatSellerInventoryStatus(status);
}

export function formatAdminProductListPrice(product: Product): string {
  return formatSellerListPrice(product);
}

export function getAdminProductCategoryLabel(product: Product): string {
  return getSellerProductCategoryLabel(product) ?? '—';
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
  if (product.status === 0) {
    return colors.error;
  }

  if (product.productStatus === 'Disapproved') {
    return colors.error;
  }

  if (product.productStatus === 'Pending' || product.productStatus === 'Review') {
    return colors.secondary;
  }

  if (product.productStatus === 'Approved' && product.status === 1) {
    return colors.success;
  }

  if (product.productStatus === 'Draft') {
    return colors.textMuted;
  }

  return colors.borderStrong;
}

export function formatAdminProductStockLabel(product: AdminProductListItem): string | null {
  if (product.productType === 'Downloadable') {
    return null;
  }

  if (product.productType === 'Customizable') {
    const total = (product.variations ?? []).reduce((sum, variation) => {
      const qty = Number(variation.quantity);
      return sum + (Number.isFinite(qty) ? qty : 0);
    }, 0);

    if (total <= 0) {
      return 'Out of stock';
    }

    if (total <= 5) {
      return `Low Stock (${total})`;
    }

    return `${total} in stock`;
  }

  const quantity = Number(product.quantity);
  if (!Number.isFinite(quantity)) {
    return null;
  }

  if (product.inventory === 'OutOffStock' || quantity <= 0) {
    return 'Out of stock';
  }

  if (quantity <= 5) {
    return `Low Stock (${quantity})`;
  }

  return `${quantity} in stock`;
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
  return product.status === 0 || product.productStatus === 'Disapproved';
}

export interface AdminProductListStatusChip {
  id: string;
  label: string;
  icon: string;
  tone: 'success' | 'info' | 'warning' | 'danger' | 'neutral';
}

/** One primary lifecycle chip + optional stock chip — avoids duplicate approval/visibility badges. */
export function resolveAdminProductListStatusChips(
  product: AdminProductListItem,
): AdminProductListStatusChip[] {
  const chips: AdminProductListStatusChip[] = [];
  const approval = product.productStatus?.trim();

  if (approval === 'Disapproved') {
    chips.push({
      id: 'disapproved',
      label: 'Disapproved',
      icon: 'close-circle',
      tone: 'danger',
    });
  } else if (product.status === 0) {
    chips.push({
      id: 'inactive',
      label: 'Suspended',
      icon: 'ban',
      tone: 'danger',
    });
  } else if (approval === 'Review') {
    chips.push({
      id: 'review',
      label: 'Review',
      icon: 'document-text-outline',
      tone: 'warning',
    });
  } else if (approval === 'Pending') {
    chips.push({
      id: 'pending',
      label: 'Pending',
      icon: 'time-outline',
      tone: 'warning',
    });
  } else if (approval === 'Draft') {
    chips.push({
      id: 'draft',
      label: 'Draft',
      icon: 'document-outline',
      tone: 'neutral',
    });
  } else if (product.status === 1) {
    chips.push({
      id: 'active',
      label: 'Active',
      icon: 'checkmark-circle',
      tone: 'success',
    });
  }

  const stockLabel = formatAdminProductStockLabel(product);
  if (stockLabel && !isAdminProductDimmed(product)) {
    const lower = stockLabel.toLowerCase();
    const isStockAlert = lower.includes('low') || lower.includes('out');

    chips.push({
      id: 'stock',
      label: stockLabel,
      icon: isStockAlert ? 'warning-outline' : 'cube-outline',
      tone: isStockAlert ? 'danger' : 'info',
    });
  }

  return chips;
}
