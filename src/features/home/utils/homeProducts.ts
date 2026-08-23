import type { Product } from '../../../services/types/product';

/** Unwrap best-seller wrapper objects from `/products/best/Product`. */
export function unwrapHomeProductItem(item: unknown): Product | null {
  if (!item || typeof item !== 'object') {
    return null;
  }

  const record = item as Record<string, unknown>;
  const details = record.productDetails ?? record.product ?? record;
  if (!details || typeof details !== 'object') {
    return null;
  }

  return details as Product;
}

export function normalizeFlatProductList(data: unknown): Product[] {
  if (Array.isArray(data)) {
    return data.filter(Boolean) as Product[];
  }

  if (data && typeof data === 'object' && 'products' in data) {
    return ((data as { products?: Product[] }).products ?? []).filter(Boolean);
  }

  return [];
}

export function normalizeBestSellerProducts(data: unknown): Product[] {
  const source = Array.isArray(data)
    ? data
    : data && typeof data === 'object' && 'products' in data
      ? ((data as { products?: unknown[] }).products ?? [])
      : [];

  return source
    .map((item) => unwrapHomeProductItem(item))
    .filter((product): product is Product => Boolean(product?.productName || product?.slug));
}

export interface PopularHomeCategoryItem {
  categoryId: string;
  subCategoryId: string;
  categoryName: string;
  subCategoryName: string;
  displayName: string;
}

export function normalizePopularHomeCategories(data: unknown): PopularHomeCategoryItem[] {
  const source = Array.isArray(data)
    ? data
    : data && typeof data === 'object' && 'products' in data
      ? ((data as { products?: unknown[] }).products ?? [])
      : [];

  const items: PopularHomeCategoryItem[] = [];

  for (const entry of source) {
    if (!entry || typeof entry !== 'object') {
      continue;
    }

    const record = entry as Record<string, any>;
    const category = record.productDetails?.Category ?? record.Category;
    const subCategory = record.productDetails?.SubCategory ?? record.SubCategory;
    const categoryId = category?._id ?? category?.slug;
    const subCategoryId = subCategory?._id ?? subCategory?.slug;
    const categoryName = category?.name ?? 'Category';
    const subCategoryName = subCategory?.name ?? 'Collection';

    if (!categoryId || !subCategoryId) {
      continue;
    }

    items.push({
      categoryId: String(categoryId),
      subCategoryId: String(subCategoryId),
      categoryName,
      subCategoryName,
      displayName: subCategoryName,
    });
  }

  return items;
}
