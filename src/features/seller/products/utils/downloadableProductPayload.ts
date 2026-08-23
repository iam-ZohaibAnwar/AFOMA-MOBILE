import type { DownloadableProductWritePayload } from '../api/sellerProductsApi';
import type {
  DownloadableFileEntry,
  DownloadableProductFormValues,
} from '../types/downloadableProductForm';
import type { StandardProductImageEntry } from '../types/standardProductForm';

export function buildDownloadableProductPayload(
  values: DownloadableProductFormValues,
  images: StandardProductImageEntry[],
  downloadFile: DownloadableFileEntry | null,
  sellerId: string,
  currencyRate: number,
  productStatus?: string,
): DownloadableProductWritePayload {
  const discountValue = parseFloat(values.discountCode);
  const discountCode =
    values.discountCode.trim() && Number.isFinite(discountValue) && discountValue > 0
      ? values.discountCode
      : '';

  const payload: DownloadableProductWritePayload = {
    productName: values.productName.trim(),
    description: values.description.trim(),
    Category: values.categoryId,
    SubCategory: values.subCategoryId,
    childCategory: values.childCategoryId || null,
    inventory: values.inventory,
    price: values.price.trim(),
    commodityCode: values.commodityCode.trim() || undefined,
    metaTitle: values.metaTitle.trim() || undefined,
    metaKeywords: values.metaKeywords.trim() || undefined,
    metaDesc: values.metaDesc.trim() || undefined,
    discountCode,
    seller: sellerId,
    images: images
      .filter((image) => image.imageUrl && image.fileName)
      .map((image) => ({
        imageUrl: image.imageUrl!,
        fileName: image.fileName!,
        altText: image.altText.trim(),
      })),
    videos: [],
    productType: 'Downloadable',
    currency: values.currency || 'cad',
    currencyPrice: values.currencyPrice.trim() ? values.currencyPrice.trim() : 1,
    currencyRate: currencyRate || 1,
    downloadableLink: {
      featuredProduct: downloadFile?.featuredProduct ?? '',
      featuredProductUrl: downloadFile?.featuredProductUrl ?? '',
    },
  };

  if (productStatus) {
    payload.productStatus = productStatus;
  }

  return payload;
}
