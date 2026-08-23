import { getCategories, getSubCategoriesByParent } from '../../../../services/api/categoriesApi';
import type { Category } from '../../../../services/types/category';
import { createEmptyCustomizableProductForm } from '../../../seller/products/types/customizableProductForm';
import { createEmptyDownloadableProductForm } from '../../../seller/products/types/downloadableProductForm';
import { createEmptyStandardProductForm } from '../../../seller/products/types/standardProductForm';
import type {
  AdminProductAiListingResponse,
  AdminProductAiListingType,
  AdminProductAiPrefill,
} from '../types/adminProductAiPrefill';
import type { StandardProductImageEntry } from '../../../seller/products/types/standardProductForm';

function normalizeName(value?: string): string {
  return value?.trim().toLowerCase().replace(/\s+/g, ' ') ?? '';
}

function findCategoryByName(categories: Category[], name?: string): Category | undefined {
  const target = normalizeName(name);
  if (!target) {
    return undefined;
  }

  return categories.find((category) => {
    const categoryName = normalizeName(category.name);
    return categoryName === target || categoryName.includes(target) || target.includes(categoryName);
  });
}

export async function resolveAdminAiListingCategoryIds(
  categoryName?: string,
  subcategoryName?: string,
  apiCategoryId?: string,
  apiSubCategoryId?: string,
): Promise<{ categoryId: string; subCategoryId: string }> {
  if (apiCategoryId?.trim() && apiSubCategoryId?.trim()) {
    return {
      categoryId: apiCategoryId.trim(),
      subCategoryId: apiSubCategoryId.trim(),
    };
  }

  const parents = await getCategories();
  const parentList = Array.isArray(parents) ? parents : [];
  const parent = findCategoryByName(parentList, categoryName);

  if (!parent?._id) {
    return { categoryId: '', subCategoryId: '' };
  }

  const subs = await getSubCategoriesByParent(parent._id);
  const sub = findCategoryByName(subs, subcategoryName);

  return {
    categoryId: parent._id,
    subCategoryId: sub?._id?.trim() ?? '',
  };
}

function extractCommodityCode(data: AdminProductAiListingResponse): string {
  if (typeof data.hsCode === 'string') {
    return data.hsCode.replace(/\D/g, '').slice(0, 10);
  }

  if (data.hsCode?.code != null) {
    return String(data.hsCode.code).replace(/\D/g, '').slice(0, 10);
  }

  return data.commodityCode?.trim() ?? '';
}

function sharedAiFormFields(data: AdminProductAiListingResponse) {
  return {
    productName: data.product_title?.trim() ?? '',
    description: data.product_description?.trim() ?? '',
    metaDesc: data.meta_description?.trim() ?? '',
    metaKeywords: data.meta_keywords?.trim() ?? '',
    metaTitle: data.meta_title?.trim() ?? '',
    commodityCode: extractCommodityCode(data),
  };
}

export async function buildAdminProductAiPrefill(
  productType: AdminProductAiListingType,
  data: AdminProductAiListingResponse,
  images: StandardProductImageEntry[],
  sellerId?: string,
): Promise<AdminProductAiPrefill | null> {
  if (!data.product_title?.trim()) {
    return null;
  }

  const { categoryId, subCategoryId } = await resolveAdminAiListingCategoryIds(
    data.category,
    data.subcategory,
    data.category_id,
    data.subcategory_id,
  );

  const shared = {
    ...sharedAiFormFields(data),
    categoryId,
    subCategoryId,
    childCategoryId: '',
  };

  if (productType === 'Standard') {
    return {
      productType,
      sellerId,
      images,
      categoryHint: data.category,
      subcategoryHint: data.subcategory,
      standardValues: {
        ...createEmptyStandardProductForm(),
        ...shared,
        inventory: 'InStock',
      },
    };
  }

  if (productType === 'Downloadable') {
    return {
      productType,
      sellerId,
      images,
      categoryHint: data.category,
      subcategoryHint: data.subcategory,
      downloadableValues: {
        ...createEmptyDownloadableProductForm(),
        ...shared,
        inventory: 'InStock',
      },
    };
  }

  return {
    productType: 'Customizable',
    sellerId,
    images,
    categoryHint: data.category,
    subcategoryHint: data.subcategory,
    customizableValues: {
      ...createEmptyCustomizableProductForm(),
      ...shared,
    },
  };
}
