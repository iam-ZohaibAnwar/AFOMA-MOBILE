import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { usePricing } from '../../../app/providers/PricingProvider';
import {
  buildSearchCacheKey,
  getListingCache,
  setListingCache,
} from '../../../services/cache/screenCache';
import { globalProductSearch } from '../../../services/api/productsApi';
import { getErrorMessage } from '../../../services/api/errors';
import type { Product } from '../../../services/types/product';
import {
  applyProductPricing,
  filterApprovedProducts,
} from '../../products/utils/productDisplay';

export function useProductSearch(query: string) {
  const { userInfo } = usePricing();
  const trimmedQuery = query.trim();
  const cacheKey = trimmedQuery ? buildSearchCacheKey(trimmedQuery) : '';
  const cachedProducts = cacheKey ? getListingCache(cacheKey) : undefined;
  const [rawProducts, setRawProducts] = useState<Product[]>(cachedProducts ?? []);
  const [rawSuggestedProducts, setRawSuggestedProducts] = useState<Product[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(Boolean(trimmedQuery && !cachedProducts?.length));
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(Boolean(trimmedQuery));
  const activeQueryRef = useRef(trimmedQuery);

  const products = useMemo(
    () => applyProductPricing(rawProducts, userInfo),
    [rawProducts, userInfo],
  );
  const suggestedProducts = useMemo(
    () => applyProductPricing(rawSuggestedProducts, userInfo),
    [rawSuggestedProducts, userInfo],
  );

  useEffect(() => {
    activeQueryRef.current = trimmedQuery;
    const nextCache = cacheKey ? getListingCache(cacheKey) : undefined;
    setRawProducts(nextCache ?? []);
    setRawSuggestedProducts([]);
    setError(null);
    setHasSearched(Boolean(trimmedQuery));
    setIsRefreshing(Boolean(trimmedQuery && !nextCache?.length));
  }, [cacheKey, trimmedQuery]);

  const searchProducts = useCallback(async () => {
    const activeQuery = trimmedQuery;

    if (!activeQuery) {
      setRawProducts((current) => (current.length === 0 ? current : []));
      setRawSuggestedProducts((current) => (current.length === 0 ? current : []));
      setError(null);
      setHasSearched(false);
      setIsRefreshing(false);
      return;
    }

    const existingProducts = getListingCache(cacheKey) ?? [];
    const hasExistingData = existingProducts.length > 0;

    if (!hasExistingData) {
      setIsRefreshing(true);
    }

    setError(null);
    setHasSearched(true);

    try {
      const response = await globalProductSearch(activeQuery);
      if (activeQueryRef.current !== activeQuery) {
        return;
      }

      const nextProducts = filterApprovedProducts(response.matchedProducts ?? []);
      const nextSuggested = filterApprovedProducts(response.suggestedProducts ?? []);
      setListingCache(cacheKey, nextProducts);
      setRawProducts(nextProducts);
      setRawSuggestedProducts(nextSuggested);
    } catch (err) {
      if (activeQueryRef.current !== activeQuery) {
        return;
      }

      if (!hasExistingData) {
        setRawProducts([]);
        setRawSuggestedProducts([]);
        setError(getErrorMessage(err, 'Failed to search products'));
      } else {
        setRawProducts(existingProducts);
        setError(getErrorMessage(err, 'Unable to refresh search results. Showing saved results.'));
      }
    } finally {
      if (activeQueryRef.current === activeQuery) {
        setIsRefreshing(false);
      }
    }
  }, [cacheKey, trimmedQuery]);

  useEffect(() => {
    void searchProducts();
  }, [searchProducts]);

  return {
    products,
    suggestedProducts,
    isRefreshing,
    error,
    hasSearched,
    retry: searchProducts,
  };
}
