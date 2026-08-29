import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  getSellerProductsManagementPage,
} from '../../../../services/api/productsApi';
import { getErrorMessage } from '../../../../services/api/errors';
import type { Product } from '../../../../services/types/product';
import {
  filterSellerProducts,
  type SellerApprovalStatusFilter,
  type SellerInventoryStatusFilter,
} from '../utils/sellerProductListDisplay';

const ITEMS_PER_PAGE = 10;
const SEARCH_DEBOUNCE_MS = 300;

export function useSellerProducts(sellerId?: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isLoading, setIsLoading] = useState(Boolean(sellerId));
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [approvalFilter, setApprovalFilter] = useState<SellerApprovalStatusFilter>('');
  const [inventoryFilter, setInventoryFilter] = useState<SellerInventoryStatusFilter>('');

  const requestVersionRef = useRef(0);
  const hasCachedProductsRef = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const loadPage = useCallback(
    async (page: number, mode: 'initial' | 'refresh') => {
      if (!sellerId) {
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
        let response = await getSellerProductsManagementPage(sellerId, {
          page: resolvedPage,
          limit: ITEMS_PER_PAGE,
        });

        const maxPage = Math.max(1, response.pagination?.totalPages ?? 1);
        if (resolvedPage > maxPage) {
          resolvedPage = maxPage;
          response = await getSellerProductsManagementPage(sellerId, {
            page: resolvedPage,
            limit: ITEMS_PER_PAGE,
          });
        }

        if (requestVersion !== requestVersionRef.current) {
          return;
        }

        setProducts(Array.isArray(response.products) ? response.products : []);
        setTotalPages(Math.max(1, response.pagination?.totalPages ?? 1));
        setTotalProducts(response.pagination?.totalProducts ?? 0);
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
    [sellerId],
  );

  useEffect(() => {
    setCurrentPage(1);
    void loadPage(1, hasCachedProductsRef.current ? 'refresh' : 'initial');
  }, [loadPage]);

  const filteredProducts = useMemo(
    () => filterSellerProducts(products, searchTerm, approvalFilter, inventoryFilter),
    [approvalFilter, inventoryFilter, products, searchTerm],
  );

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

  const applyApprovalFilter = useCallback((nextFilter: SellerApprovalStatusFilter) => {
    setApprovalFilter(nextFilter);
  }, []);

  const applyInventoryFilter = useCallback((nextFilter: SellerInventoryStatusFilter) => {
    setInventoryFilter(nextFilter);
  }, []);

  const hasActiveFilters = useMemo(
    () => Boolean(searchTerm || approvalFilter || inventoryFilter),
    [approvalFilter, inventoryFilter, searchTerm],
  );

  return {
    products: filteredProducts,
    pageProducts: products,
    totalProducts,
    currentPage,
    totalPages,
    isLoading,
    isRefreshing,
    error,
    searchInput,
    setSearchInput,
    approvalFilter,
    inventoryFilter,
    hasActiveFilters,
    applyApprovalFilter,
    applyInventoryFilter,
    refresh,
    goToPreviousPage,
    goToNextPage,
    canGoPrevious: currentPage > 1 && !isLoading,
    canGoNext: currentPage < totalPages && !isLoading,
  };
}
