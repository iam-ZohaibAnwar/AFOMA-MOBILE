import type { OrderSummary } from '../../../services/types/order';

const sessionPatches = new Map<string, Partial<OrderSummary>>();

export function setCustomerOrderSessionPatch(
  orderId: string,
  patch: Partial<OrderSummary>,
): void {
  sessionPatches.set(orderId, {
    ...sessionPatches.get(orderId),
    ...patch,
  });
}

export function applyCustomerOrderSessionPatch<T extends OrderSummary>(
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

export function peekCustomerOrderSessionPatches(): Map<string, Partial<OrderSummary>> {
  return new Map(sessionPatches);
}
