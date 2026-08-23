import type { ReactElement } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { ProductCard } from '../../../components/ecommerce/ProductCard';
import { AppText } from '../../../components/ui/AppText';
import { colors, spacing } from '../../../design-system';
import type { Product } from '../../../services/types/product';
import { getProductRouteId } from '../utils/productDisplay';

interface ProductGridProps {
  products: Product[];
  onProductPress: (product: Product) => void;
  emptyMessage?: string;
  isLoading?: boolean;
  ListHeaderComponent?: ReactElement | null;
  ListFooterComponent?: ReactElement | null;
}

export function ProductGrid({
  products,
  onProductPress,
  emptyMessage = 'No products found.',
  isLoading = false,
  ListHeaderComponent = null,
  ListFooterComponent = null,
}: ProductGridProps) {
  const showEmptyState = !isLoading && products.length === 0;

  return (
    <FlatList
      data={products}
      keyExtractor={(item, index) => getProductRouteId(item) ?? `product-${index}`}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={ListHeaderComponent ?? undefined}
      renderItem={({ item }) => (
        <View style={styles.cardWrap}>
          <ProductCard
            product={item}
            onPress={onProductPress}
            variant="elevated"
            layout="marketplace"
            showSeller
          />
        </View>
      )}
      ListEmptyComponent={
        showEmptyState ? (
          <View style={styles.emptyBox}>
            <AppText variant="bodySmall" color="textSecondary" style={styles.emptyText}>
              {emptyMessage}
            </AppText>
          </View>
        ) : null
      }
      ListFooterComponent={ListFooterComponent ?? undefined}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: spacing.lg,
    flexGrow: 1,
  },
  row: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  cardWrap: {
    flex: 1,
  },
  emptyBox: {
    padding: spacing.xl,
    borderRadius: 12,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyText: {
    textAlign: 'center',
  },
});
