import { useMemo, useState } from 'react';
import { Image, StyleSheet, View, type ImageSourcePropType } from 'react-native';

import { colors, radius } from '../../../design-system';
import { getCategoryImageSource } from '../utils/categoryImage';
import {
  getCategoryPlaceholderImageUrl,
  getSubCategoryImageUrl,
} from '../utils/subCategoryImage';

export interface BrowseCategoryCardImageProps {
  name: string;
  slug?: string;
}

function getRemoteCategoryImageUri(slug: string | undefined): string {
  return getSubCategoryImageUrl(slug);
}

export function BrowseCategoryCardImage({ name, slug }: BrowseCategoryCardImageProps) {
  const localSource = useMemo(() => getCategoryImageSource(slug, name), [name, slug]);
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
    <View style={styles.imageWrap}>
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
    width: 88,
    height: 88,
    borderRadius: radius.large,
    overflow: 'hidden',
    backgroundColor: colors.surfaceMuted,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
