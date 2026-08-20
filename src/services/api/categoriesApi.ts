import type { Category, CategoryListResponse } from '../types/category';
import { apiGet } from './request';

/** GET /categories */
export async function getCategories(): Promise<CategoryListResponse> {
  return apiGet<CategoryListResponse>('/categories', undefined, 'Failed to load categories');
}

/** GET /sub-categories */
export async function getSubCategories(): Promise<CategoryListResponse> {
  return apiGet<CategoryListResponse>('/sub-categories', undefined, 'Failed to load sub-categories');
}

/** GET /child-category */
export async function getChildCategories(): Promise<CategoryListResponse> {
  return apiGet<CategoryListResponse>('/child-category', undefined, 'Failed to load child categories');
}

/** GET /sub-categories/search/parent/{parentId} */
export async function getSubCategoriesByParent(parentId: string): Promise<Category[]> {
  return apiGet<Category[]>(
    `/sub-categories/search/parent/${encodeURIComponent(parentId)}`,
    undefined,
    'Failed to load sub-categories for parent',
  );
}

/** GET /child-category/search/parent/{parentId} */
export async function getChildCategoriesByParent(parentId: string): Promise<Category[]> {
  return apiGet<Category[]>(
    `/child-category/search/parent/${encodeURIComponent(parentId)}`,
    undefined,
    'Failed to load child categories for parent',
  );
}
