import { apiClient } from '../../../../services/api/client';
import { toApiError } from '../../../../services/api/errors';
import { uploadProductImage } from '../../../seller/products/api/sellerProductsApi';
import { prepareListingImageForUpload } from '../../../seller/products/utils/productImageUpload';
import type {
  AdminProductAiListingResponse,
  AdminProductAiListingType,
  AdminProductAiLocalImage,
} from '../types/adminProductAiPrefill';
import type { StandardProductImageEntry } from '../../../seller/products/types/standardProductForm';

function createImageId(): string {
  return `ai-image-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function requestAdminAiListingFromImages(
  images: AdminProductAiLocalImage[],
  productType: AdminProductAiListingType,
  signal?: AbortSignal,
): Promise<AdminProductAiListingResponse> {
  const formData = new FormData();
  formData.append('productType', productType);

  for (const image of images) {
    const prepared = await prepareListingImageForUpload(image.uri);
    formData.append('images', {
      uri: prepared.uri,
      name: prepared.fileName,
      type: prepared.mimeType,
    } as unknown as Blob);
  }

  try {
    const response = await apiClient.post<AdminProductAiListingResponse>(
      '/products/ai-listing-from-images',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        signal,
      },
    );

    return response.data;
  } catch (error) {
    throw toApiError(error, 'Failed to generate AI listing');
  }
}

export async function uploadAdminAiPrefillImages(
  images: AdminProductAiLocalImage[],
): Promise<StandardProductImageEntry[]> {
  const uploaded: StandardProductImageEntry[] = [];

  for (const image of images) {
    try {
      const prepared = await prepareListingImageForUpload(image.uri);
      const result = await uploadProductImage(prepared.uri, prepared.fileName, prepared.mimeType);
      uploaded.push({
        id: image.id || createImageId(),
        imageUrl: result.imageUrl,
        fileName: result.fileName,
        altText: '',
      });
    } catch {
      uploaded.push({
        id: image.id || createImageId(),
        localUri: image.uri,
        fileName: image.fileName,
        altText: '',
        uploadError: 'Upload failed — retry from the product wizard.',
      });
    }
  }

  return uploaded;
}

export function mergeAdminAiPrefillImagesWithAltSuggestions(
  images: StandardProductImageEntry[],
  suggestions?: AdminProductAiListingResponse['imageAltSuggestions'],
): StandardProductImageEntry[] {
  if (!images.length) {
    return [];
  }

  const byNumber = new Map(
    (suggestions ?? []).map((item) => [Number(item.imageNumber), String(item.altText ?? '').trim()]),
  );

  return images.map((image, index) => ({
    ...image,
    altText: byNumber.get(index + 1) || image.altText || '',
  }));
}

export function getAdminAiListingMinImages(productType: AdminProductAiListingType): number {
  return productType === 'Downloadable' ? 2 : 3;
}
