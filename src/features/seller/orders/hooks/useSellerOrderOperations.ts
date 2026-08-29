import { useCallback, useState } from 'react';

import { getErrorMessage } from '../../../../services/api/errors';
import { updateSellerOrderLineShippingStatus } from '../api/sellerOrdersApi';
import type { SellerLineFulfillmentStatus, SellerOrderDetail } from '../types/sellerOrder';
import { setSellerOrderSessionPatch } from '../state/sellerOrderSessionPatch';
import {
  patchSellerOrderLineShippingStatus,
  toSellerOrderListPatch,
} from '../utils/sellerOrderOperations';

export function useSellerOrderOperations(
  orderId: string | undefined,
  applyOrderUpdate: (order: SellerOrderDetail) => void,
  refresh: () => Promise<void>,
) {
  const [updatingProductId, setUpdatingProductId] = useState<string | null>(null);
  const [operationError, setOperationError] = useState<string | null>(null);

  const changeLineFulfillmentStatus = useCallback(
    async (order: SellerOrderDetail, productId: string, shippingStatus: SellerLineFulfillmentStatus) => {
      if (!orderId) {
        return false;
      }

      setUpdatingProductId(productId);
      setOperationError(null);

      try {
        await updateSellerOrderLineShippingStatus(orderId, productId, shippingStatus);
        const patched = patchSellerOrderLineShippingStatus(order, productId, shippingStatus);

        if (patched._id) {
          setSellerOrderSessionPatch(patched._id, toSellerOrderListPatch(patched));
        }

        applyOrderUpdate(patched);
        await refresh();
        return true;
      } catch (err) {
        setOperationError(getErrorMessage(err, 'Failed to update fulfillment status'));
        return false;
      } finally {
        setUpdatingProductId(null);
      }
    },
    [applyOrderUpdate, orderId, refresh],
  );

  return {
    updatingProductId,
    operationError,
    clearOperationError: () => setOperationError(null),
    changeLineFulfillmentStatus,
  };
}
