import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '../../../components/ui/AppText';
import { EmptyState } from '../../../components/ecommerce/EmptyState';
import { colors, layout, spacing } from '../../../design-system';
import type { Category } from '../../../services/types/category';
import { getCategoryDisplayName, getCategoryRouteId } from '../utils/categoryNavigation';
import { CategoryImageTile } from './CategoryImageTile';
import type { SubCategoryBrowserSection } from '../types/subCategoryBrowser';

export interface SubCategoryBrowserGroupProps {
  section: SubCategoryBrowserSection;
  tileWidth: number;
  onChildPress: (childCategory: Category, section: SubCategoryBrowserSection) => void;
  onViewAllPress: (section: SubCategoryBrowserSection) => void;
}

export function SubCategoryBrowserGroup({
  section,
  tileWidth,
  onChildPress,
  onViewAllPress,
}: SubCategoryBrowserGroupProps) {
  const subCategoryName = getCategoryDisplayName(section.subCategory);
  const hasChildren = section.childCategories.length > 0;

  return (
    <View style={styles.section}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`View all ${subCategoryName} products`}
        onPress={() => onViewAllPress(section)}
        style={({ pressed }) => [styles.sectionHeader, pressed && styles.pressed]}
      >
        <AppText variant="h3" style={styles.sectionTitle}>
          {subCategoryName}
        </AppText>
        <AppText variant="bodySmall" style={styles.sectionAction}>
          View all
        </AppText>
      </Pressable>

      <View style={styles.tileRow}>
        {hasChildren ? (
          <>
            {section.childCategories.map((childCategory) => {
              const childId = getCategoryRouteId(childCategory);
              if (!childId) {
                return null;
              }

              return (
                <CategoryImageTile
                  key={childId}
                  label={getCategoryDisplayName(childCategory)}
                  slug={childCategory.slug}
                  width={tileWidth}
                  onPress={() => onChildPress(childCategory, section)}
                />
              );
            })}
            <CategoryImageTile
              label={subCategoryName}
              width={tileWidth}
              variant="viewAll"
              onPress={() => onViewAllPress(section)}
            />
          </>
        ) : (
          <CategoryImageTile
            label={subCategoryName}
            width={tileWidth}
            variant="viewAll"
            onPress={() => onViewAllPress(section)}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md,
    marginBottom: layout.sectionGap,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  sectionTitle: {
    color: colors.textPrimary,
    flex: 1,
  },
  sectionAction: {
    color: colors.primary,
    fontWeight: '600',
  },
  tileRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  pressed: {
    opacity: 0.92,
  },
});

export function SubCategoryBrowserEmpty({ message }: { message: string }) {
  return (
    <EmptyState
      title="No sub-categories"
      message={message}
      style={{ paddingVertical: spacing.xl }}
    />
  );
}
