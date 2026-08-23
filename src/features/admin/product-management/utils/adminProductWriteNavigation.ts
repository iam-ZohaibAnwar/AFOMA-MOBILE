import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { AdminStackParamList } from '../../navigation/adminTypes';
import type { AdminProductListItem } from '../types/adminProductManagement';
import { resolveAdminProductSellerId } from './adminProductWritePayload';

type AdminNavigation = NativeStackNavigationProp<AdminStackParamList>;

export function navigateToAdminProductEdit(
  navigation: AdminNavigation,
  product: AdminProductListItem,
): boolean {
  const productId = product._id;
  if (!productId) {
    return false;
  }

  return navigateToAdminProductEditById(navigation, productId, product.productType, product);
}

export function navigateToAdminProductEditById(
  navigation: AdminNavigation,
  productId: string,
  productType?: string,
  initialProduct?: AdminProductListItem,
): boolean {
  if (!productId) {
    return false;
  }

  const params = { productId, initialProduct };

  if (productType === 'Standard') {
    navigation.navigate('AdminStandardProduct', params);
    return true;
  }

  if (productType === 'Downloadable') {
    navigation.navigate('AdminDownloadableProduct', params);
    return true;
  }

  if (productType === 'Customizable') {
    navigation.navigate('AdminCustomizableProduct', params);
    return true;
  }

  return false;
}

export function navigateToAdminDuplicatedProductEdit(
  navigation: AdminNavigation,
  product: Pick<AdminProductListItem, '_id' | 'productType'>,
): boolean {
  if (!product._id) {
    return false;
  }

  return navigateToAdminProductEditById(navigation, product._id, product.productType);
}

export function navigateToAdminCustomizableVariations(
  navigation: AdminNavigation,
  productId: string,
  sellerId?: string,
  context?: Pick<AdminProductListItem, 'productName' | 'images'>,
): void {
  navigation.navigate('AdminProductVariations', {
    productId,
    sellerId: sellerId?.trim() || undefined,
    initialProductName: context?.productName?.trim() || undefined,
    initialImages: context?.images,
  });
}

export function navigateToAdminProductVariationsFromDetail(
  navigation: AdminNavigation,
  product: AdminProductListItem,
): boolean {
  const productId = product._id;
  if (!productId || product.productType !== 'Customizable') {
    return false;
  }

  navigateToAdminCustomizableVariations(
    navigation,
    productId,
    resolveAdminProductSellerId(product.seller),
    product,
  );
  return true;
}

export function canAdminEditProductType(productType?: string): boolean {
  return (
    productType === 'Standard' ||
    productType === 'Downloadable' ||
    productType === 'Customizable'
  );
}

export function canAdminEditProductVariations(productType?: string): boolean {
  return productType === 'Customizable';
}
