import type { Product } from '../../../../services/types/product';
import {
  mapDownloadFileFromProduct,
  mapImagesFromProduct,
  mapProductToCustomizableForm,
  mapProductToDownloadableForm,
  mapProductToStandardForm,
} from '../../../seller/products/utils/productFormMappers';
import type { DownloadableFileEntry } from '../../../seller/products/types/downloadableProductForm';
import type { AdminProductListItem } from '../types/adminProductManagement';
import { resolveAdminProductSellerId } from './adminProductWritePayload';

export function isAdminProductWizardCacheMatch(
  productId: string | undefined,
  initialProduct?: AdminProductListItem | null,
): initialProduct is AdminProductListItem {
  return Boolean(productId && initialProduct?._id && initialProduct._id === productId);
}

export function hydrateAdminStandardWizardFromProduct(product: Product) {
  return {
    values: mapProductToStandardForm(product),
    images: mapImagesFromProduct(product),
    savedProductId: product._id ?? null,
    resolvedSellerId: resolveAdminProductSellerId(product.seller),
    currencyRate: product.currencyRate ?? 1,
  };
}

export function hydrateAdminDownloadableWizardFromProduct(product: Product) {
  return {
    values: mapProductToDownloadableForm(product),
    images: mapImagesFromProduct(product),
    downloadFile: mapDownloadFileFromProduct(product),
    savedProductId: product._id ?? null,
    resolvedSellerId: resolveAdminProductSellerId(product.seller),
    currencyRate: product.currencyRate ?? 1,
  };
}

export function hydrateAdminCustomizableWizardFromProduct(product: Product) {
  return {
    values: mapProductToCustomizableForm(product),
    images: mapImagesFromProduct(product),
    savedProductId: product._id ?? null,
    resolvedSellerId: resolveAdminProductSellerId(product.seller),
    currencyRate: product.currencyRate ?? 1,
  };
}

export type AdminDownloadableWizardHydration = ReturnType<
  typeof hydrateAdminDownloadableWizardFromProduct
>;
