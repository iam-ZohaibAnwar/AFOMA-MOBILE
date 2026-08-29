import type { NavigationProp, ParamListBase } from '@react-navigation/native';

import type { SellerStackParamList } from '../../../../app/navigation/sellerTypes';
import type { SellerProductType } from '../types/sellerProductType';

type SellerNavigation = NavigationProp<SellerStackParamList & ParamListBase>;

const PRODUCT_TYPE_ROUTES: Record<
  SellerProductType,
  keyof Pick<
    SellerStackParamList,
    'SellerStandardProduct' | 'SellerCustomizableProduct' | 'SellerDownloadableProduct'
  >
> = {
  Standard: 'SellerStandardProduct',
  Customizable: 'SellerCustomizableProduct',
  Downloadable: 'SellerDownloadableProduct',
};

export function navigateToSellerProductTypePicker(navigation: SellerNavigation): void {
  navigation.navigate('SellerProductType');
}

export function navigateToSellerProductSubtypePicker(navigation: SellerNavigation): void {
  navigation.navigate('SellerProductSubtype');
}

/** Seller goes directly to the wizard (no AI listing step). */
export function navigateToSellerProductWizard(
  navigation: SellerNavigation,
  productType: SellerProductType,
): void {
  navigation.navigate(PRODUCT_TYPE_ROUTES[productType]);
}
