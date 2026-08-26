import { Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { colors } from '../../design-system';
import { StackHeaderBackButton } from './StackHeaderBackButton';
import { AccountDetailsScreen } from '../../features/account/screens/AccountDetailsScreen';
import { AddressBookScreen } from '../../features/account/screens/AddressBookScreen';
import { ReferralEarningsScreen } from '../../features/account/screens/ReferralEarningsScreen';
import { TermsConditionsScreen } from '../../features/legal/screens/TermsConditionsScreen';
import { CheckoutScreen } from '../../features/checkout/screens/CheckoutScreen';
import { PaymentScreen } from '../../features/checkout/screens/PaymentScreen';
import { ChildCategoriesScreen } from '../../features/categories/screens/ChildCategoriesScreen';
import { SubCategoriesScreen } from '../../features/categories/screens/SubCategoriesScreen';
import { OrderDetailScreen } from '../../features/orders/screens/OrderDetailScreen';
import { OrdersScreen } from '../../features/orders/screens/OrdersScreen';
import { ProductDetailScreen } from '../../features/products/screens/ProductDetailScreen';
import { ProductListingScreen } from '../../features/products/screens/ProductListingScreen';
import { SearchScreen } from '../../features/search/screens/SearchScreen';
import { ShopScreen } from '../../features/shop/screens/ShopScreen';
import { MainTabNavigator } from './MainTabNavigator';
import type { ShoppingStackParamList } from './types';

const Stack = createNativeStackNavigator<ShoppingStackParamList>();

export function ShoppingNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="MainTabs"
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.textPrimary,
        headerShadowVisible: false,
        headerBackVisible: false,
        headerLeft: (props) => (
          <StackHeaderBackButton canGoBack={props.canGoBack} tintColor={props.tintColor} />
        ),
        contentStyle: { backgroundColor: colors.background },
        animation: Platform.OS === 'android' ? 'fade_from_bottom' : 'default',
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabNavigator} options={{ headerShown: false }} />
      <Stack.Screen
        name="SubCategories"
        component={SubCategoriesScreen}
        options={({ route }) => ({
          title: route.params.categoryName ?? 'Browse',
        })}
      />
      <Stack.Screen
        name="ChildCategories"
        component={ChildCategoriesScreen}
        options={{ title: 'Child Categories' }}
      />
      <Stack.Screen name="ProductListing" component={ProductListingScreen} options={{ title: 'Products' }} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Shop" component={ShopScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Search" component={SearchScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Checkout' }} />
      <Stack.Screen name="Payment" component={PaymentScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Orders" component={OrdersScreen} options={{ title: 'My Orders' }} />
      <Stack.Screen
        name="AccountDetails"
        component={AccountDetailsScreen}
        options={{ title: 'Account Details' }}
      />
      <Stack.Screen
        name="AddressBook"
        component={AddressBookScreen}
        options={{ title: 'Delivery Addresses' }}
      />
      <Stack.Screen
        name="ReferralEarnings"
        component={ReferralEarningsScreen}
        options={{ title: 'My Earnings' }}
      />
      <Stack.Screen
        name="TermsConditions"
        component={TermsConditionsScreen}
        options={{ title: 'Terms & Conditions' }}
      />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: 'Order Detail' }} />
    </Stack.Navigator>
  );
}
