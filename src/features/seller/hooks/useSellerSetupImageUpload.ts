import { useCallback, useState } from 'react';

import { useImageUploadSourceSheet } from '../../../hooks/useImageUploadSourceSheet';
import { BANNER_IMAGE_CROP, SQUARE_IMAGE_CROP, type ImageCropOptions } from '../../../utils/imageCropPresets';
import { getErrorMessage } from '../../../services/api/errors';
import { uploadSellerStoreImage, uploadUserProfileImage } from '../../../services/api/sellersApi';
import { prepareListingImageForUpload } from '../products/utils/productImageUpload';

export type SellerSetupImageKind = 'profile' | 'banner' | 'logo';

const UPLOAD_LABELS: Record<SellerSetupImageKind, string> = {
  profile: 'profile photo',
  banner: 'store banner',
  logo: 'store logo',
};

const CROP_BY_KIND: Record<SellerSetupImageKind, ImageCropOptions> = {
  profile: SQUARE_IMAGE_CROP,
  banner: BANNER_IMAGE_CROP,
  logo: SQUARE_IMAGE_CROP,
};

const CROP_HINT_BY_KIND: Record<SellerSetupImageKind, string> = {
  profile: 'Choose a photo, crop it square, then upload.',
  banner: 'Choose a wide photo and crop it to a banner.',
  logo: 'Choose a logo image, crop it square, then upload.',
};

export function useSellerSetupImageUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const imageUploadSheet = useImageUploadSourceSheet();

  const pickAndUpload = useCallback(
    async (kind: SellerSetupImageKind): Promise<string | null> => {
      setUploadError(null);

      const { asset, error } = await imageUploadSheet.pickImage({
        title: `Upload ${UPLOAD_LABELS[kind]}`,
        subtitle: CROP_HINT_BY_KIND[kind],
        libraryLabel: 'Choose from library',
        cameraLabel: 'Take photo',
        crop: CROP_BY_KIND[kind],
      });

      if (error) {
        setUploadError(error);
        return null;
      }

      if (!asset) {
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
    },
    [imageUploadSheet],
  );

  return {
    isUploading,
    uploadError,
    pickAndUpload,
    clearUploadError: () => setUploadError(null),
    imageUploadSheetProps: imageUploadSheet.sheetProps,
  };
}
