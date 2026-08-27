import { useMemo } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { SectionHeader } from '../../../components/ecommerce';
import { screenPaddingHorizontal, spacing } from '../../../design-system';
import type { Category } from '../../../services/types/category';
import { getCategoryDisplayName, getCategoryRouteId } from '../utils/categoryNavigation';
import {
  CATEGORY_GRID_COLUMN_GAP,
  CATEGORY_GRID_HORIZONTAL_PADDING,
  getCategoryCompactTileWidth,
} from '../utils/categoryGridLayout';
import type { SubCategoryBrowserSection } from '../types/subCategoryBrowser';
import { CategoryCompactTile } from './CategoryCompactTile';

export interface SubCategoryGridProps {
  categoryName: string;
  sections: SubCategoryBrowserSection[];
  onSubCategoryPress: (subCategory: Category) => void;
  onViewAllPress?: () => void;
}

export function SubCategoryGrid({
  categoryName,
  sections,
  onSubCategoryPress,
  onViewAllPress,
}: SubCategoryGridProps) {
  const { width } = useWindowDimensions();

  const tileWidth = useMemo(() => getCategoryCompactTileWidth(width), [width]);

  const showViewAllTile = sections.length >= 6 && onViewAllPress;

  if (sections.length === 0) {
    return null;
  }

  return (
    <View style={styles.wrap}>
      <SectionHeader title={categoryName} style={styles.sectionHeader} />
      <View style={styles.grid}>
        {sections.map((section) => {
          const subCategoryId = getCategoryRouteId(section.subCategory);
          if (!subCategoryId) {
            return null;
          }

          return (
            <CategoryCompactTile
              key={subCategoryId}
              label={getCategoryDisplayName(section.subCategory)}
              slug={section.subCategory.slug}
              width={tileWidth}
              onPress={() => onSubCategoryPress(section.subCategory)}
            />
          );
        })}
        {showViewAllTile ? (
          <CategoryCompactTile
            label={categoryName}
            width={tileWidth}
            variant="viewAll"
            onPress={onViewAllPress}
          />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingBottom: spacing.lg,
  },
  sectionHeader: {
    paddingHorizontal: CATEGORY_GRID_HORIZONTAL_PADDING,
    marginBottom: spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CATEGORY_GRID_COLUMN_GAP,
    paddingHorizontal: CATEGORY_GRID_HORIZONTAL_PADDING,
  },
});
