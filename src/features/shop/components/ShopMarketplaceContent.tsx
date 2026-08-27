import { useCallback, useMemo } from 'react';

import { Pressable, StyleSheet, View } from 'react-native';

import type { CompositeNavigationProp } from '@react-navigation/native';

import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

import type { NativeStackNavigationProp } from '@react-navigation/native-stack';



import { ErrorState, SectionHeader } from '../../../components/ecommerce';

import { AppText } from '../../../components/ui/AppText';

import {

  useMarketplaceFooterContentInset,

  useMarketplaceScrollHandler,

} from '../../../app/navigation/marketplaceChrome';

import { colors, screenPaddingHorizontal, spacing } from '../../../design-system';

import type { MainTabParamList, ShoppingStackParamList } from '../../../app/navigation/types';

import type { Category } from '../../../services/types/category';

import type { Product } from '../../../services/types/product';

import { useCategories } from '../../categories/hooks/useCategories';

import {

  getCategoryDisplayName,

  getCategoryRouteId,

  getNavigableCategories,

} from '../../categories/utils/categoryNavigation';

import { navigateToParentCategory } from '../../categories/utils/subCategoryNavigation';

import { useNewArrivalProducts } from '../../home/hooks/useNewArrivalProducts';

import { ProductGrid } from '../../products/components/ProductGrid';

import { getProductRouteId } from '../../products/utils/productDisplay';

import { ShopCategoryGridCard } from './ShopCategoryGridCard';



export type ShopMarketplaceNavigationProp = CompositeNavigationProp<

  BottomTabNavigationProp<MainTabParamList, 'ShopTab'>,

  NativeStackNavigationProp<ShoppingStackParamList>

>;



export interface ShopMarketplaceContentProps {

  navigation: ShopMarketplaceNavigationProp;

}



function buildCategoryRows(categories: Category[]): Category[][] {

  const rows: Category[][] = [];



  for (let index = 0; index < categories.length; index += 2) {

    rows.push(categories.slice(index, index + 2));

  }



  return rows;

}



export function ShopMarketplaceContent({ navigation }: ShopMarketplaceContentProps) {

  const footerInset = useMarketplaceFooterContentInset();

  const onMarketplaceScroll = useMarketplaceScrollHandler();

  const {

    categories,

    isLoading: isCategoriesLoading,

    error: categoriesError,

    retry: retryCategories,

  } = useCategories();

  const navigableCategories = getNavigableCategories(categories);



  const {

    products: newArrivals,

    isLoading: isNewArrivalsLoading,

    error: newArrivalsError,

    retry: retryNewArrivals,

  } = useNewArrivalProducts(12);



  const handleCategoryPress = useCallback(

    (category: Category) => {

      navigateToParentCategory(navigation, category);

    },

    [navigation],

  );



  const handleProductPress = useCallback(

    (product: Product) => {

      navigation.navigate('ProductDetail', {

        productId: getProductRouteId(product),

        slug: product.slug,

      });

    },

    [navigation],

  );



  const categoryRows = useMemo(() => buildCategoryRows(navigableCategories), [navigableCategories]);



  const listHeader = useMemo(

    () => (

      <View style={styles.headerSection}>

        {categoriesError && navigableCategories.length === 0 ? (

          <View style={styles.inlineError}>

            <ErrorState message={categoriesError} onAction={() => void retryCategories()} />

          </View>

        ) : null}



        <SectionHeader title="Browse categories" style={styles.sectionHeader} />

        {navigableCategories.length === 0 && !isCategoriesLoading ? (

          <AppText variant="body" color="textMuted" style={styles.emptyCategories}>

            No categories available right now.

          </AppText>

        ) : (

          <View style={styles.categoryGrid}>

            {categoryRows.map((row, rowIndex) => (

              <View key={`row-${rowIndex}`} style={styles.categoryRow}>

                {row.map((category, columnIndex) => {

                  const categoryId = getCategoryRouteId(category);

                  if (!categoryId) {

                    return null;

                  }



                  const colorIndex = rowIndex * 2 + columnIndex;



                  return (

                    <ShopCategoryGridCard

                      key={categoryId}

                      name={getCategoryDisplayName(category)}

                      slug={category.slug}

                      colorIndex={colorIndex}

                      onPress={() => handleCategoryPress(category)}

                    />

                  );

                })}

              </View>

            ))}

          </View>

        )}



        <SectionHeader title="New arrivals" style={styles.sectionHeader} />



        {newArrivalsError && newArrivals.length > 0 ? (

          <Pressable style={styles.refreshBanner} onPress={() => void retryNewArrivals()}>

            <AppText variant="bodySmall" color="error">

              {newArrivalsError}

            </AppText>

            <AppText variant="bodySmall" style={styles.refreshBannerAction}>

              Retry

            </AppText>

          </Pressable>

        ) : null}

      </View>

    ),

    [

      categoriesError,

      categoryRows,

      handleCategoryPress,

      isCategoriesLoading,

      navigableCategories.length,

      newArrivals.length,

      newArrivalsError,

      retryCategories,

      retryNewArrivals,

    ],

  );



  if (newArrivalsError && newArrivals.length === 0 && !isNewArrivalsLoading) {

    return (

      <View style={styles.blockingState}>

        <ErrorState message={newArrivalsError} onAction={() => void retryNewArrivals()} />

      </View>

    );

  }



  return (

    <View style={styles.screen}>

      <ProductGrid

        products={newArrivals}

        onProductPress={handleProductPress}

        isLoading={isNewArrivalsLoading}

        emptyMessage="No products to show right now."

        ListHeaderComponent={listHeader}

        edgeToEdgeHeader

        cardLayout="shop"

        showSeller

        showWishlist={false}

        onScroll={onMarketplaceScroll}

        contentInsetBottom={footerInset}

      />

    </View>

  );

}



const styles = StyleSheet.create({

  screen: {

    flex: 1,

    backgroundColor: colors.background,

  },

  headerSection: {

    backgroundColor: colors.background,

  },

  sectionHeader: {

    paddingHorizontal: screenPaddingHorizontal,

    marginTop: spacing.md,

    marginBottom: spacing.lg,

  },

  categoryGrid: {

    paddingHorizontal: screenPaddingHorizontal,

    gap: spacing.md,

    paddingBottom: spacing.sm,

  },

  categoryRow: {

    flexDirection: 'row',

    gap: spacing.md,

  },

  emptyCategories: {

    textAlign: 'center',

    paddingHorizontal: screenPaddingHorizontal,

    paddingBottom: spacing.lg,

  },

  inlineError: {

    paddingHorizontal: screenPaddingHorizontal,

    paddingVertical: spacing.md,

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

  blockingState: {

    flex: 1,

    justifyContent: 'center',

    paddingHorizontal: screenPaddingHorizontal,

    backgroundColor: colors.background,

  },

});


