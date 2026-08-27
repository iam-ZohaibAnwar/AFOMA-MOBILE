import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { navigateToSellerScreen } from '../../../app/navigation/sellerNavigation';
import {
  marketplaceScrollProps,
  useMarketplaceFooterContentInset,
  useMarketplaceScrollHandler,
} from '../../../app/navigation/marketplaceChrome';
import type { SellerStackParamList } from '../../../app/navigation/sellerTypes';
import { navigateToAdminScreen } from '../../../features/admin/navigation/adminNavigation';
import { colors, spacing } from '../../../design-system';
import { useAuth } from '../../auth/hooks/useAuth';
import { useRequireAuth } from '../../auth/hooks/useRequireAuth';
import { authReturnTo } from '../../auth/utils/authNavigation';
import { resolveAuthSellerId } from '../../auth/utils/resolveAuthSellerId';
import { getContinueSetupSection } from '../../seller/utils/sellerSetupSections';
import { useSellerProfile } from '../../seller/hooks/useSellerProfile';
import { AccountMenuRow } from '../components/AccountMenuRow';
import { AccountMenuSection } from '../components/AccountMenuSection';
import { AccountProfileHeader } from '../components/AccountProfileHeader';
import { AccountSellerSetupCard } from '../components/AccountSellerSetupCard';
import type { MainTabParamList, RootStackParamList, ShoppingStackParamList } from '../../../app/navigation/types';

type Props = BottomTabScreenProps<MainTabParamList, 'AccountTab'>;

type AccountNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<ShoppingStackParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;

const ACCOUNT_RETURN_TO = authReturnTo.accountTab();

function showComingSoon(feature: string) {
  Alert.alert('Coming soon', `${feature} will be available in a future update.`);
}

export function AccountScreen(_props: Props) {
  const insets = useSafeAreaInsets();
  const footerInset = useMarketplaceFooterContentInset();
  const onMarketplaceScroll = useMarketplaceScrollHandler();
  const rootNavigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const stackNavigation = useNavigation<AccountNavigationProp>();
  const { user, logout, role, fullAccess, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  useRequireAuth(ACCOUNT_RETURN_TO);

  const sellerId = resolveAuthSellerId(user);
  const isSeller = role === 'seller' && Boolean(sellerId);
  const isAdmin = role === 'admin';
  const { profile, isLoading: isProfileLoading } = useSellerProfile(isSeller ? sellerId : undefined);
  const showSellerSetupCard = isSeller && Boolean(profile) && !isProfileLoading;

  const goSeller = <S extends keyof SellerStackParamList>(
    screen: S,
    params?: SellerStackParamList[S],
  ) => {
    navigateToSellerScreen(rootNavigation, screen, params);
  };

  const handleContinueSellerSetup = () => {
    const nextSection = getContinueSetupSection(profile);
    if (nextSection) {
      navigateToSellerScreen(rootNavigation, 'SellerSetupSection', { section: nextSection });
      return;
    }
    goSeller('SellerSetup');
  };

  const handlePersonalInfoPress = () => {
    if (isSeller) {
      goSeller('SellerPersonalInformation');
      return;
    }
    stackNavigation.navigate('AccountDetails');
  };

  if (!isAuthLoading && !isAuthenticated) {
    return <View style={[styles.screen, { paddingTop: insets.top }]} />;
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.xxl + footerInset },
      ]}
      showsVerticalScrollIndicator={false}
      onScroll={onMarketplaceScroll}
      {...marketplaceScrollProps}
    >
      <AccountProfileHeader user={user} onEditPress={handlePersonalInfoPress} />

      <AccountMenuSection title="Personal">
        <AccountMenuRow
          icon="account-details"
          label={isSeller ? 'Personal information' : 'Account details'}
          onPress={handlePersonalInfoPress}
        />
        <AccountMenuRow icon="orders" label="My orders" onPress={() => stackNavigation.navigate('Orders')} />
        <AccountMenuRow icon="messages" label="Messages" onPress={() => stackNavigation.navigate('ChatList')} />
        {!isSeller ? (
          <AccountMenuRow icon="addresses" label="Addresses" onPress={() => stackNavigation.navigate('AddressBook')} />
        ) : null}
        <AccountMenuRow
          icon="referral-earnings"
          label="Referral earnings"
          onPress={() => stackNavigation.navigate('ReferralEarnings')}
          showDivider={false}
        />
      </AccountMenuSection>

      {isSeller ? (
        <View style={styles.sellerSection}>
          {showSellerSetupCard ? (
            <AccountSellerSetupCard
              profileSetup={profile?.profileSetup}
              onContinueSetup={handleContinueSellerSetup}
            />
          ) : null}

          <AccountMenuSection title="Seller">
            <AccountMenuRow icon="shop-profile" label="Shop profile" onPress={() => goSeller('SellerShopProfile')} />
            <AccountMenuRow icon="dashboard" label="Dashboard" onPress={() => goSeller('SellerDashboard')} />
            <AccountMenuRow icon="products" label="Products" onPress={() => goSeller('SellerProducts')} />
            <AccountMenuRow icon="messages" label="Messages" onPress={() => stackNavigation.navigate('ChatList')} />
            <AccountMenuRow icon="seller-orders" label="Orders" onPress={() => goSeller('SellerOrders')} />
            <AccountMenuRow icon="shipping" label="Shipping" onPress={() => goSeller('SellerShippingConfig')} />
            <AccountMenuRow icon="shop-settings" label="Shop settings" onPress={() => goSeller('SellerShopSettings')} />
            <AccountMenuRow icon="seller-earnings" label="Seller earnings" onPress={() => goSeller('SellerEarnings', {})} />
            <AccountMenuRow icon="coupons" label="Coupons" onPress={() => goSeller('SellerCoupons')} />
            <AccountMenuRow icon="attributes" label="Custom attributes" onPress={() => goSeller('SellerAttributes')} />
            <AccountMenuRow icon="reviews" label="Reviews" onPress={() => goSeller('SellerReviews')} showDivider={false} />
          </AccountMenuSection>
        </View>
      ) : null}

      {isAdmin ? (
        <AccountMenuSection title="Admin">
          <AccountMenuRow
            icon="admin-dashboard"
            label="Dashboard"
            onPress={() => navigateToAdminScreen(rootNavigation, 'AdminDashboard')}
          />
          <AccountMenuRow
            icon="seller-management"
            label="Seller management"
            onPress={() => navigateToAdminScreen(rootNavigation, 'AdminSellerManagement')}
          />
          <AccountMenuRow
            icon="order-management"
            label="Order management"
            onPress={() => navigateToAdminScreen(rootNavigation, 'AdminOrderManagement')}
          />
          <AccountMenuRow
            icon="product-management"
            label="Product management"
            onPress={() => navigateToAdminScreen(rootNavigation, 'AdminProductManagement')}
          />
          <AccountMenuRow
            icon="global-attributes"
            label="Global attributes"
            onPress={() => navigateToAdminScreen(rootNavigation, 'AdminGlobalAttributes')}
          />
          <AccountMenuRow
            icon="admin-reviews"
            label="Reviews"
            onPress={() => navigateToAdminScreen(rootNavigation, 'AdminReviews')}
          />
          <AccountMenuRow
            icon="admin-coupons"
            label="Coupons"
            onPress={() => navigateToAdminScreen(rootNavigation, 'AdminCoupons')}
          />
          <AccountMenuRow
            icon="admin-settings"
            label="Settings"
            onPress={() => navigateToAdminScreen(rootNavigation, 'AdminSettingsHub')}
            showDivider={Boolean(fullAccess)}
          />
          {fullAccess ? (
            <>
              <AccountMenuRow
                icon="user-management"
                label="User management"
                onPress={() => navigateToAdminScreen(rootNavigation, 'AdminUserManagement')}
              />
              <AccountMenuRow
                icon="commission"
                label="Commission"
                onPress={() => navigateToAdminScreen(rootNavigation, 'AdminCommission')}
                showDivider={false}
              />
            </>
          ) : null}
        </AccountMenuSection>
      ) : null}

      <AccountMenuSection title="Preferences">
        <AccountMenuRow
          icon="notifications"
          label="Notifications"
          onPress={() => showComingSoon('Notifications')}
        />
        <AccountMenuRow
          icon="help"
          label="Help & support"
          onPress={() => showComingSoon('Help and support')}
        />
        <AccountMenuRow
          icon="terms"
          label="Terms & Conditions"
          onPress={() => stackNavigation.navigate('TermsConditions')}
          showDivider={false}
        />
      </AccountMenuSection>

      <View style={styles.logoutPanel}>
        <AccountMenuRow
          icon="logout"
          label="Log out"
          onPress={() => void logout()}
          showDivider={false}
          destructive
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  sellerSection: {
    gap: spacing.md,
  },
  logoutPanel: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingHorizontal: spacing.md,
    overflow: 'hidden',
  },
});
