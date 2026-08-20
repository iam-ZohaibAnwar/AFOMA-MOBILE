import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ProductGrid } from '../../products/components/ProductGrid';
import { getProductRouteId } from '../../products/utils/productDisplay';
import { useProductSearch } from '../hooks/useProductSearch';
import type { ShoppingStackParamList } from '../../../app/navigation/types';
import type { Product } from '../../../services/types/product';

type Props = NativeStackScreenProps<ShoppingStackParamList, 'Search'>;

export function SearchScreen({ route, navigation }: Props) {
  const initialQuery = route.params.query ?? '';
  const [searchText, setSearchText] = useState(initialQuery);
  const [submittedQuery, setSubmittedQuery] = useState(initialQuery.trim());
  const { products, isLoading, error, hasSearched, retry } = useProductSearch(submittedQuery);

  useEffect(() => {
    const nextQuery = route.params.query ?? '';
    setSearchText(nextQuery);
    setSubmittedQuery(nextQuery.trim());
  }, [route.params.query]);

  const handleSubmitSearch = () => {
    setSubmittedQuery(searchText.trim());
  };

  const handleProductPress = (product: Product) => {
    navigation.navigate('ProductDetail', {
      productId: getProductRouteId(product),
      slug: product.slug,
    });
  };

  const emptyMessage = !hasSearched
    ? 'Enter a search term to find products.'
    : submittedQuery
      ? `No products matched "${submittedQuery}".`
      : 'Enter a search term to find products.';

  return (
    <View style={styles.container}>
      <View style={styles.searchBarWrap}>
        <TextInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search products"
          placeholderTextColor="#94A3B8"
          style={styles.searchInput}
          returnKeyType="search"
          onSubmitEditing={handleSubmitSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Pressable style={styles.searchButton} onPress={handleSubmitSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.stateBox}>
          <ActivityIndicator size="large" color="#EA580C" />
          <Text style={styles.stateText}>Searching products...</Text>
        </View>
      ) : null}

      {!isLoading && error ? (
        <View style={styles.stateBox}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={() => void retry()}>
            <Text style={styles.retryButtonText}>Try again</Text>
          </Pressable>
        </View>
      ) : null}

      {!isLoading && !error ? (
        <ProductGrid
          products={products}
          onProductPress={handleProductPress}
          emptyMessage={emptyMessage}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF7ED',
  },
  searchBarWrap: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FED7AA',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#172554',
  },
  searchButton: {
    height: 44,
    borderRadius: 10,
    backgroundColor: '#EA580C',
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  stateBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  stateText: {
    fontSize: 14,
    color: '#64748B',
  },
  errorText: {
    fontSize: 14,
    color: '#B91C1C',
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: '#EA580C',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
