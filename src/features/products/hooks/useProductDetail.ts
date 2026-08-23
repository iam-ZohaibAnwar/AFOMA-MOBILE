import { useCallback, useEffect, useMemo, useState } from 'react';

import { usePricing } from '../../../app/providers/PricingProvider';
import {
  getProductCache,
  getProductCacheKey,
  setProductCache,
} from '../../../services/cache/screenCache';
import { getProductById, getProductBySlug } from '../../../services/api/productsApi';
import { getErrorMessage } from '../../../services/api/errors';
import type { Product } from '../../../services/types/product';
import { applySingleProductPricing } from '../utils/productDisplay';

async function fetchProduct(productId?: string, slug?: string): Promise<Product> {
  if (productId) {
    try {
      return await getProductById(productId);
    } catch (primaryError) {
      if (slug) {
        return getProductBySlug(slug);
      }
      throw primaryError;
    }
  }

  if (slug) {
    return getProductBySlug(slug);
  }

  throw new Error('Product not found');
}

export function useProductDetail(productId?: string, slug?: string) {
  const { userInfo, pricingEpoch } = usePricing();
  const cacheKey = getProductCacheKey(productId, slug);
  const cachedProduct = cacheKey ? getProductCache(cacheKey) : undefined;
  const [rawProduct, setRawProduct] = useState<Product | null>(cachedProduct ?? null);
  const [isRefreshing, setIsRefreshing] = useState(!cachedProduct);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const nextCached = cacheKey ? getProductCache(cacheKey) : undefined;
    setRawProduct(nextCached ?? null);
    setError(null);
    setIsRefreshing(!nextCached);
  }, [cacheKey]);

  const loadProduct = useCallback(async () => {
    if (!productId && !slug) {
      setRawProduct(null);
      setError('Product not found.');
      setIsRefreshing(false);
      return;
    }

    const existingProduct = cacheKey ? getProductCache(cacheKey) ?? rawProduct : rawProduct;
    const hasExistingData = Boolean(existingProduct);

    if (!hasExistingData) {
      setIsRefreshing(true);
    }

    setError(null);

    try {
      const data = await fetchProduct(productId, slug);
      if (cacheKey) {
        setProductCache(cacheKey, data);
      }
      setRawProduct(data);
    } catch (err) {
      if (!hasExistingData) {
        setRawProduct(null);
        setError(getErrorMessage(err, 'Failed to load product'));
      } else {
        setError(getErrorMessage(err, 'Unable to refresh product. Showing saved details.'));
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [cacheKey, productId, rawProduct, slug]);

  useEffect(() => {
    void loadProduct();
  }, [loadProduct]);

  const product = useMemo(() => {
    if (!rawProduct) {
      return null;
    }

    return applySingleProductPricing(rawProduct, userInfo);
  }, [pricingEpoch, rawProduct, userInfo]);

  return {
    product,
    isRefreshing,
    error,
    retry: loadProduct,
  };
}
