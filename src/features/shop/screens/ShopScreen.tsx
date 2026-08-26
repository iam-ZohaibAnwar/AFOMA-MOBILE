import { useCallback, useLayoutEffect, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
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
import { useShopScreen } from '../hooks/useShopScreen';

type Props = NativeStackScreenProps<ShoppingStackParamList, 'Shop'>;

export function ShopScreen({ route, navigation }: Props) {
  const { slug } = route.params;
  const {
    seller,
    products,
    reviews,
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

  const hasRealSeller = Boolean(seller._id);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

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
          onBack={() => navigation.goBack()}
        />

        <ShopTabBar activeTab={activeTab} onTabChange={setActiveTab} />
      </View>
    ),
    [
      activeTab,
      averageRating,
      error,
      hasRealSeller,
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
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
              {shopHeader}
              <EmptyState
                title="Shop on pause"
                message="This seller is not accepting orders right now. Check back later."
                style={styles.emptyState}
              />
            </ScrollView>
          ) : (
            <ProductGrid
              products={products}
              onProductPress={handleProductPress}
              onCartPress={handleProductPress}
              isLoading={isRefreshing && products.length === 0}
              emptyMessage="No products added yet."
              ListHeaderComponent={shopHeader}
              edgeToEdgeHeader
              sectionTitle="All products"
              cardLayout="shop"
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
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {shopHeader}
          {activeTab === 'reviews' ? <ShopReviewsList reviews={reviews} /> : null}
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
