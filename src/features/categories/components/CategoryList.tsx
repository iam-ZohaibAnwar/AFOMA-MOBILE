import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import {
  homeColors,
  homeRadii,
  homeShadows,
  homeSpacing,
  getHomeCategoryCardWidth,
} from '../../home/theme/homeTheme';
import type { Category } from '../../../services/types/category';
import {
  getCategoryDisplayName,
  getCategoryRouteId,
  getNavigableCategories,
} from '../utils/categoryNavigation';

interface CategoryListProps {
  categories: Category[];
  onCategoryPress: (category: Category) => void;
}

function getCategoryInitial(name: string): string {
  const trimmed = name.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : '?';
}

/** Horizontal category cards for Home. */
export function CategoryList({ categories, onCategoryPress }: CategoryListProps) {
  const { width } = useWindowDimensions();
  const cardWidth = getHomeCategoryCardWidth(width);
  const visibleCategories = getNavigableCategories(categories);

  if (visibleCategories.length === 0) {
    return (
      <View style={styles.emptyBox}>
        <Text style={styles.emptyTitle}>No categories yet</Text>
        <Text style={styles.emptyText}>Check back soon for new collections.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.horizontalContent}
      decelerationRate="fast"
    >
      {visibleCategories.map((category) => {
        const categoryId = getCategoryRouteId(category)!;
        const displayName = getCategoryDisplayName(category);

        return (
          <Pressable
            key={categoryId}
            style={({ pressed }) => [
              styles.card,
              { width: cardWidth },
              pressed && styles.cardPressed,
            ]}
            onPress={() => onCategoryPress(category)}
          >
            <View style={styles.iconCircle}>
              <Text style={styles.iconText}>{getCategoryInitial(displayName)}</Text>
            </View>
            <Text style={styles.cardText} numberOfLines={2}>
              {displayName}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  horizontalContent: {
    paddingHorizontal: homeSpacing.screen,
    gap: homeSpacing.cardGap,
    paddingBottom: 4,
  },
  card: {
    minHeight: 132,
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderRadius: homeRadii.md,
    backgroundColor: homeColors.surface,
    borderWidth: 1,
    borderColor: homeColors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    ...homeShadows.card,
  },
  cardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.985 }],
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: homeColors.surfaceWarm,
    borderWidth: 1,
    borderColor: homeColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 22,
    fontWeight: '800',
    color: homeColors.primary,
  },
  cardText: {
    color: homeColors.text,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 18,
    minHeight: 36,
  },
  emptyBox: {
    marginHorizontal: homeSpacing.screen,
    paddingVertical: 22,
    paddingHorizontal: 18,
    borderRadius: homeRadii.md,
    backgroundColor: homeColors.surfaceMuted,
    borderWidth: 1,
    borderColor: homeColors.borderLight,
    gap: 6,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: homeColors.text,
    textAlign: 'center',
  },
  emptyText: {
    color: homeColors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
