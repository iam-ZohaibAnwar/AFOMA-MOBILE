import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import type { Category } from '../../../services/types/category';
import {
  getCategoryDisplayName,
  getCategoryRouteId,
  getNavigableCategories,
} from '../utils/categoryNavigation';

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
  const visibleCategories = getNavigableCategories(categories);

  return (
    <FlatList
      data={visibleCategories}
      keyExtractor={(item) => getCategoryRouteId(item)!}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <Pressable
          style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          onPress={() => onCategoryPress(item)}
        >
          <Text style={styles.cardTitle} numberOfLines={2}>
            {getCategoryDisplayName(item)}
          </Text>
        </Pressable>
      )}
      ListEmptyComponent={
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>{emptyMessage}</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  row: {
    gap: 12,
    marginBottom: 12,
  },
  card: {
    flex: 1,
    minHeight: 96,
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#FFEDD5',
    borderWidth: 1,
    borderColor: '#FED7AA',
    justifyContent: 'center',
  },
  cardPressed: {
    opacity: 0.85,
  },
  cardTitle: {
    color: '#172554',
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  emptyBox: {
    padding: 24,
    borderRadius: 12,
    backgroundColor: '#FFEDD5',
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  emptyText: {
    color: '#475569',
    fontSize: 14,
    textAlign: 'center',
  },
});
