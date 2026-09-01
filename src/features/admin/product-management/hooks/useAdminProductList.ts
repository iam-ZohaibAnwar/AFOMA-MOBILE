import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { getErrorMessage } from '../../../../services/api/errors';
import {
  getAdminProductList,
  updateAdminProductsStoreVisibility,
} from '../api/adminProductManagementApi';
import type {
  AdminProductApprovalFilter,
  AdminProductInventoryFilter,
  AdminProductListItem,
  AdminProductManagementParams,
  AdminProductStockAlertFilter,
} from '../types/adminProductManagement';
import { consumeAdminProductListRefreshRequest } from '../state/adminProductListRefresh';
import {
  applyAdminProductSessionPatch,
  peekAdminProductSessionPatches,
  setAdminProductSessionPatch,
} from '../state/adminProductSessionPatch';
import { filterAdminProductsByStockAlert } from '../utils/adminProductStockAlert';

const ITEMS_PER_PAGE = 10;
const STOCK_ALERT_PAGE_LIMIT = 100;
const SEARCH_DEBOUNCE_MS = 300;

export function useAdminProductList(
  enabled: boolean,
  initialFilters?: AdminProductManagementParams,
) {
  const [products, setProducts] = useState<AdminProductListItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isLoading, setIsLoading] = useState(enabled);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [approvalFilter, setApprovalFilter] = useState<AdminProductApprovalFilter>(
    initialFilters?.initialApprovalFilter ?? '',
  );
  const [inventoryFilter, setInventoryFilter] = useState<AdminProductInventoryFilter>(
    initialFilters?.initialInventoryFilter ?? '',
  );
  const [stockAlertFilter, setStockAlertFilter] = useState<AdminProductStockAlertFilter>(
    initialFilters?.initialStockAlertFilter ?? '',
  );
  const [actionError, setActionError] = useState<string | null>(null);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [listReloadToken, setListReloadToken] = useState(0);

  const requestVersionRef = useRef(0);
  const hasCachedProductsRef = useRef(false);
  const stockAlertFilterRef = useRef(stockAlertFilter);

  useEffect(() => {
    stockAlertFilterRef.current = stockAlertFilter;
  }, [stockAlertFilter]);

  useEffect(() => {
    const nextStockAlert = initialFilters?.initialStockAlertFilter ?? '';
    if (nextStockAlert === stockAlertFilterRef.current) {
      return;
    }

    setStockAlertFilter(nextStockAlert);
    hasCachedProductsRef.current = false;
  }, [initialFilters?.initialStockAlertFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const loadPage = useCallback(
    async (page: number, mode: 'initial' | 'refresh') => {
      if (!enabled) {
        setProducts([]);
        setError(null);
        setIsLoading(false);
        return;
      }

      const requestVersion = requestVersionRef.current + 1;
      requestVersionRef.current = requestVersion;

      if (mode === 'refresh') {
        setIsRefreshing(true);
      } else if (!hasCachedProductsRef.current) {
        setIsLoading(true);
      }

      setError(null);

      try {
        let resolvedPage = page;
        const pageLimit = stockAlertFilter ? STOCK_ALERT_PAGE_LIMIT : ITEMS_PER_PAGE;
        let response = await getAdminProductList({
          page: resolvedPage,
          limit: pageLimit,
          search: searchTerm || undefined,
          productStatus: approvalFilter || undefined,
          inventoryStatus: inventoryFilter || undefined,
          stockAlert: stockAlertFilter || undefined,
        });

        const maxPage = Math.max(1, response.totalPages ?? 1);
        if (resolvedPage > maxPage) {
          resolvedPage = maxPage;
          response = await getAdminProductList({
            page: resolvedPage,
            limit: pageLimit,
            search: searchTerm || undefined,
            productStatus: approvalFilter || undefined,
            inventoryStatus: inventoryFilter || undefined,
            stockAlert: stockAlertFilter || undefined,
          });
        }

        if (requestVersion !== requestVersionRef.current) {
          return;
        }

        const nextProducts = filterAdminProductsByStockAlert(
          Array.isArray(response.products) ? response.products : [],
          stockAlertFilter,
        );
        setProducts(
          nextProducts.map((product) => applyAdminProductSessionPatch(product) ?? product),
        );
        if (stockAlertFilter) {
          setTotalProducts(nextProducts.length);
          setTotalPages(1);
        } else {
          setTotalPages(Math.max(1, response.totalPages ?? 1));
          setTotalProducts(response.totalProducts ?? 0);
        }
        setCurrentPage(resolvedPage);
        hasCachedProductsRef.current = true;
      } catch (err) {
        if (requestVersion !== requestVersionRef.current) {
          return;
        }

        if (!hasCachedProductsRef.current) {
          setProducts([]);
        }
        setError(getErrorMessage(err, 'Failed to load products'));
      } finally {
        if (requestVersion === requestVersionRef.current) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    [approvalFilter, enabled, inventoryFilter, searchTerm, stockAlertFilter],
  );

  useEffect(() => {
    setCurrentPage(1);
    void loadPage(1, hasCachedProductsRef.current ? 'refresh' : 'initial');
  }, [loadPage, listReloadToken]);

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

  const applyApprovalFilter = useCallback((nextFilter: AdminProductApprovalFilter) => {
    setApprovalFilter(nextFilter);
  }, []);

  const applyInventoryFilter = useCallback((nextFilter: AdminProductInventoryFilter) => {
    setInventoryFilter(nextFilter);
  }, []);

  const applyStockAlertFilter = useCallback((nextFilter: AdminProductStockAlertFilter) => {
    setStockAlertFilter(nextFilter);
    hasCachedProductsRef.current = false;
    setCurrentPage(1);
    setListReloadToken((token) => token + 1);
  }, []);

  const clearFilters = useCallback(() => {
    setApprovalFilter('');
    setInventoryFilter('');
    setStockAlertFilter('');
  }, []);

  const hasActiveFilters = useMemo(
    () => Boolean(approvalFilter || inventoryFilter || stockAlertFilter),
    [approvalFilter, inventoryFilter, stockAlertFilter],
  );

  const updateProductsInList = useCallback(
    (productIds: string[], patch: Partial<AdminProductListItem>) => {
      const idSet = new Set(productIds);
      setProducts((current) =>
        current.map((product) =>
          product._id && idSet.has(product._id) ? { ...product, ...patch } : product,
        ),
      );
    },
    [],
  );

  const bulkSetStoreVisibility = useCallback(
    async (productIds: string[], status: 0 | 1) => {
      if (productIds.length === 0) {
        return false;
      }

      setActionError(null);
      setIsBulkUpdating(true);

      try {
        await updateAdminProductsStoreVisibility(productIds, status);

        for (const id of productIds) {
          setAdminProductSessionPatch(id, { status });
        }

        updateProductsInList(productIds, { status });
        void loadPage(currentPage, 'refresh');
        return true;
      } catch (err) {
        setActionError(getErrorMessage(err, 'Failed to update product visibility'));
        return false;
      } finally {
        setIsBulkUpdating(false);
      }
    },
    [currentPage, loadPage, updateProductsInList],
  );

  const clearActionError = useCallback(() => {
    setActionError(null);
  }, []);

  const applySessionPatchesToList = useCallback(() => {
    const patches = peekAdminProductSessionPatches();
    if (patches.size === 0) {
      return;
    }

    setProducts((current) =>
      current.map((product) => {
        const productId = product._id;
        if (!productId) {
          return product;
        }

        const patch = patches.get(productId);
        return patch ? applyAdminProductSessionPatch(product) ?? product : product;
      }),
    );
  }, []);

  useFocusEffect(
    useCallback(() => {
      applySessionPatchesToList();
      const { refresh: shouldRefresh, resetToFirstPage } = consumeAdminProductListRefreshRequest();
      if (shouldRefresh) {
        void loadPage(resetToFirstPage ? 1 : currentPage, resetToFirstPage ? 'initial' : 'refresh');
      }
    }, [applySessionPatchesToList, currentPage, loadPage]),
  );

  return {
    products,
    currentPage,
    totalPages,
    totalProducts,
    isLoading,
    isRefreshing,
    error,
    searchInput,
    setSearchInput,
    approvalFilter,
    inventoryFilter,
    stockAlertFilter,
    hasActiveFilters,
    applyApprovalFilter,
    applyInventoryFilter,
    applyStockAlertFilter,
    clearFilters,
    refresh,
    goToPreviousPage,
    goToNextPage,
    canGoPrevious: currentPage > 1 && !isLoading,
    canGoNext: currentPage < totalPages && !isLoading,
    actionError,
    clearActionError,
    isBulkUpdating,
    bulkSetStoreVisibility,
  };
}
