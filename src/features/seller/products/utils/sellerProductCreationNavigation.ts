import { Alert } from 'react-native';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';

import type { SellerStackParamList } from '../../../../app/navigation/sellerTypes';
import type { SellerProfile } from '../../types/sellerProfile';
import {
  canSellerCreateProducts,
  SELLER_PRODUCT_CREATION_BLOCKED_MESSAGE,
} from '../../utils/sellerProductGate';
import { getContinueSetupSection } from '../../utils/sellerSetupSections';
type SellerNavigation = NavigationProp<SellerStackParamList & ParamListBase>;

export function navigateToIncompleteSellerSetup(
  navigation: SellerNavigation,
  profile?: SellerProfile | null,
) {
  const nextSection = getContinueSetupSection(profile);
  if (nextSection) {
    navigation.navigate('SellerSetupSection', { section: nextSection });
    return;
  }

  navigation.navigate('SellerSetup');
}

export function promptIncompleteSellerSetup(
  navigation: SellerNavigation,
  profile?: SellerProfile | null,
) {
  Alert.alert('Complete seller setup', SELLER_PRODUCT_CREATION_BLOCKED_MESSAGE, [
    { text: 'Cancel', style: 'cancel' },
    {
      text: 'Continue setup',
      onPress: () => navigateToIncompleteSellerSetup(navigation, profile),
    },
  ]);
}

/** Gate product creation and open type selection when setup is complete. */
export function openSellerProductTypeSelection(
  navigation: SellerNavigation,
  profile?: SellerProfile | null,
) {
  if (!canSellerCreateProducts(profile?.profileSetup)) {
    promptIncompleteSellerSetup(navigation, profile);
    return;
  }

  navigation.navigate('SellerProductType');
}
