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
import { ADMIN_ACCOUNT_MENU_ITEMS } from '../../../features/admin/navigation/adminAccountMenuItems';
import { colors, spacing } from '../../../design-system';
import { useAuth } from '../../auth/hooks/useAuth';
import { useRequireAuth } from '../../auth/hooks/useRequireAuth';
import { authReturnTo } from '../../auth/utils/authNavigation';
import { resolveAuthSellerId } from '../../auth/utils/resolveAuthSellerId';
import { resolveAuthUserId } from '../../auth/utils/resolveAuthUserId';
import { getContinueSetupSection } from '../../seller/utils/sellerSetupSections';
import { useSellerProfile } from '../../seller/hooks/useSellerProfile';
import { useAccountMemberSince } from '../hooks/useAccountMemberSince';
import { useAccountProfilePhoto } from '../hooks/useAccountProfilePhoto';
import { AccountMenuRow } from '../components/AccountMenuRow';
import { AccountMenuSectionLabel } from '../components/AccountMenuSectionLabel';
import type { AccountMenuIconName } from '../components/AccountMenuIcon';
import { AccountProfileHeader } from '../components/AccountProfileHeader';
import { AccountSellerSetupCard } from '../components/AccountSellerSetupCard';
import type { MainTabParamList, RootStackParamList, ShoppingStackParamList } from '../../../app/navigation/types';

type Props = BottomTabScreenProps<MainTabParamList, 'AccountTab'>;

type AccountNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<ShoppingStackParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;

type AccountMenuItem = {
  key: string;
  icon: AccountMenuIconName;
  label: string;
  onPress: () => void;
  destructive?: boolean;
};

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

  const authUserId = resolveAuthUserId(user);
  const memberSince = useAccountMemberSince(isAuthenticated ? authUserId : undefined);
  const { isUploading: isPhotoUploading, openPhotoActions } = useAccountProfilePhoto(
    isAuthenticated ? authUserId : undefined,
  );

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

  const personalItems: AccountMenuItem[] = [
    {
      key: 'account-details',
      icon: 'account-details',
      label: isSeller ? 'Personal information' : 'Account details',
      onPress: handlePersonalInfoPress,
    },
    {
      key: 'orders',
      icon: 'orders',
      label: 'My orders',
      onPress: () => stackNavigation.navigate('Orders'),
    },
    {
      key: 'messages',
      icon: 'messages',
      label: 'Messages',
      onPress: () => stackNavigation.navigate('ChatList'),
    },
  ];

  if (!isSeller) {
    personalItems.push({
      key: 'addresses',
      icon: 'addresses',
      label: 'Addresses',
      onPress: () => stackNavigation.navigate('AddressBook'),
    });
  }

  personalItems.push({
    key: 'referral-earnings',
    icon: 'referral-earnings',
    label: 'Referral earnings',
    onPress: () => stackNavigation.navigate('ReferralEarnings'),
  });

  const sellerItems: AccountMenuItem[] = [];

  if (isSeller) {
    sellerItems.push(
      {
        key: 'shop-profile',
        icon: 'shop-profile',
        label: 'Shop profile',
        onPress: () => goSeller('SellerShopProfile'),
      },
      {
        key: 'dashboard',
        icon: 'dashboard',
        label: 'Dashboard',
        onPress: () => goSeller('SellerDashboard'),
      },
      {
        key: 'products',
        icon: 'products',
        label: 'Products',
        onPress: () => goSeller('SellerProducts'),
      },
      {
        key: 'seller-orders',
        icon: 'seller-orders',
        label: 'Orders',
        onPress: () => goSeller('SellerOrders'),
      },
      {
        key: 'shipping',
        icon: 'shipping',
        label: 'Shipping',
        onPress: () => goSeller('SellerShippingConfig'),
      },
      {
        key: 'shop-settings',
        icon: 'shop-settings',
        label: 'Shop settings',
        onPress: () => goSeller('SellerShopSettings'),
      },
      {
        key: 'seller-earnings',
        icon: 'seller-earnings',
        label: 'Seller earnings',
        onPress: () => goSeller('SellerEarnings', {}),
      },
      {
        key: 'coupons',
        icon: 'coupons',
        label: 'Coupons',
        onPress: () => goSeller('SellerCoupons'),
      },
      {
        key: 'attributes',
        icon: 'attributes',
        label: 'Custom attributes',
        onPress: () => goSeller('SellerAttributes'),
      },
      {
        key: 'reviews',
        icon: 'reviews',
        label: 'Reviews',
        onPress: () => goSeller('SellerReviews'),
      },
    );
  }

  const adminItems: AccountMenuItem[] = [];

  if (isAdmin) {
    ADMIN_ACCOUNT_MENU_ITEMS.filter((item) => !item.requiresFullAccess || fullAccess).forEach((item) => {
      adminItems.push({
        key: `admin-${item.screen}`,
        icon: item.icon,
        label: item.label,
        onPress: () => navigateToAdminScreen(rootNavigation, item.screen),
      });
    });
  }

  const preferenceItems: AccountMenuItem[] = [
    {
      key: 'notifications',
      icon: 'notifications',
      label: 'Notifications',
      onPress: () => showComingSoon('Notifications'),
    },
    {
      key: 'help',
      icon: 'help',
      label: 'Help & support',
      onPress: () => showComingSoon('Help and support'),
    },
    {
      key: 'terms',
      icon: 'terms',
      label: 'Terms & Conditions',
      onPress: () => stackNavigation.navigate('TermsConditions'),
    },
    {
      key: 'logout',
      icon: 'logout',
      label: 'Log out',
      onPress: () => void logout(),
      destructive: true,
    },
  ];

  const renderMenuItems = (items: AccountMenuItem[]) =>
    items.map((item) => (
      <AccountMenuRow
        key={item.key}
        icon={item.icon}
        label={item.label}
        onPress={item.onPress}
        destructive={item.destructive}
      />
    ));

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
      <AccountProfileHeader
        user={user}
        isAuthenticated={isAuthenticated}
        memberSince={memberSince}
        isPhotoUploading={isPhotoUploading}
        onAvatarPress={openPhotoActions}
      />

      {showSellerSetupCard ? (
        <AccountSellerSetupCard
          profileSetup={profile?.profileSetup}
          onContinueSetup={handleContinueSellerSetup}
        />
      ) : null}

      <View style={styles.menuList}>
        <View style={styles.section}>
          <AccountMenuSectionLabel title="Personal" />
          {renderMenuItems(personalItems)}
          {renderMenuItems(sellerItems)}
        </View>

        {adminItems.length > 0 ? (
          <View style={styles.section}>
            <AccountMenuSectionLabel title="Admin" />
            {renderMenuItems(adminItems)}
          </View>
        ) : null}

        <View style={styles.section}>
          <AccountMenuSectionLabel title="Preferences" />
          {renderMenuItems(preferenceItems)}
        </View>
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
  menuList: {
    gap: spacing.lg,
  },
  section: {
    gap: spacing.sm,
  },
});
