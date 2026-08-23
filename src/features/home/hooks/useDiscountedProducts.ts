import { useCallback, useEffect, useMemo, useState } from 'react';

import { usePricing } from '../../../app/providers/PricingProvider';
import { getErrorMessage } from '../../../services/api/errors';
import { getDiscountedProducts } from '../../../services/api/productsApi';
import type { Product } from '../../../services/types/product';
import { applyProductPricing } from '../../products/utils/productDisplay';
import { normalizeFlatProductList } from '../utils/homeProducts';

const DISCOUNTED_FETCH = 30;
const HOME_PREVIEW_LIMIT = 2;

function sortByDiscountDesc(products: Product[]): Product[] {
  return [...products].sort(
    (a, b) => Number(b.discountCode ?? 0) - Number(a.discountCode ?? 0),
  );
}

export function useDiscountedProducts(previewLimit = HOME_PREVIEW_LIMIT) {
  const { userInfo } = usePricing();
  const [rawProducts, setRawProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const products = useMemo(() => {
    const priced = applyProductPricing(sortByDiscountDesc(rawProducts), userInfo);
    return priced.slice(0, previewLimit);
  }, [previewLimit, rawProducts, userInfo]);

  const loadDiscountedProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getDiscountedProducts(DISCOUNTED_FETCH);
      setRawProducts(normalizeFlatProductList(response));
    } catch (err) {
      setRawProducts([]);
      setError(getErrorMessage(err, 'Failed to load discounted products'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDiscountedProducts();
  }, [loadDiscountedProducts]);

  return {
    products,
    isLoading,
    error,
    retry: loadDiscountedProducts,
  };
}
