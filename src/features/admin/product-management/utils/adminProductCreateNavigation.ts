import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { AdminStackParamList } from '../../navigation/adminTypes';
import type { AdminProductAiListingType } from '../types/adminProductAiPrefill';
import { navigateToAdminProductAiListing } from './adminProductAiListingNavigation';

type AdminNavigation = NativeStackNavigationProp<AdminStackParamList>;

export function navigateToAdminProductTypePicker(
  navigation: AdminNavigation,
  sellerId?: string,
): void {
  navigation.navigate('AdminProductType', {
    sellerId: sellerId?.trim() || undefined,
  });
}

export function navigateToAdminProductSubtypePicker(
  navigation: AdminNavigation,
  sellerId?: string,
): void {
  navigation.navigate('AdminProductSubtype', {
    category: 'physical',
    sellerId: sellerId?.trim() || undefined,
  });
}

/** After product type is chosen, offer AI photo prefill once (web parity) with manual skip. */
export function navigateToAdminProductWizard(
  navigation: AdminNavigation,
  productType: AdminProductAiListingType,
  sellerId?: string,
): void {
  navigateToAdminProductAiListing(navigation, productType, sellerId);
}
