import { colors } from '../../../design-system';
import type { Product } from '../../../services/types/product';
import { formatCadAmount } from '../../../utils/currencyFormat';

export function formatProductListPrice(product: Product): string {
  if (product.productType === 'Customizable') {
    const price = product.variations?.[0]?.price;
    return formatCadAmount(price);
  }

  if (product.finalPrice != null) {
    return formatCadAmount(product.finalPrice);
  }

  return '—';
}

export function formatProductApprovalStatus(productStatus?: string): string {
  if (productStatus === 'Review') {
    return 'In Review';
  }

  return productStatus?.trim() || '—';
}

export function formatProductInventoryStatus(status?: number): string {
  if (status === 1) {
    return 'Active';
  }

  if (status === 0) {
    return 'Inactive';
  }

  return '—';
}

export function getProductListCategoryLabel(product: Product): string | undefined {
  return product.Category?.name?.trim() || undefined;
}

export function formatProductListStockLabel(product: Product): string | null {
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

export function isProductListDimmed(product: Product): boolean {
  return product.status === 0 || product.productStatus === 'Disapproved';
}

export function resolveProductListAccentColor(product: Product): string {
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

export interface ProductListStatusChip {
  id: string;
  label: string;
  icon: string;
  tone: 'success' | 'info' | 'warning' | 'danger' | 'neutral';
}

/** One primary lifecycle chip + optional stock chip — avoids duplicate approval/visibility badges. */
export function resolveProductListStatusChips(product: Product): ProductListStatusChip[] {
  const chips: ProductListStatusChip[] = [];
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

  const stockLabel = formatProductListStockLabel(product);
  if (stockLabel && !isProductListDimmed(product)) {
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
