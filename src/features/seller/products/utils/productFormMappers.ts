import type { Product } from '../../../../services/types/product';
import {
  productImagesFromProduct,
  resolveCategoryId,
} from '../api/sellerProductsApi';
import type { CustomizableProductFormValues } from '../types/customizableProductForm';
import { createEmptyCustomizableProductForm } from '../types/customizableProductForm';
import type { DownloadableFileEntry, DownloadableProductFormValues } from '../types/downloadableProductForm';
import { createEmptyDownloadableProductForm } from '../types/downloadableProductForm';
import type { StandardProductFormValues, StandardProductImageEntry } from '../types/standardProductForm';
import { createEmptyStandardProductForm } from '../types/standardProductForm';
import type { SellerInventoryValue } from '../utils/standardProductConstants';

function createImageId(): string {
  return `image-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function mapImagesFromProduct(product: Product): StandardProductImageEntry[] {
  return productImagesFromProduct(product).map((image, index) => ({
    id: createImageId() + index,
    imageUrl: image.imageUrl,
    fileName: image.fileName,
    altText: image.altText,
  }));
}

export function mapProductToStandardForm(product: Product): StandardProductFormValues {
  const form = createEmptyStandardProductForm();

  form.productName = product.productName ?? '';
  form.description = product.description ?? '';
  form.categoryId = resolveCategoryId(product.Category);
  form.subCategoryId = resolveCategoryId(product.SubCategory);
  form.childCategoryId = resolveCategoryId(product.childCategory);
  form.inventory = (product.inventory as SellerInventoryValue) ?? '';
  form.quantity = product.quantity != null ? String(product.quantity) : '';
  form.price = product.price != null ? String(product.price) : '';
  form.currency = product.currency ?? 'cad';
  form.currencyPrice =
    product.currencyPrice != null && product.currencyPrice !== ''
      ? String(product.currencyPrice)
      : '';
  form.weight = product.weight != null ? String(product.weight) : '';
  form.length = product.length != null ? String(product.length) : '';
  form.width = product.width != null ? String(product.width) : '';
  form.height = product.height != null ? String(product.height) : '';
  form.dispatchDays = product.dispatchDays != null ? String(product.dispatchDays) : '';
  form.isCustomShipping = Boolean(product.freeDelivery || product.handlingFee);
  form.freeDelivery = Boolean(product.freeDelivery);
  form.handlingFee = product.handlingFee != null ? String(product.handlingFee) : '';
  form.additionalCost = product.additionalCost != null ? String(product.additionalCost) : '';
  form.commodityCode = product.commodityCode ?? '';
  form.metaTitle = product.metaTitle ?? '';
  form.metaKeywords = product.metaKeywords ?? '';
  form.metaDesc = product.metaDesc ?? '';
  form.discountCode =
    product.discountCode != null && product.discountCode > 0
      ? String(product.discountCode)
      : '';

  return form;
}

export function mapProductToDownloadableForm(product: Product): DownloadableProductFormValues {
  const form = createEmptyDownloadableProductForm();

  form.productName = product.productName ?? '';
  form.description = product.description ?? '';
  form.categoryId = resolveCategoryId(product.Category);
  form.subCategoryId = resolveCategoryId(product.SubCategory);
  form.childCategoryId = resolveCategoryId(product.childCategory);
  form.inventory = (product.inventory as SellerInventoryValue) ?? '';
  form.price = product.price != null ? String(product.price) : '';
  form.currency = product.currency ?? 'cad';
  form.currencyPrice =
    product.currencyPrice != null && product.currencyPrice !== ''
      ? String(product.currencyPrice)
      : '';
  form.commodityCode = product.commodityCode ?? '';
  form.metaTitle = product.metaTitle ?? '';
  form.metaKeywords = product.metaKeywords ?? '';
  form.metaDesc = product.metaDesc ?? '';
  form.discountCode =
    product.discountCode != null && product.discountCode > 0
      ? String(product.discountCode)
      : '';
  form.productStatus = product.productStatus;

  return form;
}

export function mapDownloadFileFromProduct(product: Product): DownloadableFileEntry | null {
  const link = product.downloadableLink;
  if (!link?.featuredProduct && !link?.featuredProductUrl) {
    return null;
  }

  return {
    featuredProduct: link.featuredProduct ?? '',
    featuredProductUrl: link.featuredProductUrl ?? '',
  };
}

export function mapProductToCustomizableForm(product: Product): CustomizableProductFormValues {
  const form = createEmptyCustomizableProductForm();

  form.productName = product.productName ?? '';
  form.description = product.description ?? '';
  form.categoryId = resolveCategoryId(product.Category);
  form.subCategoryId = resolveCategoryId(product.SubCategory);
  form.childCategoryId = resolveCategoryId(product.childCategory);
  form.weight = product.weight != null ? String(product.weight) : '';
  form.length = product.length != null ? String(product.length) : '';
  form.width = product.width != null ? String(product.width) : '';
  form.height = product.height != null ? String(product.height) : '';
  form.dispatchDays = product.dispatchDays != null ? String(product.dispatchDays) : '';
  form.isCustomShipping = Boolean(product.freeDelivery || product.handlingFee);
  form.freeDelivery = Boolean(product.freeDelivery);
  form.handlingFee = product.handlingFee != null ? String(product.handlingFee) : '';
  form.additionalCost = product.additionalCost != null ? String(product.additionalCost) : '';
  form.commodityCode = product.commodityCode ?? '';
  form.metaTitle = product.metaTitle ?? '';
  form.metaKeywords = product.metaKeywords ?? '';
  form.metaDesc = product.metaDesc ?? '';
  form.discountCode =
    product.discountCode != null && product.discountCode > 0
      ? String(product.discountCode)
      : '';
  form.currency = product.currency ?? 'cad';
  form.currencyPrice =
    product.currencyPrice != null && product.currencyPrice !== ''
      ? String(product.currencyPrice)
      : '1';
  form.productStatus = product.productStatus;

  return form;
}

export function resolveEditProductStatus(productStatus?: string): string | undefined {
  if (productStatus === 'Approved') {
    return productStatus;
  }

  return 'Draft';
}
