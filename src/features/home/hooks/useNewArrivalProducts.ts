import { useCallback, useEffect, useMemo, useState } from 'react';

import { usePricing } from '../../../app/providers/PricingProvider';
import { getErrorMessage } from '../../../services/api/errors';
import { getNewArrivalProducts } from '../../../services/api/productsApi';
import type { Product } from '../../../services/types/product';
import { applyProductPricing } from '../../products/utils/productDisplay';
import { normalizeFlatProductList } from '../utils/homeProducts';

const NEW_ARRIVAL_LIMIT = 10;

export function useNewArrivalProducts(limit = NEW_ARRIVAL_LIMIT) {
  const { userInfo } = usePricing();
  const [rawProducts, setRawProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const products = useMemo(
    () => applyProductPricing(rawProducts, userInfo),
    [rawProducts, userInfo],
  );

  const loadNewArrivalProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getNewArrivalProducts(limit);
      const normalized = normalizeFlatProductList(response).slice(0, limit);
      setRawProducts(normalized);
    } catch (err) {
      setRawProducts([]);
      setError(getErrorMessage(err, 'Failed to load new arrivals'));
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    void loadNewArrivalProducts();
  }, [loadNewArrivalProducts]);

  return {
    products,
    isLoading,
    error,
    retry: loadNewArrivalProducts,
  };
}
