import { useCallback, useRef, useState } from 'react';

import { getErrorMessage } from '../../../services/api/errors';
import { getUserProfile, updateUserProfilePhoto } from '../../../services/api/usersApi';
import { uploadUserProfileImage } from '../../../services/api/sellersApi';
import { useImageUploadSourceSheet } from '../../../hooks/useImageUploadSourceSheet';
import { SQUARE_IMAGE_CROP } from '../../../utils/imageCropPresets';
import { resolveUserProfileImageUrl } from '../../../utils/resolveUserProfileImageUrl';
import { useAuth } from '../../auth/hooks/useAuth';
import { mapUserProfileToStoredProfile } from '../utils/accountDetailsForm';
import { prepareListingImageForUpload } from '../../seller/products/utils/productImageUpload';
import { getUserProfileImageUrl } from '../utils/accountDisplay';

export function useAccountProfilePhoto(authUserId?: string) {
  const { user, patchUserProfile } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isUploadingRef = useRef(false);
  const imageUploadSheet = useImageUploadSourceSheet();

  const uploadAndSavePhoto = useCallback(
    async (localUri: string) => {
      if (!authUserId || isUploadingRef.current) {
        return;
      }

      isUploadingRef.current = true;
      setError(null);
      setIsUploading(true);

      try {
        const prepared = await prepareListingImageForUpload(localUri);
        const imageUrl = await uploadUserProfileImage(
          prepared.uri,
          prepared.fileName,
          prepared.mimeType,
        );
        await updateUserProfilePhoto(authUserId, imageUrl);

        const refreshed = await getUserProfile(authUserId);
        const persistedUrl =
          resolveUserProfileImageUrl(refreshed.userProfile) ??
          resolveUserProfileImageUrl(imageUrl) ??
          imageUrl;
        const storedProfile = mapUserProfileToStoredProfile(
          { ...refreshed, userProfile: persistedUrl },
          authUserId,
          user,
        );
        await patchUserProfile(storedProfile);
      } catch (err) {
        const message = getErrorMessage(err, 'Failed to update profile photo');
        setError(message);
      } finally {
        isUploadingRef.current = false;
        setIsUploading(false);
      }
    },
    [authUserId, patchUserProfile, user],
  );

  const pickAndUploadPhoto = useCallback(async () => {
    if (!authUserId || isUploadingRef.current) {
      return;
    }

    setError(null);

    const hasPhoto = Boolean(getUserProfileImageUrl(user));
    const { asset, error: pickError } = await imageUploadSheet.pickImage({
      title: 'Profile photo',
      subtitle: hasPhoto
        ? 'View or update your profile photo. New photos are cropped square.'
        : 'Upload a profile photo. You can crop it square before saving.',
      libraryLabel: hasPhoto ? 'Change photo' : 'Choose from library',
      cameraLabel: 'Take photo',
      crop: SQUARE_IMAGE_CROP,
    });

    if (pickError) {
      setError(pickError);
      return;
    }

    if (!asset) {
      return;
    }

    await uploadAndSavePhoto(asset.uri);
  }, [authUserId, imageUploadSheet, uploadAndSavePhoto, user]);

  const openPhotoActions = useCallback(
    (options?: { onViewPhoto?: () => void }) => {
      if (!authUserId) {
        return;
      }

      const hasPhoto = Boolean(getUserProfileImageUrl(user));

      void imageUploadSheet
        .pickImage({
          title: 'Profile photo',
          subtitle: hasPhoto
            ? 'View or update your profile photo. New photos are cropped square.'
            : 'Upload a profile photo. You can crop it square before saving.',
          libraryLabel: hasPhoto ? 'Change photo' : 'Choose from library',
          cameraLabel: 'Take photo',
          crop: SQUARE_IMAGE_CROP,
          extraActions:
            hasPhoto && options?.onViewPhoto
              ? [
                  {
                    id: 'view',
                    label: 'View photo',
                    icon: 'eye-outline' as const,
                    onPress: () => options.onViewPhoto?.(),
                  },
                ]
              : [],
        })
        .then(({ asset, error: pickError }) => {
          if (pickError) {
            setError(pickError);
            return;
          }

          if (asset) {
            void uploadAndSavePhoto(asset.uri);
          }
        });
    },
    [authUserId, imageUploadSheet, uploadAndSavePhoto, user],
  );

  return {
    isUploading,
    error,
    openPhotoActions,
    pickAndUploadPhoto,
    imageUploadSheetProps: imageUploadSheet.sheetProps,
  };
}
