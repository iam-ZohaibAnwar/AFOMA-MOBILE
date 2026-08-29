import { useCallback, useRef, useState } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import { getErrorMessage } from '../../../services/api/errors';
import { getUserProfile, updateUserProfilePhoto } from '../../../services/api/usersApi';
import { uploadUserProfileImage } from '../../../services/api/sellersApi';
import { resolveUserProfileImageUrl } from '../../../utils/resolveUserProfileImageUrl';
import { useAuth } from '../../auth/hooks/useAuth';
import { mapUserProfileToStoredProfile } from '../utils/accountDetailsForm';
import {
  isAllowedImageMimeType,
  prepareListingImageForUpload,
} from '../../seller/products/utils/productImageUpload';
import { getUserProfileImageUrl } from '../utils/accountDisplay';

export function useAccountProfilePhoto(authUserId?: string) {
  const { user, patchUserProfile } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isUploadingRef = useRef(false);

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
        Alert.alert('Profile photo', message);
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

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      const message = 'Photo library permission is required to upload a profile photo.';
      setError(message);
      Alert.alert('Profile photo', message);
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
      const message = 'Unsupported image type. Use JPG, PNG, GIF, or WebP.';
      setError(message);
      Alert.alert('Profile photo', message);
      return;
    }

    await uploadAndSavePhoto(asset.uri);
  }, [authUserId, uploadAndSavePhoto]);

  const openPhotoActions = useCallback(
    (options?: { onViewPhoto?: () => void }) => {
      if (!authUserId) {
        return;
      }

      const hasPhoto = Boolean(getUserProfileImageUrl(user));

      Alert.alert(
        'Profile photo',
        hasPhoto ? 'View or update your profile photo.' : 'Upload a profile photo for your account.',
        [
          ...(hasPhoto && options?.onViewPhoto
            ? [{ text: 'View photo', onPress: options.onViewPhoto }]
            : []),
          {
            text: hasPhoto ? 'Change photo' : 'Upload photo',
            onPress: () => {
              void pickAndUploadPhoto();
            },
          },
          { text: 'Cancel', style: 'cancel' as const },
        ],
      );
    },
    [authUserId, pickAndUploadPhoto, user],
  );

  return {
    isUploading,
    error,
    openPhotoActions,
    pickAndUploadPhoto,
  };
}
