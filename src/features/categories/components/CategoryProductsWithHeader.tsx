import { useCallback, useMemo, type ReactElement } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppButton } from '../../../components/ui/AppButton';
import { AppText } from '../../../components/ui/AppText';
import { ErrorState, SectionHeader } from '../../../components/ecommerce';
import { FadeInContent } from '../../../components/motion';
import {
  useMarketplaceFooterContentInset,
  useMarketplaceScrollHandler,
  marketplaceScrollProps,
} from '../../../app/navigation/marketplaceChrome';
import { colors, screenPaddingHorizontal, spacing } from '../../../design-system';
import type { ShoppingStackParamList } from '../../../app/navigation/types';
import type { Product } from '../../../services/types/product';
import { ProductGrid } from '../../products/components/ProductGrid';
import { getProductRouteId } from '../../products/utils/productDisplay';
import {
  usePaginatedCategoryProducts,
  type CategoryProductFilters,
} from '../hooks/usePaginatedCategoryProducts';
import { CategoryTabBar, type CategoryTabOption } from './CategoryTabBar';

export interface CategoryProductsWithHeaderProps {
  filters: CategoryProductFilters;
  navigation: NativeStackNavigationProp<ShoppingStackParamList>;
  headerContent?: ReactElement | null;
  /** Primary page heading shown above tabs or products (e.g. subcategory name). */
  pageTitle?: string;
  /** Omit to show products without an extra section heading (e.g. when the parent title is already above). */
  productsSectionTitle?: string;
  tabs?: CategoryTabOption[];
  activeTabId?: string;
  onTabChange?: (tabId: string) => void;
  emptyMessage?: string;
}

export function CategoryProductsWithHeader({
  filters,
  navigation,
  headerContent,
  pageTitle,
  productsSectionTitle,
  tabs = [],
  activeTabId,
  onTabChange,
  emptyMessage = 'No products found in this category yet.',
}: CategoryProductsWithHeaderProps) {
  const footerInset = useMarketplaceFooterContentInset();
  const onMarketplaceScroll = useMarketplaceScrollHandler();

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

  const showTabs = tabs.length > 1 && activeTabId && onTabChange;

  const listHeader = useMemo(
    () => (
      <View style={styles.headerSection}>
        {headerContent}

        {pageTitle ? <SectionHeader title={pageTitle} style={styles.pageTitle} /> : null}

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

        {showTabs ? (
          <CategoryTabBar tabs={tabs} activeTabId={activeTabId} onTabChange={onTabChange} />
        ) : null}

        {productsSectionTitle ? (
          <SectionHeader title={productsSectionTitle} style={styles.productsHeader} />
        ) : null}
      </View>
    ),
    [
      activeTabId,
      error,
      headerContent,
      onTabChange,
      pageTitle,
      products.length,
      productsSectionTitle,
      retry,
      showTabs,
      tabs,
    ],
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
          ListHeaderComponent={listHeader}
          edgeToEdgeHeader
          cardLayout="marketplace"
          showSeller
          onScroll={onMarketplaceScroll}
          scrollEventThrottle={marketplaceScrollProps.scrollEventThrottle}
          contentInsetBottom={footerInset}
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
  },
  pageTitle: {
    paddingHorizontal: screenPaddingHorizontal,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  productsHeader: {
    paddingHorizontal: screenPaddingHorizontal,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
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
