import type { NavigationProp, ParamListBase } from '@react-navigation/native';

import type { ShoppingStackParamList } from '../../../../app/navigation/types';
import type { ReferralCommissionRecord } from '../types/referralEarning';

type ReferralEarningsNavigation = NavigationProp<ShoppingStackParamList & ParamListBase>;

export function navigateToReferralEarningDetail(
  navigation: ReferralEarningsNavigation,
  commissionId: string,
  initialRecord?: ReferralCommissionRecord,
): void {
  navigation.navigate('ReferralEarningDetail', {
    commissionId,
    initialRecord,
  });
}
