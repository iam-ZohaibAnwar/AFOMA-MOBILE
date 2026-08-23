import { useCallback, useEffect, useMemo, useState } from 'react';

import { usePricing } from '../../../app/providers/PricingProvider';
import { getErrorMessage } from '../../../services/api/errors';
import { getBestProducts } from '../../../services/api/productsApi';
import type { Product } from '../../../services/types/product';
import { applyProductPricing } from '../../products/utils/productDisplay';
import { normalizeBestSellerProducts } from '../utils/homeProducts';

/** Home preview shows two products side-by-side. */
const BEST_SELLER_HOME_LIMIT = 2;

/** Kept for hot-reload compatibility when older bundles reference this name. */
export const BEST_SELLER_LIMIT = BEST_SELLER_HOME_LIMIT;

export function useBestSellerProducts(limit: number = BEST_SELLER_HOME_LIMIT) {
  const { userInfo } = usePricing();
  const [rawProducts, setRawProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const products = useMemo(
    () => applyProductPricing(rawProducts, userInfo),
    [rawProducts, userInfo],
  );

  const loadBestSellerProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getBestProducts();
      const normalized = normalizeBestSellerProducts(response).slice(0, limit);
      setRawProducts(normalized);
    } catch (err) {
      setRawProducts([]);
      setError(getErrorMessage(err, 'Failed to load best sellers'));
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    void loadBestSellerProducts();
  }, [loadBestSellerProducts]);

  return {
    products,
    isLoading,
    error,
    retry: loadBestSellerProducts,
  };
}
