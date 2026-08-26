import { StyleSheet, View } from 'react-native';

import { ProductCard } from '../../../components/ecommerce/ProductCard';
import { AppText } from '../../../components/ui/AppText';
import { spacing } from '../../../design-system';
import type { Product } from '../../../services/types/product';

interface SuggestedProductsSectionProps {
  title: string;
  products: Product[];
  onProductPress: (product: Product) => void;
  /** Removes outer horizontal padding when nested inside another padded container. */
  embedded?: boolean;
}

export function SuggestedProductsSection({
  title,
  products,
  onProductPress,
  embedded = false,
}: SuggestedProductsSectionProps) {
  if (products.length === 0) {
    return null;
  }

  const rows: Product[][] = [];
  for (let index = 0; index < products.length; index += 2) {
    rows.push(products.slice(index, index + 2));
  }

  return (
    <View style={[styles.section, embedded ? styles.sectionEmbedded : null]}>
      <AppText variant="h3" style={styles.title}>
        {title}
      </AppText>
      {rows.map((row, rowIndex) => (
        <View key={`row-${rowIndex}`} style={styles.row}>
          {row.map((product) => (
            <View key={product._id ?? product.slug} style={styles.cardWrap}>
              <ProductCard
                product={product}
                onPress={onProductPress}
                variant="elevated"
                layout="marketplace"
                showSeller
              />
            </View>
          ))}
          {row.length === 1 ? <View style={styles.cardWrap} /> : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  sectionEmbedded: {
    paddingHorizontal: 0,
    paddingTop: spacing.lg,
    paddingBottom: 0,
  },
  title: {
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.md,
  },
  cardWrap: {
    flex: 1,
    alignSelf: 'stretch',
  },
});
