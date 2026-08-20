import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { CategoryGrid } from '../components/CategoryGrid';
import { useChildCategories } from '../hooks/useChildCategories';
import { getCategoryDisplayName, getCategoryRouteId } from '../utils/categoryNavigation';
import type { ShoppingStackParamList } from '../../../app/navigation/types';
import type { Category } from '../../../services/types/category';

type Props = NativeStackScreenProps<ShoppingStackParamList, 'ChildCategories'>;

export function ChildCategoriesScreen({ route, navigation }: Props) {
  const { categoryId, subCategoryId, categoryName, subCategoryName } = route.params;
  const { childCategories, isLoading, error, retry } = useChildCategories(subCategoryId);

  const handleChildCategoryPress = (childCategory: Category) => {
    const childCategoryId = getCategoryRouteId(childCategory);
    if (!childCategoryId) {
      return;
    }

    const childCategoryName = getCategoryDisplayName(childCategory);

    navigation.navigate('ProductListing', {
      categoryId,
      subCategoryId,
      childCategoryId,
      categoryName,
      subCategoryName,
      childCategoryName,
      title: childCategoryName,
    });
  };

  if (isLoading) {
    return (
      <View style={styles.centeredState}>
        <ActivityIndicator size="large" color="#EA580C" />
        <Text style={styles.stateText}>Loading child categories...</Text>
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
      {subCategoryName ? <Text style={styles.headerTitle}>{subCategoryName}</Text> : null}
      {categoryName ? <Text style={styles.headerSubtitle}>{categoryName}</Text> : null}
      <CategoryGrid
        categories={childCategories}
        onCategoryPress={handleChildCategoryPress}
        emptyMessage="No child categories available for this sub-category."
      />
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
    color: '#172554',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
    paddingHorizontal: 16,
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
});
