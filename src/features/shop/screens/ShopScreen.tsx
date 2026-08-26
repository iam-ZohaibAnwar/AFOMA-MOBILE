import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppButton } from '../../../components/ui/AppButton';
import { AppText } from '../../../components/ui/AppText';
import { EmptyState, ErrorState } from '../../../components/ecommerce';
import { FadeInContent } from '../../../components/motion';
import { colors, spacing } from '../../../design-system';
import type { ShoppingStackParamList } from '../../../app/navigation/types';
import type { Product } from '../../../services/types/product';
import { ProductGrid } from '../../products/components/ProductGrid';
import { getProductRouteId } from '../../products/utils/productDisplay';
import { ShopAboutSection } from '../components/ShopAboutSection';
import { ShopHero } from '../components/ShopHero';
import { ShopReviewsList } from '../components/ShopReviewsList';
import { ShopTabBar } from '../components/ShopTabBar';
import { useShopScreen, type ShopTab } from '../hooks/useShopScreen';

type Props = NativeStackScreenProps<ShoppingStackParamList, 'Shop'>;

export function ShopScreen({ route, navigation }: Props) {
  const { slug } = route.params;
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

  const productsListRef = useRef<FlatList<Product>>(null);
  const contentScrollRef = useRef<ScrollView>(null);
  const pausedScrollRef = useRef<ScrollView>(null);

  const hasRealSeller = Boolean(seller._id);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const scrollActiveTabToTop = useCallback((tab: ShopTab) => {
    requestAnimationFrame(() => {
      if (tab === 'products') {
        productsListRef.current?.scrollToOffset({ offset: 0, animated: false });
        pausedScrollRef.current?.scrollTo({ y: 0, animated: false });
        return;
      }

      contentScrollRef.current?.scrollTo({ y: 0, animated: false });
    });
  }, []);

  const handleTabChange = useCallback(
    (tab: ShopTab) => {
      if (tab === activeTab) {
        scrollActiveTabToTop(tab);
        return;
      }

      setActiveTab(tab);
    },
    [activeTab, scrollActiveTabToTop, setActiveTab],
  );

  const handleReadMoreAbout = useCallback(() => {
    if (activeTab === 'about') {
      scrollActiveTabToTop('about');
      return;
    }

    setActiveTab('about');
  }, [activeTab, scrollActiveTabToTop, setActiveTab]);

  useEffect(() => {
    scrollActiveTabToTop(activeTab);
  }, [activeTab, scrollActiveTabToTop]);

  const handleProductPress = useCallback(
    (product: Product) => {
      navigation.navigate('ProductDetail', {
        productId: getProductRouteId(product),
        slug: product.slug,
      });
    },
    [navigation],
  );

  const shopHeader = useMemo(
    () => (
      <View style={styles.headerSection}>
        {error && hasRealSeller ? (
          <Pressable style={styles.refreshBanner} onPress={() => void retry()}>
            <AppText variant="bodySmall" color="error">
              {error}
            </AppText>
            <AppText variant="bodySmall" style={styles.refreshBannerAction}>
              Retry
            </AppText>
          </Pressable>
        ) : null}

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
    ),
    [
      activeTab,
      averageRating,
      error,
      handleReadMoreAbout,
      handleTabChange,
      hasRealSeller,
      isReviewsLoading,
      isRefreshing,
      navigation,
      products.length,
      retry,
      reviews.length,
      seller,
    ],
  );

  if (error && !hasRealSeller) {
    return (
      <View style={styles.centeredState}>
        <ErrorState
          message={error ?? 'This shop could not be found.'}
          onAction={() => void retry()}
        />
        <Pressable onPress={() => navigation.goBack()} style={styles.backLink}>
          <AppText variant="bodyMedium" style={styles.backLinkText}>
            Go back
          </AppText>
        </Pressable>
      </View>
    );
  }

  if (activeTab === 'products') {
    return (
      <View style={styles.container}>
        <FadeInContent style={styles.content}>
          {isPaused ? (
            <ScrollView
              ref={pausedScrollRef}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {shopHeader}
              <EmptyState
                title="Shop on pause"
                message="This seller is not accepting orders right now. Check back later."
                style={styles.emptyState}
              />
            </ScrollView>
          ) : (
            <ProductGrid
              listRef={productsListRef}
              products={products}
              onProductPress={handleProductPress}
              isLoading={isRefreshing && products.length === 0}
              emptyMessage="No products added yet."
              ListHeaderComponent={shopHeader}
              edgeToEdgeHeader
              sectionTitle="All products"
              cardLayout="marketplace"
              showSeller={false}
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
          )}
        </FadeInContent>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FadeInContent style={styles.content}>
        <ScrollView
          ref={contentScrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {shopHeader}
          {activeTab === 'reviews' ? (
            <ShopReviewsList
              reviews={reviews}
              averageRating={averageRating}
              isLoading={isReviewsLoading}
            />
          ) : null}
          {activeTab === 'about' ? <ShopAboutSection seller={seller} /> : null}
        </ScrollView>
      </FadeInContent>
    </View>
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
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  headerSection: {
    backgroundColor: colors.background,
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
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  backLink: {
    marginTop: spacing.sm,
  },
  backLinkText: {
    color: colors.textLink,
  },
  emptyState: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  loadMoreWrap: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
});
