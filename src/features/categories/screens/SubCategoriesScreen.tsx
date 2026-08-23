import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ErrorState } from '../../../components/ecommerce';
import { AppText } from '../../../components/ui/AppText';
import { colors, screenPaddingHorizontal, spacing } from '../../../design-system';
import type { ShoppingStackParamList } from '../../../app/navigation/types';
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

  const tileWidth = useMemo(() => {
    const horizontalPadding = screenPaddingHorizontal * 2;
    const gaps = spacing.sm * (TILES_PER_ROW - 1);
    return Math.floor((width - horizontalPadding - gaps) / TILES_PER_ROW);
  }, [width]);

  const showBlockingError = Boolean(error) && sections.length === 0 && !isRefreshing;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {categoryName ? (
        <AppText variant="bodySmall" color="textMuted" style={styles.contextLabel}>
          {categoryName}
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
});
