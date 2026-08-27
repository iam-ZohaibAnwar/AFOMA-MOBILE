import { useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, View, type ImageSourcePropType } from 'react-native';

import { AppText } from '../../../components/ui/AppText';
import { colors, radius, shadows, spacing } from '../../../design-system';
import { getBrowseCategoryImageSource } from '../../categories/utils/categoryImage';
import { getCategoryBannerColor } from '../../categories/utils/categoryBannerTheme';
import {
  getCategoryPlaceholderImageUrl,
  getSubCategoryImageUrl,
} from '../../categories/utils/subCategoryImage';

export interface ShopCategoryGridCardProps {
  name: string;
  slug?: string;
  colorIndex?: number;
  selected?: boolean;
  onPress: () => void;
}

export function ShopCategoryGridCard({
  name,
  slug,
  colorIndex = 0,
  selected = false,
  onPress,
}: ShopCategoryGridCardProps) {
  const bannerColor = getCategoryBannerColor(colorIndex);
  const localSource = useMemo(() => getBrowseCategoryImageSource(slug, name), [name, slug]);
  const placeholderUri = getCategoryPlaceholderImageUrl();
  const [useRemoteFallback, setUseRemoteFallback] = useState(false);
  const [usePlaceholderFallback, setUsePlaceholderFallback] = useState(false);

  const imageSource = useMemo<ImageSourcePropType>(() => {
    if (localSource && !useRemoteFallback && !usePlaceholderFallback) {
      return localSource;
    }

    if (!usePlaceholderFallback) {
      return { uri: getSubCategoryImageUrl(slug) };
    }

    return { uri: placeholderUri };
  }, [localSource, placeholderUri, slug, usePlaceholderFallback, useRemoteFallback]);

  const handleImageError = () => {
    if (localSource && !useRemoteFallback) {
      setUseRemoteFallback(true);
      return;
    }

    if (!usePlaceholderFallback) {
      setUsePlaceholderFallback(true);
    }
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Browse ${name}`}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        selected && styles.cardSelected,
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.colorFallback, { backgroundColor: bannerColor }]} />

      <Image
        source={imageSource}
        style={styles.backgroundImage}
        resizeMode="cover"
        onError={handleImageError}
      />

      <View style={styles.scrim} pointerEvents="none" />

      <View style={styles.titleWrap} pointerEvents="none">
        <AppText variant="bodyMedium" style={styles.title} numberOfLines={2}>
          {name}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 112,
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderStrong,
    ...shadows.card,
  },
  cardSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  pressed: {
    opacity: 0.94,
  },
  colorFallback: {
    ...StyleSheet.absoluteFillObject,
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(23, 37, 84, 0.48)',
  },
  titleWrap: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    zIndex: 1,
  },
  title: {
    color: colors.textInverse,
    fontWeight: '700',
    lineHeight: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
