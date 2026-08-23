import { useLayoutEffect, useRef } from 'react';

import { consumeAdminProductAiPrefill } from '../state/adminProductAiPrefill';
import type { AdminProductAiListingType, AdminProductAiPrefill } from '../types/adminProductAiPrefill';

export function useAdminProductAiPrefillEffect(
  productType: AdminProductAiListingType,
  productId: string | undefined,
  applyPrefill: (prefill: AdminProductAiPrefill) => void,
) {
  const appliedRef = useRef(false);

  useLayoutEffect(() => {
    if (productId || appliedRef.current) {
      return;
    }

    const prefill = consumeAdminProductAiPrefill(productType);
    if (!prefill) {
      return;
    }

    appliedRef.current = true;
    applyPrefill(prefill);
  }, [applyPrefill, productId, productType]);
}
