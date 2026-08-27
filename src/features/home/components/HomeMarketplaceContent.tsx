import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { SectionHeader } from '../../../components/ecommerce';
import {
  marketplaceScrollProps,
  useMarketplaceFooterContentInset,
  useMarketplaceScrollHandler,
} from '../../../app/navigation/marketplaceChrome';
import { colors, sectionGap, spacing } from '../../../design-system';
import type { MainTabParamList, ShoppingStackParamList } from '../../../app/navigation/types';
import { navigateToShop } from '../../../app/navigation/shoppingNavigation';
import type { Product } from '../../../services/types/product';
import type { Seller } from '../../../services/types/seller';
import { getProductRouteId, getProductImageUrl } from '../../products/utils/productDisplay';
import { HomeFeaturedSellersSection } from './HomeFeaturedSellersSection';
import { HomeProductSection } from './HomeProductSection';
import { HomePromoCarousel } from './HomePromoCarousel';
import { useBestSellerProducts } from '../hooks/useBestSellerProducts';
import { useDiscountedProducts } from '../hooks/useDiscountedProducts';
import { useFeaturedSellers } from '../hooks/useFeaturedSellers';
import { useNewArrivalProducts } from '../hooks/useNewArrivalProducts';

export type HomeMarketplaceNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'MarketplaceTab'>,
  NativeStackNavigationProp<ShoppingStackParamList>
>;

export interface HomeMarketplaceContentProps {
  navigation: HomeMarketplaceNavigationProp;
}

export function HomeMarketplaceContent({ navigation }: HomeMarketplaceContentProps) {
  const footerInset = useMarketplaceFooterContentInset();
  const onMarketplaceScroll = useMarketplaceScrollHandler();
  const {
    products: newArrivals,
    isLoading: isNewArrivalsLoading,
    error: newArrivalsError,
    retry: retryNewArrivals,
  } = useNewArrivalProducts(8);
  const {
    products: bestSellers,
    isLoading: isBestSellersLoading,
    error: bestSellersError,
    retry: retryBestSellers,
  } = useBestSellerProducts(4);
  const {
    products: discountedProducts,
    isLoading: isDiscountedLoading,
    error: discountedError,
    retry: retryDiscounted,
  } = useDiscountedProducts(4);
  const {
    sellers: featuredSellers,
    isLoading: isFeaturedSellersLoading,
    error: featuredSellersError,
    retry: retryFeaturedSellers,
  } = useFeaturedSellers(3);

  const promoSlides = useMemo(() => {
    const slides = [
      {
        id: 'shipping-promo',
        title: 'Save on shipping across the marketplace',
        subtitle: 'Discover artisan finds from independent sellers',
        imageUrl: newArrivals[0] ? getProductImageUrl(newArrivals[0]) : undefined,
      },
      {
        id: 'new-arrivals-promo',
        title: 'Shop the latest new arrivals',
        subtitle: 'Fresh products added this week',
        imageUrl: newArrivals[1] ? getProductImageUrl(newArrivals[1]) : undefined,
      },
      {
        id: 'discounted-promo',
        title: 'Biggest savings right now',
        subtitle: 'Browse discounted marketplace picks',
        imageUrl: discountedProducts[0] ? getProductImageUrl(discountedProducts[0]) : undefined,
      },
    ];

    return slides.filter((slide) => slide.title);
  }, [discountedProducts, newArrivals]);

  const handleProductPress = (product: Product) => {
    navigation.navigate('ProductDetail', {
      productId: getProductRouteId(product),
      slug: product.slug,
    });
  };

  const handlePromoPress = () => {
    navigation.navigate('ProductListing', {
      title: 'New Arrivals',
      listingSource: 'newArrival',
    });
  };

  const handleSellerPress = (seller: Seller) => {
    if (seller.storeSlug?.trim()) {
      navigateToShop(navigation, seller.storeSlug);
    }
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.scrollContent, { paddingBottom: spacing.xxl + footerInset }]}
      showsVerticalScrollIndicator={false}
      directionalLockEnabled
      nestedScrollEnabled
      onScroll={onMarketplaceScroll}
      {...marketplaceScrollProps}
    >
      <HomePromoCarousel slides={promoSlides} onPress={handlePromoPress} />

      <View style={styles.section}>
        <SectionHeader title="Featured Shops" />
        <HomeFeaturedSellersSection
          sellers={featuredSellers}
          isLoading={isFeaturedSellersLoading}
          error={featuredSellersError}
          onRetry={retryFeaturedSellers}
          onSellerPress={handleSellerPress}
        />
      </View>

      <View style={styles.section}>
        <SectionHeader
          title="New Arrivals"
          actionLabel="See All"
          onActionPress={() =>
            navigation.navigate('ProductListing', {
              title: 'New Arrivals',
              listingSource: 'newArrival',
            })
          }
        />
        <HomeProductSection
          products={newArrivals}
          isLoading={isNewArrivalsLoading}
          error={newArrivalsError}
          onRetry={retryNewArrivals}
          onProductPress={handleProductPress}
          layout="pair"
          maxItems={4}
        />
      </View>

      <View style={styles.section}>
        <SectionHeader
          title="Best Selling"
          actionLabel="See All"
          onActionPress={() =>
            navigation.navigate('ProductListing', {
              title: 'Best Selling',
              listingSource: 'best',
            })
          }
        />
        <HomeProductSection
          products={bestSellers}
          isLoading={isBestSellersLoading}
          error={bestSellersError}
          onRetry={retryBestSellers}
          onProductPress={handleProductPress}
          layout="pair"
          maxItems={4}
        />
      </View>

      <View style={styles.section}>
        <SectionHeader
          title="Most Discounted"
          actionLabel="See All"
          onActionPress={() =>
            navigation.navigate('ProductListing', {
              title: 'Most Discounted',
              listingSource: 'discounted',
            })
          }
        />
        <HomeProductSection
          products={discountedProducts}
          isLoading={isDiscountedLoading}
          error={discountedError}
          onRetry={retryDiscounted}
          onProductPress={handleProductPress}
          layout="pair"
          maxItems={4}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
    backgroundColor: colors.background,
  },
  section: {
    marginBottom: sectionGap,
  },
});
