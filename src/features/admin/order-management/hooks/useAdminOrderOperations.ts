import { useCallback, useState } from 'react';

import { getErrorMessage } from '../../../../services/api/errors';
import {
  cancelAdminOrderShipment,
  getAdminOrderById,
  updateAdminOrderLineShippingStatus,
  updateAdminOrderStatus,
} from '../api/adminOrderManagementApi';
import type { AdminOrderDetail } from '../types/adminOrderManagement';
import type {
  AdminLineFulfillmentMutationValue,
  AdminOrderStatusMutationValue,
} from '../types/adminOrderOperations';
import { setAdminOrderSessionPatch } from '../state/adminOrderSessionPatch';
import {
  patchAdminOrderLineShippingStatus,
  patchAdminOrderStatus,
  toAdminOrderListPatch,
} from '../utils/adminOrderOperations';

export function useAdminOrderOperations(
  orderId: string | undefined,
  onOrderUpdated: (order: AdminOrderDetail) => void,
) {
  const [isUpdatingOrderStatus, setIsUpdatingOrderStatus] = useState(false);
  const [updatingProductId, setUpdatingProductId] = useState<string | null>(null);
  const [isCancellingShipment, setIsCancellingShipment] = useState(false);
  const [operationError, setOperationError] = useState<string | null>(null);

  const clearOperationError = useCallback(() => {
    setOperationError(null);
  }, []);

  const commitOrderUpdate = useCallback(
    (updatedOrder: AdminOrderDetail) => {
      if (!orderId) {
        return;
      }

      setAdminOrderSessionPatch(orderId, toAdminOrderListPatch(updatedOrder));
      onOrderUpdated(updatedOrder);
    },
    [onOrderUpdated, orderId],
  );

  const refreshOrderFromServer = useCallback(async (): Promise<AdminOrderDetail | null> => {
    if (!orderId) {
      return null;
    }

    try {
      const refreshed = await getAdminOrderById(orderId);
      commitOrderUpdate(refreshed);
      return refreshed;
    } catch {
      return null;
    }
  }, [commitOrderUpdate, orderId]);

  const changeOrderStatus = useCallback(
    async (order: AdminOrderDetail, status: AdminOrderStatusMutationValue | string) => {
      if (!orderId || !order._id || order.status === status) {
        return false;
      }

      setIsUpdatingOrderStatus(true);
      setOperationError(null);

      try {
        await updateAdminOrderStatus(orderId, status);
        const patched = patchAdminOrderStatus(order, status);
        commitOrderUpdate(patched);
        void refreshOrderFromServer();
        return true;
      } catch (err) {
        setOperationError(getErrorMessage(err, 'Failed to update order status'));
        return false;
      } finally {
        setIsUpdatingOrderStatus(false);
      }
    },
    [commitOrderUpdate, orderId, refreshOrderFromServer],
  );

  const changeLineFulfillmentStatus = useCallback(
    async (
      order: AdminOrderDetail,
      productId: string,
      shippingStatus: AdminLineFulfillmentMutationValue | string,
    ) => {
      if (!orderId) {
        return false;
      }

      const currentLine = order.cart?.find((line) => line.productData?._id === productId);
      if (currentLine?.productData?.shippingStatus === shippingStatus) {
        return false;
      }

      setUpdatingProductId(productId);
      setOperationError(null);

      try {
        await updateAdminOrderLineShippingStatus(orderId, productId, shippingStatus);
        const patched = patchAdminOrderLineShippingStatus(order, productId, shippingStatus);
        commitOrderUpdate(patched);
        void refreshOrderFromServer();
        return true;
      } catch (err) {
        setOperationError(getErrorMessage(err, 'Failed to update fulfillment status'));
        return false;
      } finally {
        setUpdatingProductId(null);
      }
    },
    [commitOrderUpdate, orderId, refreshOrderFromServer],
  );

  const cancelShipment = useCallback(
    async (order: AdminOrderDetail) => {
      if (!orderId) {
        return false;
      }

      setIsCancellingShipment(true);
      setOperationError(null);

      try {
        await cancelAdminOrderShipment(orderId);
        const refreshed = await refreshOrderFromServer();
        if (!refreshed) {
          const patched = patchAdminOrderStatus(order, 'Cancelled');
          commitOrderUpdate(patched);
        }
        return true;
      } catch (err) {
        setOperationError(getErrorMessage(err, 'Failed to cancel shipment'));
        return false;
      } finally {
        setIsCancellingShipment(false);
      }
    },
    [commitOrderUpdate, orderId, refreshOrderFromServer],
  );

  return {
    isUpdatingOrderStatus,
    updatingProductId,
    isCancellingShipment,
    operationError,
    clearOperationError,
    changeOrderStatus,
    changeLineFulfillmentStatus,
    cancelShipment,
  };
}
