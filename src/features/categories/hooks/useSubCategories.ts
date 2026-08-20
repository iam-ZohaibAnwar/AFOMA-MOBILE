import { useCallback, useEffect, useState } from 'react';

import { getSubCategoriesByParent } from '../../../services/api/categoriesApi';
import { getErrorMessage } from '../../../services/api/errors';
import type { Category } from '../../../services/types/category';

export function useSubCategories(categoryId: string) {
  const [subCategories, setSubCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSubCategories = useCallback(async () => {
    if (!categoryId) {
      setSubCategories([]);
      setError('Missing category.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await getSubCategoriesByParent(categoryId);
      setSubCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      setSubCategories([]);
      setError(getErrorMessage(err, 'Failed to load sub-categories'));
    } finally {
      setIsLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    void loadSubCategories();
  }, [loadSubCategories]);

  return {
    subCategories,
    isLoading,
    error,
    retry: loadSubCategories,
  };
}
