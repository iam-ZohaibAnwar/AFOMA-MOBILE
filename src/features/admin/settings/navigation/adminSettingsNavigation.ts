import type { NavigatorScreenParams } from '@react-navigation/native';

import type { NativeStackNavigationProp } from '@react-navigation/native-stack';



import type { RootStackParamList } from '../../../../app/navigation/types';

import type { AdminStackParamList } from '../../navigation/adminTypes';

import type { AdminCommissionRateSettingType } from '../types/adminSettings';



type RootNavigation = NativeStackNavigationProp<RootStackParamList>;

type AdminNavigation = NativeStackNavigationProp<AdminStackParamList>;



export function navigateToAdminSettingsHubFromRoot(navigation: RootNavigation): void {

  navigation.navigate('Admin', {

    screen: 'AdminSettingsHub',

  } as NavigatorScreenParams<AdminStackParamList>);

}



export function navigateToAdminSettingsHub(navigation: AdminNavigation): void {

  navigation.navigate('AdminSettingsHub');

}



export function navigateToAdminSettingsCommissionRate(

  navigation: AdminNavigation,

  rateType: AdminCommissionRateSettingType,

): void {

  navigation.navigate('AdminSettingsCommissionRate', { rateType });

}



export function navigateToAdminSettingsFeaturedShops(navigation: AdminNavigation): void {

  navigation.navigate('AdminSettingsFeaturedShops');

}



export function navigateToAdminSettingsShippingConfig(navigation: AdminNavigation): void {

  navigation.navigate('AdminSettingsShippingConfig');

}



export function navigateToAdminSettingsCsvExport(navigation: AdminNavigation): void {

  navigation.navigate('AdminSettingsCsvExport');

}



export function navigateToAdminSettingsSellerShippingList(navigation: AdminNavigation): void {

  navigation.navigate('AdminSettingsSellerShippingList');

}



export function navigateToAdminSettingsSellerShippingEdit(

  navigation: AdminNavigation,

  sellerId: string,

  initialSeller?: import('../../seller-management/types/adminSellerManagement').AdminSellerListItem,

): void {

  navigation.navigate('AdminSettingsSellerShippingEdit', { sellerId, initialSeller });

}


