import { Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { colors } from '../../design-system';
import { StackHeaderBackButton } from './StackHeaderBackButton';
import type { SellerStackParamList } from './sellerTypes';
import { SellerAccountScreen } from '../../features/seller/screens/SellerAccountScreen';
import { SellerDashboardScreen } from '../../features/seller/screens/SellerDashboardScreen';
import { SellerProductsScreen } from '../../features/seller/screens/SellerProductsScreen';
import { SellerProductTypeScreen } from '../../features/seller/screens/SellerProductTypeScreen';
import { SellerStandardProductScreen } from '../../features/seller/screens/SellerStandardProductScreen';
import { SellerDownloadableProductScreen } from '../../features/seller/screens/SellerDownloadableProductScreen';
import { SellerCustomizableProductScreen } from '../../features/seller/screens/SellerCustomizableProductScreen';
import { SellerProductVariationsScreen } from '../../features/seller/screens/SellerProductVariationsScreen';
import { SellerOrdersScreen } from '../../features/seller/orders/screens/SellerOrdersScreen';
import { SellerOrderDetailScreen } from '../../features/seller/orders/screens/SellerOrderDetailScreen';
import { SellerShippingConfigScreen } from '../../features/seller/shipping/screens/SellerShippingConfigScreen';
import { SellerCouponsScreen } from '../../features/seller/coupons/screens/SellerCouponsScreen';
import { SellerCouponFormScreen } from '../../features/seller/coupons/screens/SellerCouponFormScreen';
import { SellerAttributesScreen } from '../../features/seller/attributes/screens/SellerAttributesScreen';
import { SellerEarningsScreen } from '../../features/seller/earnings/screens/SellerEarningsScreen';
import { SellerReviewsScreen } from '../../features/seller/reviews/screens/SellerReviewsScreen';
import { SellerReviewDetailScreen } from '../../features/seller/reviews/screens/SellerReviewDetailScreen';
import { SellerPersonalInformationScreen } from '../../features/seller/screens/SellerPersonalInformationScreen';
import { SellerShopProfileScreen } from '../../features/seller/screens/SellerShopProfileScreen';
import { SellerShopSettingsScreen } from '../../features/seller/settings/screens/SellerShopSettingsScreen';
import { SellerSetupScreen } from '../../features/seller/screens/SellerSetupScreen';
import { SellerSetupSectionScreen } from '../../features/seller/screens/SellerSetupSectionScreen';
import { getSectionTitle } from '../../features/seller/utils/sellerSetupForms';

const Stack = createNativeStackNavigator<SellerStackParamList>();

export function SellerNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="SellerDashboard"
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
      <Stack.Screen
        name="SellerAccount"
        component={SellerAccountScreen}
        options={{ title: 'Dashboard', headerShown: false }}
      />
      <Stack.Screen name="SellerDashboard" component={SellerDashboardScreen} options={{ title: 'Dashboard' }} />
      <Stack.Screen name="SellerProducts" component={SellerProductsScreen} options={{ title: 'Products' }} />
      <Stack.Screen
        name="SellerProductType"
        component={SellerProductTypeScreen}
        options={{ title: 'Add product' }}
      />
      <Stack.Screen
        name="SellerStandardProduct"
        component={SellerStandardProductScreen}
        options={{ title: 'Standard product' }}
      />
      <Stack.Screen
        name="SellerCustomizableProduct"
        component={SellerCustomizableProductScreen}
        options={{ title: 'Customizable product' }}
      />
      <Stack.Screen
        name="SellerDownloadableProduct"
        component={SellerDownloadableProductScreen}
        options={{ title: 'Downloadable product' }}
      />
      <Stack.Screen
        name="SellerProductVariations"
        component={SellerProductVariationsScreen}
        options={{ title: 'Product variations' }}
      />
      <Stack.Screen name="SellerOrders" component={SellerOrdersScreen} options={{ title: 'Orders' }} />
      <Stack.Screen
        name="SellerOrderDetail"
        component={SellerOrderDetailScreen}
        options={{ title: 'Order detail' }}
      />
      <Stack.Screen
        name="SellerShippingConfig"
        component={SellerShippingConfigScreen}
        options={{ title: 'Shipping' }}
      />
      <Stack.Screen name="SellerCoupons" component={SellerCouponsScreen} options={{ title: 'Coupons' }} />
      <Stack.Screen
        name="SellerCouponForm"
        component={SellerCouponFormScreen}
        options={({ route }) => ({
          title: route.params?.couponId ? 'Edit coupon' : 'Add coupon',
        })}
      />
      <Stack.Screen
        name="SellerAttributes"
        component={SellerAttributesScreen}
        options={{ title: 'Custom Attributes' }}
      />
      <Stack.Screen
        name="SellerEarnings"
        component={SellerEarningsScreen}
        options={{ title: 'Seller Earnings' }}
      />
      <Stack.Screen name="SellerReviews" component={SellerReviewsScreen} options={{ title: 'Reviews' }} />
      <Stack.Screen
        name="SellerReviewDetail"
        component={SellerReviewDetailScreen}
        options={{ title: 'Review detail' }}
      />
      <Stack.Screen
        name="SellerPersonalInformation"
        component={SellerPersonalInformationScreen}
        options={{ title: 'Personal information' }}
      />
      <Stack.Screen
        name="SellerShopProfile"
        component={SellerShopProfileScreen}
        options={{ title: 'Shop profile' }}
      />
      <Stack.Screen
        name="SellerShopSettings"
        component={SellerShopSettingsScreen}
        options={{ title: 'Shop settings' }}
      />
      <Stack.Screen name="SellerSetup" component={SellerSetupScreen} options={{ title: 'Seller Setup' }} />
      <Stack.Screen
        name="SellerSetupSection"
        component={SellerSetupSectionScreen}
        options={({ route }) => ({ title: getSectionTitle(route.params.section) })}
      />
    </Stack.Navigator>
  );
}
