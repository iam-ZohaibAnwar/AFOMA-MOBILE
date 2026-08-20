import { useCallback, useEffect, useState } from 'react';

import { getCategories } from '../../../services/api/categoriesApi';
import { getErrorMessage } from '../../../services/api/errors';
import type { Category } from '../../../services/types/category';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      setCategories([]);
      setError(getErrorMessage(err, 'Failed to load categories'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  return {
    categories,
    isLoading,
    error,
    retry: loadCategories,
  };
}
