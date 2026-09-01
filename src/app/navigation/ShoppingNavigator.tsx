import { Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { colors } from '../../design-system';
import { stackHeaderLeftContainerStyle } from './stackHeaderStyles';
import { StackHeaderBackButton } from './StackHeaderBackButton';
import { AccountDetailsScreen } from '../../features/account/screens/AccountDetailsScreen';
import { AddressBookScreen } from '../../features/account/screens/AddressBookScreen';
import { ReferralEarningsScreen } from '../../features/account/screens/ReferralEarningsScreen';
import { ReferralEarningDetailScreen } from '../../features/account/screens/ReferralEarningDetailScreen';
import { NotificationPreferencesScreen } from '../../features/account/screens/NotificationPreferencesScreen';
import { BellNotificationsScreen } from '../../features/notifications/screens/BellNotificationsScreen';
import { TermsConditionsScreen } from '../../features/legal/screens/TermsConditionsScreen';
import { ChatListScreen } from '../../features/chat/screens/ChatListScreen';
import { ChatThreadScreen } from '../../features/chat/screens/ChatThreadScreen';
import { CheckoutScreen } from '../../features/checkout/screens/CheckoutScreen';
import { PaymentScreen } from '../../features/checkout/screens/PaymentScreen';
import { ChildCategoriesScreen } from '../../features/categories/screens/ChildCategoriesScreen';
import { ChildCategoryScreen } from '../../features/categories/screens/ChildCategoryScreen';
import { SubCategoriesScreen } from '../../features/categories/screens/SubCategoriesScreen';
import { SubCategoryScreen } from '../../features/categories/screens/SubCategoryScreen';
import { OrderDetailScreen } from '../../features/orders/screens/OrderDetailScreen';
import { OrdersScreen } from '../../features/orders/screens/OrdersScreen';
import { ProductDetailScreen } from '../../features/products/screens/ProductDetailScreen';
import { ProductListingScreen } from '../../features/products/screens/ProductListingScreen';
import { SearchScreen } from '../../features/search/screens/SearchScreen';
import { SellerShopScreen } from '../../features/shop/screens/SellerShopScreen';
import { MainTabNavigator } from './MainTabNavigator';
import type { ShoppingStackParamList } from './types';

const Stack = createNativeStackNavigator<ShoppingStackParamList>();

/** Shopping stack — product browse, checkout, account screens. */
export function ShoppingNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="MainTabs"
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.textPrimary,
        headerShadowVisible: false,
        headerBackVisible: false,
        headerLeftContainerStyle: stackHeaderLeftContainerStyle,
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
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SubCategory"
        component={SubCategoryScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ChildCategory"
        component={ChildCategoryScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ChildCategories"
        component={ChildCategoriesScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="ProductListing" component={ProductListingScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SellerShop" component={SellerShopScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Search" component={SearchScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Checkout' }} />
      <Stack.Screen name="Payment" component={PaymentScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Orders" component={OrdersScreen} options={{ title: 'My Orders' }} />
      <Stack.Screen name="ChatList" component={ChatListScreen} options={{ title: 'Messages' }} />
      <Stack.Screen name="ChatThread" component={ChatThreadScreen} options={{ title: 'Chat' }} />
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
        options={{ title: 'Referral Earning' }}
      />
      <Stack.Screen
        name="ReferralEarningDetail"
        component={ReferralEarningDetailScreen}
        options={{ title: 'Referral Detail' }}
      />
      <Stack.Screen
        name="TermsConditions"
        component={TermsConditionsScreen}
        options={{ title: 'Terms & Conditions' }}
      />
      <Stack.Screen
        name="NotificationPreferences"
        component={NotificationPreferencesScreen}
        options={{ title: 'Notifications' }}
      />
      <Stack.Screen
        name="BellNotifications"
        component={BellNotificationsScreen}
        options={{ title: 'Notifications' }}
      />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: 'Order Details' }} />
    </Stack.Navigator>
  );
}
