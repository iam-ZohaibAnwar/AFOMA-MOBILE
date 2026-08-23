import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { usePricing } from '../../../app/providers/PricingProvider';
import {
  buildListingCacheKey,
  getListingCache,
  setListingCache,
} from '../../../services/cache/screenCache';
import {
  getBestProducts,
  getDiscountedProducts,
  getNewArrivalProducts,
  getRelatedProducts,
  globalProductSearch,
} from '../../../services/api/productsApi';
import { getErrorMessage } from '../../../services/api/errors';
import type { Product } from '../../../services/types/product';
import {
  applyProductPricing,
  filterApprovedProducts,
} from '../utils/productDisplay';
import {
  normalizeBestSellerProducts,
  normalizeFlatProductList,
} from '../../home/utils/homeProducts';

export type ProductListingSource = 'best' | 'newArrival' | 'discounted';

export interface ProductListingFilters {
  categoryId?: string;
  subCategoryId?: string;
  childCategoryId?: string;
  searchQuery?: string;
  listingSource?: ProductListingSource;
}

export function useProductListing(filters: ProductListingFilters) {
  const { categoryId, subCategoryId, childCategoryId, searchQuery, listingSource } = filters;
  const { userInfo } = usePricing();
  const cacheKey = buildListingCacheKey(filters);
  const cachedProducts = getListingCache(cacheKey);
  const [rawProducts, setRawProducts] = useState<Product[]>(cachedProducts ?? []);
  const [isRefreshing, setIsRefreshing] = useState(!cachedProducts?.length);
  const [error, setError] = useState<string | null>(null);
  const activeFiltersRef = useRef(cacheKey);

  const products = useMemo(() => {
    const approved = listingSource ? rawProducts : filterApprovedProducts(rawProducts);
    return applyProductPricing(approved, userInfo);
  }, [listingSource, rawProducts, userInfo]);

  useEffect(() => {
    activeFiltersRef.current = cacheKey;
    const nextCache = getListingCache(cacheKey);
    setRawProducts(nextCache ?? []);
    setError(null);
    setIsRefreshing(!nextCache?.length);
  }, [cacheKey]);

  const loadProducts = useCallback(async () => {
    const requestKey = cacheKey;
    const existingProducts = getListingCache(cacheKey) ?? [];
    const hasExistingData = existingProducts.length > 0;

    if (!hasExistingData) {
      setIsRefreshing(true);
    }

    setError(null);

    try {
      let nextProducts: Product[] = [];

      if (listingSource === 'best') {
        nextProducts = normalizeBestSellerProducts(await getBestProducts());
      } else if (listingSource === 'newArrival') {
        nextProducts = normalizeFlatProductList(await getNewArrivalProducts(100));
      } else if (listingSource === 'discounted') {
        nextProducts = normalizeFlatProductList(await getDiscountedProducts(30)).sort(
          (a, b) => Number(b.discountCode ?? 0) - Number(a.discountCode ?? 0),
        );
      } else if (searchQuery?.trim()) {
        const response = await globalProductSearch(searchQuery.trim());
        nextProducts = response.matchedProducts ?? [];
      } else {
        const listingId = childCategoryId ?? subCategoryId ?? categoryId;
        if (!listingId) {
          if (activeFiltersRef.current === requestKey) {
            setRawProducts((current) => (current.length === 0 ? current : []));
            setError('No listing filters provided.');
            setIsRefreshing(false);
          }
          return;
        }

        nextProducts = await getRelatedProducts(listingId, { page: 1, limit: 100 });
      }

      if (activeFiltersRef.current !== requestKey) {
        return;
      }

      setListingCache(cacheKey, nextProducts);
      setRawProducts(nextProducts);
    } catch (err) {
      if (activeFiltersRef.current !== requestKey) {
        return;
      }

      if (!hasExistingData) {
        setRawProducts([]);
        setError(getErrorMessage(err, 'Failed to load products'));
      } else {
        setError(getErrorMessage(err, 'Unable to refresh products. Showing saved results.'));
      }
    } finally {
      if (activeFiltersRef.current === requestKey) {
        setIsRefreshing(false);
      }
    }
  }, [
    cacheKey,
    categoryId,
    childCategoryId,
    listingSource,
    searchQuery,
    subCategoryId,
  ]);

  useEffect(() => {
    void loadProducts();
  }, [cacheKey]); // eslint-disable-line react-hooks/exhaustive-deps -- reload when filters change

  return {
    products,
    isRefreshing,
    isLoading: isRefreshing && products.length === 0,
    error,
    retry: loadProducts,
  };
}
