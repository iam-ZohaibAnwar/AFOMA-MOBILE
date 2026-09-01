import * as ImagePicker from 'expo-image-picker';

import { isAllowedImageMimeType } from '../features/seller/products/utils/productImageUpload';
import { NO_IMAGE_CROP, SQUARE_IMAGE_CROP, type ImageCropOptions } from './imageCropPresets';

export type ImagePickSource = 'library' | 'camera';

export type PickImageAssetOptions = {
  allowsMultipleSelection?: boolean;
  selectionLimit?: number;
  crop?: ImageCropOptions;
};

export type PickImageAssetResult = {
  asset: ImagePicker.ImagePickerAsset | null;
  error?: string;
};

export type PickMultipleImageAssetsResult = {
  assets: ImagePicker.ImagePickerAsset[];
  error?: string;
};

const UNSUPPORTED_TYPE_ERROR = 'Unsupported image type. Use JPG, PNG, GIF, or WebP.';

function buildPickerOptions(
  source: ImagePickSource,
  options: PickImageAssetOptions,
): ImagePicker.ImagePickerOptions {
  const crop = options.crop ?? SQUARE_IMAGE_CROP;
  const allowsMultipleSelection = options.allowsMultipleSelection ?? false;
  const allowsEditing = allowsMultipleSelection ? false : crop.allowsEditing;

  return {
    mediaTypes: ['images'],
    quality: 1,
    allowsMultipleSelection,
    selectionLimit: options.selectionLimit,
    allowsEditing,
    ...(allowsEditing && crop.aspect ? { aspect: crop.aspect } : {}),
  };
}

export async function pickImageAsset(
  source: ImagePickSource,
  options: PickImageAssetOptions = {},
): Promise<PickImageAssetResult> {
  const permission =
    source === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    return {
      asset: null,
      error:
        source === 'camera'
          ? 'Camera permission is required to take a photo.'
          : 'Photo library permission is required to choose an image.',
    };
  }

  const pickerOptions = buildPickerOptions(source, options);
  const result =
    source === 'camera'
      ? await ImagePicker.launchCameraAsync(pickerOptions)
      : await ImagePicker.launchImageLibraryAsync(pickerOptions);

  if (result.canceled || !result.assets?.[0]) {
    return { asset: null };
  }

  const asset = result.assets[0];
  if (!isAllowedImageMimeType(asset.mimeType)) {
    return { asset: null, error: UNSUPPORTED_TYPE_ERROR };
  }

  return { asset };
}

export async function pickMultipleImagesFromLibrary(
  options: PickImageAssetOptions = {},
): Promise<PickMultipleImageAssetsResult> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    return {
      assets: [],
      error: 'Photo library permission is required to choose images.',
    };
  }

  const result = await ImagePicker.launchImageLibraryAsync(
    buildPickerOptions('library', {
      ...options,
      allowsMultipleSelection: true,
      crop: NO_IMAGE_CROP,
    }),
  );

  if (result.canceled || !result.assets?.length) {
    return { assets: [] };
  }

  const assets = result.assets.filter((asset) => isAllowedImageMimeType(asset.mimeType));
  if (!assets.length) {
    return { assets: [], error: UNSUPPORTED_TYPE_ERROR };
  }

  return { assets };
}
