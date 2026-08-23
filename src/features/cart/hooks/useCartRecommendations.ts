import { useCallback, useEffect, useMemo, useState } from 'react';

import { usePricing } from '../../../app/providers/PricingProvider';
import { getErrorMessage } from '../../../services/api/errors';
import { getDiscountedProducts } from '../../../services/api/productsApi';
import type { Product } from '../../../services/types/product';
import { applyProductPricing, getProductRouteId } from '../../products/utils/productDisplay';
import { normalizeFlatProductList } from '../../home/utils/homeProducts';

const FETCH_LIMIT = 12;
const DISPLAY_LIMIT = 3;

export function useCartRecommendations(excludedProductIds: string[]) {
  const { userInfo } = usePricing();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const excludedIds = useMemo(
    () => new Set(excludedProductIds.filter(Boolean)),
    [excludedProductIds],
  );

  const loadRecommendations = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await getDiscountedProducts(FETCH_LIMIT);
      const normalized = normalizeFlatProductList(response);
      const priced = applyProductPricing(normalized, userInfo);
      const filtered = priced.filter((product) => {
        const id = getProductRouteId(product);
        return id ? !excludedIds.has(id) : true;
      });

      setProducts(filtered.slice(0, DISPLAY_LIMIT));
    } catch (err) {
      setProducts([]);
      if (__DEV__) {
        console.warn(getErrorMessage(err, 'Failed to load cart recommendations'));
      }
    } finally {
      setIsLoading(false);
    }
  }, [excludedIds, userInfo]);

  useEffect(() => {
    void loadRecommendations();
  }, [loadRecommendations]);

  return {
    products,
    isLoading,
  };
}
