import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { HomeStatePanel } from './HomeStatePanel';
import { ProductCard } from '../../products/components/ProductCard';
import { getProductRouteId } from '../../products/utils/productDisplay';
import {
  getHomeProductCardWidth,
  homeColors,
  homeRadii,
  homeShadows,
  homeSpacing,
} from '../theme/homeTheme';
import type { Product } from '../../../services/types/product';

interface FeaturedProductsSectionProps {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onProductPress: (product: Product) => void;
}

function FeaturedSkeleton({ cardWidth }: { cardWidth: number }) {
  return (
    <View style={styles.grid}>
      {Array.from({ length: 4 }).map((_, index) => (
        <View key={`skeleton-${index}`} style={[styles.cardWrap, { width: cardWidth }]}>
          <View style={styles.skeletonCard}>
            <View style={styles.skeletonImage} />
            <View style={styles.skeletonLineLarge} />
            <View style={styles.skeletonLineSmall} />
          </View>
        </View>
      ))}
    </View>
  );
}

export function FeaturedProductsSection({
  products,
  isLoading,
  error,
  onRetry,
  onProductPress,
}: FeaturedProductsSectionProps) {
  const { width } = useWindowDimensions();
  const columns = width >= 768 ? 3 : 2;
  const cardWidth = getHomeProductCardWidth(width, columns);

  if (isLoading) {
    return (
      <View style={styles.sectionSurface}>
        <FeaturedSkeleton cardWidth={cardWidth} />
      </View>
    );
  }

  if (error) {
    return (
      <HomeStatePanel
        tone="error"
        message={error}
        actionLabel="Try again"
        onAction={onRetry}
      />
    );
  }

  if (products.length === 0) {
    return (
      <HomeStatePanel
        tone="empty"
        message="No featured products available right now."
      />
    );
  }

  return (
    <View style={styles.sectionSurface}>
      <View style={[styles.grid, { gap: homeSpacing.cardGap }]}>
        {products.map((product, index) => (
          <View
            key={getProductRouteId(product) ?? `featured-${index}`}
            style={[styles.cardWrap, { width: cardWidth }]}
          >
            <ProductCard product={product} onPress={onProductPress} variant="elevated" />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionSurface: {
    marginHorizontal: homeSpacing.screen,
    padding: homeSpacing.block,
    borderRadius: homeRadii.lg,
    backgroundColor: homeColors.surface,
    borderWidth: 1,
    borderColor: homeColors.borderLight,
    ...homeShadows.soft,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'stretch',
  },
  cardWrap: {
    alignSelf: 'stretch',
    marginBottom: 0,
  },
  skeletonCard: {
    borderRadius: homeRadii.md,
    backgroundColor: homeColors.surfaceMuted,
    borderWidth: 1,
    borderColor: homeColors.borderLight,
    overflow: 'hidden',
    paddingBottom: 12,
  },
  skeletonImage: {
    width: '100%',
    aspectRatio: 0.92,
    backgroundColor: homeColors.surfaceWarm,
  },
  skeletonLineLarge: {
    height: 12,
    borderRadius: 6,
    backgroundColor: homeColors.borderLight,
    marginTop: 12,
    marginHorizontal: 12,
  },
  skeletonLineSmall: {
    height: 10,
    width: '45%',
    borderRadius: 5,
    backgroundColor: homeColors.borderLight,
    marginTop: 8,
    marginHorizontal: 12,
  },
});
