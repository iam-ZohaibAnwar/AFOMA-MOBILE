import { Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { colors } from '../../../design-system';
import { stackHeaderTitleStyle } from '../../../app/navigation/stackHeaderStyles';
import { StackHeaderBackButton } from '../../../app/navigation/StackHeaderBackButton';
import { AdminDashboardScreen } from '../dashboard/screens/AdminDashboardScreen';
import { AdminOrderDetailScreen } from '../order-management/screens/AdminOrderDetailScreen';
import { AdminOrderManagementScreen } from '../order-management/screens/AdminOrderManagementScreen';
import { AdminProductAiListingScreen } from '../product-management/screens/AdminProductAiListingScreen';
import { AdminCustomizableProductScreen } from '../product-management/screens/AdminCustomizableProductScreen';
import { AdminDownloadableProductScreen } from '../product-management/screens/AdminDownloadableProductScreen';
import { AdminProductDetailScreen } from '../product-management/screens/AdminProductDetailScreen';
import { AdminProductManagementScreen } from '../product-management/screens/AdminProductManagementScreen';
import { AdminCreateListingScreen } from '../product-management/screens/AdminCreateListingScreen';
import { AdminProductSubtypeScreen } from '../product-management/screens/AdminProductSubtypeScreen';
import { AdminProductTypeScreen } from '../product-management/screens/AdminProductTypeScreen';
import { AdminProductVariationsScreen } from '../product-management/screens/AdminProductVariationsScreen';
import { AdminStandardProductScreen } from '../product-management/screens/AdminStandardProductScreen';
import { AdminCreateSellerScreen } from '../seller-management/screens/AdminCreateSellerScreen';
import { AdminSellerSectionEditScreen } from '../seller-management/screens/AdminSellerSectionEditScreen';
import { AdminSellerSectionScreen } from '../seller-management/screens/AdminSellerSectionScreen';
import { getAdminSellerSectionTitle } from '../seller-management/utils/adminSellerSectionForms';
import { AdminSellerBasicInformationEditScreen } from '../seller-management/screens/AdminSellerBasicInformationEditScreen';
import { AdminSellerBasicInformationScreen } from '../seller-management/screens/AdminSellerBasicInformationScreen';
import { AdminSellerDetailScreen } from '../seller-management/screens/AdminSellerDetailScreen';
import { AdminSellerManagementScreen } from '../seller-management/screens/AdminSellerManagementScreen';
import { AdminUserDetailScreen } from '../user-management/screens/AdminUserDetailScreen';
import { AdminUserFormScreen } from '../user-management/screens/AdminUserFormScreen';
import { AdminUserManagementScreen } from '../user-management/screens/AdminUserManagementScreen';
import { AdminCommissionScreen } from '../commission/screens/AdminCommissionScreen';
import { AdminCommissionDetailScreen } from '../commission/screens/AdminCommissionDetailScreen';
import { AdminSettingsCommissionRateScreen } from '../settings/screens/AdminSettingsCommissionRateScreen';
import { AdminSettingsCommissionRatesScreen } from '../settings/screens/AdminSettingsCommissionRatesScreen';
import { AdminSettingsFeaturedShopsScreen } from '../settings/screens/AdminSettingsFeaturedShopsScreen';
import { AdminSettingsHubScreen } from '../settings/screens/AdminSettingsHubScreen';
import { AdminSettingsShippingConfigScreen } from '../settings/screens/AdminSettingsShippingConfigScreen';
import { AdminSettingsCsvExportScreen } from '../settings/screens/AdminSettingsCsvExportScreen';
import { AdminSettingsSellerShippingEditScreen } from '../settings/screens/AdminSettingsSellerShippingEditScreen';
import { AdminSettingsSellerShippingListScreen } from '../settings/screens/AdminSettingsSellerShippingListScreen';
import { AdminGlobalAttributesScreen } from '../attributes/screens/AdminGlobalAttributesScreen';
import { AdminReviewDetailScreen } from '../reviews/screens/AdminReviewDetailScreen';
import { AdminReviewsScreen } from '../reviews/screens/AdminReviewsScreen';
import { AdminCouponDetailScreen } from '../coupons/screens/AdminCouponDetailScreen';
import { AdminCouponFormScreen } from '../coupons/screens/AdminCouponFormScreen';
import { AdminCouponsScreen } from '../coupons/screens/AdminCouponsScreen';
import type { AdminStackParamList } from './adminTypes';

const Stack = createNativeStackNavigator<AdminStackParamList>();

export function AdminNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="AdminDashboard"
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: stackHeaderTitleStyle,
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
        name="AdminDashboard"
        component={AdminDashboardScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AdminProductManagement"
        component={AdminProductManagementScreen}
        options={{ title: 'Product Management' }}
      />
      <Stack.Screen
        name="AdminProductDetail"
        component={AdminProductDetailScreen}
        options={{ title: 'Product Detail' }}
      />
      <Stack.Screen
        name="AdminCreateListing"
        component={AdminCreateListingScreen}
        options={{ title: 'Create Listing' }}
      />
      <Stack.Screen
        name="AdminProductType"
        component={AdminProductTypeScreen}
        options={{ title: 'Add Listing' }}
      />
      <Stack.Screen
        name="AdminProductSubtype"
        component={AdminProductSubtypeScreen}
        options={{ title: 'Product Format' }}
      />
      <Stack.Screen
        name="AdminStandardProduct"
        component={AdminStandardProductScreen}
        options={({ route }) => ({
          title: route.params?.productId ? 'Edit Standard Product' : 'Create Standard Product',
        })}
      />
      <Stack.Screen
        name="AdminDownloadableProduct"
        component={AdminDownloadableProductScreen}
        options={({ route }) => ({
          title: route.params?.productId ? 'Edit Downloadable Product' : 'Create Downloadable Product',
        })}
      />
      <Stack.Screen
        name="AdminCustomizableProduct"
        component={AdminCustomizableProductScreen}
        options={({ route }) => ({
          title: route.params?.productId ? 'Edit Customizable Product' : 'Create Customizable Product',
        })}
      />
      <Stack.Screen
        name="AdminProductVariations"
        component={AdminProductVariationsScreen}
        options={{ title: 'Product Variations' }}
      />
      <Stack.Screen
        name="AdminProductAiListing"
        component={AdminProductAiListingScreen}
        options={{ title: 'Add Photos' }}
      />
      <Stack.Screen
        name="AdminOrderManagement"
        component={AdminOrderManagementScreen}
        options={{
          title: 'Order Management',
          headerBackTitle: 'Order Management',
        }}
      />
      <Stack.Screen
        name="AdminOrderDetail"
        component={AdminOrderDetailScreen}
        options={{
          title: '',
          headerLeft: (props) => (
            <StackHeaderBackButton
              canGoBack={props.canGoBack}
              tintColor={props.tintColor}
              title="Order Details"
            />
          ),
        }}
      />
      <Stack.Screen
        name="AdminSellerManagement"
        component={AdminSellerManagementScreen}
        options={{ title: 'Seller Management' }}
      />
      <Stack.Screen
        name="AdminSellerDetail"
        component={AdminSellerDetailScreen}
        options={{ title: 'Seller Detail' }}
      />
      <Stack.Screen
        name="AdminSellerBasicInformation"
        component={AdminSellerBasicInformationScreen}
        options={{ title: 'Basic Information' }}
      />
      <Stack.Screen
        name="AdminSellerBasicInformationEdit"
        component={AdminSellerBasicInformationEditScreen}
        options={{ title: 'Edit Basic Information' }}
      />
      <Stack.Screen
        name="AdminCreateSeller"
        component={AdminCreateSellerScreen}
        options={{ title: 'Create Seller' }}
      />
      <Stack.Screen
        name="AdminSellerSection"
        component={AdminSellerSectionScreen}
        options={({ route }) => ({ title: getAdminSellerSectionTitle(route.params.sectionId) })}
      />
      <Stack.Screen
        name="AdminSellerSectionEdit"
        component={AdminSellerSectionEditScreen}
        options={({ route }) => ({
          title: `Edit ${getAdminSellerSectionTitle(route.params.sectionId)}`,
        })}
      />
      <Stack.Screen
        name="AdminUserManagement"
        component={AdminUserManagementScreen}
        options={{ title: 'User Management' }}
      />
      <Stack.Screen
        name="AdminUserDetail"
        component={AdminUserDetailScreen}
        options={{ title: 'User Detail' }}
      />
      <Stack.Screen
        name="AdminUserForm"
        component={AdminUserFormScreen}
        options={({ route }) => ({
          title: route.params.mode === 'create' ? 'Create User' : 'Edit User',
        })}
      />
      <Stack.Screen
        name="AdminCommission"
        component={AdminCommissionScreen}
        options={{ title: 'Commission' }}
      />
      <Stack.Screen
        name="AdminCommissionDetail"
        component={AdminCommissionDetailScreen}
        options={{ title: 'Commission Detail' }}
      />
      <Stack.Screen
        name="AdminSettingsHub"
        component={AdminSettingsHubScreen}
        options={{ title: 'Settings' }}
      />
      <Stack.Screen
        name="AdminSettingsCommissionRates"
        component={AdminSettingsCommissionRatesScreen}
        options={{ title: 'Commission Rates' }}
      />
      <Stack.Screen
        name="AdminSettingsCommissionRate"
        component={AdminSettingsCommissionRateScreen}
        options={({ route }) => ({
          title:
            route.params.rateType === 'affiliate-commission'
              ? 'Affiliate Commission'
              : route.params.rateType === 'seller-referral-commission'
                ? 'Seller Referral Commission'
                : 'Buyer Referral Commission',
        })}
      />
      <Stack.Screen
        name="AdminSettingsFeaturedShops"
        component={AdminSettingsFeaturedShopsScreen}
        options={{ title: 'Featured Shops' }}
      />
      <Stack.Screen
        name="AdminSettingsShippingConfig"
        component={AdminSettingsShippingConfigScreen}
        options={{ title: 'Shipping Matrix' }}
      />
      <Stack.Screen
        name="AdminSettingsCsvExport"
        component={AdminSettingsCsvExportScreen}
        options={{ title: 'CSV Export' }}
      />
      <Stack.Screen
        name="AdminSettingsSellerShippingList"
        component={AdminSettingsSellerShippingListScreen}
        options={{ title: 'Seller Shipping' }}
      />
      <Stack.Screen
        name="AdminSettingsSellerShippingEdit"
        component={AdminSettingsSellerShippingEditScreen}
        options={{ title: 'Edit Shipping' }}
      />
      <Stack.Screen
        name="AdminGlobalAttributes"
        component={AdminGlobalAttributesScreen}
        options={{ title: 'Global Attributes' }}
      />
      <Stack.Screen
        name="AdminReviews"
        component={AdminReviewsScreen}
        options={{ title: 'Reviews' }}
      />
      <Stack.Screen
        name="AdminReviewDetail"
        component={AdminReviewDetailScreen}
        options={{ title: 'Review Detail' }}
      />
      <Stack.Screen
        name="AdminCoupons"
        component={AdminCouponsScreen}
        options={{ title: 'Coupon' }}
      />
      <Stack.Screen
        name="AdminCouponDetail"
        component={AdminCouponDetailScreen}
        options={{ title: 'Coupon Detail' }}
      />
      <Stack.Screen
        name="AdminCouponForm"
        component={AdminCouponFormScreen}
        options={({ route }) => ({
          title: route.params?.couponId ? 'Edit Coupon' : 'Add Coupon',
        })}
      />
    </Stack.Navigator>
  );
}
