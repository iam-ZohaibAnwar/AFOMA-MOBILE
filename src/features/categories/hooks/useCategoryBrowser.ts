import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  getChildCategoriesByParent,
  getSubCategoriesByParent,
} from '../../../services/api/categoriesApi';
import { getErrorMessage } from '../../../services/api/errors';
import type { Category } from '../../../services/types/category';
import {
  getCategoryRouteId,
  getNavigableCategories,
} from '../utils/categoryNavigation';
import { useCategories } from './useCategories';

import type { SubCategoryBrowserSection } from '../types/subCategoryBrowser';

export type { SubCategoryBrowserSection };

export function useCategoryBrowser() {
  const { categories, isLoading, error, retry } = useCategories();
  const navigableCategories = useMemo(
    () => getNavigableCategories(categories),
    [categories],
  );

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [sections, setSections] = useState<SubCategoryBrowserSection[]>([]);
  const [sectionsLoading, setSectionsLoading] = useState(false);
  const [sectionsError, setSectionsError] = useState<string | null>(null);

  const loadSections = useCallback(async (categoryId: string) => {
    setSectionsLoading(true);
    setSectionsError(null);

    try {
      const subCategories = await getSubCategoriesByParent(categoryId);
      const navigableSubCategories = getNavigableCategories(
        Array.isArray(subCategories) ? subCategories : [],
      );

      const sectionResults = await Promise.all(
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

      setSections(sectionResults);
    } catch (err) {
      setSections([]);
      setSectionsError(getErrorMessage(err, 'Failed to load sub-categories'));
    } finally {
      setSectionsLoading(false);
    }
  }, []);

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

    void loadSections(selectedCategoryId);
  }, [loadSections, selectedCategoryId]);

  const selectedCategory = useMemo(
    () =>
      navigableCategories.find(
        (category) => getCategoryRouteId(category) === selectedCategoryId,
      ),
    [navigableCategories, selectedCategoryId],
  );

  const retrySections = useCallback(() => {
    if (selectedCategoryId) {
      void loadSections(selectedCategoryId);
    }
  }, [loadSections, selectedCategoryId]);

  return {
    categories: navigableCategories,
    selectedCategoryId,
    selectedCategory,
    setSelectedCategoryId,
    sections,
    sectionsLoading,
    sectionsError,
    retrySections,
    isLoading,
    error,
    retry,
  };
}
