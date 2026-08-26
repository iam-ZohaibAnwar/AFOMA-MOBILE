import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  ensureCategoryTreeLoaded,
  getCachedCategorySections,
  getCachedParentCategories,
  getCategoryTreeLoadError,
  isCategoryTreeLoaded,
  subscribeCategoryTree,
} from '../../../services/cache/categoryTreeCache';
import { getErrorMessage } from '../../../services/api/errors';
import type { Category } from '../../../services/types/category';
import {
  getCategoryRouteId,
  getNavigableCategories,
} from '../utils/categoryNavigation';

import type { SubCategoryBrowserSection } from '../types/subCategoryBrowser';

export type { SubCategoryBrowserSection };

export function useCategoryBrowser() {
  const [categories, setCategories] = useState<Category[]>(() =>
    getNavigableCategories(getCachedParentCategories()),
  );
  const [isLoading, setIsLoading] = useState(() => !isCategoryTreeLoaded());
  const [error, setError] = useState<string | null>(() => getCategoryTreeLoadError());

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [sections, setSections] = useState<SubCategoryBrowserSection[]>([]);
  const [sectionsError, setSectionsError] = useState<string | null>(null);

  const navigableCategories = useMemo(
    () => getNavigableCategories(categories),
    [categories],
  );

  const syncFromCache = useCallback(() => {
    setCategories(getNavigableCategories(getCachedParentCategories()));
    setError(getCategoryTreeLoadError());
    if (isCategoryTreeLoaded()) {
      setIsLoading(false);
    }
  }, []);

  const loadTree = useCallback(async () => {
    if (!isCategoryTreeLoaded()) {
      setIsLoading(true);
    }

    setError(null);
    setSectionsError(null);

    try {
      await ensureCategoryTreeLoaded();
      syncFromCache();
    } catch (err) {
      const message = getErrorMessage(err, 'Failed to load categories');
      setError(message);
      setSectionsError(message);
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
    void loadTree();
  }, [loadTree]);

  useEffect(() => {
    if (navigableCategories.length === 0) {
      setSelectedCategoryId(null);
      setSections([]);
      return;
    }

    setSelectedCategoryId((current) => {
      if (current && navigableCategories.some((category) => getCategoryRouteId(category) === current)) {
        return current;
      }

      return getCategoryRouteId(navigableCategories[0]) ?? null;
    });
  }, [navigableCategories]);

  useEffect(() => {
    if (!selectedCategoryId) {
      setSections([]);
      return;
    }

    setSections(getCachedCategorySections(selectedCategoryId));
  }, [selectedCategoryId, categories]);

  const selectedCategory = useMemo(
    () =>
      navigableCategories.find(
        (category) => getCategoryRouteId(category) === selectedCategoryId,
      ),
    [navigableCategories, selectedCategoryId],
  );

  const retrySections = useCallback(() => {
    void loadTree();
  }, [loadTree]);

  return {
    categories: navigableCategories,
    selectedCategoryId,
    selectedCategory,
    setSelectedCategoryId,
    sections,
    sectionsLoading: false,
    sectionsError,
    retrySections,
    isLoading,
    error,
    retry: loadTree,
  };
}
