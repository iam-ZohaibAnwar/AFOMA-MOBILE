import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from './types';
import type { SellerStackParamList } from './sellerTypes';

type RootNavigation = NativeStackNavigationProp<RootStackParamList>;

export function navigateToSellerScreen<S extends keyof SellerStackParamList>(
  navigation: RootNavigation,
  screen: S,
  params?: SellerStackParamList[S],
): void {
  navigation.navigate('Seller', {
    screen,
    params,
  } as NavigatorScreenParams<SellerStackParamList>);
}
