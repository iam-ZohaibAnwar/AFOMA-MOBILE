import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { getChildCategoriesByParent } from '../../../services/api/categoriesApi';
import type { ShoppingStackParamList } from '../../../app/navigation/types';
import type { Category } from '../../../services/types/category';
import {
  getCategoryDisplayName,
  getCategoryRouteId,
  getNavigableCategories,
} from './categoryNavigation';

export type SubCategoryDestination = 'childCategories' | 'productListing';

type ShoppingNavigation = NativeStackNavigationProp<ShoppingStackParamList>;

export async function resolveSubCategoryDestination(
  subCategoryId: string,
): Promise<SubCategoryDestination> {
  const childCategories = await getChildCategoriesByParent(subCategoryId);
  const navigableChildren = getNavigableCategories(
    Array.isArray(childCategories) ? childCategories : [],
  );

  return navigableChildren.length > 0 ? 'childCategories' : 'productListing';
}

export function navigateFromSubCategory(
  navigation: ShoppingNavigation,
  params: {
    categoryId: string;
    categoryName?: string;
    subCategory: Category;
  },
  destination: SubCategoryDestination,
): void {
  const subCategoryId = getCategoryRouteId(params.subCategory);
  if (!subCategoryId) {
    return;
  }

  const subCategoryName = getCategoryDisplayName(params.subCategory);

  if (destination === 'childCategories') {
    navigation.navigate('ChildCategories', {
      categoryId: params.categoryId,
      categoryName: params.categoryName,
      subCategoryId,
      subCategoryName,
    });
    return;
  }

  navigation.navigate('ProductListing', {
    categoryId: params.categoryId,
    subCategoryId,
    categoryName: params.categoryName,
    subCategoryName,
    title: subCategoryName,
  });
}
