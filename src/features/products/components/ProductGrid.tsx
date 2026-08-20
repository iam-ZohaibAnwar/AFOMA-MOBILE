import { FlatList, StyleSheet, Text, View } from 'react-native';

import type { Product } from '../../../services/types/product';
import { getProductRouteId } from '../utils/productDisplay';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  onProductPress: (product: Product) => void;
  emptyMessage?: string;
}

export function ProductGrid({
  products,
  onProductPress,
  emptyMessage = 'No products found.',
}: ProductGridProps) {
  return (
    <FlatList
      data={products}
      keyExtractor={(item, index) => getProductRouteId(item) ?? `product-${index}`}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => <ProductCard product={item} onPress={onProductPress} />}
      ListEmptyComponent={
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>{emptyMessage}</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  row: {
    gap: 12,
    marginBottom: 12,
  },
  emptyBox: {
    padding: 24,
    borderRadius: 12,
    backgroundColor: '#FFEDD5',
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  emptyText: {
    color: '#475569',
    fontSize: 14,
    textAlign: 'center',
  },
});
