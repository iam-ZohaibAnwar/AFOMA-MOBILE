import { useCallback, useRef, useState } from 'react';

import { getErrorMessage } from '../../../../services/api/errors';
import { uploadUserProfileImage } from '../../../../services/api/sellersApi';
import { useImageUploadSourceSheet } from '../../../../hooks/useImageUploadSourceSheet';
import { SQUARE_IMAGE_CROP } from '../../../../utils/imageCropPresets';
import { prepareListingImageForUpload } from '../../../seller/products/utils/productImageUpload';

export function useAdminUserProfileUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const isUploadingRef = useRef(false);
  const imageUploadSheet = useImageUploadSourceSheet();

  const uploadLocalImage = useCallback(async (localUri: string): Promise<string | null> => {
    if (isUploadingRef.current) {
      return null;
    }

    isUploadingRef.current = true;
    setUploadError(null);
    setIsUploading(true);

    try {
      const prepared = await prepareListingImageForUpload(localUri);
      const imageUrl = await uploadUserProfileImage(
        prepared.uri,
        prepared.fileName,
        prepared.mimeType,
      );
      return imageUrl;
    } catch (err) {
      setUploadError(getErrorMessage(err, 'Failed to upload profile photo'));
      return null;
    } finally {
      isUploadingRef.current = false;
      setIsUploading(false);
    }
  }, []);

  const pickProfilePhoto = useCallback(async (): Promise<{
    localUri: string;
    imageUrl: string | null;
  } | null> => {
    if (isUploadingRef.current) {
      return null;
    }

    setUploadError(null);

    const { asset, error } = await imageUploadSheet.pickImage({
      title: 'Profile photo',
      subtitle: 'Choose a photo and crop it square before uploading.',
      libraryLabel: 'Choose from library',
      cameraLabel: 'Take photo',
      crop: SQUARE_IMAGE_CROP,
    });

    if (error) {
      setUploadError(error);
      return null;
    }

    if (!asset) {
      return null;
    }

    const imageUrl = await uploadLocalImage(asset.uri);
    return {
      localUri: asset.uri,
      imageUrl,
    };
  }, [imageUploadSheet, uploadLocalImage]);

  const clearUploadError = useCallback(() => {
    setUploadError(null);
  }, []);

  return {
    isUploading,
    uploadError,
    pickProfilePhoto,
    uploadLocalImage,
    clearUploadError,
    imageUploadSheetProps: imageUploadSheet.sheetProps,
  };
}
