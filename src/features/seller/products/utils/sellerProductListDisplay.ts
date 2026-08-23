import type { Product } from '../../../../services/types/product';

export type SellerInventoryStatusFilter = '' | 'Active' | 'Inactive';

export type SellerApprovalStatusFilter =
  | ''
  | 'Approved'
  | 'Pending'
  | 'Review'
  | 'Disapproved'
  | 'Draft';

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
  if (product.productType === 'Customizable') {
    const price = product.variations?.[0]?.price;
    if (price == null) {
      return '—';
    }

    const value = Number(price);
    return Number.isFinite(value) ? `CA$${value.toFixed(2)}` : '—';
  }

  if (product.finalPrice != null) {
    const value = Number(product.finalPrice);
    return Number.isFinite(value) ? `CA$${value.toFixed(2)}` : '—';
  }

  return '—';
}

export function formatSellerApprovalStatus(productStatus?: string): string {
  if (productStatus === 'Review') {
    return 'In Review';
  }

  return productStatus?.trim() || '—';
}

export function formatSellerInventoryStatus(status?: number): string {
  if (status === 1) {
    return 'Active';
  }

  if (status === 0) {
    return 'Inactive';
  }

  return '—';
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
  return product.Category?.name?.trim() || undefined;
}
