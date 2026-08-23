import type { AdminProductListItem } from '../types/adminProductManagement';

const sessionPatches = new Map<string, Partial<AdminProductListItem>>();

export function setAdminProductSessionPatch(
  productId: string,
  patch: Partial<AdminProductListItem>,
): void {
  sessionPatches.set(productId, {
    ...sessionPatches.get(productId),
    ...patch,
  });
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

  return { ...product, ...patch };
}

export function peekAdminProductSessionPatches(): Map<string, Partial<AdminProductListItem>> {
  return new Map(sessionPatches);
}

export function clearAdminProductSessionPatch(productId: string): void {
  sessionPatches.delete(productId);
}
