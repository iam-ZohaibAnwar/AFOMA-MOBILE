import { useCallback, useEffect, useState } from 'react';

import {
  ensureCategoryTreeLoaded,
  getCachedParentCategories,
  getCategoryTreeLoadError,
  isCategoryTreeLoaded,
  subscribeCategoryTree,
} from '../../../services/cache/categoryTreeCache';
import { getErrorMessage } from '../../../services/api/errors';
import type { Category } from '../../../services/types/category';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>(() => getCachedParentCategories());
  const [isLoading, setIsLoading] = useState(() => !isCategoryTreeLoaded());
  const [error, setError] = useState<string | null>(() => getCategoryTreeLoadError());

  const syncFromCache = useCallback(() => {
    setCategories(getCachedParentCategories());
    setError(getCategoryTreeLoadError());
    if (isCategoryTreeLoaded()) {
      setIsLoading(false);
    }
  }, []);

  const loadCategories = useCallback(async () => {
    if (!isCategoryTreeLoaded()) {
      setIsLoading(true);
    }

    setError(null);

    try {
      await ensureCategoryTreeLoaded();
      syncFromCache();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load categories'));
      syncFromCache();
    } finally {
      setIsLoading(false);
    }
  }, [syncFromCache]);

  useEffect(() => {
    syncFromCache();
    return subscribeCategoryTree(syncFromCache);
  }, [syncFromCache]);

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
