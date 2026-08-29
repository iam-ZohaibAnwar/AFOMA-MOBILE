import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../../../app/navigation/types';
import type { AdminStackParamList } from '../../navigation/adminTypes';
import type { AdminCommissionDetailParams, AdminCommissionManagementParams } from '../types/adminCommission';

type RootNavigation = NativeStackNavigationProp<RootStackParamList>;
type AdminNavigation = NativeStackNavigationProp<AdminStackParamList>;

export function navigateToAdminCommissionFromRoot(
  navigation: RootNavigation,
  params?: AdminCommissionManagementParams,
): void {
  navigation.navigate('Admin', {
    screen: 'AdminCommission',
    params,
  } as NavigatorScreenParams<AdminStackParamList>);
}

export function navigateToAdminCommission(
  navigation: AdminNavigation,
  params?: AdminCommissionManagementParams,
): void {
  navigation.navigate('AdminCommission', params);
}

export function navigateToAdminCommissionDetail(
  navigation: AdminNavigation,
  params: AdminCommissionDetailParams,
): void {
  navigation.navigate('AdminCommissionDetail', params);
}
