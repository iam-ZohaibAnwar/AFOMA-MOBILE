/**
 * Category hierarchy types — minimal fields from web usage.
 * TODO: Verify full category document shape from backend.
 */
export interface Category {
  _id?: string;
  name?: string;
  slug?: string;
}

export type CategoryListResponse = Category[];
