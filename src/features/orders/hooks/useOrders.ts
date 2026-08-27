import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  buildOrdersListCacheKey,
  getOrdersListCache,
  setOrdersListCache,
  type OrdersListCacheEntry,
} from '../../../services/cache/screenCache';
import { getErrorMessage } from '../../../services/api/errors';
import { getOrdersByUserId } from '../../../services/api/ordersApi';
import type { OrderSummary } from '../../../services/types/order';
import { getOrderListPreviewDebug } from '../utils/orderListDisplay';

export const ORDERS_PAGE_SIZE = 10;

type LoadMode = 'initial' | 'page' | 'retry';

interface LoadOrdersOptions {
  revertPageOnError?: number;
  /** In-memory snapshot when leaving a page without a cache entry for the target page. */
  fallbackSnapshot?: OrdersListCacheEntry;
}

function hydrateOrdersState(userId?: string) {
  if (!userId) {
    return {
      orders: [] as OrderSummary[],
      totalOrders: 0,
      totalPages: 1,
      currentPage: 1,
      hasLoadedOnce: false,
      isRefreshing: false,
    };
  }

  const cached = getOrdersListCache(buildOrdersListCacheKey(userId, 1));
  if (!cached) {
    return {
      orders: [] as OrderSummary[],
      totalOrders: 0,
      totalPages: 1,
      currentPage: 1,
      hasLoadedOnce: false,
      isRefreshing: true,
    };
  }

  return {
    orders: cached.orders,
    totalOrders: cached.totalOrders,
    totalPages: cached.totalPages,
    currentPage: cached.currentPage,
    hasLoadedOnce: true,
    isRefreshing: true,
  };
}

function applyCacheEntry(entry: OrdersListCacheEntry) {
  return {
    orders: entry.orders,
    totalOrders: entry.totalOrders,
    totalPages: entry.totalPages,
    currentPage: entry.currentPage,
  };
}

export function useOrders(userId?: string) {
  const initialState = useMemo(() => hydrateOrdersState(userId), [userId]);
  const requestVersionRef = useRef(0);

  const [orders, setOrders] = useState<OrderSummary[]>(initialState.orders);
  const [totalOrders, setTotalOrders] = useState(initialState.totalOrders);
  const [totalPages, setTotalPages] = useState(initialState.totalPages);
  const [currentPage, setCurrentPage] = useState(initialState.currentPage);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(initialState.hasLoadedOnce);
  const [isRefreshing, setIsRefreshing] = useState(initialState.isRefreshing);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = useCallback(
    async (page: number, mode: LoadMode, options?: LoadOrdersOptions) => {
      if (!userId) {
        setOrders([]);
        setTotalOrders(0);
        setTotalPages(1);
        setCurrentPage(1);
        setHasLoadedOnce(false);
        setError(null);
        setIsRefreshing(false);
        setIsPageLoading(false);
        return;
      }

      const cacheKey = buildOrdersListCacheKey(userId, page);
      const cachedEntry = getOrdersListCache(cacheKey);
      const requestVersion = requestVersionRef.current + 1;
      requestVersionRef.current = requestVersion;

      if (mode === 'page') {
        setIsPageLoading(true);
        setCurrentPage(page);
        if (cachedEntry) {
          const next = applyCacheEntry(cachedEntry);
          setOrders(next.orders);
          setTotalOrders(next.totalOrders);
          setTotalPages(next.totalPages);
          setCurrentPage(next.currentPage);
          setHasLoadedOnce(true);
        } else {
          setOrders([]);
        }
      } else if (cachedEntry) {
        const next = applyCacheEntry(cachedEntry);
        setOrders(next.orders);
        setTotalOrders(next.totalOrders);
        setTotalPages(next.totalPages);
        setCurrentPage(next.currentPage);
        setHasLoadedOnce(true);
        setIsRefreshing(true);
      } else {
        setIsRefreshing(true);
      }

      setError(null);

      try {
        const response = await getOrdersByUserId(userId, {
          page,
          limit: ORDERS_PAGE_SIZE,
        });

        if (requestVersion !== requestVersionRef.current) {
          return;
        }

        const nextOrders = Array.isArray(response.orders) ? response.orders : [];
        const nextTotalOrders = response.totalOrders ?? nextOrders.length;
        const nextTotalPages = Math.max(
          1,
          response.totalPages ?? Math.ceil(nextTotalOrders / ORDERS_PAGE_SIZE),
        );
        const resolvedPage = Math.min(page, nextTotalPages);
        const entry = {
          orders: nextOrders,
          totalOrders: nextTotalOrders,
          totalPages: nextTotalPages,
          currentPage: resolvedPage,
        };

        setOrdersListCache(buildOrdersListCacheKey(userId, resolvedPage), entry);
        setOrders(nextOrders);
        setTotalOrders(nextTotalOrders);
        setTotalPages(nextTotalPages);
        setCurrentPage(resolvedPage);
        setHasLoadedOnce(true);
        setError(null);

        if (__DEV__ && nextOrders[0]) {
          console.log('[useOrders] list preview path', {
            userId,
            page: resolvedPage,
            orderCount: nextOrders.length,
            sample: getOrderListPreviewDebug(nextOrders[0]),
          });
        }
      } catch (err) {
        if (requestVersion !== requestVersionRef.current) {
          return;
        }

        const message = getErrorMessage(err, 'Failed to load orders');

        if (mode === 'page') {
          if (cachedEntry) {
            const next = applyCacheEntry(cachedEntry);
            setOrders(next.orders);
            setTotalOrders(next.totalOrders);
            setTotalPages(next.totalPages);
            setCurrentPage(next.currentPage);
            setHasLoadedOnce(true);
          } else if (options?.revertPageOnError != null) {
            const revertPage = options.revertPageOnError;
            setCurrentPage(revertPage);

            const cachedPrevious = getOrdersListCache(
              buildOrdersListCacheKey(userId, revertPage),
            );
            const restoreEntry =
              cachedPrevious ??
              (options.fallbackSnapshot?.currentPage === revertPage
                ? options.fallbackSnapshot
                : undefined);

            if (restoreEntry) {
              const next = applyCacheEntry(restoreEntry);
              setOrders(next.orders);
              setTotalOrders(next.totalOrders);
              setTotalPages(next.totalPages);
              setCurrentPage(next.currentPage);
              setHasLoadedOnce(true);
            }
          }

          setError(message);
          return;
        }

        const fallbackEntry = cachedEntry ?? getOrdersListCache(cacheKey);
        if (fallbackEntry?.orders.length) {
          const next = applyCacheEntry(fallbackEntry);
          setOrders(next.orders);
          setTotalOrders(next.totalOrders);
          setTotalPages(next.totalPages);
          setCurrentPage(next.currentPage);
          setHasLoadedOnce(true);
          setError(getErrorMessage(err, 'Unable to refresh orders. Showing saved results.'));
          return;
        }

        setError(message);
      } finally {
        if (requestVersion === requestVersionRef.current) {
          setIsRefreshing(false);
          setIsPageLoading(false);
        }
      }
    },
    [userId],
  );

  useEffect(() => {
    if (!userId) {
      setOrders([]);
      setTotalOrders(0);
      setTotalPages(1);
      setCurrentPage(1);
      setHasLoadedOnce(false);
      setError(null);
      setIsRefreshing(false);
      setIsPageLoading(false);
      return;
    }

    const nextState = hydrateOrdersState(userId);
    setOrders(nextState.orders);
    setTotalOrders(nextState.totalOrders);
    setTotalPages(nextState.totalPages);
    setCurrentPage(nextState.currentPage);
    setHasLoadedOnce(nextState.hasLoadedOnce);
    setIsRefreshing(nextState.isRefreshing);
    setError(null);
    void loadOrders(1, 'initial');
  }, [loadOrders, userId]);

  const buildPageSnapshot = useCallback(
    (): OrdersListCacheEntry => ({
      orders,
      totalOrders,
      totalPages,
      currentPage,
    }),
    [currentPage, orders, totalOrders, totalPages],
  );

  const goToPreviousPage = useCallback(() => {
    if (currentPage <= 1 || isPageLoading) {
      return;
    }

    const targetPage = currentPage - 1;
    void loadOrders(targetPage, 'page', {
      revertPageOnError: currentPage,
      fallbackSnapshot: buildPageSnapshot(),
    });
  }, [buildPageSnapshot, currentPage, isPageLoading, loadOrders]);

  const goToNextPage = useCallback(() => {
    if (currentPage >= totalPages || isPageLoading) {
      return;
    }

    const targetPage = currentPage + 1;
    void loadOrders(targetPage, 'page', {
      revertPageOnError: currentPage,
      fallbackSnapshot: buildPageSnapshot(),
    });
  }, [buildPageSnapshot, currentPage, isPageLoading, loadOrders, totalPages]);

  const retry = useCallback(() => {
    void loadOrders(currentPage, 'retry');
  }, [currentPage, loadOrders]);

  const isLoading = isRefreshing && orders.length === 0 && !isPageLoading;

  return {
    orders,
    totalOrders,
    totalPages,
    currentPage,
    hasLoadedOnce,
    isLoading,
    isRefreshing: isRefreshing && orders.length > 0,
    isPageLoading,
    error,
    retry,
    goToPreviousPage,
    goToNextPage,
    canGoPrevious: currentPage > 1 && !isPageLoading,
    canGoNext: currentPage < totalPages && !isPageLoading,
  };
}
