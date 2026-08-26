import { useCallback, useEffect, useState } from 'react';

import {
  ensureCategoryTreeLoaded,
  getCachedCategorySections,
  getCategoryTreeLoadError,
  isCategoryTreeLoaded,
  subscribeCategoryTree,
} from '../../../services/cache/categoryTreeCache';
import { getErrorMessage } from '../../../services/api/errors';
import type { SubCategoryBrowserSection } from '../types/subCategoryBrowser';

export type { SubCategoryBrowserSection };

export function useSubCategoryBrowserSections(categoryId: string, enabled = true) {
  const [sections, setSections] = useState<SubCategoryBrowserSection[]>(() =>
    categoryId ? getCachedCategorySections(categoryId) : [],
  );
  const [isRefreshing, setIsRefreshing] = useState(
    () => Boolean(enabled && categoryId) && !isCategoryTreeLoaded(),
  );
  const [error, setError] = useState<string | null>(() => getCategoryTreeLoadError());

  const syncFromCache = useCallback(() => {
    if (!enabled || !categoryId) {
      setSections([]);
      setIsRefreshing(false);
      return;
    }

    setSections(getCachedCategorySections(categoryId));
    setError(getCategoryTreeLoadError());
    if (isCategoryTreeLoaded()) {
      setIsRefreshing(false);
    }
  }, [categoryId, enabled]);

  const loadSections = useCallback(async () => {
    if (!categoryId || !enabled) {
      return;
    }

    const hasExistingData = getCachedCategorySections(categoryId).length > 0;
    if (!hasExistingData && !isCategoryTreeLoaded()) {
      setIsRefreshing(true);
    }

    setError(null);

    try {
      await ensureCategoryTreeLoaded();
      syncFromCache();
    } catch (err) {
      if (!hasExistingData) {
        setSections([]);
        setError(getErrorMessage(err, 'Failed to load sub-categories'));
      } else {
        setError(getErrorMessage(err, 'Unable to refresh categories. Showing saved content.'));
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [categoryId, enabled, syncFromCache]);

  useEffect(() => {
    syncFromCache();
    return subscribeCategoryTree(syncFromCache);
  }, [syncFromCache]);

  useEffect(() => {
    if (enabled && categoryId) {
      void loadSections();
    }
  }, [categoryId, enabled, loadSections]);

  return {
    sections,
    isRefreshing,
    isLoading: isRefreshing && sections.length === 0,
    error,
    retry: loadSections,
  };
}
