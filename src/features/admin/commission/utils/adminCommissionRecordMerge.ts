import type { AdminCommissionOrderRef, AdminCommissionRecord } from '../types/adminCommission';

function isPopulatedOrderRef(orderId: unknown): orderId is AdminCommissionOrderRef {
  return typeof orderId === 'object' && orderId !== null;
}

function hasCartItems(cart: unknown): boolean {
  if (Array.isArray(cart)) {
    return cart.length > 0;
  }

  if (cart && typeof cart === 'object') {
    return Object.keys(cart as Record<string, unknown>).length > 0;
  }

  return false;
}

/**
 * Preserve populated list `orderId.cart` when mutation/GET-by-id returns sparse order refs.
 * Server response is authoritative for scalar fields; nested list population is retained.
 */
export function mergeAdminCommissionRecord(
  existing: AdminCommissionRecord,
  incoming: AdminCommissionRecord,
): AdminCommissionRecord {
  const existingOrder = existing.orderId;
  const incomingOrder = incoming.orderId;

  let mergedOrderId: AdminCommissionRecord['orderId'] = existingOrder;

  if (isPopulatedOrderRef(incomingOrder)) {
    if (isPopulatedOrderRef(existingOrder)) {
      const preserveCart = !hasCartItems(incomingOrder.cart) && hasCartItems(existingOrder.cart);

      mergedOrderId = {
        ...existingOrder,
        ...incomingOrder,
        cart: preserveCart ? existingOrder.cart : incomingOrder.cart ?? existingOrder.cart,
      };
    } else {
      mergedOrderId = incomingOrder;
    }
  } else if (typeof incomingOrder === 'string' && isPopulatedOrderRef(existingOrder)) {
    mergedOrderId = existingOrder;
  } else if (typeof incomingOrder === 'string') {
    mergedOrderId = incomingOrder;
  }

  return {
    ...existing,
    ...incoming,
    orderId: mergedOrderId,
    seller: incoming.seller ?? existing.seller,
    userId: incoming.userId ?? existing.userId,
  };
}

export function replaceAdminCommissionInPage(
  records: AdminCommissionRecord[],
  updated: AdminCommissionRecord,
): AdminCommissionRecord[] {
  const index = records.findIndex((record) => record._id === updated._id);
  if (index === -1) {
    return records;
  }

  const next = [...records];
  next[index] = mergeAdminCommissionRecord(records[index], updated);
  return next;
}

function resolveOrderIdString(orderId: AdminCommissionRecord['orderId']): string | undefined {
  if (typeof orderId === 'string') {
    return orderId;
  }

  return orderId?._id;
}

export function getRawOrderId(record: AdminCommissionRecord): string | undefined {
  return resolveOrderIdString(record.orderId);
}
