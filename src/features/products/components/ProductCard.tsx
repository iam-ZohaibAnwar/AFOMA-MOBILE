import { useState } from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import type { Product } from '../../../services/types/product';
import {
  formatProductPrice,
  getProductDisplayName,
  getProductImageUrl,
  getProductPrice,
} from '../utils/productDisplay';

interface ProductCardProps {
  product: Product;
  onPress: (product: Product) => void;
  variant?: 'default' | 'elevated';
}

const colors = {
  surface: '#FFFFFF',
  surfaceWarm: '#FFEDD5',
  border: '#FED7AA',
  borderLight: '#FFEDD5',
  text: '#172554',
  textMuted: '#64748B',
  primary: '#EA580C',
};

const elevatedShadow = Platform.select({
  ios: {
    shadowColor: '#172554',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
  },
  android: {
    elevation: 4,
  },
  default: {},
});

export function ProductCard({ product, onPress, variant = 'default' }: ProductCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const imageUrl = getProductImageUrl(product);
  const showImage = Boolean(imageUrl) && !imageFailed;
  const isElevated = variant === 'elevated';

  return (
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
        <Text style={[styles.price, isElevated && styles.priceElevated]}>
          {formatProductPrice(getProductPrice(product))}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
  },
  cardElevated: {
    borderColor: colors.border,
    ...elevatedShadow,
  },
  cardPressed: {
    opacity: 0.94,
  },
  imageWrap: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: colors.surfaceWarm,
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
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
    gap: 6,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 18,
    minHeight: 36,
  },
  nameElevated: {
    fontSize: 13,
    fontWeight: '700',
    minHeight: 34,
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  priceElevated: {
    fontSize: 15,
  },
});
