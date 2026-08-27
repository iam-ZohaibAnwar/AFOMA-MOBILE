import { useMemo, useState } from 'react';
import { Image, StyleSheet, View, type ImageSourcePropType } from 'react-native';

import { colors } from '../../../design-system';
import { getBrowseCategoryImageSource } from '../utils/categoryImage';
import {
  getCategoryPlaceholderImageUrl,
  getSubCategoryImageUrl,
} from '../utils/subCategoryImage';

export interface BrowseCategoryCardImageProps {
  name: string;
  slug?: string;
  size?: number;
}

function getRemoteCategoryImageUri(slug: string | undefined): string {
  return getSubCategoryImageUrl(slug);
}

export function BrowseCategoryCardImage({ name, slug, size = 88 }: BrowseCategoryCardImageProps) {
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
    <View style={[styles.imageWrap, { width: size, height: size, borderRadius: Math.round(size * 0.22) }]}>
      <Image
        source={imageSource}
        style={styles.image}
        resizeMode="cover"
        onError={handleImageError}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  imageWrap: {
    overflow: 'hidden',
    backgroundColor: colors.surfaceMuted,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
