import type { Product } from '../../../../services/types/product';
import {
  ADMIN_LOW_STOCK_THRESHOLD,
  type AdminProductStockAlertFilter,
} from '../types/adminProductManagement';

function isOutOfStockInventory(inventory?: string | null): boolean {
  const normalized = inventory?.trim().toLowerCase() ?? '';
  return normalized === 'outoffstock' || normalized === 'out of stock';
}

function isInStockInventory(inventory?: string | null): boolean {
  const normalized = inventory?.trim().toLowerCase() ?? '';
  return normalized === 'instock' || normalized === 'in stock';
}

export function matchesAdminProductStockAlert(
  product: Product,
  filter: Exclude<AdminProductStockAlertFilter, ''>,
): boolean {
  if (filter === 'outOfStock') {
    return isOutOfStockInventory(product.inventory);
  }

  const quantity = Number(product.quantity);
  return (
    isInStockInventory(product.inventory) &&
    Number.isFinite(quantity) &&
    quantity > 0 &&
    quantity < ADMIN_LOW_STOCK_THRESHOLD
  );
}

export function filterAdminProductsByStockAlert<T extends Product>(
  products: T[],
  filter: AdminProductStockAlertFilter,
): T[] {
  if (!filter) {
    return products;
  }

  return products.filter((product) => matchesAdminProductStockAlert(product, filter));
}
