import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { CategoryGrid } from '../components/CategoryGrid';
import { useCategories } from '../hooks/useCategories';
import { getCategoryDisplayName, getCategoryRouteId } from '../utils/categoryNavigation';
import type { ShoppingStackParamList } from '../../../app/navigation/types';
import type { Category } from '../../../services/types/category';

type Props = NativeStackScreenProps<ShoppingStackParamList, 'Categories'>;

export function CategoriesScreen({ navigation }: Props) {
  const { categories, isLoading, error, retry } = useCategories();

  const handleCategoryPress = (category: Category) => {
    const categoryId = getCategoryRouteId(category);
    if (!categoryId) {
      return;
    }

    navigation.navigate('SubCategories', {
      categoryId,
      categoryName: getCategoryDisplayName(category),
    });
  };

  if (isLoading) {
    return (
      <View style={styles.centeredState}>
        <ActivityIndicator size="large" color="#EA580C" />
        <Text style={styles.stateText}>Loading categories...</Text>
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
        <Pressable style={styles.backLink} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.backLinkText}>Back to Home</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CategoryGrid categories={categories} onCategoryPress={handleCategoryPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF7ED',
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
});
