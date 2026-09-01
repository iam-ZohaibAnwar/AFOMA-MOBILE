import {
  ImageUploadSourceSheet,
  type ImageUploadSourceSheetProps,
} from '../../../../components/ui/ImageUploadSourceSheet';
import { StandardProductImageList } from './StandardProductImageList';
import type { StandardProductImageEntry } from '../types/standardProductForm';

export interface ProductMediaPickerProps {
  images: StandardProductImageEntry[];
  minImages: number;
  error?: string;
  onAdd: () => void;
  onRemove: (imageId: string) => void;
  onMove: (imageId: string, direction: 'up' | 'down') => void;
  onAltTextChange: (imageId: string, altText: string) => void;
  isAdding?: boolean;
  imageUploadSheetProps?: ImageUploadSourceSheetProps;
}

export function ProductMediaPicker({
  minImages,
  imageUploadSheetProps,
  ...props
}: ProductMediaPickerProps) {
  return (
    <StandardProductImageList
      {...props}
      minImages={minImages}
      imageUploadSheetProps={imageUploadSheetProps}
    />
  );
}
