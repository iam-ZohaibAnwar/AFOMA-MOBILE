import { StyleSheet, View } from 'react-native';

import { AppText } from '../../../components/ui/AppText';
import { spacing } from '../../../design-system';
import type { Product } from '../../../services/types/product';
import { ProductGrid } from './ProductGrid';

interface SuggestedProductsSectionProps {
  title: string;
  products: Product[];
  onProductPress: (product: Product) => void;
  /** Removes outer horizontal padding when nested inside another padded container. */
  embedded?: boolean;
  showSeller?: boolean;
}

export function SuggestedProductsSection({
  title,
  products,
  onProductPress,
  embedded = false,
  showSeller = true,
}: SuggestedProductsSectionProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <View style={[styles.section, embedded ? styles.sectionEmbedded : null]}>
      <AppText variant="h3" style={styles.title}>
        {title}
      </AppText>
      <ProductGrid
        products={products}
        onProductPress={onProductPress}
        showSeller={showSeller}
        scrollEnabled={false}
        nestedInList
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  sectionEmbedded: {
    paddingHorizontal: 0,
    paddingTop: spacing.lg,
    paddingBottom: 0,
  },
  title: {
    marginBottom: spacing.md,
  },
});
