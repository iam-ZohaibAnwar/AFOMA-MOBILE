import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../../app/navigation/types';
import type { AdminStackParamList } from './adminTypes';

type RootNavigation = NativeStackNavigationProp<RootStackParamList>;

export function navigateToAdminScreen<S extends keyof AdminStackParamList>(
  navigation: RootNavigation,
  screen: S,
  params?: AdminStackParamList[S],
): void {
  navigation.navigate('Admin', {
    screen,
    params,
  } as NavigatorScreenParams<AdminStackParamList>);
}
