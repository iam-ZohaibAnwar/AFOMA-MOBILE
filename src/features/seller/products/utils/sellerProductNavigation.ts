import type { Product } from '../../../../services/types/product';
import type { SellerStackParamList } from '../../../../app/navigation/sellerTypes';

type SellerNavigation = {
  navigate: <RouteName extends keyof SellerStackParamList>(
    ...args: undefined extends SellerStackParamList[RouteName]
      ? [screen: RouteName] | [screen: RouteName, params: SellerStackParamList[RouteName]]
      : [screen: RouteName, params: SellerStackParamList[RouteName]]
  ) => void;
};

export function navigateToEditProduct(navigation: SellerNavigation, product: Product) {
  const productId = product._id;
  if (!productId) {
    return;
  }

  switch (product.productType) {
    case 'Customizable':
      navigation.navigate('SellerCustomizableProduct', { productId });
      break;
    case 'Downloadable':
      navigation.navigate('SellerDownloadableProduct', { productId });
      break;
    case 'Standard':
    default:
      navigation.navigate('SellerStandardProduct', { productId });
      break;
  }
}

export function navigateToCustomizableVariations(
  navigation: SellerNavigation,
  productId: string,
) {
  navigation.navigate('SellerProductVariations', { productId });
}
