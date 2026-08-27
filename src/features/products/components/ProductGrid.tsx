import { type ReactElement, type Ref } from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

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
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  scrollEventThrottle?: number;
  contentInsetBottom?: number;
  scrollEnabled?: boolean;
  /** Removes outer list padding for grids nested inside another padded container. */
  nestedInList?: boolean;
  style?: StyleProp<ViewStyle>;
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
  onScroll,
  scrollEventThrottle = 16,
  contentInsetBottom = 0,
  scrollEnabled = true,
  nestedInList = false,
  style,
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
      style={style}
      data={products}
      keyExtractor={(item, index) => getProductRouteId(item) ?? `product-${index}`}
      numColumns={2}
      scrollEnabled={scrollEnabled}
      nestedScrollEnabled={nestedInList}
      columnWrapperStyle={[styles.row, edgeToEdgeHeader && styles.rowEdgeToEdge]}
      contentContainerStyle={[
        nestedInList ? styles.listContentNested : styles.listContent,
        edgeToEdgeHeader && styles.listContentEdgeToEdge,
        contentInsetBottom > 0 && { paddingBottom: spacing.lg + contentInsetBottom },
      ]}
      showsVerticalScrollIndicator={false}
      onScroll={onScroll}
      scrollEventThrottle={scrollEventThrottle}
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
  listContentNested: {
    padding: 0,
    flexGrow: 0,
  },
  listContentEdgeToEdge: {
    paddingHorizontal: 0,
    paddingTop: spacing.lg,
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
