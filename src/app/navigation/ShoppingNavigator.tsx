import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { CheckoutScreen } from '../../features/checkout/screens/CheckoutScreen';
import { CartScreen } from '../../features/cart/screens/CartScreen';
import { CategoriesScreen } from '../../features/categories/screens/CategoriesScreen';
import { ChildCategoriesScreen } from '../../features/categories/screens/ChildCategoriesScreen';
import { SubCategoriesScreen } from '../../features/categories/screens/SubCategoriesScreen';
import { HomeScreen } from '../../features/home/screens/HomeScreen';
import { OrderDetailScreen } from '../../features/orders/screens/OrderDetailScreen';
import { OrdersScreen } from '../../features/orders/screens/OrdersScreen';
import { ProductDetailScreen } from '../../features/products/screens/ProductDetailScreen';
import { ProductListingScreen } from '../../features/products/screens/ProductListingScreen';
import { SearchScreen } from '../../features/search/screens/SearchScreen';
import type { ShoppingStackParamList } from './types';

const Stack = createNativeStackNavigator<ShoppingStackParamList>();

export function ShoppingNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: { backgroundColor: '#FFF7ED' },
        headerTintColor: '#172554',
        contentStyle: { backgroundColor: '#FFF7ED' },
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Categories" component={CategoriesScreen} options={{ title: 'Categories' }} />
      <Stack.Screen name="SubCategories" component={SubCategoriesScreen} options={{ title: 'Sub Categories' }} />
      <Stack.Screen
        name="ChildCategories"
        component={ChildCategoriesScreen}
        options={{ title: 'Child Categories' }}
      />
      <Stack.Screen name="ProductListing" component={ProductListingScreen} options={{ title: 'Products' }} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: 'Product Detail' }} />
      <Stack.Screen name="Search" component={SearchScreen} options={{ title: 'Search' }} />
      <Stack.Screen name="Cart" component={CartScreen} options={{ title: 'Cart' }} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Checkout' }} />
      <Stack.Screen name="Orders" component={OrdersScreen} options={{ title: 'My Orders' }} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: 'Order Detail' }} />
    </Stack.Navigator>
  );
}
