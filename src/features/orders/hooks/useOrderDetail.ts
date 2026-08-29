import { useCallback, useEffect, useRef, useState } from 'react';

import { ApiError } from '../../../services/api/errors';
import { getErrorMessage } from '../../../services/api/errors';
import { getOrderById } from '../../../services/api/ordersApi';
import type { OrderDetail, OrderSummary } from '../../../services/types/order';
import {
  applyCustomerOrderSessionPatch,
  setCustomerOrderSessionPatch,
} from '../state/customerOrderSessionPatch';

export function useOrderDetail(orderId: string, initialOrder?: OrderSummary) {
  const [order, setOrder] = useState<OrderDetail | null>(
    applyCustomerOrderSessionPatch(initialOrder ?? null) ?? null,
  );
  const [isLoading, setIsLoading] = useState(Boolean(orderId) && !initialOrder);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isNotFound, setIsNotFound] = useState(false);

  const requestVersionRef = useRef(0);
  const hasCachedOrderRef = useRef(Boolean(initialOrder));

  useEffect(() => {
    hasCachedOrderRef.current = Boolean(initialOrder);
    if (initialOrder) {
      setOrder(applyCustomerOrderSessionPatch(initialOrder) ?? initialOrder);
    } else {
      setOrder(null);
    }
    setError(null);
    setIsNotFound(false);
    setIsLoading(Boolean(orderId) && !initialOrder);
  }, [initialOrder, orderId]);

  const loadOrder = useCallback(
    async (mode: 'initial' | 'refresh') => {
      if (!orderId) {
        setOrder(null);
        setError('Order ID is missing.');
        setIsNotFound(false);
        setIsLoading(false);
        return;
      }

      const requestVersion = requestVersionRef.current + 1;
      requestVersionRef.current = requestVersion;

      if (mode === 'refresh') {
        setIsRefreshing(true);
      } else if (!hasCachedOrderRef.current) {
        setIsLoading(true);
      }

      setError(null);
      setIsNotFound(false);

      try {
        const response = await getOrderById(orderId);

        if (requestVersion !== requestVersionRef.current) {
          return;
        }

        const merged = applyCustomerOrderSessionPatch(response) ?? response;
        setOrder(merged);
        hasCachedOrderRef.current = true;
      } catch (err) {
        if (requestVersion !== requestVersionRef.current) {
          return;
        }

        const notFound = err instanceof ApiError && err.statusCode === 404;
        setIsNotFound(notFound);

        if (!hasCachedOrderRef.current) {
          setOrder(null);
        }

        setError(
          notFound ? 'Order not found.' : getErrorMessage(err, 'Failed to load order'),
        );
      } finally {
        if (requestVersion === requestVersionRef.current) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    [orderId],
  );

  useEffect(() => {
    void loadOrder(hasCachedOrderRef.current ? 'refresh' : 'initial');
  }, [loadOrder]);

  const retry = useCallback(async () => {
    await loadOrder('refresh');
  }, [loadOrder]);

  const refresh = retry;

  const syncSessionPatch = useCallback(() => {
    setOrder((current) => applyCustomerOrderSessionPatch(current) ?? current);
  }, []);

  const applyOrderUpdate = useCallback(
    (updatedOrder: OrderDetail) => {
      if (!orderId) {
        return;
      }

      setCustomerOrderSessionPatch(orderId, {
        _id: updatedOrder._id,
        status: updatedOrder.status,
        createdAt: updatedOrder.createdAt,
        totalAmount: updatedOrder.totalAmount,
        subTotal: updatedOrder.subTotal,
        totalShippingRate: updatedOrder.totalShippingRate,
        currency: updatedOrder.currency,
        cart: updatedOrder.cart,
      });
      setOrder(updatedOrder);
    },
    [orderId],
  );

  return {
    order,
    isLoading,
    isRefreshing,
    error,
    isNotFound,
    retry,
    refresh,
    syncSessionPatch,
    applyOrderUpdate,
  };
}
