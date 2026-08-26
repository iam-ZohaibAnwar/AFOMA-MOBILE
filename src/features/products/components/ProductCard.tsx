import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { ProductPrice } from '../../../components/ecommerce/ProductPrice';
import { colors, radius, shadows } from '../../../design-system';
import type { Product } from '../../../services/types/product';
import {
  getProductCompareAtPrice,
  getProductDiscountPercent,
  getProductDisplayName,
  getProductImageUrl,
  getProductPrice,
} from '../utils/productDisplay';

interface ProductCardProps {
  product: Product;
  onPress: (product: Product) => void;
  variant?: 'default' | 'elevated';
}

export function ProductCard({ product, onPress, variant = 'default' }: ProductCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const imageUrl = getProductImageUrl(product);
  const showImage = Boolean(imageUrl) && !imageFailed;
  const isElevated = variant === 'elevated';

  return (
    <View style={styles.cardHost}>
      <Pressable
        style={({ pressed }) => [
          styles.card,
          isElevated && styles.cardElevated,
          pressed && styles.cardPressed,
        ]}
        onPress={() => onPress(product)}
      >
      <View style={[styles.imageWrap, isElevated && styles.imageWrapElevated]}>
        {showImage ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="cover"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>No image</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={[styles.name, isElevated && styles.nameElevated]} numberOfLines={2}>
          {getProductDisplayName(product)}
        </Text>
        <View style={styles.priceWrap}>
          <ProductPrice
            price={getProductPrice(product)}
            compareAtPrice={getProductCompareAtPrice(product)}
            discountPercent={getProductDiscountPercent(product)}
            size="sm"
            layout="marketplace"
          />
        </View>
      </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  cardHost: {
    flex: 1,
    alignSelf: 'stretch',
  },
  card: {
    flex: 1,
    borderRadius: radius.large,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  cardElevated: {
    borderColor: colors.borderStrong,
    ...shadows.card,
  },
  cardPressed: {
    opacity: 0.94,
  },
  imageWrap: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: colors.surfaceMuted,
  },
  imageWrapElevated: {
    aspectRatio: 0.92,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  imagePlaceholderText: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
    gap: 6,
  },
  priceWrap: {
    marginTop: 'auto',
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: 18,
    minHeight: 36,
  },
  nameElevated: {
    fontSize: 13,
    fontWeight: '700',
    minHeight: 34,
  },
});
