import { useCallback, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';

import { getErrorMessage } from '../../../services/api/errors';
import { uploadSellerStoreImage, uploadUserProfileImage } from '../../../services/api/sellersApi';
import {
  isAllowedImageMimeType,
  prepareListingImageForUpload,
} from '../products/utils/productImageUpload';

export type SellerSetupImageKind = 'profile' | 'banner' | 'logo';

export function useSellerSetupImageUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const pickAndUpload = useCallback(async (kind: SellerSetupImageKind): Promise<string | null> => {
    setUploadError(null);

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setUploadError('Photo library permission is required to upload images.');
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

    setIsUploading(true);

    try {
      const prepared = await prepareListingImageForUpload(asset.uri);
      const imageUrl =
        kind === 'profile'
          ? await uploadUserProfileImage(prepared.uri, prepared.fileName, prepared.mimeType)
          : await uploadSellerStoreImage(prepared.uri, prepared.fileName, prepared.mimeType);

      return imageUrl;
    } catch (err) {
      setUploadError(getErrorMessage(err, 'Failed to upload image'));
      return null;
    } finally {
      setIsUploading(false);
    }
  }, []);

  return {
    isUploading,
    uploadError,
    pickAndUpload,
    clearUploadError: () => setUploadError(null),
  };
}
