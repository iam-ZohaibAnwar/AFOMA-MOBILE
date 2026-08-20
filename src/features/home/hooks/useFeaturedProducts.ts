import { useCallback, useEffect, useState } from 'react';

import { getErrorMessage } from '../../../services/api/errors';
import { getBestSellingProducts } from '../../../services/api/productsApi';
import type { Product } from '../../../services/types/product';
import { filterApprovedProducts } from '../../products/utils/productDisplay';

const FEATURED_LIMIT = 8;

function normalizeProducts(data: unknown): Product[] {
  if (Array.isArray(data)) {
    return data;
  }

  if (data && typeof data === 'object' && 'products' in data) {
    return (data as { products?: Product[] }).products ?? [];
  }

  return [];
}

export function useFeaturedProducts(limit = FEATURED_LIMIT) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFeaturedProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getBestSellingProducts();
      const approved = filterApprovedProducts(normalizeProducts(response));
      setProducts(approved.slice(0, limit));
    } catch (err) {
      setProducts([]);
      setError(getErrorMessage(err, 'Failed to load featured products'));
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    void loadFeaturedProducts();
  }, [loadFeaturedProducts]);

  return {
    products,
    isLoading,
    error,
    retry: loadFeaturedProducts,
  };
}
