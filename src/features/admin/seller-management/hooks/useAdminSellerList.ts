import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { getErrorMessage } from '../../../../services/api/errors';
import {
  deleteAdminSeller,
  getAdminSellerList,
  updateAdminSellerShopVisibility,
} from '../api/adminSellerManagementApi';
import type {
  AdminSellerApprovalFilter,
  AdminSellerListItem,
  AdminSellerShopFilter,
} from '../types/adminSellerManagement';
import { peekAdminSellerSessionPatches } from '../state/adminSellerSessionPatch';
import { consumeAdminSellerListRefreshRequest } from '../state/adminSellerListRefresh';

const ITEMS_PER_PAGE = 10;
const SEARCH_DEBOUNCE_MS = 300;

export function useAdminSellerList(enabled: boolean) {
  const [sellers, setSellers] = useState<AdminSellerListItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSellers, setTotalSellers] = useState(0);
  const [isLoading, setIsLoading] = useState(enabled);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [approvalFilter, setApprovalFilter] = useState<AdminSellerApprovalFilter>('');
  const [shopVisibilityFilter, setShopVisibilityFilter] = useState<AdminSellerShopFilter>('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [updatingSellerId, setUpdatingSellerId] = useState<string | null>(null);
  const [deletingSellerId, setDeletingSellerId] = useState<string | null>(null);

  const requestVersionRef = useRef(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const loadPage = useCallback(
    async (page: number, mode: 'initial' | 'refresh') => {
      if (!enabled) {
        setSellers([]);
        setError(null);
        setIsLoading(false);
        return;
      }

      const requestVersion = requestVersionRef.current + 1;
      requestVersionRef.current = requestVersion;

      if (mode === 'refresh') {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setError(null);

      try {
        let resolvedPage = page;
        let response = await getAdminSellerList({
          page: resolvedPage,
          limit: ITEMS_PER_PAGE,
          search: searchTerm || undefined,
          status: approvalFilter || undefined,
          shopStatus: shopVisibilityFilter || undefined,
        });

        const maxPage = Math.max(1, response.totalPages ?? 1);
        if (resolvedPage > maxPage) {
          resolvedPage = maxPage;
          response = await getAdminSellerList({
            page: resolvedPage,
            limit: ITEMS_PER_PAGE,
            search: searchTerm || undefined,
            status: approvalFilter || undefined,
            shopStatus: shopVisibilityFilter || undefined,
          });
        }

        if (requestVersion !== requestVersionRef.current) {
          return;
        }

        setSellers(Array.isArray(response.sellers) ? response.sellers : []);
        setTotalPages(Math.max(1, response.totalPages ?? 1));
        setTotalSellers(response.totalSellers ?? 0);
        setCurrentPage(resolvedPage);
      } catch (err) {
        if (requestVersion !== requestVersionRef.current) {
          return;
        }

        setSellers([]);
        setError(getErrorMessage(err, 'Failed to load sellers'));
      } finally {
        if (requestVersion === requestVersionRef.current) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    [approvalFilter, enabled, searchTerm, shopVisibilityFilter],
  );

  useEffect(() => {
    setCurrentPage(1);
    void loadPage(1, 'initial');
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

  const applyFilters = useCallback(
    (nextApproval: AdminSellerApprovalFilter, nextShop: AdminSellerShopFilter) => {
      setApprovalFilter(nextApproval);
      setShopVisibilityFilter(nextShop);
    },
    [],
  );

  const applyApprovalFilter = useCallback((nextApproval: AdminSellerApprovalFilter) => {
    setApprovalFilter(nextApproval);
    setShopVisibilityFilter('');
  }, []);

  const applyShopVisibilityFilter = useCallback((nextShop: AdminSellerShopFilter) => {
    setShopVisibilityFilter(nextShop);
    setApprovalFilter('');
  }, []);

  const clearFilters = useCallback(() => {
    setApprovalFilter('');
    setShopVisibilityFilter('');
  }, []);

  const hasActiveFilters = useMemo(
    () => Boolean(approvalFilter || shopVisibilityFilter),
    [approvalFilter, shopVisibilityFilter],
  );

  const updateSellerInList = useCallback((sellerId: string, patch: Partial<AdminSellerListItem>) => {
    setSellers((current) =>
      current.map((seller) => (seller._id === sellerId ? { ...seller, ...patch } : seller)),
    );
  }, []);

  const setShopVisibility = useCallback(
    async (sellerId: string, visible: boolean) => {
      setActionError(null);
      setUpdatingSellerId(sellerId);

      try {
        await updateAdminSellerShopVisibility(sellerId, visible ? 1 : 0);
        updateSellerInList(sellerId, { shop_status: visible ? 1 : 0 });
        return true;
      } catch (err) {
        setActionError(getErrorMessage(err, 'Failed to update shop visibility'));
        return false;
      } finally {
        setUpdatingSellerId(null);
      }
    },
    [updateSellerInList],
  );

  const deleteSeller = useCallback(
    async (sellerId: string) => {
      setActionError(null);
      setDeletingSellerId(sellerId);

      const wasOnlySellerOnPage = sellers.length === 1;
      const pageBeforeDelete = currentPage;

      try {
        await deleteAdminSeller(sellerId);

        if (wasOnlySellerOnPage && pageBeforeDelete > 1) {
          await loadPage(pageBeforeDelete - 1, 'initial');
        } else {
          await loadPage(pageBeforeDelete, 'refresh');
        }

        return true;
      } catch (err) {
        setActionError(getErrorMessage(err, 'Failed to delete seller'));
        return false;
      } finally {
        setDeletingSellerId(null);
      }
    },
    [currentPage, loadPage, sellers.length],
  );

  const clearActionError = useCallback(() => {
    setActionError(null);
  }, []);

  const applySessionPatchesToList = useCallback(() => {
    const patches = peekAdminSellerSessionPatches();
    if (patches.size === 0) {
      return;
    }

    setSellers((current) =>
      current.map((seller) => {
        const patch = patches.get(seller._id);
        return patch ? { ...seller, ...patch } : seller;
      }),
    );
  }, []);

  useFocusEffect(
    useCallback(() => {
      applySessionPatchesToList();
      const { refresh, resetToFirstPage } = consumeAdminSellerListRefreshRequest();
      if (refresh) {
        void loadPage(resetToFirstPage ? 1 : currentPage, resetToFirstPage ? 'initial' : 'refresh');
      }
    }, [applySessionPatchesToList, currentPage, loadPage]),
  );

  return {
    sellers,
    currentPage,
    totalPages,
    totalSellers,
    isLoading,
    isRefreshing,
    error,
    searchInput,
    setSearchInput,
    approvalFilter,
    shopVisibilityFilter,
    hasActiveFilters,
    applyFilters,
    applyApprovalFilter,
    applyShopVisibilityFilter,
    clearFilters,
    actionError,
    clearActionError,
    updatingSellerId,
    deletingSellerId,
    refresh,
    goToPreviousPage,
    goToNextPage,
    canGoPrevious: currentPage > 1 && !isLoading,
    canGoNext: currentPage < totalPages && !isLoading,
    setShopVisibility,
    deleteSeller,
  };
}
