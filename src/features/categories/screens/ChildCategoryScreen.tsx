import { useLayoutEffect } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { ShoppingStackParamList } from '../../../app/navigation/types';
import { CategoryProductsPage } from '../components/CategoryProductsPage';

type Props = NativeStackScreenProps<ShoppingStackParamList, 'ChildCategory'>;

export function ChildCategoryScreen({ route, navigation }: Props) {
  const {
    categoryId,
    subCategoryId,
    childCategoryId,
    childCategoryName,
  } = route.params;

  useLayoutEffect(() => {
    navigation.setOptions({
      title: childCategoryName ?? 'Category',
    });
  }, [childCategoryName, navigation]);

  return (
    <CategoryProductsPage
      navigation={navigation}
      filters={{ categoryId, subCategoryId, childCategoryId }}
      emptyMessage="No products found in this category yet."
    />
  );
}
