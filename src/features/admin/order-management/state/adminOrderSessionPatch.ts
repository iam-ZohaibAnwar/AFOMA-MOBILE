import type { AdminOrderListItem } from '../types/adminOrderManagement';

const sessionPatches = new Map<string, Partial<AdminOrderListItem>>();

export function setAdminOrderSessionPatch(
  orderId: string,
  patch: Partial<AdminOrderListItem>,
): void {
  sessionPatches.set(orderId, {
    ...sessionPatches.get(orderId),
    ...patch,
  });
}

export function applyAdminOrderSessionPatch<T extends AdminOrderListItem>(
  order: T | null | undefined,
): T | null | undefined {
  if (!order?._id) {
    return order;
  }

  const patch = sessionPatches.get(order._id);
  if (!patch) {
    return order;
  }

  return { ...order, ...patch };
}

export function peekAdminOrderSessionPatches(): Map<string, Partial<AdminOrderListItem>> {
  return new Map(sessionPatches);
}

export function clearAdminOrderSessionPatch(orderId: string): void {
  sessionPatches.delete(orderId);
}
