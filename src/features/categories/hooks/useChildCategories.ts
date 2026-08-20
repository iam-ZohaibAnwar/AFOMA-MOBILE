import { useCallback, useEffect, useState } from 'react';

import { getChildCategoriesByParent } from '../../../services/api/categoriesApi';
import { getErrorMessage } from '../../../services/api/errors';
import type { Category } from '../../../services/types/category';

export function useChildCategories(subCategoryId: string) {
  const [childCategories, setChildCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadChildCategories = useCallback(async () => {
    if (!subCategoryId) {
      setChildCategories([]);
      setError('Missing sub-category.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await getChildCategoriesByParent(subCategoryId);
      setChildCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      setChildCategories([]);
      setError(getErrorMessage(err, 'Failed to load child categories'));
    } finally {
      setIsLoading(false);
    }
  }, [subCategoryId]);

  useEffect(() => {
    void loadChildCategories();
  }, [loadChildCategories]);

  return {
    childCategories,
    isLoading,
    error,
    retry: loadChildCategories,
  };
}
