import type { AdminProductListItem } from '../types/adminProductManagement';
import { isPopulatedProductSellerRef } from '../../../products/utils/productDisplay';

const sessionPatches = new Map<string, Partial<AdminProductListItem>>();

function mergeAdminProductListPatchFields(
  product: AdminProductListItem,
  patch: Partial<AdminProductListItem>,
): AdminProductListItem {
  const merged = { ...product, ...patch };

  if (patch.seller !== undefined && !isPopulatedProductSellerRef(patch.seller)) {
    merged.seller = product.seller;
  }

  return merged;
}

export function setAdminProductSessionPatch(
  productId: string,
  patch: Partial<AdminProductListItem>,
): void {
  const existing = sessionPatches.get(productId);
  const nextPatch: Partial<AdminProductListItem> = {
    ...existing,
    ...patch,
  };

  if (patch.seller !== undefined && !isPopulatedProductSellerRef(patch.seller)) {
    if (existing?.seller && isPopulatedProductSellerRef(existing.seller)) {
      nextPatch.seller = existing.seller;
    } else {
      delete nextPatch.seller;
    }
  }

  sessionPatches.set(productId, nextPatch);
}

export function applyAdminProductSessionPatch<T extends AdminProductListItem>(
  product: T | null | undefined,
): T | null | undefined {
  if (!product?._id) {
    return product;
  }

  const patch = sessionPatches.get(product._id);
  if (!patch) {
    return product;
  }

  return mergeAdminProductListPatchFields(product, patch) as T;
}

export function peekAdminProductSessionPatches(): Map<string, Partial<AdminProductListItem>> {
  return new Map(sessionPatches);
}

export function clearAdminProductSessionPatch(productId: string): void {
  sessionPatches.delete(productId);
}
