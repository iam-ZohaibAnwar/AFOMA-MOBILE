import { useCallback, useMemo, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';

import { getErrorMessage } from '../../../../services/api/errors';
import { uploadProductImage } from '../api/sellerProductsApi';
import type { StandardProductImageEntry } from '../types/standardProductForm';
import {
  isAllowedImageMimeType,
  prepareListingImageForUpload,
} from '../utils/productImageUpload';

function createImageId(): string {
  return `image-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useProductImages(defaultAltText = '') {
  const [images, setImages] = useState<StandardProductImageEntry[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);

  const uploadedImageCount = useMemo(
    () => images.filter((image) => image.imageUrl).length,
    [images],
  );

  const uploadPendingImages = useCallback(async (entries: StandardProductImageEntry[]) => {
    const updated = [...entries];

    for (let index = 0; index < updated.length; index += 1) {
      const entry = updated[index];
      if (entry.imageUrl || !entry.localUri) {
        continue;
      }

      updated[index] = { ...entry, isUploading: true, uploadError: undefined };
      setImages([...updated]);

      try {
        const prepared = await prepareListingImageForUpload(entry.localUri);
        const uploaded = await uploadProductImage(prepared.uri, prepared.fileName, prepared.mimeType);
        updated[index] = {
          ...entry,
          localUri: undefined,
          imageUrl: uploaded.imageUrl,
          fileName: uploaded.fileName,
          isUploading: false,
          uploadError: undefined,
        };
      } catch (err) {
        updated[index] = {
          ...entry,
          isUploading: false,
          uploadError: getErrorMessage(err, 'Failed to upload image'),
        };
        throw err;
      }

      setImages([...updated]);
    }

    return updated;
  }, []);

  const addImageFromPicker = useCallback(async (altText?: string) => {
    setImageError(null);

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setImageError('Photo library permission is required to add product images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
      allowsMultipleSelection: false,
    });

    if (result.canceled || !result.assets?.[0]) {
      return;
    }

    const asset = result.assets[0];
    if (!isAllowedImageMimeType(asset.mimeType)) {
      setImageError('Allowed image types: jpg, jpeg, png, gif, webp');
      return;
    }

    const entryId = createImageId();
    const pendingEntry: StandardProductImageEntry = {
      id: entryId,
      localUri: asset.uri,
      altText: altText ?? defaultAltText,
      isUploading: true,
    };

    setImages((current) => [...current, pendingEntry]);

    try {
      const prepared = await prepareListingImageForUpload(asset.uri);
      const uploaded = await uploadProductImage(prepared.uri, prepared.fileName, prepared.mimeType);

      setImages((current) =>
        current.map((image) =>
          image.id === entryId
            ? {
                ...image,
                localUri: undefined,
                imageUrl: uploaded.imageUrl,
                fileName: uploaded.fileName,
                isUploading: false,
                uploadError: undefined,
              }
            : image,
        ),
      );
    } catch (err) {
      setImages((current) =>
        current.map((image) =>
          image.id === entryId
            ? {
                ...image,
                isUploading: false,
                uploadError: getErrorMessage(err, 'Failed to upload image'),
              }
            : image,
        ),
      );
    }
  }, [defaultAltText]);

  const removeImage = useCallback((imageId: string) => {
    setImages((current) => current.filter((image) => image.id !== imageId));
  }, []);

  const moveImage = useCallback((imageId: string, direction: 'up' | 'down') => {
    setImages((current) => {
      const index = current.findIndex((image) => image.id === imageId);
      if (index < 0) {
        return current;
      }

      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= current.length) {
        return current;
      }

      const next = [...current];
      const [item] = next.splice(index, 1);
      next.splice(targetIndex, 0, item);
      return next;
    });
  }, []);

  const updateImageAltText = useCallback((imageId: string, altText: string) => {
    setImages((current) =>
      current.map((image) => (image.id === imageId ? { ...image, altText } : image)),
    );
  }, []);

  const setImagesFromEntries = useCallback((entries: StandardProductImageEntry[]) => {
    setImages(entries);
  }, []);

  return {
    images,
    uploadedImageCount,
    imageError,
    setImageError,
    setImagesFromEntries,
    uploadPendingImages,
    addImageFromPicker,
    removeImage,
    moveImage,
    updateImageAltText,
  };
}
