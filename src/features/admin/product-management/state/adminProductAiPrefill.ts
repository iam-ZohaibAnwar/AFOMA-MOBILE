import type { AdminProductAiPrefill } from '../types/adminProductAiPrefill';

let pendingPrefill: AdminProductAiPrefill | null = null;

export function stashAdminProductAiPrefill(prefill: AdminProductAiPrefill): void {
  pendingPrefill = prefill;
}

export function consumeAdminProductAiPrefill(
  productType: AdminProductAiPrefill['productType'],
): AdminProductAiPrefill | null {
  if (!pendingPrefill || pendingPrefill.productType !== productType) {
    return null;
  }

  const next = pendingPrefill;
  pendingPrefill = null;
  return next;
}

export function clearAdminProductAiPrefill(): void {
  pendingPrefill = null;
}

export function peekAdminProductAiPrefill(): AdminProductAiPrefill | null {
  return pendingPrefill;
}
