import { useCallback, useMemo, type ReactElement } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppButton } from '../../../components/ui/AppButton';
import { AppText } from '../../../components/ui/AppText';
import { ErrorState } from '../../../components/ecommerce';
import { FadeInContent } from '../../../components/motion';
import { colors, spacing } from '../../../design-system';
import type { ShoppingStackParamList } from '../../../app/navigation/types';
import type { Product } from '../../../services/types/product';
import { ProductGrid } from '../../products/components/ProductGrid';
import { getProductRouteId } from '../../products/utils/productDisplay';
import {
  usePaginatedCategoryProducts,
  type CategoryProductFilters,
} from '../hooks/usePaginatedCategoryProducts';
import { CategoryLinkBar, type CategoryLinkOption } from './CategoryLinkBar';

export interface CategoryProductsPageProps {
  filters: CategoryProductFilters;
  navigation: NativeStackNavigationProp<ShoppingStackParamList>;
  categoryLinks?: CategoryLinkOption[];
  linkBarTitle?: string;
  onCategoryLinkPress?: (linkId: string, label: string) => void;
  emptyMessage?: string;
}

export function CategoryProductsPage({
  filters,
  navigation,
  categoryLinks = [],
  linkBarTitle,
  onCategoryLinkPress,
  emptyMessage = 'No products found in this category yet.',
}: CategoryProductsPageProps) {
  const {
    products,
    isLoading,
    isRefreshing,
    isLoadingMore,
    hasMore,
    error,
    retry,
    loadMore,
  } = usePaginatedCategoryProducts(filters);

  const handleProductPress = useCallback(
    (product: Product) => {
      navigation.navigate('ProductDetail', {
        productId: getProductRouteId(product),
        slug: product.slug,
      });
    },
    [navigation],
  );

  const listHeader = useMemo(
    () => (
      <View style={styles.headerSection}>
        {error && products.length > 0 ? (
          <Pressable style={styles.refreshBanner} onPress={() => void retry()}>
            <AppText variant="bodySmall" color="error">
              {error}
            </AppText>
            <AppText variant="bodySmall" style={styles.refreshBannerAction}>
              Retry
            </AppText>
          </Pressable>
        ) : null}

        {categoryLinks.length > 0 && onCategoryLinkPress ? (
          <CategoryLinkBar
            title={linkBarTitle}
            links={categoryLinks}
            onLinkPress={onCategoryLinkPress}
          />
        ) : null}
      </View>
    ),
    [categoryLinks, error, linkBarTitle, onCategoryLinkPress, products.length, retry],
  );

  if (error && products.length === 0 && !isRefreshing) {
    return (
      <View style={styles.errorState}>
        <ErrorState message={error} onAction={() => void retry()} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <FadeInContent style={styles.content}>
        <ProductGrid
          products={products}
          onProductPress={handleProductPress}
          isLoading={isLoading}
          emptyMessage={emptyMessage}
          ListHeaderComponent={listHeader as ReactElement}
          edgeToEdgeHeader
          cardLayout="marketplace"
          showSeller
          ListFooterComponent={
            hasMore ? (
              <View style={styles.loadMoreWrap}>
                <AppButton
                  label={isLoadingMore ? 'Loading...' : 'Load more products'}
                  size="md"
                  shape="pill"
                  fullWidth
                  disabled={isLoadingMore}
                  onPress={() => void loadMore()}
                />
              </View>
            ) : null
          }
        />
      </FadeInContent>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  headerSection: {
    backgroundColor: colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderStrong,
  },
  refreshBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    backgroundColor: colors.surfaceMuted,
  },
  refreshBannerAction: {
    color: colors.textLink,
    fontWeight: '600',
  },
  loadMoreWrap: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  errorState: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
});
