import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { getErrorMessage } from '../../../../services/api/errors';
import { getSellerOrdersPage } from '../api/sellerOrdersApi';
import type { SellerOrderStatusFilter, SellerOrderSummary } from '../types/sellerOrder';

const ITEMS_PER_PAGE = 10;
const SEARCH_DEBOUNCE_MS = 300;

export function useSellerOrders(sellerId?: string) {
  const [orders, setOrders] = useState<SellerOrderSummary[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [isLoading, setIsLoading] = useState(Boolean(sellerId));
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<SellerOrderStatusFilter>('');

  const loadingMoreRef = useRef(false);
  const requestVersionRef = useRef(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const loadPage = useCallback(
    async (page: number, mode: 'initial' | 'more' | 'refresh') => {
      if (!sellerId) {
        setOrders([]);
        setError(null);
        setIsLoading(false);
        return;
      }

      const requestVersion = requestVersionRef.current + 1;
      requestVersionRef.current = requestVersion;

      if (mode === 'more') {
        if (loadingMoreRef.current) {
          return;
        }
        loadingMoreRef.current = true;
        setIsLoadingMore(true);
      } else if (mode === 'refresh') {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setError(null);

      try {
        const response = await getSellerOrdersPage(sellerId, {
          page,
          limit: ITEMS_PER_PAGE,
          status: statusFilter || undefined,
          search: searchTerm || undefined,
        });

        if (requestVersion !== requestVersionRef.current) {
          return;
        }

        const nextOrders = Array.isArray(response.orders) ? response.orders : [];

        setOrders((current) => (mode === 'more' ? [...current, ...nextOrders] : nextOrders));
        setCurrentPage(response.currentPage ?? page);
        setTotalPages(response.totalPages ?? 1);
        setTotalOrders(response.totalOrders ?? nextOrders.length);
      } catch (err) {
        if (requestVersion !== requestVersionRef.current) {
          return;
        }

        if (mode !== 'more') {
          setOrders([]);
        }
        setError(getErrorMessage(err, 'Failed to load orders'));
      } finally {
        if (requestVersion === requestVersionRef.current) {
          setIsLoading(false);
          setIsLoadingMore(false);
          setIsRefreshing(false);
          loadingMoreRef.current = false;
        }
      }
    },
    [searchTerm, sellerId, statusFilter],
  );

  useEffect(() => {
    void loadPage(1, 'initial');
  }, [loadPage]);

  const hasMore = currentPage < totalPages;

  const refresh = useCallback(async () => {
    await loadPage(1, 'refresh');
  }, [loadPage]);

  const loadMore = useCallback(() => {
    if (!hasMore || isLoading || isLoadingMore || isRefreshing) {
      return;
    }

    void loadPage(currentPage + 1, 'more');
  }, [currentPage, hasMore, isLoading, isLoadingMore, isRefreshing, loadPage]);

  const hasActiveFilters = useMemo(
    () => Boolean(searchTerm || statusFilter),
    [searchTerm, statusFilter],
  );

  return {
    orders,
    totalOrders,
    currentPage,
    totalPages,
    hasMore,
    isLoading,
    isLoadingMore,
    isRefreshing,
    error,
    searchInput,
    setSearchInput,
    statusFilter,
    setStatusFilter,
    hasActiveFilters,
    refresh,
    loadMore,
  };
}
