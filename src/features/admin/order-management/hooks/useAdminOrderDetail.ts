import { useCallback, useEffect, useRef, useState } from 'react';

import { ApiError } from '../../../../services/api/errors';
import { getErrorMessage } from '../../../../services/api/errors';
import { getAdminOrderById } from '../api/adminOrderManagementApi';
import type { AdminOrderDetail, AdminOrderListItem } from '../types/adminOrderManagement';
import {
  applyAdminOrderSessionPatch,
  setAdminOrderSessionPatch,
} from '../state/adminOrderSessionPatch';

export function useAdminOrderDetail(
  orderId: string | undefined,
  initialOrder?: AdminOrderListItem,
) {
  const [order, setOrder] = useState<AdminOrderDetail | null>(
    applyAdminOrderSessionPatch(initialOrder ?? null) ?? null,
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
      setOrder(applyAdminOrderSessionPatch(initialOrder) ?? initialOrder);
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
        setError(null);
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
        const response = await getAdminOrderById(orderId);

        if (requestVersion !== requestVersionRef.current) {
          return;
        }

        const merged = applyAdminOrderSessionPatch(response) ?? response;
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

  const refresh = useCallback(async () => {
    await loadOrder('refresh');
  }, [loadOrder]);

  const syncSessionPatch = useCallback(() => {
    setOrder((current) => applyAdminOrderSessionPatch(current) ?? current);
  }, []);

  const applyOrderUpdate = useCallback(
    (updatedOrder: AdminOrderDetail) => {
      if (!orderId) {
        return;
      }

      setAdminOrderSessionPatch(orderId, updatedOrder);
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
    refresh,
    syncSessionPatch,
    applyOrderUpdate,
  };
}
