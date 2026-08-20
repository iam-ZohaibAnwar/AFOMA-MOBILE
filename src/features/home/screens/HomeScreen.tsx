import { ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useAuth } from '../../auth/hooks/useAuth';
import { CategoryList } from '../../categories/components/CategoryList';
import { useCategories } from '../../categories/hooks/useCategories';
import {
  getCategoryDisplayName,
  getCategoryRouteId,
} from '../../categories/utils/categoryNavigation';
import { getProductRouteId } from '../../products/utils/productDisplay';
import { FeaturedProductsSection } from '../components/FeaturedProductsSection';
import { HomeHeader } from '../components/HomeHeader';
import { HomeHeroBanner } from '../components/HomeHeroBanner';
import { HomeSearchBar } from '../components/HomeSearchBar';
import { HomeSectionHeader } from '../components/HomeSectionHeader';
import { HomeStatePanel } from '../components/HomeStatePanel';
import { useFeaturedProducts } from '../hooks/useFeaturedProducts';
import { homeColors, homeSpacing } from '../theme/homeTheme';
import type { RootStackParamList, ShoppingStackParamList } from '../../../app/navigation/types';
import type { Category } from '../../../services/types/category';
import type { Product } from '../../../services/types/product';

type HomeScreenProps = NativeStackScreenProps<ShoppingStackParamList, 'Home'>;

type HomeNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<ShoppingStackParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export function HomeScreen({ navigation }: HomeScreenProps) {
  const rootNavigation = useNavigation<HomeNavigationProp>();
  const { isAuthenticated } = useAuth();
  const { categories, isLoading, error, retry } = useCategories();
  const {
    products: featuredProducts,
    isLoading: isFeaturedLoading,
    error: featuredError,
    retry: retryFeatured,
  } = useFeaturedProducts();

  const handleCategoryPress = (category: Category) => {
    const categoryId = getCategoryRouteId(category);
    if (!categoryId) {
      return;
    }

    navigation.navigate('SubCategories', {
      categoryId,
      categoryName: getCategoryDisplayName(category),
    });
  };

  const handleProductPress = (product: Product) => {
    navigation.navigate('ProductDetail', {
      productId: getProductRouteId(product),
      slug: product.slug,
    });
  };

  const handleAccountPress = () => {
    if (isAuthenticated) {
      navigation.navigate('Orders');
      return;
    }

    rootNavigation.navigate('Auth', { screen: 'Login' });
  };

  return (
    <View style={styles.screen}>
      <HomeHeader
        onCartPress={() => navigation.navigate('Cart')}
        onAccountPress={handleAccountPress}
        accountLabel={isAuthenticated ? 'Account' : 'Sign in'}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <HomeSearchBar onPress={() => navigation.navigate('Search', {})} />
        <HomeHeroBanner />

        <View style={styles.section}>
          <HomeSectionHeader
            title="Shop by Category"
            subtitle="Browse collections curated for every style"
            actionLabel="View all"
            onActionPress={() => navigation.navigate('Categories')}
          />

          {isLoading ? (
            <HomeStatePanel message="Loading categories..." loading />
          ) : null}

          {!isLoading && error ? (
            <HomeStatePanel
              tone="error"
              message={error}
              actionLabel="Try again"
              onAction={() => void retry()}
            />
          ) : null}

          {!isLoading && !error ? (
            <CategoryList categories={categories} onCategoryPress={handleCategoryPress} />
          ) : null}
        </View>

        <View style={styles.section}>
          <HomeSectionHeader
            title="Featured Products"
            subtitle="Best-selling picks from our artisan community"
          />
          <FeaturedProductsSection
            products={featuredProducts}
            isLoading={isFeaturedLoading}
            error={featuredError}
            onRetry={retryFeatured}
            onProductPress={handleProductPress}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: homeColors.background,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    marginBottom: homeSpacing.section,
  },
});
