import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  deleteSellerProduct,
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

export function useSellerProducts(sellerId?: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isLoading, setIsLoading] = useState(Boolean(sellerId));
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [approvalStatusFilter, setApprovalStatusFilter] = useState<SellerApprovalStatusFilter>('');
  const [inventoryStatusFilter, setInventoryStatusFilter] = useState<SellerInventoryStatusFilter>('');

  const loadingMoreRef = useRef(false);

  const loadPage = useCallback(
    async (page: number, mode: 'initial' | 'more' | 'refresh') => {
      if (!sellerId) {
        setProducts([]);
        setError(null);
        setIsLoading(false);
        return;
      }

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
        const response = await getSellerProductsManagementPage(sellerId, {
          page,
          limit: ITEMS_PER_PAGE,
        });

        setProducts((current) =>
          mode === 'more' ? [...current, ...response.products] : response.products,
        );
        setCurrentPage(response.pagination?.currentPage ?? page);
        setTotalPages(response.pagination?.totalPages ?? 1);
        setTotalProducts(
          response.pagination?.totalProducts ?? response.products.length,
        );
      } catch (err) {
        if (mode !== 'more') {
          setProducts([]);
        }
        setError(getErrorMessage(err, 'Failed to load products'));
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
        setIsRefreshing(false);
        loadingMoreRef.current = false;
      }
    },
    [sellerId],
  );

  useEffect(() => {
    void loadPage(1, 'initial');
  }, [loadPage]);

  const filteredProducts = useMemo(
    () =>
      filterSellerProducts(
        products,
        searchTerm,
        approvalStatusFilter,
        inventoryStatusFilter,
      ),
    [approvalStatusFilter, inventoryStatusFilter, products, searchTerm],
  );

  const hasMore = currentPage < totalPages;

  const loadMore = useCallback(() => {
    if (!hasMore || isLoading || isLoadingMore || isRefreshing) {
      return;
    }

    void loadPage(currentPage + 1, 'more');
  }, [currentPage, hasMore, isLoading, isLoadingMore, isRefreshing, loadPage]);

  const refresh = useCallback(() => {
    void loadPage(1, 'refresh');
  }, [loadPage]);

  const removeProduct = useCallback(
    async (productId: string) => {
      setDeletingProductId(productId);
      setDeleteError(null);

      try {
        await deleteSellerProduct(productId);
        setProducts((current) => current.filter((product) => product._id !== productId));
        setTotalProducts((count) => Math.max(0, count - 1));
        return true;
      } catch (err) {
        setDeleteError(getErrorMessage(err, 'Failed to delete product'));
        return false;
      } finally {
        setDeletingProductId(null);
      }
    },
    [],
  );

  return {
    products,
    filteredProducts,
    totalProducts,
    isLoading,
    isLoadingMore,
    isRefreshing,
    error,
    deleteError,
    deletingProductId,
    searchTerm,
    setSearchTerm,
    approvalStatusFilter,
    setApprovalStatusFilter,
    inventoryStatusFilter,
    setInventoryStatusFilter,
    hasMore,
    loadMore,
    refresh,
    removeProduct,
    clearDeleteError: () => setDeleteError(null),
  };
}
