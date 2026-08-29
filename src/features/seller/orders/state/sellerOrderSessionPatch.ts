import type { SellerOrderSummary } from '../types/sellerOrder';

const sessionPatches = new Map<string, Partial<SellerOrderSummary>>();

export function setSellerOrderSessionPatch(
  orderId: string,
  patch: Partial<SellerOrderSummary>,
): void {
  sessionPatches.set(orderId, {
    ...sessionPatches.get(orderId),
    ...patch,
  });
}

export function applySellerOrderSessionPatch<T extends SellerOrderSummary>(
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

export function peekSellerOrderSessionPatches(): Map<string, Partial<SellerOrderSummary>> {
  return new Map(sessionPatches);
}

export function clearSellerOrderSessionPatch(orderId: string): void {
  sessionPatches.delete(orderId);
}
