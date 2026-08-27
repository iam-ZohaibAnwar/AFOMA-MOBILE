import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppText } from '../../../components/ui/AppText';
import { ErrorState } from '../../../components/ecommerce';
import { colors, spacing } from '../../../design-system';
import type { ShoppingStackParamList } from '../../../app/navigation/types';
import { CategoryBrowseScreenLayout } from '../components/CategoryBrowseScreenLayout';
import { CategoryProductsWithHeader } from '../components/CategoryProductsWithHeader';
import { SubCategoryGrid } from '../components/SubCategoryGrid';
import { useSubCategoryBrowserSections } from '../hooks/useSubCategoryBrowserSections';
import { navigateFromSubCategorySection } from '../utils/subCategoryNavigation';

type Props = NativeStackScreenProps<ShoppingStackParamList, 'SubCategories'>;

export function SubCategoriesScreen({ route, navigation }: Props) {
  const { categoryId, categoryName } = route.params;
  const { sections, isRefreshing, error, retry } = useSubCategoryBrowserSections(categoryId);

  const headerContent = useMemo(
    () => (
      <View style={styles.headerContent}>
        {error && sections.length === 0 && !isRefreshing ? (
          <View style={styles.inlineError}>
            <ErrorState message={error} onAction={() => void retry()} />
          </View>
        ) : null}

        {error && sections.length > 0 ? (
          <Pressable style={styles.refreshBanner} onPress={() => void retry()}>
            <AppText variant="bodySmall" color="error">
              {error}
            </AppText>
            <AppText variant="bodySmall" style={styles.refreshBannerAction}>
              Retry
            </AppText>
          </Pressable>
        ) : null}

        <SubCategoryGrid
          categoryName={categoryName ?? 'Category'}
          sections={sections}
          onSubCategoryPress={(subCategory) => {
            navigateFromSubCategorySection(navigation, {
              categoryId,
              categoryName,
              subCategory,
            });
          }}
        />
      </View>
    ),
    [categoryId, categoryName, error, isRefreshing, navigation, retry, sections],
  );

  return (
    <CategoryBrowseScreenLayout navigation={navigation}>
      <CategoryProductsWithHeader
        navigation={navigation}
        filters={{ categoryId }}
        headerContent={headerContent}
        emptyMessage="No products found in this category yet."
      />
    </CategoryBrowseScreenLayout>
  );
}

const styles = StyleSheet.create({
  headerContent: {
    paddingTop: spacing.sm,
  },
  inlineError: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  refreshBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    backgroundColor: colors.surfaceMuted,
  },
  refreshBannerAction: {
    color: colors.textLink,
    fontWeight: '600',
  },
});
