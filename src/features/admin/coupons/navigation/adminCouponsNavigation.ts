import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../../../app/navigation/types';
import type { AdminStackParamList } from '../../navigation/adminTypes';
import type { AdminCouponListItem } from '../types/adminCoupons';

type RootNavigation = NativeStackNavigationProp<RootStackParamList>;
type AdminNavigation = NativeStackNavigationProp<AdminStackParamList>;

export function navigateToAdminCouponsFromRoot(navigation: RootNavigation): void {
  navigation.navigate('Admin', {
    screen: 'AdminCoupons',
  } as NavigatorScreenParams<AdminStackParamList>);
}

export function navigateToAdminCoupons(navigation: AdminNavigation): void {
  navigation.navigate('AdminCoupons');
}

export function navigateToAdminCouponDetail(
  navigation: AdminNavigation,
  couponId: string,
  initialCoupon?: AdminCouponListItem,
): void {
  navigation.navigate('AdminCouponDetail', {
    couponId,
    initialCoupon,
  });
}

export function navigateToAdminCouponForm(
  navigation: AdminNavigation,
  params?: {
    couponId?: string;
    initialCoupon?: AdminCouponListItem;
  },
): void {
  navigation.navigate('AdminCouponForm', params ?? {});
}
