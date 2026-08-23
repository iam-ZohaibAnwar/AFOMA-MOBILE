import { StyleSheet, View } from 'react-native';

import { AppDivider } from '../../../components/ui/AppDivider';
import { AppText } from '../../../components/ui/AppText';
import { colors, screenPaddingHorizontal, spacing } from '../../../design-system';
import type { Category } from '../../../services/types/category';
import { getCategoryDisplayName, getCategoryRouteId } from '../utils/categoryNavigation';
import type { SubCategoryBrowserSection } from '../types/subCategoryBrowser';
import { CategoryBrowseRow } from './CategoryBrowseRow';

export interface CategoryBrowseSectionsListProps {
  sections: SubCategoryBrowserSection[];
  onChildPress: (section: SubCategoryBrowserSection, childCategory: Category) => void;
  onSubCategoryPress: (section: SubCategoryBrowserSection) => void;
}

export function CategoryBrowseSectionsList({
  sections,
  onChildPress,
  onSubCategoryPress,
}: CategoryBrowseSectionsListProps) {
  return (
    <View style={styles.container}>
      {sections.map((section) => {
        const subCategoryId = getCategoryRouteId(section.subCategory);
        if (!subCategoryId) {
          return null;
        }

        const subCategoryName = getCategoryDisplayName(section.subCategory);
        const rows =
          section.childCategories.length > 0
            ? section.childCategories
            : [section.subCategory];

        return (
          <View key={subCategoryId} style={styles.section}>
            <AppText variant="label" style={styles.sectionTitle}>
              {subCategoryName}
            </AppText>
            <AppDivider style={styles.sectionDivider} />
            <View style={styles.rows}>
              {rows.map((rowCategory) => {
                const rowId = getCategoryRouteId(rowCategory) ?? subCategoryId;
                const isChildRow = section.childCategories.length > 0;

                return (
                  <CategoryBrowseRow
                    key={rowId}
                    label={getCategoryDisplayName(rowCategory)}
                    onPress={() =>
                      isChildRow
                        ? onChildPress(section, rowCategory)
                        : onSubCategoryPress(section)
                    }
                  />
                );
              })}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xl,
    paddingHorizontal: screenPaddingHorizontal,
    paddingBottom: spacing.xxl,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    color: colors.textPrimary,
  },
  sectionDivider: {
    backgroundColor: colors.borderStrong,
  },
  rows: {
    gap: spacing.xs,
  },
});
