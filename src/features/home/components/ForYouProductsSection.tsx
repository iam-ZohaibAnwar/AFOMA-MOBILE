import { ScrollView, StyleSheet, View } from 'react-native';

import { ProductCard } from '../../products/components/ProductCard';
import { getProductRouteId } from '../../products/utils/productDisplay';
import { HomeStatePanel } from './HomeStatePanel';
import { homeSpacing } from '../theme/homeTheme';
import type { Product } from '../../../services/types/product';

interface ForYouProductsSectionProps {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onProductPress: (product: Product) => void;
}

const CARD_WIDTH = 156;

export function ForYouProductsSection({
  products,
  isLoading,
  error,
  onRetry,
  onProductPress,
}: ForYouProductsSectionProps) {
  if (error && products.length === 0 && !isLoading) {
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
    if (isLoading) {
      return null;
    }

    return (
      <HomeStatePanel tone="empty" message="No picks for you yet. Check back soon." />
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      decelerationRate="fast"
    >
      {products.map((product, index) => (
        <View
          key={getProductRouteId(product) ?? `for-you-${index}`}
          style={styles.cardWrap}
        >
          <ProductCard product={product} onPress={onProductPress} variant="elevated" />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: homeSpacing.screen,
    gap: homeSpacing.cardGap,
    paddingBottom: 4,
  },
  cardWrap: {
    width: CARD_WIDTH,
  },
});
