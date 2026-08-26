import type { Category } from '../../../services/types/category';

export function getCategoryRouteId(category: Category): string | undefined {
  return category._id ?? category.slug;
}

export function getCategoryDisplayName(category: Category): string {
  const extended = category as Category & {
    SubCategoryName?: string;
    ChildCategoryName?: string;
  };

  return (
    category.name?.trim() ||
    extended.SubCategoryName?.trim() ||
    extended.ChildCategoryName?.trim() ||
    category.slug ||
    'Category'
  );
}

export function getNavigableCategories(categories: Category[]): Category[] {
  return categories.filter((category) => Boolean(getCategoryRouteId(category)));
}
