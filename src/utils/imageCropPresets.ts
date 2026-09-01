export type ImageCropOptions = {
  allowsEditing: boolean;
  aspect?: [number, number];
};

/** Square crop — profile photos, logos, product listing images. */
export const SQUARE_IMAGE_CROP: ImageCropOptions = {
  allowsEditing: true,
  aspect: [1, 1],
};

/** Wide banner crop — seller store header. */
export const BANNER_IMAGE_CROP: ImageCropOptions = {
  allowsEditing: true,
  aspect: [3, 1],
};

/** Multi-select flows cannot use the native crop UI. */
export const NO_IMAGE_CROP: ImageCropOptions = {
  allowsEditing: false,
};
