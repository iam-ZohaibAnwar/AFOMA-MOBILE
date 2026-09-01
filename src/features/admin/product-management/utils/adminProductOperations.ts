import type { Product } from '../../../../services/types/product';
import { isPopulatedProductSellerRef } from '../../../products/utils/productDisplay';
import type { AdminProductApprovalStatus } from '../types/adminProductOperations';
import type { AdminProductDetail, AdminProductListItem } from '../types/adminProductManagement';
import type { SelectOption } from '../../../../utils/regionOptions';

export const ADMIN_PRODUCT_APPROVAL_OPTIONS: SelectOption[] = [
  { label: 'Pending', value: 'Pending' },
  { label: 'In Review', value: 'Review' },
  { label: 'Approved', value: 'Approved' },
  { label: 'Disapproved', value: 'Disapproved' },
  { label: 'Draft', value: 'Draft' },
];

export function buildAdminProductApprovalOptions(
  currentStatus?: string,
): SelectOption[] {
  const normalized = currentStatus?.trim() ?? '';
  const hasCurrent = ADMIN_PRODUCT_APPROVAL_OPTIONS.some((option) => option.value === normalized);

  if (!normalized || hasCurrent) {
    return ADMIN_PRODUCT_APPROVAL_OPTIONS;
  }

  return [{ label: normalized, value: normalized }, ...ADMIN_PRODUCT_APPROVAL_OPTIONS];
}

export function isDestructiveAdminProductApproval(
  productStatus: AdminProductApprovalStatus | string,
): boolean {
  return productStatus === 'Disapproved';
}

export function patchAdminProductApproval<T extends Product>(
  product: T,
  productStatus: AdminProductApprovalStatus | string,
): T {
  return { ...product, productStatus };
}

export function patchAdminProductStoreVisibility<T extends Product>(
  product: T,
  status: 0 | 1,
): T {
  return { ...product, status };
}

export function toAdminProductListPatch(
  product: AdminProductDetail | AdminProductListItem,
): Partial<AdminProductListItem> {
  const patch: Partial<AdminProductListItem> = {
    productStatus: product.productStatus,
    status: product.status,
    productName: product.productName,
    productType: product.productType,
    finalPrice: product.finalPrice,
    variations: product.variations,
    Category: product.Category,
  };

  if (isPopulatedProductSellerRef(product.seller)) {
    patch.seller = product.seller;
  }

  return patch;
}

export function getAdminProductVisibilityLabel(status?: number): 'Active' | 'Inactive' | 'Unknown' {
  if (status === 1) {
    return 'Active';
  }

  if (status === 0) {
    return 'Inactive';
  }

  return 'Unknown';
}

export function isAdminProductActive(status?: number): boolean {
  return status === 1;
}
