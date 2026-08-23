import type {
  CustomizableProductWritePayload,
  DownloadableProductWritePayload,
  StandardProductWritePayload,
} from '../../../seller/products/api/sellerProductsApi';
import { buildCustomizableProductPayload } from '../../../seller/products/utils/customizableProductPayload';
import { buildDownloadableProductPayload } from '../../../seller/products/utils/downloadableProductPayload';
import { buildStandardProductPayload } from '../../../seller/products/utils/standardProductPayload';
import type { CustomizableProductFormValues } from '../../../seller/products/types/customizableProductForm';
import type {
  DownloadableFileEntry,
  DownloadableProductFormValues,
} from '../../../seller/products/types/downloadableProductForm';
import type {
  StandardProductFormValues,
  StandardProductImageEntry,
} from '../../../seller/products/types/standardProductForm';

export function buildAdminStandardProductPayload(
  values: StandardProductFormValues,
  images: StandardProductImageEntry[],
  sellerId: string,
  currencyRate: number,
  isCreate: boolean,
): StandardProductWritePayload {
  const payload = buildStandardProductPayload(values, images, sellerId, currencyRate);

  if (isCreate) {
    payload.productStatus = 'Pending';
  }

  return payload;
}

export function buildAdminDownloadableProductPayload(
  values: DownloadableProductFormValues,
  images: StandardProductImageEntry[],
  downloadFile: DownloadableFileEntry | null,
  sellerId: string,
  currencyRate: number,
  isCreate: boolean,
): DownloadableProductWritePayload {
  const payload = buildDownloadableProductPayload(
    values,
    images,
    downloadFile,
    sellerId,
    currencyRate,
  );

  if (isCreate) {
    payload.productStatus = 'Pending';
  }

  return payload;
}

export function buildAdminCustomizableProductPayload(
  values: CustomizableProductFormValues,
  images: StandardProductImageEntry[],
  sellerId: string,
  currencyRate: number,
  isCreate: boolean,
): CustomizableProductWritePayload {
  const payload = buildCustomizableProductPayload(values, images, sellerId, currencyRate);

  if (isCreate) {
    payload.productStatus = 'Pending';
  }

  return payload;
}

export function resolveAdminProductSellerId(
  seller?: { _id?: string; id?: string } | string | null,
): string {
  if (typeof seller === 'string') {
    return seller.trim();
  }

  return seller?._id?.trim() || seller?.id?.trim() || '';
}
