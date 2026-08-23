import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../design-system';
import type { Product } from '../../../services/types/product';
import {
  formatProductPrice,
  getProductImageUrl,
  getProductPrice,
} from '../../products/utils/productDisplay';

export interface CartRecommendationsSectionProps {
  products: Product[];
  isLoading?: boolean;
  currency?: string;
  onProductPress: (product: Product) => void;
}

export function CartRecommendationsSection({
  products,
  isLoading = false,
  currency = 'CAD',
  onProductPress,
}: CartRecommendationsSectionProps) {
  if (isLoading) {
    return (
      <View style={styles.loadingBox}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <AppText variant="h3" style={styles.title}>
        You might also like
      </AppText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {products.map((product) => (
          <RecommendationCard
            key={product._id ?? product.slug}
            product={product}
            currency={currency}
            onPress={() => onProductPress(product)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

function RecommendationCard({
  product,
  currency,
  onPress,
}: {
  product: Product;
  currency: string;
  onPress: () => void;
}) {
  const imageUrl = getProductImageUrl(product);
  const price = getProductPrice(product);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={styles.imagePlaceholder} />
      )}
      <AppText variant="bodySmall" style={styles.price}>
        {formatProductPrice(price, currency)}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md,
    paddingVertical: spacing.lg,
  },
  title: {
    color: colors.textPrimary,
  },
  row: {
    gap: spacing.md,
    paddingRight: spacing.lg,
  },
  card: {
    width: 96,
    gap: spacing.sm,
    alignItems: 'center',
  },
  image: {
    width: 96,
    height: 96,
    borderRadius: radius.large,
    backgroundColor: colors.disabledBg,
  },
  imagePlaceholder: {
    width: 96,
    height: 96,
    borderRadius: radius.large,
    backgroundColor: colors.disabledBg,
  },
  price: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  loadingBox: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.92,
  },
});
