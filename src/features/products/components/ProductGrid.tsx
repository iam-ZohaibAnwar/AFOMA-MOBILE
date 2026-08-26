import { type ReactElement, type Ref } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { ProductCard } from '../../../components/ecommerce/ProductCard';
import { SectionHeader } from '../../../components/ecommerce/SectionHeader';
import { AppText } from '../../../components/ui/AppText';
import { colors, spacing } from '../../../design-system';
import type { Product } from '../../../services/types/product';
import { ProductGridSkeleton } from './ProductGridSkeleton';
import { getProductRouteId } from '../utils/productDisplay';

type ProductCardLayout = 'default' | 'marketplace' | 'shop';

interface ProductGridProps {
  products: Product[];
  onProductPress: (product: Product) => void;
  emptyMessage?: string;
  isLoading?: boolean;
  ListHeaderComponent?: ReactElement | null;
  ListFooterComponent?: ReactElement | null;
  edgeToEdgeHeader?: boolean;
  sectionTitle?: string;
  cardLayout?: ProductCardLayout;
  showSeller?: boolean;
  showWishlist?: boolean;
  showRating?: boolean;
  onCartPress?: (product: Product) => void;
  listRef?: Ref<FlatList<Product>>;
}

export function ProductGrid({
  products,
  onProductPress,
  emptyMessage = 'No products found.',
  isLoading = false,
  ListHeaderComponent = null,
  ListFooterComponent = null,
  edgeToEdgeHeader = false,
  sectionTitle,
  cardLayout = 'marketplace',
  showSeller = true,
  showWishlist = false,
  showRating = false,
  onCartPress,
  listRef,
}: ProductGridProps) {
  const showEmptyState = !isLoading && products.length === 0;

  const listHeader = (
    <>
      {ListHeaderComponent}
      {sectionTitle && products.length > 0 ? (
        <SectionHeader title={sectionTitle} style={styles.sectionHeader} />
      ) : null}
    </>
  );

  return (
    <FlatList
      ref={listRef}
      data={products}
      keyExtractor={(item, index) => getProductRouteId(item) ?? `product-${index}`}
      numColumns={2}
      columnWrapperStyle={[styles.row, edgeToEdgeHeader && styles.rowEdgeToEdge]}
      contentContainerStyle={[
        styles.listContent,
        edgeToEdgeHeader && styles.listContentEdgeToEdge,
      ]}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={listHeader}
      renderItem={({ item }) => (
        <View style={styles.cardWrap}>
          <ProductCard
            product={item}
            onPress={onProductPress}
            variant="elevated"
            layout={cardLayout}
            showSeller={showSeller}
            showWishlist={showWishlist}
            showRating={showRating}
            onCartPress={onCartPress}
          />
        </View>
      )}
      ListEmptyComponent={
        isLoading ? (
          <ProductGridSkeleton count={4} horizontalPadding={spacing.lg} />
        ) : showEmptyState ? (
          <View style={[styles.emptyBox, edgeToEdgeHeader && styles.emptyBoxEdgeToEdge]}>
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
  listContentEdgeToEdge: {
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  row: {
    alignItems: 'stretch',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  rowEdgeToEdge: {
    paddingHorizontal: spacing.lg,
  },
  cardWrap: {
    flex: 1,
  },
  sectionHeader: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  emptyBox: {
    padding: spacing.xl,
    borderRadius: 12,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyBoxEdgeToEdge: {
    marginHorizontal: spacing.lg,
  },
  emptyText: {
    textAlign: 'center',
  },
});
