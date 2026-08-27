import { useEffect, useMemo, useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { ShoppingStackParamList } from '../../../app/navigation/types';
import { CategoryBrowseScreenLayout } from '../components/CategoryBrowseScreenLayout';
import { CategoryProductsWithHeader } from '../components/CategoryProductsWithHeader';
import type { CategoryTabOption } from '../components/CategoryTabBar';
import { useSubCategoryBrowserSections } from '../hooks/useSubCategoryBrowserSections';
import {
  getCategoryDisplayName,
  getCategoryRouteId,
} from '../utils/categoryNavigation';

type Props = NativeStackScreenProps<ShoppingStackParamList, 'SubCategory'>;

export function SubCategoryScreen({ route, navigation }: Props) {
  const { categoryId, categoryName, subCategoryId, subCategoryName, initialChildCategoryId } =
    route.params;
  const { sections } = useSubCategoryBrowserSections(categoryId);
  const [activeTabId, setActiveTabId] = useState(initialChildCategoryId ?? 'all');

  useEffect(() => {
    setActiveTabId(initialChildCategoryId ?? 'all');
  }, [initialChildCategoryId, subCategoryId]);

  const activeSection = useMemo(
    () => sections.find((section) => getCategoryRouteId(section.subCategory) === subCategoryId),
    [sections, subCategoryId],
  );

  const childTabs = useMemo<CategoryTabOption[]>(() => {
    const children = activeSection?.childCategories ?? [];
    if (children.length === 0) {
      return [];
    }

    const tabs: CategoryTabOption[] = [{ id: 'all', label: 'All' }];
    for (const childCategory of children) {
      const childCategoryId = getCategoryRouteId(childCategory);
      if (!childCategoryId) {
        continue;
      }

      tabs.push({
        id: childCategoryId,
        label: getCategoryDisplayName(childCategory),
      });
    }

    return tabs;
  }, [activeSection]);

  const filters = useMemo(() => {
    if (activeTabId !== 'all') {
      return {
        categoryId,
        subCategoryId,
        childCategoryId: activeTabId,
      };
    }

    return { categoryId, subCategoryId };
  }, [activeTabId, categoryId, subCategoryId]);

  const pageTitle = useMemo(() => {
    if (subCategoryName?.trim()) {
      return subCategoryName.trim();
    }

    if (activeSection?.subCategory) {
      return getCategoryDisplayName(activeSection.subCategory);
    }

    return undefined;
  }, [activeSection, subCategoryName]);

  return (
    <CategoryBrowseScreenLayout navigation={navigation}>
      <CategoryProductsWithHeader
        navigation={navigation}
        filters={filters}
        pageTitle={pageTitle}
        tabs={childTabs}
        activeTabId={activeTabId}
        onTabChange={setActiveTabId}
        emptyMessage="No products found in this subcategory yet."
      />
    </CategoryBrowseScreenLayout>
  );
}
