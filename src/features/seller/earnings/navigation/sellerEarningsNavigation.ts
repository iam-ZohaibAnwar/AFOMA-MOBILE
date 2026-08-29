import type { NavigationProp, ParamListBase } from '@react-navigation/native';

import type { SellerStackParamList } from '../../../../app/navigation/sellerTypes';
import type { SellerCommissionRecord } from '../types/sellerEarning';

type SellerNavigation = NavigationProp<SellerStackParamList & ParamListBase>;

export function navigateToSellerEarningDetail(
  navigation: SellerNavigation,
  commissionId: string,
  initialRecord?: SellerCommissionRecord,
): void {
  navigation.navigate('SellerEarningDetail', {
    commissionId,
    initialRecord,
  });
}
