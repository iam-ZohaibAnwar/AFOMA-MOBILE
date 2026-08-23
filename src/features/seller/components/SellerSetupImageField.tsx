import { Image, StyleSheet, View } from 'react-native';

import { AppButton } from '../../../components/ui/AppButton';
import { AppText } from '../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../design-system';
import type { SellerSetupImageKind } from '../hooks/useSellerSetupImageUpload';

export interface SellerSetupImageFieldProps {
  label: string;
  imageUrl?: string;
  kind: SellerSetupImageKind;
  isUploading?: boolean;
  error?: string | null;
  onPick: (kind: SellerSetupImageKind) => void;
}

export function SellerSetupImageField({
  label,
  imageUrl,
  kind,
  isUploading = false,
  error,
  onPick,
}: SellerSetupImageFieldProps) {
  return (
    <View style={styles.field}>
      <AppText variant="bodyMedium" style={styles.label}>
        {label}
      </AppText>

      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.preview} resizeMode="cover" accessibilityIgnoresInvertColors />
      ) : (
        <View style={styles.placeholder}>
          <AppText variant="caption" color="textMuted">
            No image selected
          </AppText>
        </View>
      )}

      <AppButton
        label={isUploading ? 'Uploading...' : imageUrl ? 'Replace image' : 'Choose image'}
        variant="secondary"
        loading={isUploading}
        onPress={() => onPick(kind)}
      />

      {error ? (
        <AppText variant="caption" color="error">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: spacing.sm,
  },
  label: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  preview: {
    width: '100%',
    height: 140,
    borderRadius: radius.medium,
    backgroundColor: colors.secondaryMuted,
  },
  placeholder: {
    width: '100%',
    height: 140,
    borderRadius: radius.medium,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
});
