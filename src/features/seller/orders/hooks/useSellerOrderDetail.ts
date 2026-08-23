import { useCallback, useEffect, useState } from 'react';

import { ApiError } from '../../../../services/api/errors';
import { getErrorMessage } from '../../../../services/api/errors';
import {
  getSellerOrderDetail,
  updateSellerOrderLineShippingStatus,
} from '../api/sellerOrdersApi';
import type { SellerLineFulfillmentStatus, SellerOrderDetail } from '../types/sellerOrder';

export function useSellerOrderDetail(sellerId?: string, orderId?: string) {
  const [order, setOrder] = useState<SellerOrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(sellerId && orderId));
  const [error, setError] = useState<string | null>(null);
  const [isNotFound, setIsNotFound] = useState(false);
  const [updatingProductId, setUpdatingProductId] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const loadOrder = useCallback(async () => {
    if (!sellerId || !orderId) {
      setOrder(null);
      setError('Order unavailable.');
      setIsNotFound(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsNotFound(false);

    try {
      const response = await getSellerOrderDetail(sellerId, orderId);
      setOrder(response);
    } catch (err) {
      setOrder(null);
      setIsNotFound(err instanceof ApiError && err.statusCode === 404);
      setError(
        err instanceof ApiError && err.statusCode === 404
          ? 'Order not found.'
          : getErrorMessage(err, 'Failed to load order'),
      );
    } finally {
      setIsLoading(false);
    }
  }, [orderId, sellerId]);

  useEffect(() => {
    void loadOrder();
  }, [loadOrder]);

  const updateLineFulfillmentStatus = useCallback(
    async (productId: string, shippingStatus: SellerLineFulfillmentStatus) => {
      if (!orderId) {
        return false;
      }

      setUpdatingProductId(productId);
      setUpdateError(null);

      try {
        await updateSellerOrderLineShippingStatus(orderId, productId, shippingStatus);
        await loadOrder();
        return true;
      } catch (err) {
        setUpdateError(getErrorMessage(err, 'Failed to update fulfillment status'));
        return false;
      } finally {
        setUpdatingProductId(null);
      }
    },
    [loadOrder, orderId],
  );

  return {
    order,
    isLoading,
    error,
    isNotFound,
    updatingProductId,
    updateError,
    clearUpdateError: () => setUpdateError(null),
    refresh: loadOrder,
    updateLineFulfillmentStatus,
  };
}
