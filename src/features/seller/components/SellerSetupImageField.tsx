import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '../../../components/ui/AppText';
import { colors, radius, shadows, spacing } from '../../../design-system';
import type { SellerSetupImageKind } from '../hooks/useSellerSetupImageUpload';

export interface SellerSetupImageFieldProps {
  label: string;
  imageUrl?: string;
  kind: SellerSetupImageKind;
  isUploading?: boolean;
  error?: string | null;
  onPick: (kind: SellerSetupImageKind) => void;
  onRemove?: (kind: SellerSetupImageKind) => void;
}

const KIND_CONFIG: Record<
  SellerSetupImageKind,
  {
    hint: string;
    emptyTitle: string;
    emptySubtitle: string;
    emptyTapLabel: string;
    changeLabel: string;
    borderRadius: number;
  }
> = {
  profile: {
    hint: 'Recommended 120 × 120 px · JPG, PNG, GIF or WebP',
    emptyTitle: 'Add profile photo',
    emptySubtitle: 'JPG, PNG, GIF or WebP',
    emptyTapLabel: 'Tap to add photo',
    changeLabel: 'Change photo',
    borderRadius: radius.medium,
  },
  banner: {
    hint: 'Recommended 1200 × 400 px',
    emptyTitle: 'Add store banner',
    emptySubtitle: 'Wide image for your shop header',
    emptyTapLabel: 'Tap to add banner',
    changeLabel: 'Change banner',
    borderRadius: radius.large,
  },
  logo: {
    hint: 'Recommended 200 × 200 px · Square logo',
    emptyTitle: 'Add store logo',
    emptySubtitle: 'Square logo for your shop',
    emptyTapLabel: 'Tap to add logo',
    changeLabel: 'Change logo',
    borderRadius: radius.medium,
  },
};

export function SellerSetupImageField({
  label,
  imageUrl,
  kind,
  isUploading = false,
  error,
  onPick,
  onRemove,
}: SellerSetupImageFieldProps) {
  const config = KIND_CONFIG[kind];
  const hasImage = Boolean(imageUrl?.trim());
  const isSquare = kind !== 'banner';

  return (
    <View style={styles.field}>
      <View style={styles.labelRow}>
        <AppText variant="label" style={styles.label}>
          {label}
        </AppText>
        <AppText variant="caption" color="textSecondary">
          {config.hint}
        </AppText>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={hasImage ? config.changeLabel : config.emptyTitle}
        disabled={isUploading}
        onPress={() => onPick(kind)}
        style={({ pressed }) => [
          styles.frame,
          kind === 'banner' ? styles.frameBanner : styles.frameSquare,
          {
            borderRadius: config.borderRadius,
          },
          pressed && !isUploading && styles.framePressed,
          error && styles.frameError,
        ]}
      >
        {hasImage ? (
          <>
            <Image
              source={{ uri: imageUrl }}
              style={StyleSheet.absoluteFillObject}
              resizeMode="cover"
              accessibilityIgnoresInvertColors
            />
            <View style={[styles.imageOverlay, isSquare && styles.imageOverlaySquare]}>
              <View style={[styles.changeBadge, isSquare && styles.changeBadgeSquare]}>
                <Ionicons name="camera-outline" size={isSquare ? 18 : 16} color={colors.textInverse} />
                {isSquare ? null : (
                  <AppText variant="caption" style={styles.changeBadgeText}>
                    {config.changeLabel}
                  </AppText>
                )}
              </View>
            </View>
          </>
        ) : isSquare ? (
          <View style={styles.emptyStateSquare}>
            <View style={styles.iconCircleSquare}>
              <Ionicons name="camera-outline" size={20} color={colors.primary} />
            </View>
            <AppText variant="caption" color="textMuted" style={styles.emptyTapLabel} numberOfLines={2}>
              {config.emptyTapLabel}
            </AppText>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.iconCircle}>
              <Ionicons name="image-outline" size={22} color={colors.primary} />
            </View>
            <AppText variant="bodyMedium" style={styles.emptyTitle}>
              {config.emptyTitle}
            </AppText>
            <AppText variant="caption" color="textMuted" style={styles.emptySubtitle}>
              {config.emptySubtitle}
            </AppText>
          </View>
        )}

        {isUploading ? (
          <View style={styles.uploadOverlay}>
            <ActivityIndicator size="small" color={colors.textInverse} />
            <AppText variant="caption" style={styles.uploadingText}>
              Uploading...
            </AppText>
          </View>
        ) : null}
      </Pressable>

      {hasImage && onRemove ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Remove ${label.toLowerCase()}`}
          disabled={isUploading}
          onPress={() => onRemove(kind)}
          style={({ pressed }) => [styles.removeAction, pressed && styles.removeActionPressed]}
        >
          <Ionicons name="trash-outline" size={16} color={colors.error} />
          <AppText variant="caption" style={styles.removeLabel}>
            Remove image
          </AppText>
        </Pressable>
      ) : null}

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
  labelRow: {
    gap: 2,
  },
  label: {
    color: colors.textPrimary,
  },
  frame: {
    alignSelf: 'stretch',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderForm,
    backgroundColor: colors.surfaceWhite,
    ...shadows.card,
  },
  frameSquare: {
    width: 128,
    height: 128,
    alignSelf: 'flex-start',
  },
  frameBanner: {
    width: '100%',
    aspectRatio: 3,
  },
  framePressed: {
    opacity: 0.94,
  },
  frameError: {
    borderColor: colors.error,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  emptyStateSquare: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  iconCircleSquare: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTapLabel: {
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: spacing.xs,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptySubtitle: {
    textAlign: 'center',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(23, 37, 84, 0.08)',
  },
  imageOverlaySquare: {
    justifyContent: 'center',
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.overlay,
  },
  changeBadgeSquare: {
    marginBottom: 0,
    width: 36,
    height: 36,
    paddingHorizontal: 0,
    paddingVertical: 0,
    justifyContent: 'center',
  },
  changeBadgeText: {
    color: colors.textInverse,
    fontWeight: '600',
  },
  uploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.overlay,
  },
  uploadingText: {
    color: colors.textInverse,
    fontWeight: '600',
  },
  removeAction: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  removeActionPressed: {
    opacity: 0.7,
  },
  removeLabel: {
    color: colors.error,
    fontWeight: '600',
  },
});
