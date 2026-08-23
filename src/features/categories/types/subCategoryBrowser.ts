import type { Category } from '../../../services/types/category';

export interface SubCategoryBrowserSection {
  subCategory: Category;
  childCategories: Category[];
}
