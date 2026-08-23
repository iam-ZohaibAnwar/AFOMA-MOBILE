import { useState } from 'react';
import { Image, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from '../../../components/ui/AppText';
import { colors, radius, shadows, spacing } from '../../../design-system';
import {
  getCategoryPlaceholderImageUrl,
  getSubCategoryImageUrl,
} from '../utils/subCategoryImage';

export type CategoryImageTileVariant = 'category' | 'viewAll';

export interface CategoryImageTileProps {
  label: string;
  slug?: string;
  width: number;
  variant?: CategoryImageTileVariant;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export function CategoryImageTile({
  label,
  slug,
  width,
  variant = 'category',
  onPress,
  style,
}: CategoryImageTileProps) {
  const placeholder = getCategoryPlaceholderImageUrl();
  const [imageUri, setImageUri] = useState(
    variant === 'viewAll' ? placeholder : getSubCategoryImageUrl(slug),
  );

  const imageSize = width;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={variant === 'viewAll' ? `View all ${label}` : `Browse ${label}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        { width },
        pressed && styles.pressed,
        style,
      ]}
    >
      <View
        style={[
          styles.imageWrap,
          { width: imageSize, height: imageSize },
          variant === 'viewAll' && styles.viewAllImageWrap,
        ]}
      >
        {variant === 'viewAll' ? (
          <AppText variant="label" color="primary" style={styles.viewAllText}>
            View all →
          </AppText>
        ) : (
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            resizeMode="cover"
            onError={() => setImageUri(placeholder)}
          />
        )}
      </View>
      <AppText variant="label" numberOfLines={2} style={styles.label}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.985 }],
  },
  imageWrap: {
    borderRadius: radius.large,
    overflow: 'hidden',
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  viewAllImageWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  viewAllText: {
    textAlign: 'center',
    fontWeight: '700',
  },
  label: {
    textAlign: 'center',
    minHeight: 36,
  },
});
