import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../../../app/navigation/types';
import type { AdminStackParamList } from '../../navigation/adminTypes';
import type { AdminUserFormMode, AdminUserListItem } from '../types/adminUserManagement';

type RootNavigation = NativeStackNavigationProp<RootStackParamList>;
type AdminNavigation = NativeStackNavigationProp<AdminStackParamList>;

export function navigateToAdminUserManagement(navigation: RootNavigation): void {
  navigation.navigate('Admin', {
    screen: 'AdminUserManagement',
  } as NavigatorScreenParams<AdminStackParamList>);
}

export function navigateToAdminUserDetail(
  navigation: AdminNavigation,
  userId: string,
  initialUser?: AdminUserListItem,
): void {
  navigation.navigate('AdminUserDetail', { userId, initialUser });
}

export function navigateToAdminUserForm(
  navigation: AdminNavigation,
  params: { userId?: string; mode: AdminUserFormMode; initialUser?: AdminUserListItem },
): void {
  navigation.navigate('AdminUserForm', params);
}

export function navigateToAdminUserCreate(navigation: AdminNavigation): void {
  navigateToAdminUserForm(navigation, { mode: 'create' });
}

export function navigateToAdminUserEdit(
  navigation: AdminNavigation,
  userId: string,
  initialUser?: AdminUserListItem,
): void {
  navigateToAdminUserForm(navigation, { userId, mode: 'edit', initialUser });
}
