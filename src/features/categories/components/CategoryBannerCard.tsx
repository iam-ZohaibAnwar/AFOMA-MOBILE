import { useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, View, type ImageSourcePropType } from 'react-native';

import { AppText } from '../../../components/ui/AppText';
import { colors, spacing } from '../../../design-system';
import { getBrowseCategoryImageSource } from '../utils/categoryImage';
import { getCategoryBannerColor } from '../utils/categoryBannerTheme';
import {
  getCategoryPlaceholderImageUrl,
  getSubCategoryImageUrl,
} from '../utils/subCategoryImage';

export const CATEGORY_BANNER_HEIGHT = 120;

export interface CategoryBannerCardProps {
  name: string;
  slug?: string;
  colorIndex?: number;
  expanded?: boolean;
  onPress: () => void;
}

function getRemoteCategoryImageUri(slug: string | undefined): string {
  return getSubCategoryImageUrl(slug);
}

export function CategoryBannerCard({
  name,
  slug,
  colorIndex = 0,
  expanded = false,
  onPress,
}: CategoryBannerCardProps) {
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
      return { uri: getRemoteCategoryImageUri(slug) };
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
      accessibilityLabel={`Open ${name}`}
      accessibilityState={{ expanded }}
      onPress={onPress}
      style={({ pressed }) => [styles.banner, pressed && styles.pressed]}
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
        <AppText variant="h2" style={styles.title} numberOfLines={2}>
          {name.toUpperCase()}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: {
    height: CATEGORY_BANNER_HEIGHT,
    overflow: 'hidden',
    justifyContent: 'center',
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
    backgroundColor: 'rgba(23, 37, 84, 0.42)',
  },
  titleWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    zIndex: 1,
  },
  title: {
    color: colors.textInverse,
    fontWeight: '800',
    letterSpacing: 0.5,
    lineHeight: 28,
    textShadowColor: 'rgba(0, 0, 0, 0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  pressed: {
    opacity: 0.96,
  },
});
