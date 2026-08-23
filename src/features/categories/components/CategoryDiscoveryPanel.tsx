import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppText } from '../../../components/ui/AppText';
import { ErrorState } from '../../../components/ecommerce';
import { colors, radius, spacing } from '../../../design-system';
import type { ShoppingStackParamList } from '../../../app/navigation/types';
import type { Category } from '../../../services/types/category';
import { useSubCategoryBrowserSections } from '../hooks/useSubCategoryBrowserSections';
import {
  getCategoryDisplayName,
  getCategoryRouteId,
} from '../utils/categoryNavigation';
import {
  navigateFromSubCategorySection,
  navigateFromSubCategorySectionChild,
  navigateToCategoryProductListing,
} from '../utils/subCategoryNavigation';
import { CategoryBannerCard } from './CategoryBannerCard';
import { CategoryTreeRow } from './CategoryTreeRow';

export interface CategoryDiscoveryPanelProps {
  category: Category;
  colorIndex: number;
  expanded: boolean;
  onToggleExpand: () => void;
  navigation: NativeStackNavigationProp<ShoppingStackParamList>;
}

export function CategoryDiscoveryPanel({
  category,
  colorIndex,
  expanded,
  onToggleExpand,
  navigation,
}: CategoryDiscoveryPanelProps) {
  const categoryId = getCategoryRouteId(category);
  const categoryName = getCategoryDisplayName(category);
  const { sections, isRefreshing, error, retry } = useSubCategoryBrowserSections(
    categoryId ?? '',
    expanded,
  );
  const [expandedSubCategoryId, setExpandedSubCategoryId] = useState<string | null>(null);

  useEffect(() => {
    if (!expanded) {
      setExpandedSubCategoryId(null);
    }
  }, [expanded]);

  const handleViewAllCategory = () => {
    if (!categoryId) {
      return;
    }

    navigateToCategoryProductListing(navigation, { categoryId, categoryName });
  };

  const handleChildPress = (childCategory: Category, section: { subCategory: Category }) => {
    if (!categoryId) {
      return;
    }

    navigateFromSubCategorySectionChild(navigation, {
      categoryId,
      categoryName,
      subCategory: section.subCategory,
      childCategory,
    });
  };

  const handleSubCategoryPress = (section: { subCategory: Category }) => {
    if (!categoryId) {
      return;
    }

    navigateFromSubCategorySection(navigation, {
      categoryId,
      categoryName,
      subCategory: section.subCategory,
    });
  };

  const handleBannerPress = () => {
    onToggleExpand();
  };

  const handleSubRowPress = (section: { subCategory: Category; childCategories: Category[] }) => {
    const subCategoryId = getCategoryRouteId(section.subCategory);
    if (!subCategoryId) {
      return;
    }

    const hasChildren = section.childCategories.length > 0;

    if (!hasChildren) {
      handleSubCategoryPress(section);
      return;
    }

    setExpandedSubCategoryId((current) => (current === subCategoryId ? null : subCategoryId));
  };

  if (!categoryId) {
    return null;
  }

  const visibleSections = sections.filter((section) => getCategoryRouteId(section.subCategory));

  return (
    <View style={styles.panel}>
      <CategoryBannerCard
        name={categoryName}
        slug={category.slug}
        colorIndex={colorIndex}
        expanded={expanded}
        onPress={handleBannerPress}
      />

      {expanded ? (
        <View style={styles.treePanel}>
          {error && visibleSections.length > 0 ? (
            <Pressable style={styles.refreshBanner} onPress={() => void retry()}>
              <AppText variant="bodySmall" color="error">
                {error}
              </AppText>
              <AppText variant="bodySmall" style={styles.refreshBannerAction}>
                Retry
              </AppText>
            </Pressable>
          ) : null}

          {error && visibleSections.length === 0 && !isRefreshing ? (
            <View style={styles.inlineState}>
              <ErrorState message={error} onAction={() => void retry()} />
            </View>
          ) : null}

          {!error && visibleSections.length === 0 && !isRefreshing ? (
            <CategoryTreeRow
              label={`Shop all ${categoryName}`}
              onPress={handleViewAllCategory}
              isLast
            />
          ) : null}

          {visibleSections.map((section, sectionIndex) => {
            const subCategoryId = getCategoryRouteId(section.subCategory);
            if (!subCategoryId) {
              return null;
            }

            const subCategoryName = getCategoryDisplayName(section.subCategory);
            const hasChildren = section.childCategories.length > 0;
            const isSubExpanded = expandedSubCategoryId === subCategoryId;
            const isLastSection =
              sectionIndex === visibleSections.length - 1 && (!hasChildren || !isSubExpanded);

            return (
              <View key={subCategoryId}>
                <CategoryTreeRow
                  label={subCategoryName}
                  expanded={hasChildren ? isSubExpanded : false}
                  onPress={() => handleSubRowPress(section)}
                  isLast={isLastSection}
                />

                {hasChildren && isSubExpanded
                  ? section.childCategories.map((childCategory, childIndex) => {
                      const childId = getCategoryRouteId(childCategory);
                      if (!childId) {
                        return null;
                      }

                      const isLastChild =
                        sectionIndex === visibleSections.length - 1 &&
                        childIndex === section.childCategories.length - 1;

                      return (
                        <CategoryTreeRow
                          key={childId}
                          label={getCategoryDisplayName(childCategory)}
                          depth={1}
                          onPress={() => handleChildPress(childCategory, section)}
                          isLast={isLastChild}
                        />
                      );
                    })
                  : null}
              </View>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    alignSelf: 'stretch',
    flexGrow: 0,
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  treePanel: {
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderStrong,
  },
  refreshBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: radius.large,
    backgroundColor: colors.surfaceMuted,
  },
  refreshBannerAction: {
    color: colors.textLink,
    fontWeight: '600',
  },
  inlineState: {
    padding: spacing.md,
  },
});
