import { useCallback, useEffect, useState } from 'react';

import {
  ensureCategoryTreeLoaded,
  getCachedChildCategoriesBySubCategory,
  getCategoryTreeLoadError,
  isCategoryTreeLoaded,
  subscribeCategoryTree,
} from '../../../services/cache/categoryTreeCache';
import { getErrorMessage } from '../../../services/api/errors';
import type { Category } from '../../../services/types/category';

export function useChildCategories(subCategoryId: string) {
  const [childCategories, setChildCategories] = useState<Category[]>(() =>
    subCategoryId ? getCachedChildCategoriesBySubCategory(subCategoryId) : [],
  );
  const [isLoading, setIsLoading] = useState(
    () => Boolean(subCategoryId) && !isCategoryTreeLoaded(),
  );
  const [error, setError] = useState<string | null>(() => getCategoryTreeLoadError());

  const syncFromCache = useCallback(() => {
    if (!subCategoryId) {
      setChildCategories([]);
      setError('Missing sub-category.');
      setIsLoading(false);
      return;
    }

    setChildCategories(getCachedChildCategoriesBySubCategory(subCategoryId));
    setError(getCategoryTreeLoadError());
    if (isCategoryTreeLoaded()) {
      setIsLoading(false);
    }
  }, [subCategoryId]);

  const loadChildCategories = useCallback(async () => {
    if (!subCategoryId) {
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
      setError(getErrorMessage(err, 'Failed to load child categories'));
      syncFromCache();
    } finally {
      setIsLoading(false);
    }
  }, [subCategoryId, syncFromCache]);

  useEffect(() => {
    syncFromCache();
    return subscribeCategoryTree(syncFromCache);
  }, [syncFromCache]);

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
