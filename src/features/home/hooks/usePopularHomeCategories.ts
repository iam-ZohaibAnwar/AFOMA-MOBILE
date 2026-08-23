import { useCallback, useEffect, useState } from 'react';

import { getErrorMessage } from '../../../services/api/errors';
import { getBestSellingProducts } from '../../../services/api/productsApi';
import {
  normalizePopularHomeCategories,
  type PopularHomeCategoryItem,
} from '../utils/homeProducts';

const POPULAR_CATEGORY_LIMIT = 6;

export function usePopularHomeCategories(limit = POPULAR_CATEGORY_LIMIT) {
  const [categories, setCategories] = useState<PopularHomeCategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPopularCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getBestSellingProducts();
      setCategories(normalizePopularHomeCategories(response).slice(0, limit));
    } catch (err) {
      setCategories([]);
      setError(getErrorMessage(err, 'Failed to load categories'));
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    void loadPopularCategories();
  }, [loadPopularCategories]);

  return {
    categories,
    isLoading,
    error,
    retry: loadPopularCategories,
  };
}
