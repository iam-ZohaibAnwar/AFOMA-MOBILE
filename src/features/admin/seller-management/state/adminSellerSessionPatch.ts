import type { AdminSellerListItem } from '../types/adminSellerManagement';

const sessionPatches = new Map<string, Partial<AdminSellerListItem>>();

export function setAdminSellerSessionPatch(
  sellerId: string,
  patch: Partial<AdminSellerListItem>,
): void {
  sessionPatches.set(sellerId, {
    ...sessionPatches.get(sellerId),
    ...patch,
  });
}

export function applyAdminSellerSessionPatch<T extends AdminSellerListItem>(
  seller: T | null | undefined,
): T | null | undefined {
  if (!seller?._id) {
    return seller;
  }

  const patch = sessionPatches.get(seller._id);
  if (!patch) {
    return seller;
  }

  return { ...seller, ...patch };
}

export function consumeAdminSellerSessionPatches(): Map<string, Partial<AdminSellerListItem>> {
  const snapshot = new Map(sessionPatches);
  sessionPatches.clear();
  return snapshot;
}

export function peekAdminSellerSessionPatches(): Map<string, Partial<AdminSellerListItem>> {
  return new Map(sessionPatches);
}

export function clearAdminSellerSessionPatch(sellerId: string): void {
  sessionPatches.delete(sellerId);
}
