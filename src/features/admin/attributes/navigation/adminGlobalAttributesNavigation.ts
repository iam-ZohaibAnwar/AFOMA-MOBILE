import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../../../app/navigation/types';
import type { AdminStackParamList } from '../../navigation/adminTypes';

type RootNavigation = NativeStackNavigationProp<RootStackParamList>;
type AdminNavigation = NativeStackNavigationProp<AdminStackParamList>;

export function navigateToAdminGlobalAttributesFromRoot(navigation: RootNavigation): void {
  navigation.navigate('Admin', {
    screen: 'AdminGlobalAttributes',
  } as NavigatorScreenParams<AdminStackParamList>);
}

export function navigateToAdminGlobalAttributes(navigation: AdminNavigation): void {
  navigation.navigate('AdminGlobalAttributes');
}
