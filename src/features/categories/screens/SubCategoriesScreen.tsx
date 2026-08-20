import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { CategoryGrid } from '../components/CategoryGrid';
import { useSubCategories } from '../hooks/useSubCategories';
import { getCategoryRouteId } from '../utils/categoryNavigation';
import {
  navigateFromSubCategory,
  resolveSubCategoryDestination,
} from '../utils/subCategoryNavigation';
import type { ShoppingStackParamList } from '../../../app/navigation/types';
import type { Category } from '../../../services/types/category';

type Props = NativeStackScreenProps<ShoppingStackParamList, 'SubCategories'>;

export function SubCategoriesScreen({ route, navigation }: Props) {
  const { categoryId, categoryName } = route.params;
  const { subCategories, isLoading, error, retry } = useSubCategories(categoryId);
  const [navigatingSubCategoryId, setNavigatingSubCategoryId] = useState<string | null>(null);

  const handleSubCategoryPress = async (subCategory: Category) => {
    const subCategoryId = getCategoryRouteId(subCategory);
    if (!subCategoryId || navigatingSubCategoryId) {
      return;
    }

    setNavigatingSubCategoryId(subCategoryId);

    try {
      const destination = await resolveSubCategoryDestination(subCategoryId);
      navigateFromSubCategory(
        navigation,
        {
          categoryId,
          categoryName,
          subCategory,
        },
        destination,
      );
    } catch {
      navigateFromSubCategory(
        navigation,
        {
          categoryId,
          categoryName,
          subCategory,
        },
        'productListing',
      );
    } finally {
      setNavigatingSubCategoryId(null);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centeredState}>
        <ActivityIndicator size="large" color="#EA580C" />
        <Text style={styles.stateText}>Loading sub-categories...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centeredState}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={() => void retry()}>
          <Text style={styles.retryButtonText}>Try again</Text>
        </Pressable>
        <Pressable style={styles.backLink} onPress={() => navigation.goBack()}>
          <Text style={styles.backLinkText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {categoryName ? <Text style={styles.headerTitle}>{categoryName}</Text> : null}
      <CategoryGrid
        categories={subCategories}
        onCategoryPress={(subCategory) => void handleSubCategoryPress(subCategory)}
        emptyMessage="No sub-categories available for this category."
      />
      {navigatingSubCategoryId ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#EA580C" />
          <Text style={styles.stateText}>Opening sub-category...</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF7ED',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#FFF7ED',
    gap: 12,
  },
  stateText: {
    fontSize: 14,
    color: '#64748B',
  },
  errorText: {
    fontSize: 14,
    color: '#B91C1C',
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: '#EA580C',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  backLink: {
    marginTop: 4,
    paddingVertical: 8,
  },
  backLinkText: {
    color: '#1D4ED8',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 247, 237, 0.88)',
    gap: 12,
  },
});
