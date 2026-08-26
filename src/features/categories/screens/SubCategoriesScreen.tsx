import { useLayoutEffect, useMemo } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { ShoppingStackParamList } from '../../../app/navigation/types';
import { CategoryProductsPage } from '../components/CategoryProductsPage';
import { useSubCategoryBrowserSections } from '../hooks/useSubCategoryBrowserSections';
import {
  getCategoryDisplayName,
  getCategoryRouteId,
} from '../utils/categoryNavigation';

type Props = NativeStackScreenProps<ShoppingStackParamList, 'SubCategories'>;

export function SubCategoriesScreen({ route, navigation }: Props) {
  const { categoryId, categoryName } = route.params;
  const { sections } = useSubCategoryBrowserSections(categoryId);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: categoryName ?? 'Category',
    });
  }, [categoryName, navigation]);

  const subCategoryLinks = useMemo(
    () =>
      sections
        .map((section) => {
          const subCategoryId = getCategoryRouteId(section.subCategory);
          if (!subCategoryId) {
            return null;
          }

          return {
            id: subCategoryId,
            label: getCategoryDisplayName(section.subCategory),
          };
        })
        .filter((link): link is { id: string; label: string } => link !== null),
    [sections],
  );

  return (
    <CategoryProductsPage
      navigation={navigation}
      filters={{ categoryId }}
      categoryLinks={subCategoryLinks}
      onCategoryLinkPress={(subCategoryId, subCategoryName) => {
        navigation.navigate('SubCategory', {
          categoryId,
          categoryName,
          subCategoryId,
          subCategoryName,
        });
      }}
      emptyMessage="No products found in this category yet."
    />
  );
}
