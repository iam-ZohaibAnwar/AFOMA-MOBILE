import { useCallback, useRef, useState } from 'react';

import { getErrorMessage } from '../../../../services/api/errors';
import { useImageUploadSourceSheet } from '../../../../hooks/useImageUploadSourceSheet';
import { NO_IMAGE_CROP } from '../../../../utils/imageCropPresets';
import {
  getAdminAiListingMinImages,
  mergeAdminAiPrefillImagesWithAltSuggestions,
  requestAdminAiListingFromImages,
  uploadAdminAiPrefillImages,
} from '../api/adminProductAiListingApi';
import { stashAdminProductAiPrefill } from '../state/adminProductAiPrefill';
import type {
  AdminProductAiListingType,
  AdminProductAiLocalImage,
  AdminProductAiPrefill,
} from '../types/adminProductAiPrefill';
import { buildAdminProductAiPrefill } from '../utils/adminProductAiListingMap';

function createLocalImageId(): string {
  return `local-ai-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useAdminProductAiListing(productType: AdminProductAiListingType, sellerId?: string) {
  const [images, setImages] = useState<AdminProductAiLocalImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const imageUploadSheet = useImageUploadSourceSheet();

  const minImages = getAdminAiListingMinImages(productType);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearWarning = useCallback(() => {
    setWarning(null);
  }, []);

  const addImagesFromPicker = useCallback(async () => {
    setError(null);

    const { assets, error: pickError } = await imageUploadSheet.pickImages({
      title: 'Add product photos',
      subtitle: 'Choose up to 8 photos from your library. Batch upload skips crop.',
      libraryLabel: 'Choose from library',
      showCamera: false,
      selectionLimit: 8,
      crop: NO_IMAGE_CROP,
    });

    if (pickError) {
      setError(pickError);
      return;
    }

    if (!assets.length) {
      return;
    }

    const nextImages = assets.map((asset, index) => ({
      id: createLocalImageId() + index,
      uri: asset.uri,
      mimeType: asset.mimeType,
      fileName: asset.fileName ?? `ai-photo-${Date.now()}-${index + 1}.jpg`,
    }));

    setImages((current) => [...current, ...nextImages].slice(0, 8));
  }, [imageUploadSheet]);

  const removeImage = useCallback((imageId: string) => {
    setImages((current) => current.filter((image) => image.id !== imageId));
  }, []);

  const cancelGeneration = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsGenerating(false);
  }, []);

  const generatePrefill = useCallback(async (): Promise<AdminProductAiPrefill | null> => {
    if (isGenerating) {
      return null;
    }

    if (images.length < minImages) {
      setError(`Add at least ${minImages} product photos before generating a listing.`);
      return null;
    }

    setIsGenerating(true);
    setError(null);
    setWarning(null);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const listing = await requestAdminAiListingFromImages(
        images,
        productType,
        controller.signal,
      );

      if (!listing.product_title?.trim()) {
        setError('Could not generate listing. Try different photos.');
        return null;
      }

      const uploadedImages = await uploadAdminAiPrefillImages(images);
      const prefillImages = mergeAdminAiPrefillImagesWithAltSuggestions(
        uploadedImages,
        listing.imageAltSuggestions,
      );

      if (prefillImages.length < images.length) {
        setWarning(
          prefillImages.length === 0
            ? 'Listing ready, but photos could not be saved. Re-upload images in the wizard.'
            : `${images.length - prefillImages.length} photo(s) could not be saved. Re-upload any missing images in the wizard.`,
        );
      }

      const prefill = await buildAdminProductAiPrefill(
        productType,
        listing,
        prefillImages,
        sellerId,
      );

      if (!prefill) {
        setError('Could not map AI listing into the product form.');
        return null;
      }

      stashAdminProductAiPrefill(prefill);
      return prefill;
    } catch (err) {
      setError(getErrorMessage(err, 'Could not generate listing.'));
      return null;
    } finally {
      abortRef.current = null;
      setIsGenerating(false);
    }
  }, [images, isGenerating, minImages, productType, sellerId]);

  return {
    images,
    minImages,
    isGenerating,
    error,
    warning,
    addImagesFromPicker,
    removeImage,
    generatePrefill,
    cancelGeneration,
    clearError,
    clearWarning,
    imageUploadSheetProps: imageUploadSheet.sheetProps,
  };
}
