import { useLayoutEffect } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ProductGrid } from '../components/ProductGrid';
import { useProductListing } from '../hooks/useProductListing';
import { getProductRouteId } from '../utils/productDisplay';
import type { ShoppingStackParamList } from '../../../app/navigation/types';
import type { Product } from '../../../services/types/product';

type Props = NativeStackScreenProps<ShoppingStackParamList, 'ProductListing'>;

function buildHeaderTitle(params: ShoppingStackParamList['ProductListing']): string {
  return (
    params.title ??
    params.childCategoryName ??
    params.subCategoryName ??
    params.categoryName ??
    (params.searchQuery ? `Results for "${params.searchQuery}"` : 'Products')
  );
}

function buildHeaderSubtitle(params: ShoppingStackParamList['ProductListing']): string | undefined {
  const parts = [params.categoryName, params.subCategoryName, params.childCategoryName].filter(
    (value, index, array) => Boolean(value) && array.indexOf(value) === index,
  );

  if (params.searchQuery) {
    return parts.length > 0 ? parts.join(' · ') : undefined;
  }

  if (params.title && parts.length > 1) {
    return parts.slice(0, -1).join(' · ');
  }

  return parts.length > 0 ? parts.join(' · ') : undefined;
}

export function ProductListingScreen({ route, navigation }: Props) {
  const { categoryId, subCategoryId, childCategoryId, searchQuery } = route.params;

  const headerTitle = buildHeaderTitle(route.params);
  const headerSubtitle = buildHeaderSubtitle(route.params);

  const { products, isLoading, error, retry } = useProductListing({
    categoryId,
    subCategoryId,
    childCategoryId,
    searchQuery,
  });

  useLayoutEffect(() => {
    navigation.setOptions({ title: headerTitle });
  }, [headerTitle, navigation]);

  const handleProductPress = (product: Product) => {
    const productId = getProductRouteId(product);
    navigation.navigate('ProductDetail', {
      productId,
      slug: product.slug,
    });
  };

  if (isLoading) {
    return (
      <View style={styles.centeredState}>
        <ActivityIndicator size="large" color="#EA580C" />
        <Text style={styles.stateText}>Loading products...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centeredState}>
        <Text style={styles.headerTitle}>{headerTitle}</Text>
        {headerSubtitle ? <Text style={styles.headerSubtitle}>{headerSubtitle}</Text> : null}
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={() => void retry()}>
          <Text style={styles.retryButtonText}>Try again</Text>
        </Pressable>
        <Pressable style={styles.backLink} onPress={() => navigation.goBack()}>
          <Text style={styles.backLinkText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {headerSubtitle ? <Text style={styles.listHeaderSubtitle}>{headerSubtitle}</Text> : null}
      <ProductGrid
        products={products}
        onProductPress={handleProductPress}
        emptyMessage={
          searchQuery
            ? `No products matched "${searchQuery}".`
            : 'No products found for this category.'
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF7ED',
  },
  listHeaderSubtitle: {
    fontSize: 14,
    color: '#64748B',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#FFF7ED',
    gap: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#172554',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
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
  backLink: {
    marginTop: 4,
    paddingVertical: 8,
  },
  backLinkText: {
    color: '#1D4ED8',
    fontSize: 14,
    fontWeight: '600',
  },
});
