import type { Product } from '../../../../services/types/product';
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
