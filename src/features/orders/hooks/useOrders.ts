import { useCallback, useEffect, useState } from 'react';

import { getErrorMessage } from '../../../services/api/errors';
import { getOrdersByUserId } from '../../../services/api/ordersApi';
import type { OrderSummary } from '../../../services/types/order';

export const ORDERS_PAGE_SIZE = 10;

export function useOrders(userId?: string) {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [isInitialLoading, setIsInitialLoading] = useState(Boolean(userId));
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = useCallback(
    async (page: number, options?: { showPageLoader?: boolean }) => {
      if (!userId) {
        setOrders([]);
        setTotalOrders(0);
        setTotalPages(1);
        setCurrentPage(1);
        setError(null);
        setIsInitialLoading(false);
        setIsPageLoading(false);
        return;
      }

      const showPageLoader = options?.showPageLoader ?? page > 1;

      if (showPageLoader) {
        setIsPageLoading(true);
      } else {
        setIsInitialLoading(true);
      }

      setError(null);

      try {
        const response = await getOrdersByUserId(userId, {
          page,
          limit: ORDERS_PAGE_SIZE,
        });
        const nextOrders = Array.isArray(response.orders) ? response.orders : [];
        const nextTotalOrders = response.totalOrders ?? nextOrders.length;
        const nextTotalPages = Math.max(
          1,
          response.totalPages ?? Math.ceil(nextTotalOrders / ORDERS_PAGE_SIZE),
        );

        setOrders(nextOrders);
        setTotalOrders(nextTotalOrders);
        setTotalPages(nextTotalPages);
        setCurrentPage(Math.min(page, nextTotalPages));
      } catch (err) {
        setOrders([]);
        setTotalOrders(0);
        setTotalPages(1);
        setError(getErrorMessage(err, 'Failed to load orders'));
      } finally {
        setIsInitialLoading(false);
        setIsPageLoading(false);
      }
    },
    [userId],
  );

  useEffect(() => {
    setCurrentPage(1);
    void loadOrders(1);
  }, [loadOrders]);

  const goToPreviousPage = useCallback(() => {
    if (currentPage <= 1 || isPageLoading) {
      return;
    }

    const nextPage = currentPage - 1;
    setCurrentPage(nextPage);
    void loadOrders(nextPage, { showPageLoader: true });
  }, [currentPage, isPageLoading, loadOrders]);

  const goToNextPage = useCallback(() => {
    if (currentPage >= totalPages || isPageLoading) {
      return;
    }

    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    void loadOrders(nextPage, { showPageLoader: true });
  }, [currentPage, isPageLoading, loadOrders, totalPages]);

  const retry = useCallback(() => {
    void loadOrders(currentPage);
  }, [currentPage, loadOrders]);

  return {
    orders,
    totalOrders,
    totalPages,
    currentPage,
    isLoading: isInitialLoading,
    isPageLoading,
    error,
    retry,
    goToPreviousPage,
    goToNextPage,
    canGoPrevious: currentPage > 1 && !isPageLoading,
    canGoNext: currentPage < totalPages && !isPageLoading,
  };
}
