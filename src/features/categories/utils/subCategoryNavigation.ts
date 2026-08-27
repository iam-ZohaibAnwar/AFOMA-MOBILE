import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import {
  ensureCategoryTreeLoaded,
  getCachedSubCategoriesByParent,
  isCategoryTreeLoaded,
} from '../../../services/cache/categoryTreeCache';
import type { ShoppingStackParamList } from '../../../app/navigation/types';
import type { Category } from '../../../services/types/category';
import {
  formatCategoryDisplayName,
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
  const childName = params.childCategoryName?.trim();
  const subName = params.subCategoryName?.trim();
  const categoryName = params.categoryName?.trim();

  return (
    (childName ? formatCategoryDisplayName(childName) : undefined) ??
    (subName ? formatCategoryDisplayName(subName) : undefined) ??
    (categoryName ? formatCategoryDisplayName(categoryName) : undefined) ??
    'Products'
  );
}

export function navigateToCategoryProductListing(
  navigation: ShoppingNavigation,
  params: CategoryListingParams,
): void {
  if (params.childCategoryId && params.subCategoryId) {
    navigation.navigate('SubCategory', {
      categoryId: params.categoryId,
      subCategoryId: params.subCategoryId,
      categoryName: params.categoryName,
      subCategoryName: params.subCategoryName,
      initialChildCategoryId: params.childCategoryId,
    });
    return;
  }

  if (params.subCategoryId) {
    navigation.navigate('SubCategory', {
      categoryId: params.categoryId,
      subCategoryId: params.subCategoryId,
      categoryName: params.categoryName,
      subCategoryName: params.subCategoryName,
    });
    return;
  }

  navigation.navigate('SubCategories', {
    categoryId: params.categoryId,
    categoryName: params.categoryName,
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

export function navigateToParentCategory(
  navigation: ShoppingNavigation,
  category: Category,
): void {
  const categoryId = getCategoryRouteId(category);
  if (!categoryId) {
    return;
  }

  navigation.navigate('SubCategories', {
    categoryId,
    categoryName: getCategoryDisplayName(category),
  });
}

export function navigateFromCategory(
  navigation: ShoppingNavigation,
  category: Category,
  _destination: CategoryListingDestination,
): void {
  navigateToParentCategory(navigation, category);
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

  navigation.navigate('SubCategory', {
    categoryId: params.categoryId,
    categoryName: params.categoryName,
    subCategoryId,
    subCategoryName: getCategoryDisplayName(params.subCategory),
    initialChildCategoryId: childCategoryId,
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

  navigation.navigate('SubCategory', {
    categoryId: params.categoryId,
    categoryName: params.categoryName,
    subCategoryId,
    subCategoryName: getCategoryDisplayName(params.subCategory),
  });
}
