import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ErrorState } from '../../../components/ecommerce';
import { AppText } from '../../../components/ui/AppText';
import { colors, screenPaddingHorizontal, spacing } from '../../../design-system';
import type { ShoppingStackParamList } from '../../../app/navigation/types';
import { ProductCard } from '../../products/components/ProductCard';
import { useProductListing } from '../../products/hooks/useProductListing';
import { getProductRouteId } from '../../products/utils/productDisplay';
import { useSubCategoryBrowserSections } from '../hooks/useSubCategoryBrowserSections';
import {
  navigateFromSubCategorySection,
  navigateFromSubCategorySectionChild,
  navigateToCategoryProductListing,
} from '../utils/subCategoryNavigation';
import { SubCategoryBrowserEmpty, SubCategoryBrowserGroup } from '../components/SubCategoryBrowserGroup';
import { getCategoryRouteId } from '../utils/categoryNavigation';

type Props = NativeStackScreenProps<ShoppingStackParamList, 'SubCategories'>;

const TILES_PER_ROW = 3;

export function SubCategoriesScreen({ route, navigation }: Props) {
  const { categoryId, categoryName } = route.params;
  const { width } = useWindowDimensions();
  const { sections, isRefreshing, error, retry } = useSubCategoryBrowserSections(categoryId);
  const { products, isRefreshing: isProductsRefreshing } = useProductListing({ categoryId });
  const previewProducts = useMemo(() => products.slice(0, 4), [products]);

  const tileWidth = useMemo(() => {
    const horizontalPadding = screenPaddingHorizontal * 2;
    const gaps = spacing.sm * (TILES_PER_ROW - 1);
    return Math.floor((width - horizontalPadding - gaps) / TILES_PER_ROW);
  }, [width]);

  const productCardWidth = useMemo(() => {
    const horizontalPadding = screenPaddingHorizontal * 2;
    const gap = spacing.sm;
    return Math.floor((width - horizontalPadding - gap) / 2);
  }, [width]);

  const showBlockingError = Boolean(error) && sections.length === 0 && !isRefreshing;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {categoryName ? (
        <AppText variant="h2" style={styles.title}>
          {categoryName}
        </AppText>
      ) : null}

      {categoryName ? (
        <AppText variant="bodySmall" color="textMuted" style={styles.contextLabel}>
          Browse subcategories and shop products in this category.
        </AppText>
      ) : null}

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
        <ErrorState message={error ?? 'Failed to load categories'} onAction={() => void retry()} />
      ) : null}

      {!showBlockingError && sections.length === 0 && !isRefreshing ? (
        <View style={styles.emptyWrap}>
          <SubCategoryBrowserEmpty message="There are no sub-categories available for this category right now." />
          <Pressable
            style={styles.viewAllButton}
            onPress={() =>
              navigateToCategoryProductListing(navigation, {
                categoryId,
                categoryName,
              })
            }
          >
            <AppText variant="bodyMedium" style={styles.viewAllText}>
              View all {categoryName ?? 'products'} →
            </AppText>
          </Pressable>
        </View>
      ) : null}

      {sections.map((section) => {
        const sectionId = getCategoryRouteId(section.subCategory);
        if (!sectionId) {
          return null;
        }

        return (
          <SubCategoryBrowserGroup
            key={sectionId}
            section={section}
            tileWidth={tileWidth}
            onChildPress={(childCategory, sectionData) =>
              navigateFromSubCategorySectionChild(navigation, {
                categoryId,
                categoryName,
                subCategory: sectionData.subCategory,
                childCategory,
              })
            }
            onViewAllPress={(sectionData) =>
              navigateFromSubCategorySection(navigation, {
                categoryId,
                categoryName,
                subCategory: sectionData.subCategory,
              })
            }
          />
        );
      })}

      {sections.length > 0 ? (
        <Pressable
          style={styles.viewAllButton}
          onPress={() =>
            navigateToCategoryProductListing(navigation, {
              categoryId,
              categoryName,
            })
          }
        >
          <AppText variant="bodyMedium" style={styles.viewAllText}>
            View all {categoryName ?? 'products'} →
          </AppText>
        </Pressable>
      ) : null}

      {previewProducts.length > 0 ? (
        <View style={styles.productsSection}>
          <View style={styles.productsHeader}>
            <AppText variant="label">Products</AppText>
            {!isProductsRefreshing ? (
              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  navigateToCategoryProductListing(navigation, {
                    categoryId,
                    categoryName,
                  })
                }
              >
                <AppText variant="bodySmall" color="textLink">
                  See all
                </AppText>
              </Pressable>
            ) : null}
          </View>

          <View style={styles.productGrid}>
            {previewProducts.map((product) => (
              <View key={getProductRouteId(product) ?? product.slug} style={{ width: productCardWidth }}>
                <ProductCard
                  product={product}
                  variant="elevated"
                  onPress={(selected) =>
                    navigation.navigate('ProductDetail', {
                      productId: getProductRouteId(selected),
                      slug: selected.slug,
                    })
                  }
                />
              </View>
            ))}
          </View>
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
  content: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    paddingHorizontal: screenPaddingHorizontal,
  },
  title: {
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  contextLabel: {
    marginBottom: spacing.md,
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
  emptyWrap: {
    gap: spacing.md,
  },
  viewAllButton: {
    alignSelf: 'center',
    paddingVertical: spacing.md,
  },
  viewAllText: {
    color: colors.primary,
    fontWeight: '700',
  },
  productsSection: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  productsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
