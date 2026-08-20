import { useCallback, useEffect, useState } from 'react';

import {
  getRelatedProducts,
  globalProductSearch,
} from '../../../services/api/productsApi';
import { getErrorMessage } from '../../../services/api/errors';
import type { Product } from '../../../services/types/product';
import { filterApprovedProducts } from '../utils/productDisplay';

export interface ProductListingFilters {
  categoryId?: string;
  subCategoryId?: string;
  childCategoryId?: string;
  searchQuery?: string;
}

export function useProductListing(filters: ProductListingFilters) {
  const { categoryId, subCategoryId, childCategoryId, searchQuery } = filters;
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let nextProducts: Product[] = [];

      if (searchQuery?.trim()) {
        const response = await globalProductSearch(searchQuery.trim());
        nextProducts = response.matchedProducts ?? [];
      } else {
        const listingId = childCategoryId ?? subCategoryId ?? categoryId;
        if (!listingId) {
          setProducts([]);
          setError('No listing filters provided.');
          setIsLoading(false);
          return;
        }

        nextProducts = await getRelatedProducts(listingId, { page: 1, limit: 100 });
      }

      setProducts(filterApprovedProducts(nextProducts));
    } catch (err) {
      setProducts([]);
      setError(getErrorMessage(err, 'Failed to load products'));
    } finally {
      setIsLoading(false);
    }
  }, [categoryId, childCategoryId, searchQuery, subCategoryId]);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  return {
    products,
    isLoading,
    error,
    retry: loadProducts,
  };
}
