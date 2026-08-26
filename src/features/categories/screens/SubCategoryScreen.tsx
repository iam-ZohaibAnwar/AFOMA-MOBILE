import { useLayoutEffect, useMemo } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { ShoppingStackParamList } from '../../../app/navigation/types';
import { CategoryProductsPage } from '../components/CategoryProductsPage';
import { useSubCategoryBrowserSections } from '../hooks/useSubCategoryBrowserSections';
import {
  getCategoryDisplayName,
  getCategoryRouteId,
} from '../utils/categoryNavigation';

type Props = NativeStackScreenProps<ShoppingStackParamList, 'SubCategory'>;

export function SubCategoryScreen({ route, navigation }: Props) {
  const { categoryId, categoryName, subCategoryId, subCategoryName } = route.params;
  const { sections } = useSubCategoryBrowserSections(categoryId);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: subCategoryName ?? 'Subcategory',
    });
  }, [navigation, subCategoryName]);

  const activeSection = useMemo(
    () => sections.find((section) => getCategoryRouteId(section.subCategory) === subCategoryId),
    [sections, subCategoryId],
  );

  const childCategoryLinks = useMemo(
    () =>
      (activeSection?.childCategories ?? [])
        .map((childCategory) => {
          const childCategoryId = getCategoryRouteId(childCategory);
          if (!childCategoryId) {
            return null;
          }

          return {
            id: childCategoryId,
            label: getCategoryDisplayName(childCategory),
          };
        })
        .filter((link): link is { id: string; label: string } => link !== null),
    [activeSection],
  );

  return (
    <CategoryProductsPage
      navigation={navigation}
      filters={{ categoryId, subCategoryId }}
      categoryLinks={childCategoryLinks}
      onCategoryLinkPress={(childCategoryId, childCategoryName) => {
        navigation.navigate('ChildCategory', {
          categoryId,
          categoryName,
          subCategoryId,
          subCategoryName,
          childCategoryId,
          childCategoryName,
        });
      }}
      emptyMessage="No products found in this subcategory yet."
    />
  );
}
