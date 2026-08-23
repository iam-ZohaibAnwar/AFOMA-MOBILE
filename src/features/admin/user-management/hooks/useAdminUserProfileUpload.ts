import { useCallback, useRef, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';

import { getErrorMessage } from '../../../../services/api/errors';
import { uploadUserProfileImage } from '../../../../services/api/sellersApi';
import {
  isAllowedImageMimeType,
  prepareListingImageForUpload,
} from '../../../seller/products/utils/productImageUpload';

export function useAdminUserProfileUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const isUploadingRef = useRef(false);

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

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setUploadError('Photo library permission is required to upload a profile photo.');
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
      allowsMultipleSelection: false,
    });

    if (result.canceled || !result.assets?.[0]) {
      return null;
    }

    const asset = result.assets[0];
    if (!isAllowedImageMimeType(asset.mimeType)) {
      setUploadError('Unsupported image type. Use JPG, PNG, GIF, or WebP.');
      return null;
    }

    const imageUrl = await uploadLocalImage(asset.uri);
    return {
      localUri: asset.uri,
      imageUrl,
    };
  }, [uploadLocalImage]);

  const clearUploadError = useCallback(() => {
    setUploadError(null);
  }, []);

  return {
    isUploading,
    uploadError,
    pickProfilePhoto,
    uploadLocalImage,
    clearUploadError,
  };
}
