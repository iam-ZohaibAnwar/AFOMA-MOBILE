import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';



import { AccountScreen } from '../../features/account/screens/AccountScreen';

import { CartScreen } from '../../features/cart/screens/CartScreen';

import { useCart } from '../../features/cart/hooks/useCart';
import { getCartItemCount } from '../../features/cart/utils/cartUtils';

import { MarketplaceHubScreen } from '../../features/home/screens/MarketplaceHubScreen';

import { useAuth } from '../../features/auth/hooks/useAuth';
import { resolveAuthUserId } from '../../features/auth/utils/resolveAuthUserId';

import { MarketplaceTabBarWithCartBadge } from './MarketplaceTabBar';

import type { MainTabParamList } from './types';



const Tab = createBottomTabNavigator<MainTabParamList>();



export function MainTabNavigator() {

  const { user } = useAuth();

  const authUserId = resolveAuthUserId(user);

  const { cart } = useCart(authUserId);

  const cartCount = getCartItemCount(cart);



  return (

    <Tab.Navigator

      initialRouteName="MarketplaceTab"

      tabBar={(props) => <MarketplaceTabBarWithCartBadge {...props} cartCount={cartCount} />}

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

      <Tab.Screen name="CartTab" component={CartScreen} options={{ title: 'Cart', lazy: false }} />

      <Tab.Screen
        name="AccountTab"
        component={AccountScreen}
        options={{ title: 'Account', lazy: false }}
      />

    </Tab.Navigator>

  );

}


