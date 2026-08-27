import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { FadeInContent } from '../../../components/motion';
import { ErrorState } from '../../../components/ecommerce';
import { AppText } from '../../../components/ui/AppText';
import {
  useMarketplaceFooterContentInset,
  useMarketplaceScrollHandler,
} from '../../../app/navigation/marketplaceChrome';
import { CategoryBrowseScreenLayout } from '../../categories/components/CategoryBrowseScreenLayout';
import { ProductGrid } from '../components/ProductGrid';
import { useProductListing } from '../hooks/useProductListing';
import { getProductRouteId } from '../utils/productDisplay';
import type { ShoppingStackParamList } from '../../../app/navigation/types';
import type { Product } from '../../../services/types/product';
import { colors, spacing } from '../../../design-system';

type Props = NativeStackScreenProps<ShoppingStackParamList, 'ProductListing'>;

function buildHeaderTitle(params: ShoppingStackParamList['ProductListing']): string {
  if (params.title) {
    return params.title;
  }

  if (params.listingSource === 'best') {
    return 'Best Selling';
  }

  if (params.listingSource === 'newArrival') {
    return 'New Arrivals';
  }

  if (params.listingSource === 'discounted') {
    return 'Most Discounted';
  }

  return (
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
  const footerInset = useMarketplaceFooterContentInset();
  const onMarketplaceScroll = useMarketplaceScrollHandler();
  const {
    categoryId,
    subCategoryId,
    childCategoryId,
    searchQuery,
    listingSource,
  } = route.params;

  const headerTitle = buildHeaderTitle(route.params);
  const headerSubtitle = buildHeaderSubtitle(route.params);

  const { products, isLoading, isRefreshing, error, retry } = useProductListing({
    categoryId,
    subCategoryId,
    childCategoryId,
    searchQuery,
    listingSource,
  });

  const handleProductPress = (product: Product) => {
    const productId = getProductRouteId(product);
    navigation.navigate('ProductDetail', {
      productId,
      slug: product.slug,
    });
  };

  const showBlockingError = Boolean(error) && products.length === 0 && !isRefreshing;

  return (
    <CategoryBrowseScreenLayout navigation={navigation}>
      <View style={styles.container}>
        {headerTitle ? <Text style={styles.listHeaderTitle}>{headerTitle}</Text> : null}
        {headerSubtitle ? <Text style={styles.listHeaderSubtitle}>{headerSubtitle}</Text> : null}

        {error && !showBlockingError ? (
          <Pressable style={styles.refreshBanner} onPress={() => void retry()}>
            <AppText variant="bodySmall" color="error">
              {error}
            </AppText>
            <AppText variant="bodySmall" style={styles.refreshBannerAction}>
              Retry
            </AppText>
          </Pressable>
        ) : null}

        {showBlockingError ? (
          <View style={styles.errorWrap}>
            <ErrorState message={error ?? 'Failed to load products'} onAction={() => void retry()} />
            <Pressable style={styles.backLink} onPress={() => navigation.goBack()}>
              <Text style={styles.backLinkText}>Go back</Text>
            </Pressable>
          </View>
        ) : (
          <FadeInContent style={styles.content}>
            <ProductGrid
              products={products}
              onProductPress={handleProductPress}
              isLoading={isLoading}
              emptyMessage={
                searchQuery
                  ? `No products matched "${searchQuery}".`
                  : 'No products found for this category.'
              }
              onScroll={onMarketplaceScroll}
              contentInsetBottom={footerInset}
            />
          </FadeInContent>
        )}
      </View>
    </CategoryBrowseScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  listHeaderTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  listHeaderSubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  refreshBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
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
  errorWrap: {
    flex: 1,
    padding: spacing.xl,
    gap: spacing.sm,
  },
  backLink: {
    alignSelf: 'center',
    paddingVertical: spacing.sm,
  },
  backLinkText: {
    color: colors.textLink,
    fontSize: 14,
    fontWeight: '600',
  },
});
