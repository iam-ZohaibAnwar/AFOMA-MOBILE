import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { getErrorMessage } from '../../../../services/api/errors';
import { getSellerOrdersPage } from '../api/sellerOrdersApi';
import type { SellerOrderStatusFilter, SellerOrderSummary } from '../types/sellerOrder';
import { peekSellerOrderSessionPatches } from '../state/sellerOrderSessionPatch';

const ITEMS_PER_PAGE = 10;
const SEARCH_DEBOUNCE_MS = 300;

export function useSellerOrders(sellerId?: string) {
  const [orders, setOrders] = useState<SellerOrderSummary[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [isLoading, setIsLoading] = useState(Boolean(sellerId));
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<SellerOrderStatusFilter>('');

  const requestVersionRef = useRef(0);
  const hasCachedOrdersRef = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const loadPage = useCallback(
    async (page: number, mode: 'initial' | 'refresh') => {
      if (!sellerId) {
        setOrders([]);
        setError(null);
        setIsLoading(false);
        return;
      }

      const requestVersion = requestVersionRef.current + 1;
      requestVersionRef.current = requestVersion;

      if (mode === 'refresh') {
        setIsRefreshing(true);
      } else if (!hasCachedOrdersRef.current) {
        setIsLoading(true);
      }

      setError(null);

      try {
        let resolvedPage = page;
        let response = await getSellerOrdersPage(sellerId, {
          page: resolvedPage,
          limit: ITEMS_PER_PAGE,
          status: statusFilter || undefined,
          search: searchTerm || undefined,
        });

        const maxPage = Math.max(1, response.totalPages ?? 1);
        if (resolvedPage > maxPage) {
          resolvedPage = maxPage;
          response = await getSellerOrdersPage(sellerId, {
            page: resolvedPage,
            limit: ITEMS_PER_PAGE,
            status: statusFilter || undefined,
            search: searchTerm || undefined,
          });
        }

        if (requestVersion !== requestVersionRef.current) {
          return;
        }

        setOrders(Array.isArray(response.orders) ? response.orders : []);
        setTotalPages(Math.max(1, response.totalPages ?? 1));
        setTotalOrders(response.totalOrders ?? 0);
        setCurrentPage(resolvedPage);
        hasCachedOrdersRef.current = true;
      } catch (err) {
        if (requestVersion !== requestVersionRef.current) {
          return;
        }

        if (!hasCachedOrdersRef.current) {
          setOrders([]);
        }
        setError(getErrorMessage(err, 'Failed to load orders'));
      } finally {
        if (requestVersion === requestVersionRef.current) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    [searchTerm, sellerId, statusFilter],
  );

  useEffect(() => {
    setCurrentPage(1);
    void loadPage(1, hasCachedOrdersRef.current ? 'refresh' : 'initial');
  }, [loadPage]);

  const refresh = useCallback(async () => {
    await loadPage(currentPage, 'refresh');
  }, [currentPage, loadPage]);

  const goToPreviousPage = useCallback(() => {
    const nextPage = Math.max(1, currentPage - 1);
    if (nextPage === currentPage) {
      return;
    }
    void loadPage(nextPage, 'initial');
  }, [currentPage, loadPage]);

  const goToNextPage = useCallback(() => {
    const nextPage = Math.min(totalPages, currentPage + 1);
    if (nextPage === currentPage) {
      return;
    }
    void loadPage(nextPage, 'initial');
  }, [currentPage, loadPage, totalPages]);

  const applyStatusFilter = useCallback((nextStatus: SellerOrderStatusFilter) => {
    setStatusFilter(nextStatus);
  }, []);

  const hasActiveFilters = useMemo(
    () => Boolean(searchTerm || statusFilter),
    [searchTerm, statusFilter],
  );

  const applySessionPatchesToList = useCallback(() => {
    const patches = peekSellerOrderSessionPatches();
    if (patches.size === 0) {
      return;
    }

    setOrders((current) =>
      current.map((order) => {
        const orderId = order._id;
        if (!orderId) {
          return order;
        }

        const patch = patches.get(orderId);
        return patch ? { ...order, ...patch } : order;
      }),
    );
  }, []);

  useFocusEffect(
    useCallback(() => {
      applySessionPatchesToList();
    }, [applySessionPatchesToList]),
  );

  return {
    orders,
    currentPage,
    totalPages,
    totalOrders,
    isLoading,
    isRefreshing,
    error,
    searchInput,
    setSearchInput,
    statusFilter,
    hasActiveFilters,
    applyStatusFilter,
    refresh,
    goToPreviousPage,
    goToNextPage,
    canGoPrevious: currentPage > 1 && !isLoading,
    canGoNext: currentPage < totalPages && !isLoading,
  };
}
