import { useCallback, useMemo, useRef, useState } from 'react';
import type * as ImagePicker from 'expo-image-picker';

import type { ImageCropOptions } from '../utils/imageCropPresets';
import type { ImageUploadSourceAction } from '../components/ui/ImageUploadSourceSheet';
import {
  pickImageAsset,
  pickMultipleImagesFromLibrary,
  type ImagePickSource,
} from '../utils/pickImageAsset';

export type OpenImageUploadSheetConfig = {
  title?: string;
  subtitle?: string;
  showLibrary?: boolean;
  showCamera?: boolean;
  libraryLabel?: string;
  cameraLabel?: string;
  allowsMultipleSelection?: boolean;
  selectionLimit?: number;
  crop?: ImageCropOptions;
  extraActions?: ImageUploadSourceAction[];
};

type PickImageResult = {
  asset: ImagePicker.ImagePickerAsset | null;
  error?: string;
};

type PickImagesResult = {
  assets: ImagePicker.ImagePickerAsset[];
  error?: string;
};

type PendingRequest =
  | {
      kind: 'single';
      config: OpenImageUploadSheetConfig;
      resolve: (value: PickImageResult) => void;
    }
  | {
      kind: 'multiple';
      config: OpenImageUploadSheetConfig;
      resolve: (value: PickImagesResult) => void;
    };

const DEFAULT_CONFIG: OpenImageUploadSheetConfig = {
  title: 'Upload image',
  showLibrary: true,
  showCamera: true,
};

export function useImageUploadSourceSheet() {
  const [pending, setPending] = useState<PendingRequest | null>(null);
  const pendingRef = useRef<PendingRequest | null>(null);

  const dismiss = useCallback(() => {
    pendingRef.current = null;
    setPending(null);
  }, []);

  const finishSingle = useCallback(
    (result: PickImageResult) => {
      const request = pendingRef.current;
      dismiss();
      if (request?.kind === 'single') {
        request.resolve(result);
      }
    },
    [dismiss],
  );

  const finishMultiple = useCallback(
    (result: PickImagesResult) => {
      const request = pendingRef.current;
      dismiss();
      if (request?.kind === 'multiple') {
        request.resolve(result);
      }
    },
    [dismiss],
  );

  const pickImage = useCallback((config: OpenImageUploadSheetConfig = {}) => {
    return new Promise<PickImageResult>((resolve) => {
      const request: PendingRequest = {
        kind: 'single',
        config: { ...DEFAULT_CONFIG, ...config },
        resolve,
      };
      pendingRef.current = request;
      setPending(request);
    });
  }, []);

  const pickImages = useCallback((config: OpenImageUploadSheetConfig = {}) => {
    return new Promise<PickImagesResult>((resolve) => {
      const request: PendingRequest = {
        kind: 'multiple',
        config: {
          ...DEFAULT_CONFIG,
          title: 'Upload images',
          showCamera: false,
          allowsMultipleSelection: true,
          ...config,
        },
        resolve,
      };
      pendingRef.current = request;
      setPending(request);
    });
  }, []);

  const handleSource = useCallback(
    async (source: ImagePickSource) => {
      const request = pendingRef.current;
      if (!request) {
        return;
      }

      const { config } = request;

      if (request.kind === 'multiple' || config.allowsMultipleSelection) {
        const result = await pickMultipleImagesFromLibrary({
          selectionLimit: config.selectionLimit,
          crop: config.crop,
        });
        finishMultiple(result);
        return;
      }

      const result = await pickImageAsset(source, {
        crop: config.crop,
      });
      finishSingle(result);
    },
    [finishMultiple, finishSingle],
  );

  const close = useCallback(() => {
    const request = pendingRef.current;
    if (!request) {
      return;
    }

    if (request.kind === 'single') {
      finishSingle({ asset: null });
      return;
    }

    finishMultiple({ assets: [] });
  }, [finishMultiple, finishSingle]);

  const sheetProps = useMemo(() => {
    if (!pending) {
      return {
        visible: false,
        title: '',
        actions: [] as ImageUploadSourceAction[],
        onClose: close,
      };
    }

    const { config } = pending;
    const actions: ImageUploadSourceAction[] = [
      ...(config.extraActions ?? []).map((action) => ({
        ...action,
        onPress: () => {
          close();
          action.onPress();
        },
      })),
      ...(config.showLibrary !== false
        ? [
            {
              id: 'library',
              label: config.libraryLabel ?? 'Choose from library',
              icon: 'images-outline' as const,
              onPress: () => void handleSource('library'),
            },
          ]
        : []),
      ...(config.showCamera !== false
        ? [
            {
              id: 'camera',
              label: config.cameraLabel ?? 'Take photo',
              icon: 'camera-outline' as const,
              onPress: () => void handleSource('camera'),
            },
          ]
        : []),
    ];

    return {
      visible: true,
      title: config.title ?? DEFAULT_CONFIG.title!,
      subtitle: config.subtitle,
      actions,
      onClose: close,
    };
  }, [close, handleSource, pending]);

  return {
    pickImage,
    pickImages,
    dismiss,
    sheetProps,
  };
}
