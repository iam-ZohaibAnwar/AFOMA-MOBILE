import { useCallback, useRef } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { EmptyState, ErrorState } from '../../../components/ecommerce';
import { AppButton } from '../../../components/ui/AppButton';
import {
  useMarketplaceFooterContentInset,
  useMarketplaceScrollHandler,
} from '../../../app/navigation/marketplaceChrome';
import { colors, spacing } from '../../../design-system';
import type { ShoppingStackParamList } from '../../../app/navigation/types';
import type { Product } from '../../../services/types/product';
import { ProductGrid } from '../../products/components/ProductGrid';
import { getProductRouteId } from '../../products/utils/productDisplay';
import { ShopAboutSection } from '../components/ShopAboutSection';
import { ShopHero } from '../components/ShopHero';
import { ShopReviewsList } from '../components/ShopReviewsList';
import { ShopScreenSkeleton } from '../components/ShopScreenSkeleton';
import { ShopTabBar } from '../components/ShopTabBar';
import { useShopScreen, type ShopTab } from '../hooks/useShopScreen';

type Props = NativeStackScreenProps<ShoppingStackParamList, 'SellerShop'>;

export function SellerShopScreen({ route, navigation }: Props) {
  const { slug } = route.params;
  const footerInset = useMarketplaceFooterContentInset();
  const onMarketplaceScroll = useMarketplaceScrollHandler();
  const scrollRef = useRef<ScrollView>(null);
  const headerAnchorY = useRef(0);
  const scrollY = useRef(0);

  const {
    seller,
    products,
    reviews,
    isReviewsLoading,
    activeTab,
    setActiveTab,
    isRefreshing,
    isLoadingMore,
    error,
    hasMore,
    isPaused,
    averageRating,
    retry,
    loadMoreProducts,
  } = useShopScreen(slug);

  const handleProductPress = useCallback(
    (product: Product) => {
      navigation.navigate('ProductDetail', {
        productId: getProductRouteId(product),
        slug: product.slug,
      });
    },
    [navigation],
  );

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      scrollY.current = event.nativeEvent.contentOffset.y;
      onMarketplaceScroll(event);
    },
    [onMarketplaceScroll],
  );

  const handleTabChange = useCallback(
    (tab: ShopTab) => {
      setActiveTab(tab);

      if (scrollY.current > headerAnchorY.current) {
        requestAnimationFrame(() => {
          scrollRef.current?.scrollTo({ y: headerAnchorY.current, animated: false });
          scrollY.current = headerAnchorY.current;
        });
      }
    },
    [setActiveTab],
  );

  const handleReadMoreAbout = useCallback(() => {
    handleTabChange('about');
  }, [handleTabChange]);

  const refreshControl = (
    <RefreshControl refreshing={isRefreshing} onRefresh={() => void retry()} tintColor={colors.primary} />
  );

  if (error && !seller._id && products.length === 0 && !isRefreshing) {
    return (
      <View style={styles.blockingState}>
        <ErrorState message={error} onAction={() => void retry()} />
      </View>
    );
  }

  if (isRefreshing && products.length === 0 && !seller._id) {
    return <ShopScreenSkeleton />;
  }

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.screen}
      contentContainerStyle={{ paddingBottom: footerInset }}
      refreshControl={refreshControl}
      onScroll={handleScroll}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
    >
      <View
        onLayout={(event) => {
          headerAnchorY.current = event.nativeEvent.layout.height;
        }}
      >
        <ShopHero
          seller={seller}
          productCount={products.length}
          averageRating={averageRating}
          reviewCount={reviews.length}
          isReviewsLoading={isReviewsLoading}
          isProductsLoading={isRefreshing && products.length === 0}
          onBack={() => navigation.goBack()}
          onReadMoreAbout={handleReadMoreAbout}
        />
        <ShopTabBar activeTab={activeTab} onTabChange={handleTabChange} />
      </View>

      {activeTab === 'products' && isPaused ? (
        <View style={styles.pausedBanner}>
          <EmptyState
            title="Shop unavailable"
            message="This seller has temporarily paused their storefront."
          />
        </View>
      ) : null}

      {activeTab === 'products' && !isPaused ? (
        <ProductGrid
          products={products}
          onProductPress={handleProductPress}
          isLoading={isRefreshing && products.length === 0}
          emptyMessage="No products listed in this shop yet."
          cardLayout="shop"
          showSeller={false}
          showWishlist={false}
          scrollEnabled={false}
          nestedInList
          ListFooterComponent={
            hasMore ? (
              <View style={styles.loadMoreWrap}>
                <AppButton
                  label={isLoadingMore ? 'Loading...' : 'Load more products'}
                  size="md"
                  shape="pill"
                  fullWidth
                  disabled={isLoadingMore}
                  onPress={() => void loadMoreProducts()}
                />
              </View>
            ) : null
          }
        />
      ) : null}

      {activeTab === 'reviews' ? (
        <ShopReviewsList
          reviews={reviews}
          averageRating={averageRating}
          isLoading={isReviewsLoading}
        />
      ) : null}

      {activeTab === 'about' ? <ShopAboutSection seller={seller} /> : null}

      {error ? (
        <View style={styles.inlineError}>
          <ErrorState message={error} onAction={() => void retry()} />
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  pausedBanner: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  loadMoreWrap: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  blockingState: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.background,
  },
  inlineError: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
});
