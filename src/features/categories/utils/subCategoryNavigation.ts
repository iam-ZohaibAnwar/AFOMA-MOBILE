import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import {
  ensureCategoryTreeLoaded,
  getCachedSubCategoriesByParent,
  isCategoryTreeLoaded,
} from '../../../services/cache/categoryTreeCache';
import type { ShoppingStackParamList } from '../../../app/navigation/types';
import type { Category } from '../../../services/types/category';
import {
  getCategoryDisplayName,
  getCategoryRouteId,
  getNavigableCategories,
} from './categoryNavigation';

export type CategoryListingDestination = 'subCategories' | 'productListing';

type ShoppingNavigation = NativeStackNavigationProp<ShoppingStackParamList>;

export interface CategoryListingParams {
  categoryId: string;
  categoryName?: string;
  subCategoryId?: string;
  subCategoryName?: string;
  childCategoryId?: string;
  childCategoryName?: string;
}

export function getCategoryListingTitle(params: CategoryListingParams): string {
  return (
    params.childCategoryName ??
    params.subCategoryName ??
    params.categoryName ??
    'Products'
  );
}

export function navigateToCategoryProductListing(
  navigation: ShoppingNavigation,
  params: CategoryListingParams,
): void {
  navigation.navigate('ProductListing', {
    categoryId: params.categoryId,
    subCategoryId: params.subCategoryId,
    childCategoryId: params.childCategoryId,
    categoryName: params.categoryName,
    subCategoryName: params.subCategoryName,
    childCategoryName: params.childCategoryName,
    title: getCategoryListingTitle(params),
  });
}

export async function resolveCategoryDestination(
  categoryId: string,
): Promise<CategoryListingDestination> {
  if (isCategoryTreeLoaded()) {
    const navigableSubCategories = getNavigableCategories(
      getCachedSubCategoriesByParent(categoryId),
    );
    return navigableSubCategories.length > 0 ? 'subCategories' : 'productListing';
  }

  await ensureCategoryTreeLoaded();
  const navigableSubCategories = getNavigableCategories(
    getCachedSubCategoriesByParent(categoryId),
  );

  return navigableSubCategories.length > 0 ? 'subCategories' : 'productListing';
}

export function navigateFromCategory(
  navigation: ShoppingNavigation,
  category: Category,
  destination: CategoryListingDestination,
): void {
  const categoryId = getCategoryRouteId(category);
  if (!categoryId) {
    return;
  }

  const categoryName = getCategoryDisplayName(category);

  if (destination === 'productListing') {
    navigateToCategoryProductListing(navigation, { categoryId, categoryName });
    return;
  }

  navigation.navigate('SubCategories', {
    categoryId,
    categoryName,
  });
}

export function navigateFromSubCategorySectionChild(
  navigation: ShoppingNavigation,
  params: {
    categoryId: string;
    categoryName?: string;
    subCategory: Category;
    childCategory: Category;
  },
): void {
  const subCategoryId = getCategoryRouteId(params.subCategory);
  const childCategoryId = getCategoryRouteId(params.childCategory);
  if (!subCategoryId || !childCategoryId) {
    return;
  }

  navigateToCategoryProductListing(navigation, {
    categoryId: params.categoryId,
    categoryName: params.categoryName,
    subCategoryId,
    subCategoryName: getCategoryDisplayName(params.subCategory),
    childCategoryId,
    childCategoryName: getCategoryDisplayName(params.childCategory),
  });
}

export function navigateFromSubCategorySection(
  navigation: ShoppingNavigation,
  params: {
    categoryId: string;
    categoryName?: string;
    subCategory: Category;
  },
): void {
  const subCategoryId = getCategoryRouteId(params.subCategory);
  if (!subCategoryId) {
    return;
  }

  navigateToCategoryProductListing(navigation, {
    categoryId: params.categoryId,
    categoryName: params.categoryName,
    subCategoryId,
    subCategoryName: getCategoryDisplayName(params.subCategory),
  });
}
