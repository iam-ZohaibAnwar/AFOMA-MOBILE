import { useCallback, useEffect, useState } from 'react';

import { getErrorMessage } from '../../../services/api/errors';
import { getOrdersByUserId } from '../../../services/api/ordersApi';
import type { OrderSummary } from '../../../services/types/order';

export function useOrders(userId?: string) {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [isLoading, setIsLoading] = useState(Boolean(userId));
  const [error, setError] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    if (!userId) {
      setOrders([]);
      setTotalOrders(0);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await getOrdersByUserId(userId);
      setOrders(Array.isArray(response.orders) ? response.orders : []);
      setTotalOrders(response.totalOrders ?? response.orders?.length ?? 0);
    } catch (err) {
      setOrders([]);
      setTotalOrders(0);
      setError(getErrorMessage(err, 'Failed to load orders'));
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  return {
    orders,
    totalOrders,
    isLoading,
    error,
    retry: loadOrders,
  };
}
