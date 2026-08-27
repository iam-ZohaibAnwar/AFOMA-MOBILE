import { FlatList, StyleSheet, useWindowDimensions, View } from 'react-native';

import { AppText } from '../../../components/ui/AppText';
import { colors, spacing } from '../../../design-system';
import type { Category } from '../../../services/types/category';
import {
  getCategoryDisplayName,
  getCategoryRouteId,
  getNavigableCategories,
} from '../utils/categoryNavigation';
import {
  CATEGORY_GRID_COLUMN_GAP,
  CATEGORY_GRID_COLUMNS,
  CATEGORY_GRID_HORIZONTAL_PADDING,
  getCategoryCompactTileWidth,
} from '../utils/categoryGridLayout';
import { CategoryCompactTile } from './CategoryCompactTile';

interface CategoryGridProps {
  categories: Category[];
  onCategoryPress: (category: Category) => void;
  emptyMessage?: string;
}

export function CategoryGrid({
  categories,
  onCategoryPress,
  emptyMessage = 'No categories available right now.',
}: CategoryGridProps) {
  const { width } = useWindowDimensions();
  const visibleCategories = getNavigableCategories(categories);
  const tileWidth = getCategoryCompactTileWidth(width);

  return (
    <FlatList
      data={visibleCategories}
      keyExtractor={(item) => getCategoryRouteId(item)!}
      numColumns={CATEGORY_GRID_COLUMNS}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <CategoryCompactTile
          label={getCategoryDisplayName(item)}
          slug={item.slug}
          width={tileWidth}
          onPress={() => onCategoryPress(item)}
        />
      )}
      ListEmptyComponent={
        <View style={styles.emptyBox}>
          <AppText variant="bodySmall" color="textMuted" style={styles.emptyText}>
            {emptyMessage}
          </AppText>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: CATEGORY_GRID_HORIZONTAL_PADDING,
    paddingBottom: spacing.xl,
    flexGrow: 1,
  },
  row: {
    gap: CATEGORY_GRID_COLUMN_GAP,
    marginBottom: CATEGORY_GRID_COLUMN_GAP,
  },
  emptyBox: {
    padding: spacing.xl,
    borderRadius: 12,
    backgroundColor: colors.surfaceMuted,
  },
  emptyText: {
    textAlign: 'center',
  },
});
