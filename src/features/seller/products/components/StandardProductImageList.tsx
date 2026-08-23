import { ActivityIndicator, Image, Pressable, StyleSheet, View } from 'react-native';

import { AppButton } from '../../../../components/ui/AppButton';
import { AppInput } from '../../../../components/ui/AppInput';
import { AppText } from '../../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../../design-system';
import type { StandardProductImageEntry } from '../types/standardProductForm';
import { STANDARD_PRODUCT_MIN_IMAGES } from '../utils/standardProductConstants';

export interface StandardProductImageListProps {
  images: StandardProductImageEntry[];
  minImages?: number;
  error?: string;
  onAdd: () => void;
  onRemove: (imageId: string) => void;
  onMove: (imageId: string, direction: 'up' | 'down') => void;
  onAltTextChange: (imageId: string, altText: string) => void;
  isAdding?: boolean;
}

export function StandardProductImageList({
  images,
  minImages = STANDARD_PRODUCT_MIN_IMAGES,
  error,
  onAdd,
  onRemove,
  onMove,
  onAltTextChange,
  isAdding = false,
}: StandardProductImageListProps) {
  return (
    <View style={styles.container}>
      <AppText variant="bodySmall" color="textSecondary">
        Add at least {minImages} images (max 2 MB each after compression).
      </AppText>

      <AppButton
        label={isAdding ? 'Adding image...' : 'Add image'}
        variant="outline"
        onPress={onAdd}
        loading={isAdding}
        disabled={isAdding}
      />

      {error ? (
        <AppText variant="caption" color="error">
          {error}
        </AppText>
      ) : null}

      <View style={styles.grid}>
        {images.map((image, index) => {
          const previewUri = image.imageUrl ?? image.localUri;
          return (
            <View key={image.id} style={styles.card}>
              <View style={styles.previewWrap}>
                {previewUri ? (
                  <Image source={{ uri: previewUri }} style={styles.preview} resizeMode="cover" />
                ) : (
                  <View style={[styles.preview, styles.previewPlaceholder]}>
                    <AppText variant="caption" color="textMuted">
                      No preview
                    </AppText>
                  </View>
                )}

                {image.isUploading ? (
                  <View style={styles.uploadOverlay}>
                    <ActivityIndicator size="small" color={colors.primary} />
                  </View>
                ) : null}
              </View>

              <AppInput
                label="Alt text"
                value={image.altText}
                onChangeText={(text) => onAltTextChange(image.id, text)}
                placeholder="Describe this image"
              />

              {image.uploadError ? (
                <AppText variant="caption" color="error">
                  {image.uploadError}
                </AppText>
              ) : null}

              <View style={styles.actions}>
                <Pressable
                  accessibilityRole="button"
                  disabled={index === 0}
                  onPress={() => onMove(image.id, 'up')}
                  style={[styles.actionButton, index === 0 && styles.actionDisabled]}
                >
                  <AppText variant="caption" color="primary">
                    Move up
                  </AppText>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  disabled={index === images.length - 1}
                  onPress={() => onMove(image.id, 'down')}
                  style={[
                    styles.actionButton,
                    index === images.length - 1 && styles.actionDisabled,
                  ]}
                >
                  <AppText variant="caption" color="primary">
                    Move down
                  </AppText>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => onRemove(image.id)}
                  style={styles.actionButton}
                >
                  <AppText variant="caption" color="error">
                    Remove
                  </AppText>
                </Pressable>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  grid: {
    gap: spacing.md,
  },
  card: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.medium,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },
  previewWrap: {
    position: 'relative',
  },
  preview: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: radius.medium,
    backgroundColor: colors.surfaceMuted,
  },
  previewPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.65)',
    borderRadius: radius.medium,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  actionButton: {
    paddingVertical: spacing.xs,
  },
  actionDisabled: {
    opacity: 0.4,
  },
});
