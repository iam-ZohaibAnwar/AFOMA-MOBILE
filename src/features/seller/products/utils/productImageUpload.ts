import * as ImageManipulator from 'expo-image-manipulator';

import {
  LISTING_IMAGE_MAX_EDGE,
  MAX_PRODUCT_LISTING_IMAGE_BYTES,
} from './standardProductConstants';

async function getFileSize(uri: string): Promise<number> {
  const response = await fetch(uri);
  const blob = await response.blob();
  return blob.size;
}

export async function prepareListingImageForUpload(localUri: string): Promise<{
  uri: string;
  mimeType: string;
  fileName: string;
}> {
  let workingUri = localUri;
  let quality = 0.85;

  let manipulated = await ImageManipulator.manipulateAsync(
    workingUri,
    [{ resize: { width: LISTING_IMAGE_MAX_EDGE } }],
    { compress: quality, format: ImageManipulator.SaveFormat.JPEG },
  );

  workingUri = manipulated.uri;

  for (let attempt = 0; attempt < 6; attempt += 1) {
    const size = await getFileSize(workingUri);
    if (size <= MAX_PRODUCT_LISTING_IMAGE_BYTES) {
      return {
        uri: workingUri,
        mimeType: 'image/jpeg',
        fileName: `product-${Date.now()}.jpg`,
      };
    }

    quality = Math.max(0.35, quality - 0.1);
    manipulated = await ImageManipulator.manipulateAsync(
      localUri,
      [{ resize: { width: Math.max(640, LISTING_IMAGE_MAX_EDGE - attempt * 120) } }],
      { compress: quality, format: ImageManipulator.SaveFormat.JPEG },
    );
    workingUri = manipulated.uri;
  }

  const finalSize = await getFileSize(workingUri);
  if (finalSize > MAX_PRODUCT_LISTING_IMAGE_BYTES) {
    throw new Error('Image must be 2 MB or smaller after compression');
  }

  return {
    uri: workingUri,
    mimeType: 'image/jpeg',
    fileName: `product-${Date.now()}.jpg`,
  };
}

export const ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

export function isAllowedImageMimeType(mimeType?: string): boolean {
  if (!mimeType) {
    return true;
  }

  return (
    mimeType === 'image/jpeg' ||
    mimeType === 'image/png' ||
    mimeType === 'image/gif' ||
    mimeType === 'image/webp'
  );
}
