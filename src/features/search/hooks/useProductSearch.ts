import { useCallback, useEffect, useState } from 'react';

import { globalProductSearch } from '../../../services/api/productsApi';
import { getErrorMessage } from '../../../services/api/errors';
import type { Product } from '../../../services/types/product';
import { filterApprovedProducts } from '../../products/utils/productDisplay';

export function useProductSearch(query: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const searchProducts = useCallback(async () => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setProducts([]);
      setError(null);
      setHasSearched(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const response = await globalProductSearch(trimmedQuery);
      setProducts(filterApprovedProducts(response.matchedProducts ?? []));
    } catch (err) {
      setProducts([]);
      setError(getErrorMessage(err, 'Failed to search products'));
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  useEffect(() => {
    void searchProducts();
  }, [searchProducts]);

  return {
    products,
    isLoading,
    error,
    hasSearched,
    retry: searchProducts,
  };
}
