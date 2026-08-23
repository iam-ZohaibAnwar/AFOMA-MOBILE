import { ScrollView, StyleSheet, useWindowDimensions } from 'react-native';

import { CategoryCard, EmptyState, ErrorState } from '../../../components/ecommerce';
import { spacing } from '../../../design-system';
import type { PopularHomeCategoryItem } from '../utils/homeProducts';
import { getHomeCategoryCardWidth } from '../utils/homeLayout';

interface HomeCategoriesSectionProps {
  categories: PopularHomeCategoryItem[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onCategoryPress: (category: PopularHomeCategoryItem) => void;
}

export function HomeCategoriesSection({
  categories,
  isLoading,
  error,
  onRetry,
  onCategoryPress,
}: HomeCategoriesSectionProps) {
  const { width } = useWindowDimensions();
  const cardWidth = getHomeCategoryCardWidth(width);

  if (error && categories.length === 0 && !isLoading) {
    return (
      <ErrorState message={error} onAction={() => void onRetry()} style={styles.statePanel} />
    );
  }

  if (categories.length === 0) {
    if (isLoading) {
      return null;
    }

    return (
      <EmptyState
        title="No categories yet"
        message="Check back soon for new collections."
        style={styles.statePanel}
      />
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      decelerationRate="fast"
    >
      {categories.map((category) => (
        <CategoryCard
          key={`${category.categoryId}-${category.subCategoryId}`}
          name={category.displayName}
          width={cardWidth}
          variant="horizontal"
          onPress={() => onCategoryPress(category)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
    paddingBottom: spacing.xs,
  },
  statePanel: {
    marginHorizontal: spacing.xl,
  },
});
