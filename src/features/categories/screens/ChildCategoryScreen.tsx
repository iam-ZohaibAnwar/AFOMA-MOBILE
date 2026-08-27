import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { ShoppingStackParamList } from '../../../app/navigation/types';
import { CategoryBrowseScreenLayout } from '../components/CategoryBrowseScreenLayout';
import { CategoryProductsPage } from '../components/CategoryProductsPage';

type Props = NativeStackScreenProps<ShoppingStackParamList, 'ChildCategory'>;

export function ChildCategoryScreen({ route, navigation }: Props) {
  const {
    categoryId,
    subCategoryId,
    childCategoryId,
  } = route.params;

  return (
    <CategoryBrowseScreenLayout navigation={navigation}>
      <CategoryProductsPage
        navigation={navigation}
        filters={{ categoryId, subCategoryId, childCategoryId }}
        emptyMessage="No products found in this category yet."
      />
    </CategoryBrowseScreenLayout>
  );
}
