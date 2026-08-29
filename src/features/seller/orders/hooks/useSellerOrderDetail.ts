import { useCallback, useEffect, useRef, useState } from 'react';

import { ApiError } from '../../../../services/api/errors';
import { getErrorMessage } from '../../../../services/api/errors';
import { getSellerOrderDetail } from '../api/sellerOrdersApi';
import type { SellerOrderDetail, SellerOrderSummary } from '../types/sellerOrder';
import {
  applySellerOrderSessionPatch,
  setSellerOrderSessionPatch,
} from '../state/sellerOrderSessionPatch';

export function useSellerOrderDetail(
  sellerId: string | undefined,
  orderId: string | undefined,
  initialOrder?: SellerOrderSummary,
) {
  const [order, setOrder] = useState<SellerOrderDetail | null>(
    applySellerOrderSessionPatch(initialOrder ?? null) ?? null,
  );
  const [isLoading, setIsLoading] = useState(Boolean(sellerId && orderId) && !initialOrder);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isNotFound, setIsNotFound] = useState(false);

  const requestVersionRef = useRef(0);
  const hasCachedOrderRef = useRef(Boolean(initialOrder));

  useEffect(() => {
    hasCachedOrderRef.current = Boolean(initialOrder);
    if (initialOrder) {
      setOrder(applySellerOrderSessionPatch(initialOrder) ?? initialOrder);
    } else {
      setOrder(null);
    }
    setError(null);
    setIsNotFound(false);
    setIsLoading(Boolean(sellerId && orderId) && !initialOrder);
  }, [initialOrder, orderId, sellerId]);

  const loadOrder = useCallback(
    async (mode: 'initial' | 'refresh') => {
      if (!sellerId || !orderId) {
        setOrder(null);
        setError('Order unavailable.');
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
        const response = await getSellerOrderDetail(sellerId, orderId);

        if (requestVersion !== requestVersionRef.current) {
          return;
        }

        const merged = applySellerOrderSessionPatch(response) ?? response;
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
    [orderId, sellerId],
  );

  useEffect(() => {
    void loadOrder(hasCachedOrderRef.current ? 'refresh' : 'initial');
  }, [loadOrder]);

  const refresh = useCallback(async () => {
    await loadOrder('refresh');
  }, [loadOrder]);

  const syncSessionPatch = useCallback(() => {
    setOrder((current) => applySellerOrderSessionPatch(current) ?? current);
  }, []);

  const applyOrderUpdate = useCallback(
    (updatedOrder: SellerOrderDetail) => {
      if (!orderId) {
        return;
      }

      setSellerOrderSessionPatch(orderId, {
        _id: updatedOrder._id,
        status: updatedOrder.status,
        paymentStatus: updatedOrder.paymentStatus,
        createdAt: updatedOrder.createdAt,
        userInfo: updatedOrder.userInfo,
        cart: updatedOrder.filteredCart?.length
          ? updatedOrder.filteredCart
          : updatedOrder.cart,
        currency: updatedOrder.currency,
        conversionRate: updatedOrder.conversionRate,
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
    refresh,
    syncSessionPatch,
    applyOrderUpdate,
  };
}
