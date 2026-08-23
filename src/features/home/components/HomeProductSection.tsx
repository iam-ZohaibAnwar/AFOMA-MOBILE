import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';

import { FadeInContent } from '../../../components/motion';
import {
  EmptyState,
  ErrorState,
  ProductCard,
} from '../../../components/ecommerce';
import { AppText } from '../../../components/ui/AppText';
import { getProductRouteId } from '../../products/utils/productDisplay';
import {
  getHomeGridCardWidth,
  getHomeHorizontalProductCardWidth,
} from '../utils/homeLayout';
import { colors, screenPaddingHorizontal, spacing } from '../../../design-system';
import type { Product } from '../../../services/types/product';

type HomeProductSectionLayout = 'grid' | 'horizontal' | 'pair';

interface HomeProductSectionProps {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onProductPress: (product: Product) => void;
  layout?: HomeProductSectionLayout;
  maxGridItems?: number;
  maxItems?: number;
}

export function HomeProductSection({
  products,
  isLoading,
  error,
  onRetry,
  onProductPress,
  layout = 'grid',
  maxGridItems = 4,
  maxItems = 4,
}: HomeProductSectionProps) {
  const { width } = useWindowDimensions();
  const gridCardWidth = getHomeGridCardWidth(width, 2);
  const horizontalCardWidth = getHomeHorizontalProductCardWidth(width);
  const previewLimit = layout === 'grid' ? maxGridItems : maxItems;
  const visibleProducts = products.slice(0, previewLimit);

  if (error && visibleProducts.length === 0 && !isLoading) {
    return (
      <ErrorState message={error} onAction={() => void onRetry()} style={styles.statePanel} />
    );
  }

  if (visibleProducts.length === 0) {
    if (isLoading) {
      return null;
    }

    return (
      <EmptyState
        title="No products yet"
        message="Check back soon for new marketplace picks."
        style={styles.statePanel}
      />
    );
  }

  const errorBanner =
    error && visibleProducts.length > 0 ? (
      <Pressable style={styles.refreshBanner} onPress={() => void onRetry()}>
        <AppText variant="bodySmall" color="error">
          {error}
        </AppText>
        <AppText variant="bodySmall" style={styles.refreshBannerAction}>
          Retry
        </AppText>
      </Pressable>
    ) : null;

  if (layout === 'pair') {
    return (
      <FadeInContent>
        {errorBanner}
        <View style={[styles.grid, styles.pairRow]}>
          {visibleProducts.map((product, index) => (
            <View
              key={getProductRouteId(product) ?? `product-${index}`}
              style={{ width: gridCardWidth }}
            >
              <ProductCard
                product={product}
                onPress={onProductPress}
                variant="elevated"
                layout="marketplace"
                showSeller
              />
            </View>
          ))}
        </View>
      </FadeInContent>
    );
  }

  if (layout === 'horizontal') {
    return (
      <FadeInContent>
        {errorBanner}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalContent}
          decelerationRate="fast"
        >
          {visibleProducts.map((product, index) => (
            <View
              key={getProductRouteId(product) ?? `product-${index}`}
              style={{ width: horizontalCardWidth }}
            >
              <ProductCard
                product={product}
                onPress={onProductPress}
                variant="elevated"
                layout="marketplace"
                showSeller
              />
            </View>
          ))}
        </ScrollView>
      </FadeInContent>
    );
  }

  return (
    <FadeInContent>
      {errorBanner}
      <View style={styles.grid}>
        {visibleProducts.map((product, index) => (
          <View
            key={getProductRouteId(product) ?? `product-${index}`}
            style={{ width: gridCardWidth }}
          >
            <ProductCard
              product={product}
              onPress={onProductPress}
              variant="elevated"
              layout="marketplace"
              showSeller
            />
          </View>
        ))}
      </View>
    </FadeInContent>
  );
}

const styles = StyleSheet.create({
  pairRow: {
    flexWrap: 'wrap',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    paddingHorizontal: screenPaddingHorizontal,
  },
  horizontalContent: {
    paddingHorizontal: screenPaddingHorizontal,
    gap: spacing.md,
    paddingBottom: spacing.xs,
  },
  statePanel: {
    marginHorizontal: screenPaddingHorizontal,
  },
  refreshBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginHorizontal: screenPaddingHorizontal,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    backgroundColor: colors.surfaceMuted,
  },
  refreshBannerAction: {
    color: colors.textLink,
    fontWeight: '600',
  },
});
