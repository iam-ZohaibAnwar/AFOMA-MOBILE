import { ActivityIndicator, Image, Pressable, StyleSheet, View } from 'react-native';

import { AppButton } from '../../../../components/ui/AppButton';
import { AppText } from '../../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../../design-system';

export interface AdminUserProfilePhotoFieldProps {
  imageUrl?: string;
  localUri?: string;
  isUploading?: boolean;
  uploadError?: string | null;
  onPickPhoto: () => void;
  onRetryUpload?: () => void;
  onRemovePhoto?: () => void;
}

export function AdminUserProfilePhotoField({
  imageUrl,
  localUri,
  isUploading,
  uploadError,
  onPickPhoto,
  onRetryUpload,
  onRemovePhoto,
}: AdminUserProfilePhotoFieldProps) {
  const previewUri = imageUrl?.trim() || localUri?.trim();
  const showRetry = Boolean(localUri && !imageUrl && onRetryUpload);

  return (
    <View style={styles.container}>
      <AppText variant="label">Profile photo</AppText>

      <View style={styles.previewRow}>
        {previewUri ? (
          <Image source={{ uri: previewUri }} style={styles.preview} resizeMode="cover" />
        ) : (
          <View style={styles.previewPlaceholder}>
            <AppText variant="caption" color="textMuted">
              No photo
            </AppText>
          </View>
        )}

        <View style={styles.actions}>
          <AppButton
            label={previewUri ? 'Change photo' : 'Choose photo'}
            variant="outline"
            onPress={onPickPhoto}
            disabled={isUploading}
          />
          {showRetry ? (
            <AppButton
              label="Retry upload"
              variant="outline"
              onPress={onRetryUpload}
              disabled={isUploading}
            />
          ) : null}
          {previewUri && onRemovePhoto ? (
            <Pressable
              accessibilityRole="button"
              onPress={onRemovePhoto}
              disabled={isUploading}
              style={[styles.removeButton, isUploading && styles.disabled]}
            >
              <AppText variant="bodySmall" style={styles.removeLabel}>
                Remove
              </AppText>
            </Pressable>
          ) : null}
        </View>
      </View>

      {isUploading ? (
        <View style={styles.uploadingRow}>
          <ActivityIndicator size="small" color={colors.primary} />
          <AppText variant="caption" color="textSecondary">
            Uploading profile photo...
          </AppText>
        </View>
      ) : null}

      {uploadError ? (
        <AppText variant="caption" color="error">
          {uploadError}
        </AppText>
      ) : null}

      {localUri && !imageUrl && !isUploading ? (
        <AppText variant="caption" color="textSecondary">
          Photo selected locally. Upload must succeed before save if a photo is chosen.
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  previewRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  preview: {
    width: 88,
    height: 88,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
  },
  previewPlaceholder: {
    width: 88,
    height: 88,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
  },
  actions: {
    flex: 1,
    gap: spacing.sm,
  },
  removeButton: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
  },
  removeLabel: {
    color: colors.error,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.5,
  },
  uploadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});
