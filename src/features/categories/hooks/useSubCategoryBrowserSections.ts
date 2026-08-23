import { useCallback, useEffect, useState } from 'react';

import {
  getCategorySectionsCache,
  setCategorySectionsCache,
} from '../../../services/cache/screenCache';
import {
  getChildCategoriesByParent,
  getSubCategoriesByParent,
} from '../../../services/api/categoriesApi';
import { getErrorMessage } from '../../../services/api/errors';
import {
  getCategoryRouteId,
  getNavigableCategories,
} from '../utils/categoryNavigation';
import type { SubCategoryBrowserSection } from '../types/subCategoryBrowser';

export type { SubCategoryBrowserSection };

async function fetchCategorySections(categoryId: string): Promise<SubCategoryBrowserSection[]> {
  const subCategories = await getSubCategoriesByParent(categoryId);
  const navigableSubCategories = getNavigableCategories(
    Array.isArray(subCategories) ? subCategories : [],
  );

  return Promise.all(
    navigableSubCategories.map(async (subCategory) => {
      const subCategoryId = getCategoryRouteId(subCategory);
      if (!subCategoryId) {
        return { subCategory, childCategories: [] };
      }

      const childCategories = await getChildCategoriesByParent(subCategoryId);
      return {
        subCategory,
        childCategories: getNavigableCategories(
          Array.isArray(childCategories) ? childCategories : [],
        ),
      };
    }),
  );
}

export function useSubCategoryBrowserSections(categoryId: string, enabled = true) {
  const cachedSections = categoryId ? getCategorySectionsCache(categoryId) : undefined;
  const [sections, setSections] = useState<SubCategoryBrowserSection[]>(cachedSections ?? []);
  const [isRefreshing, setIsRefreshing] = useState(Boolean(enabled && categoryId && !cachedSections));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const nextCache = categoryId ? getCategorySectionsCache(categoryId) : undefined;
    setSections(nextCache ?? []);
    setError(null);
    setIsRefreshing(Boolean(enabled && categoryId && !nextCache));
  }, [categoryId, enabled]);

  const loadSections = useCallback(async () => {
    if (!categoryId || !enabled) {
      return;
    }

    const existingSections = getCategorySectionsCache(categoryId) ?? [];
    const hasExistingData = existingSections.length > 0;

    if (!hasExistingData) {
      setIsRefreshing(true);
    }

    setError(null);

    try {
      const sectionResults = await fetchCategorySections(categoryId);
      setCategorySectionsCache(categoryId, sectionResults);
      setSections(sectionResults);
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
  }, [categoryId, enabled]);

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
