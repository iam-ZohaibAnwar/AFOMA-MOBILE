import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { AccountScreen } from '../../features/account/screens/AccountScreen';
import { CartScreen } from '../../features/cart/screens/CartScreen';
import { MarketplaceHubScreen } from '../../features/home/screens/MarketplaceHubScreen';
import { ShopScreen } from '../../features/shop/screens/ShopScreen';
import type { MainTabParamList } from './types';



const Tab = createBottomTabNavigator<MainTabParamList>();



export function MainTabNavigator() {
  return (
    <Tab.Navigator

      initialRouteName="MarketplaceTab"

      tabBar={() => null}

      screenOptions={{

        headerShown: false,

        lazy: true,

        tabBarHideOnKeyboard: true,

      }}

    >

      <Tab.Screen

        name="MarketplaceTab"

        component={MarketplaceHubScreen}

        initialParams={{ segment: 'home' }}

        options={{ title: 'Home' }}

      />

      <Tab.Screen
        name="ShopTab"
        component={ShopScreen}
        options={{ title: 'Shop' }}
      />

      <Tab.Screen name="CartTab" component={CartScreen} options={{ title: 'Cart' }} />

      <Tab.Screen
        name="AccountTab"
        component={AccountScreen}
        options={{ title: 'Account', lazy: false }}
      />

    </Tab.Navigator>

  );

}


