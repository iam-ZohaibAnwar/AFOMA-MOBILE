import { useCallback, useEffect, useState } from 'react';

import {
  ensureCategoryTreeLoaded,
  getCachedSubCategoriesByParent,
  getCategoryTreeLoadError,
  isCategoryTreeLoaded,
  subscribeCategoryTree,
} from '../../../services/cache/categoryTreeCache';
import { getErrorMessage } from '../../../services/api/errors';
import type { Category } from '../../../services/types/category';

export function useSubCategories(categoryId: string) {
  const [subCategories, setSubCategories] = useState<Category[]>(() =>
    categoryId ? getCachedSubCategoriesByParent(categoryId) : [],
  );
  const [isLoading, setIsLoading] = useState(
    () => Boolean(categoryId) && !isCategoryTreeLoaded(),
  );
  const [error, setError] = useState<string | null>(() => getCategoryTreeLoadError());

  const syncFromCache = useCallback(() => {
    if (!categoryId) {
      setSubCategories([]);
      setError('Missing category.');
      setIsLoading(false);
      return;
    }

    setSubCategories(getCachedSubCategoriesByParent(categoryId));
    setError(getCategoryTreeLoadError());
    if (isCategoryTreeLoaded()) {
      setIsLoading(false);
    }
  }, [categoryId]);

  const loadSubCategories = useCallback(async () => {
    if (!categoryId) {
      syncFromCache();
      return;
    }

    if (!isCategoryTreeLoaded()) {
      setIsLoading(true);
    }

    setError(null);

    try {
      await ensureCategoryTreeLoaded();
      syncFromCache();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load sub-categories'));
      syncFromCache();
    } finally {
      setIsLoading(false);
    }
  }, [categoryId, syncFromCache]);

  useEffect(() => {
    syncFromCache();
    return subscribeCategoryTree(syncFromCache);
  }, [syncFromCache]);

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
