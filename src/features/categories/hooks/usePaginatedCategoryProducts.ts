import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { usePricing } from '../../../app/providers/PricingProvider';
import { getRelatedProductsPage } from '../../../services/api/productsApi';
import { getErrorMessage } from '../../../services/api/errors';
import type { Product } from '../../../services/types/product';
import {
  applyProductPricing,
  filterApprovedProducts,
} from '../../products/utils/productDisplay';

const PAGE_SIZE = 12;

export interface CategoryProductFilters {
  categoryId: string;
  subCategoryId?: string;
  childCategoryId?: string;
}

function buildFilterKey(filters: CategoryProductFilters): string {
  return `${filters.categoryId}:${filters.subCategoryId ?? ''}:${filters.childCategoryId ?? ''}`;
}

function getListingId(filters: CategoryProductFilters): string {
  return filters.childCategoryId ?? filters.subCategoryId ?? filters.categoryId;
}

function areSameProducts(left: Product[], right: Product[]): boolean {
  if (left === right) {
    return true;
  }

  if (left.length !== right.length) {
    return false;
  }

  return left.every((product, index) => product === right[index] || product._id === right[index]?._id);
}

export function usePaginatedCategoryProducts(filters: CategoryProductFilters) {
  const { userInfo } = usePricing();
  const filterKey = buildFilterKey(filters);
  const listingId = getListingId(filters);

  const [rawProducts, setRawProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeFilterKeyRef = useRef(filterKey);

  const products = useMemo(
    () => applyProductPricing(filterApprovedProducts(rawProducts), userInfo),
    [rawProducts, userInfo],
  );

  useEffect(() => {
    activeFilterKeyRef.current = filterKey;
    setRawProducts([]);
    setPage(1);
    setHasMore(false);
    setError(null);
    setIsRefreshing(true);
  }, [filterKey]);

  const loadPage = useCallback(
    async (pageNum: number, append: boolean) => {
      const requestKey = filterKey;

      if (!append) {
        setIsRefreshing(true);
      }

      setError(null);

      try {
        const result = await getRelatedProductsPage(listingId, {
          page: pageNum,
          limit: PAGE_SIZE,
        });

        if (activeFilterKeyRef.current !== requestKey) {
          return;
        }

        const approved = filterApprovedProducts(result.products);

        setRawProducts((current) => {
          const next = append ? [...current, ...approved] : approved;
          return areSameProducts(current, next) ? current : next;
        });
        setHasMore(Boolean(result.pagination?.hasNextPage));
        setPage(pageNum);
      } catch (err) {
        if (activeFilterKeyRef.current !== requestKey) {
          return;
        }

        if (!append) {
          setRawProducts([]);
          setError(getErrorMessage(err, 'Failed to load products'));
        } else {
          setError(getErrorMessage(err, 'Failed to load more products'));
        }
      } finally {
        if (activeFilterKeyRef.current === requestKey) {
          setIsRefreshing(false);
          setIsLoadingMore(false);
        }
      }
    },
    [filterKey, listingId],
  );

  useEffect(() => {
    void loadPage(1, false);
  }, [loadPage]);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore || isRefreshing) {
      return;
    }

    setIsLoadingMore(true);
    await loadPage(page + 1, true);
  }, [hasMore, isLoadingMore, isRefreshing, loadPage, page]);

  const retry = useCallback(async () => {
    setIsLoadingMore(false);
    await loadPage(1, false);
  }, [loadPage]);

  return {
    products,
    isRefreshing,
    isLoading: isRefreshing && products.length === 0,
    isLoadingMore,
    hasMore,
    error,
    retry,
    loadMore,
  };
}
