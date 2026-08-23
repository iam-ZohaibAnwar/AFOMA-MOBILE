import { useCallback, useEffect, useState } from 'react';

import { getCategories, getChildCategoriesByParent, getSubCategoriesByParent } from '../../../../services/api/categoriesApi';
import { getErrorMessage } from '../../../../services/api/errors';
import type { Category } from '../../../../services/types/category';

export function useSellerProductCategories() {
  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<Category[]>([]);
  const [childCategories, setChildCategories] = useState<Category[]>([]);
  const [isLoadingParents, setIsLoadingParents] = useState(true);
  const [isLoadingSubCategories, setIsLoadingSubCategories] = useState(false);
  const [isLoadingChildCategories, setIsLoadingChildCategories] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadParents = async () => {
      setIsLoadingParents(true);
      setError(null);

      try {
        const data = await getCategories();
        if (!cancelled) {
          setParentCategories(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err, 'Failed to load categories'));
          setParentCategories([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingParents(false);
        }
      }
    };

    void loadParents();

    return () => {
      cancelled = true;
    };
  }, []);

  const loadSubCategories = useCallback(async (parentId: string) => {
    if (!parentId) {
      setSubCategories([]);
      return;
    }

    setIsLoadingSubCategories(true);
    setError(null);

    try {
      const data = await getSubCategoriesByParent(parentId);
      setSubCategories(data);
    } catch (err) {
      setSubCategories([]);
      setError(getErrorMessage(err, 'Failed to load subcategories'));
    } finally {
      setIsLoadingSubCategories(false);
    }
  }, []);

  const loadChildCategories = useCallback(async (subCategoryId: string) => {
    if (!subCategoryId) {
      setChildCategories([]);
      return;
    }

    setIsLoadingChildCategories(true);
    setError(null);

    try {
      const data = await getChildCategoriesByParent(subCategoryId);
      setChildCategories(data);
    } catch (err) {
      setChildCategories([]);
      setError(getErrorMessage(err, 'Failed to load child categories'));
    } finally {
      setIsLoadingChildCategories(false);
    }
  }, []);

  const toSelectOptions = useCallback(
    (items: Category[]) =>
      items
        .filter((item) => item._id)
        .map((item) => ({
          label: item.name?.trim() || 'Category',
          value: item._id!,
        })),
    [],
  );

  return {
    parentCategories,
    subCategories,
    childCategories,
    isLoadingParents,
    isLoadingSubCategories,
    isLoadingChildCategories,
    error,
    loadSubCategories,
    loadChildCategories,
    parentOptions: toSelectOptions(parentCategories),
    subCategoryOptions: toSelectOptions(subCategories),
    childCategoryOptions: toSelectOptions(childCategories),
  };
}
