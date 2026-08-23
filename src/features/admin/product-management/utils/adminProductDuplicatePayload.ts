import type { SellerProductCreatePayload } from '../../../seller/products/api/sellerProductsApi';
import { resolveCategoryId } from '../../../seller/products/api/sellerProductsApi';
import { buildCustomizableProductPayload } from '../../../seller/products/utils/customizableProductPayload';
import { buildDownloadableProductPayload } from '../../../seller/products/utils/downloadableProductPayload';
import { buildStandardProductPayload } from '../../../seller/products/utils/standardProductPayload';
import type { StandardProductImageEntry } from '../../../seller/products/types/standardProductForm';
import {
  mapProductToCustomizableForm,
  mapProductToDownloadableForm,
  mapProductToStandardForm,
} from '../../../seller/products/utils/productFormMappers';
import type { AdminProductDetail } from '../types/adminProductManagement';
import { resolveAdminProductSellerId } from './adminProductWritePayload';

/**
 * Admin duplicate creates Draft products — distinct from admin create (Pending).
 * Builds an explicit payload from known configuration fields only.
 * Never spreads the source product object.
 */
export const ADMIN_DUPLICATE_PRODUCT_STATUS = 'Draft' as const;

const EMPTY_IMAGES: StandardProductImageEntry[] = [];

export interface AdminDuplicateProductValidation {
  canDuplicate: boolean;
  missingFields: string[];
}

export function validateAdminProductDuplicatable(source: AdminProductDetail): AdminDuplicateProductValidation {
  const missingFields: string[] = [];

  if (!resolveAdminProductSellerId(source.seller)) {
    missingFields.push('seller');
  }

  if (!resolveCategoryId(source.Category)) {
    missingFields.push('category');
  }

  if (!resolveCategoryId(source.SubCategory)) {
    missingFields.push('subcategory');
  }

  const productType = source.productType?.trim();
  if (
    productType !== 'Standard' &&
    productType !== 'Downloadable' &&
    productType !== 'Customizable'
  ) {
    missingFields.push('productType');
  }

  return {
    canDuplicate: missingFields.length === 0,
    missingFields,
  };
}

function withDuplicateDefaults(
  payload: SellerProductCreatePayload,
): SellerProductCreatePayload {
  return {
    ...payload,
    productStatus: ADMIN_DUPLICATE_PRODUCT_STATUS,
    images: [],
    videos: [],
  };
}

/**
 * Explicit duplicate payload. Omits lifecycle/identity/media fields:
 * _id, slug, status, createdAt, updatedAt, downloadableLink, variations, images, videos.
 *
 * Customizable duplicates: backend returns `variations: []` — expected. UX is
 * Draft → Edit Base → Save → Configure Variations (do not copy variations in payload).
 */
export function buildAdminDuplicateProductPayload(
  source: AdminProductDetail,
): SellerProductCreatePayload | null {
  const validation = validateAdminProductDuplicatable(source);
  if (!validation.canDuplicate) {
    return null;
  }

  const sellerId = resolveAdminProductSellerId(source.seller);
  const currencyRate = source.currencyRate ?? 1;
  const productType = source.productType;

  if (productType === 'Standard') {
    const values = mapProductToStandardForm(source);
    return withDuplicateDefaults(
      buildStandardProductPayload(values, EMPTY_IMAGES, sellerId, currencyRate),
    );
  }

  if (productType === 'Downloadable') {
    const values = mapProductToDownloadableForm(source);
    return withDuplicateDefaults({
      ...buildDownloadableProductPayload(values, EMPTY_IMAGES, null, sellerId, currencyRate),
      downloadableLink: {
        featuredProduct: '',
        featuredProductUrl: '',
      },
    });
  }

  if (productType === 'Customizable') {
    const values = mapProductToCustomizableForm(source);
    return withDuplicateDefaults(
      buildCustomizableProductPayload(values, EMPTY_IMAGES, sellerId, currencyRate),
    );
  }

  return null;
}

export function getAdminDuplicateValidationMessage(
  validation: AdminDuplicateProductValidation,
): string {
  if (validation.canDuplicate) {
    return '';
  }

  if (validation.missingFields.includes('productType')) {
    return 'This product type cannot be duplicated.';
  }

  return 'Unable to duplicate: missing seller or category information.';
}
