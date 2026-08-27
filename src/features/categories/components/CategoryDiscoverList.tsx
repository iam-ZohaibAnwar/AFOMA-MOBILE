import { useCallback, useMemo } from 'react';

import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';



import { ErrorState, SectionHeader } from '../../../components/ecommerce';

import { AppText } from '../../../components/ui/AppText';

import {
  useMarketplaceFooterContentInset,
  useMarketplaceScrollHandler,
} from '../../../app/navigation/marketplaceChrome';

import { colors, screenPaddingHorizontal, spacing } from '../../../design-system';
import type { Category } from '../../../services/types/category';
import type { Product } from '../../../services/types/product';
import { useNewArrivalProducts } from '../../home/hooks/useNewArrivalProducts';
import { ProductGrid } from '../../products/components/ProductGrid';
import { getCategoryDisplayName, getCategoryRouteId } from '../utils/categoryNavigation';
import {
  CATEGORY_GRID_COLUMN_GAP,
  CATEGORY_GRID_HORIZONTAL_PADDING,
  getCategoryCompactTileWidth,
} from '../utils/categoryGridLayout';
import { CategoryCompactTile } from './CategoryCompactTile';

const NEW_ARRIVAL_LIMIT = 12;



export interface CategoryDiscoverListProps {

  categories: Category[];

  isLoading: boolean;

  error: string | null;

  onRetry: () => void;

  onCategoryPress: (category: Category) => void;

  onProductPress: (product: Product) => void;

}



export function CategoryDiscoverList({

  categories,

  isLoading,

  error,

  onRetry,

  onCategoryPress,

  onProductPress,

}: CategoryDiscoverListProps) {

  const { width } = useWindowDimensions();

  const footerInset = useMarketplaceFooterContentInset();

  const onMarketplaceScroll = useMarketplaceScrollHandler();



  const {

    products: newArrivals,

    isLoading: isNewArrivalsLoading,

    error: newArrivalsError,

    retry: retryNewArrivals,

  } = useNewArrivalProducts(NEW_ARRIVAL_LIMIT);

  const handleProductPress = useCallback(
    (product: Product) => {
      onProductPress(product);
    },
    [onProductPress],
  );

  const tileWidth = useMemo(() => getCategoryCompactTileWidth(width), [width]);



  const listHeader = useMemo(

    () => (

      <View style={styles.headerSection}>

        <SectionHeader title="Shop by category" style={styles.sectionHeader} />



        {error ? (

          <Pressable style={styles.refreshBanner} onPress={() => void onRetry()}>

            <AppText variant="bodySmall" color="error">

              {error}

            </AppText>

            <AppText variant="bodySmall" style={styles.refreshBannerAction}>

              Retry

            </AppText>

          </Pressable>

        ) : null}



        {categories.length === 0 && !isLoading ? (

          <AppText variant="body" color="textMuted" style={styles.emptyText}>

            No categories available right now.

          </AppText>

        ) : null}



        <View style={styles.grid}>

          {categories.map((category) => {

            const categoryId = getCategoryRouteId(category);

            if (!categoryId) {

              return null;

            }



            return (

              <CategoryCompactTile

                key={categoryId}

                label={getCategoryDisplayName(category)}

                slug={category.slug}

                width={tileWidth}

                onPress={() => onCategoryPress(category)}

              />

            );

          })}

        </View>



        <SectionHeader title="New arrivals" style={styles.productsSectionHeader} />



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

      categories,

      error,

      isLoading,

      newArrivals.length,

      newArrivalsError,

      onCategoryPress,

      onRetry,

      retryNewArrivals,

      tileWidth,

    ],

  );



  if (error && categories.length === 0 && !isLoading) {

    return (

      <View style={styles.blockingState}>

        <ErrorState message={error} onAction={() => void onRetry()} />

      </View>

    );

  }



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
    paddingHorizontal: CATEGORY_GRID_HORIZONTAL_PADDING,
    paddingTop: spacing.md,
  },

  sectionHeader: {

    paddingHorizontal: 0,

    marginBottom: spacing.sm,

  },

  productsSectionHeader: {

    paddingHorizontal: 0,

    marginTop: spacing.lg,

    marginBottom: spacing.lg,

  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CATEGORY_GRID_COLUMN_GAP,
  },

  emptyText: {

    textAlign: 'center',

    paddingVertical: spacing.xl,

  },

  refreshBanner: {

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-between',

    gap: spacing.sm,

    marginBottom: spacing.md,

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


