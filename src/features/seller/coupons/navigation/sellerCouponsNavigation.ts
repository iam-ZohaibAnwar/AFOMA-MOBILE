import type { NavigationProp, ParamListBase } from '@react-navigation/native';

import type { SellerStackParamList } from '../../../../app/navigation/sellerTypes';
import type { SellerCoupon } from '../types/sellerCoupon';

type SellerNavigation = NavigationProp<SellerStackParamList & ParamListBase>;

export function navigateToSellerCouponDetail(
  navigation: SellerNavigation,
  couponId: string,
  initialCoupon?: SellerCoupon,
): void {
  navigation.navigate('SellerCouponDetail', {
    couponId,
    initialCoupon,
  });
}

export function navigateToSellerCouponForm(
  navigation: SellerNavigation,
  params?: {
    couponId?: string;
    initialCoupon?: SellerCoupon;
  },
): void {
  navigation.navigate('SellerCouponForm', params ?? {});
}
