import { useCallback, useEffect, useState } from 'react';

import { ApiError } from '../../../services/api/errors';
import { getErrorMessage } from '../../../services/api/errors';
import { getOrderById } from '../../../services/api/ordersApi';
import type { OrderDetail } from '../../../services/types/order';

export function useOrderDetail(orderId: string) {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNotFound, setIsNotFound] = useState(false);

  const loadOrder = useCallback(async () => {
    if (!orderId) {
      setOrder(null);
      setError('Order ID is missing.');
      setIsNotFound(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsNotFound(false);

    try {
      const response = await getOrderById(orderId);
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
  }, [orderId]);

  useEffect(() => {
    void loadOrder();
  }, [loadOrder]);

  return {
    order,
    isLoading,
    error,
    isNotFound,
    retry: loadOrder,
  };
}
