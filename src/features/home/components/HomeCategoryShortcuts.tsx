import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { Category } from '../../../services/types/category';
import {
  getCategoryDisplayName,
  getCategoryRouteId,
  getNavigableCategories,
} from '../../categories/utils/categoryNavigation';
import { homeColors, homeShadows, homeSpacing } from '../../home/theme/homeTheme';

interface HomeCategoryShortcutsProps {
  categories: Category[];
  onCategoryPress: (category: Category) => void;
}

function getCategoryInitial(name: string): string {
  const trimmed = name.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : '?';
}

export function HomeCategoryShortcuts({
  categories,
  onCategoryPress,
}: HomeCategoryShortcutsProps) {
  const visibleCategories = getNavigableCategories(categories).slice(0, 8);

  if (visibleCategories.length === 0) {
    return (
      <View style={styles.emptyBox}>
        <Text style={styles.emptyText}>No categories available right now.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
      decelerationRate="fast"
    >
      {visibleCategories.map((category) => {
        const categoryId = getCategoryRouteId(category)!;
        const displayName = getCategoryDisplayName(category);

        return (
          <Pressable
            key={categoryId}
            style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
            onPress={() => onCategoryPress(category)}
          >
            <View style={styles.circle}>
              <Text style={styles.initial}>{getCategoryInitial(displayName)}</Text>
            </View>
            <Text style={styles.label} numberOfLines={2}>
              {displayName}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: homeSpacing.screen,
    gap: 18,
    paddingBottom: 4,
  },
  item: {
    width: 78,
    alignItems: 'center',
    gap: 8,
  },
  itemPressed: {
    opacity: 0.88,
  },
  circle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: homeColors.surface,
    borderWidth: 1,
    borderColor: homeColors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    ...homeShadows.soft,
  },
  initial: {
    fontSize: 24,
    fontWeight: '800',
    color: homeColors.primary,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: homeColors.text,
    textAlign: 'center',
    lineHeight: 16,
    minHeight: 32,
  },
  emptyBox: {
    marginHorizontal: homeSpacing.screen,
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: homeColors.surfaceMuted,
    borderWidth: 1,
    borderColor: homeColors.borderLight,
  },
  emptyText: {
    fontSize: 14,
    color: homeColors.textMuted,
    textAlign: 'center',
  },
});
