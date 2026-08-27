import { Pressable, ScrollView, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ErrorState } from '../../../components/ecommerce';
import { AppText } from '../../../components/ui/AppText';
import { colors, screenPaddingHorizontal, spacing } from '../../../design-system';
import type { ShoppingStackParamList } from '../../../app/navigation/types';
import type { Category } from '../../../services/types/category';
import { CategoryBrowseScreenLayout } from '../components/CategoryBrowseScreenLayout';
import { CategoryGrid } from '../components/CategoryGrid';
import { useChildCategories } from '../hooks/useChildCategories';
import { getCategoryDisplayName, getCategoryRouteId } from '../utils/categoryNavigation';

type Props = NativeStackScreenProps<ShoppingStackParamList, 'ChildCategories'>;

export function ChildCategoriesScreen({ route, navigation }: Props) {
  const { categoryId, subCategoryId, categoryName, subCategoryName } = route.params;
  const { childCategories, error, retry } = useChildCategories(subCategoryId);

  const handleChildCategoryPress = (childCategory: Category) => {
    const childCategoryId = getCategoryRouteId(childCategory);
    if (!childCategoryId) {
      return;
    }

    const childCategoryName = getCategoryDisplayName(childCategory);

    navigation.navigate('ChildCategory', {
      categoryId,
      subCategoryId,
      childCategoryId,
      categoryName,
      subCategoryName,
      childCategoryName,
    });
  };

  const showBlockingError = Boolean(error) && childCategories.length === 0;

  return (
    <CategoryBrowseScreenLayout navigation={navigation}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {subCategoryName ? (
          <AppText variant="h2" style={styles.title}>
            {subCategoryName}
          </AppText>
        ) : null}

        {categoryName ? (
          <AppText variant="bodySmall" color="textMuted" style={styles.subtitle}>
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
          <ErrorState message={error ?? 'Failed to load child categories'} onAction={() => void retry()} />
        ) : (
          <CategoryGrid
            categories={childCategories}
            onCategoryPress={handleChildCategoryPress}
            emptyMessage="No child categories available for this sub-category."
          />
        )}
      </ScrollView>
    </CategoryBrowseScreenLayout>
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
  },
  title: {
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    paddingHorizontal: screenPaddingHorizontal,
  },
  subtitle: {
    marginBottom: spacing.md,
    paddingHorizontal: screenPaddingHorizontal,
  },
  refreshBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.md,
    marginHorizontal: screenPaddingHorizontal,
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
