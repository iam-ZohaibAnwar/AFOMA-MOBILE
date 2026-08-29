import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { getProductRouteId } from '../../../products/utils/productDisplay';
import type { AdminStackParamList } from '../../navigation/adminTypes';
import type { AdminProductListItem } from '../types/adminProductManagement';

type AdminNavigation = NativeStackNavigationProp<AdminStackParamList>;

export function canAdminPreviewProductInApp(product: AdminProductListItem): boolean {
  return Boolean(getProductRouteId(product) || product.slug?.trim());
}

/** Opens the shopper product detail screen — mobile in-app preview, not web. */
export function navigateToAdminProductMobilePreview(
  navigation: AdminNavigation,
  product: AdminProductListItem,
): boolean {
  const productId = getProductRouteId(product);
  const slug = product.slug?.trim();

  if (!productId && !slug) {
    return false;
  }

  navigation.getParent()?.navigate('Shopping', {
    screen: 'ProductDetail',
    params: {
      ...(productId ? { productId } : {}),
      ...(slug ? { slug } : {}),
    },
  });

  return true;
}
