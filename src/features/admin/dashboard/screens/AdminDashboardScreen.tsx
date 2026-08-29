import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing } from '../../../../design-system';
import type { AdminStackParamList } from '../../navigation/adminTypes';
import { useRequireAdmin } from '../../hooks/useRequireAdmin';
import { useAuth } from '../../../auth/hooks/useAuth';
import { authReturnTo } from '../../../auth/utils/authNavigation';
import { AdminBottomNav, type AdminBottomNavTab } from '../components/AdminBottomNav';
import { AdminDashboardHeader } from '../components/AdminDashboardHeader';
import { AdminDashboardKpiRow } from '../components/AdminDashboardKpiRow';
import { AdminDashboardLatestTabs } from '../components/AdminDashboardLatestTabs';
import { AdminOperationalAlertsSection } from '../components/AdminOperationalAlertsSection';
import { AdminUserEngagementSection } from '../components/AdminUserEngagementSection';
import { useAdminDashboard } from '../hooks/useAdminDashboard';
import { adminDashboardTheme } from '../utils/adminDashboardTheme';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminDashboard'>;

const DASHBOARD_RETURN_TO = authReturnTo.adminDashboard();

function sumOptionalCounts(...values: Array<number | string | null | undefined>): number {
  return values.reduce<number>((total, value) => {
    const parsed = Number(value ?? 0);
    return total + (Number.isFinite(parsed) ? parsed : 0);
  }, 0);
}

export function AdminDashboardScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { isAuthorized, isLoading: authLoading } = useRequireAdmin(DASHBOARD_RETURN_TO);
  const { fullAccess } = useAuth();

  const handleBack = useCallback(() => {
    const parent = navigation.getParent();
    if (parent?.canGoBack()) {
      parent.goBack();
      return;
    }

    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }, [navigation]);

  const handleOpenProducts = useCallback(() => {
    navigation.navigate('AdminProductManagement');
  }, [navigation]);

  const handlePendingProductsPress = useCallback(() => {
    navigation.navigate('AdminProductManagement', {
      initialApprovalFilter: 'Pending',
    });
  }, [navigation]);

  const handlePendingPayoutsPress = useCallback(() => {
    navigation.navigate('AdminCommission', {
      initialPayoutStatus: 'Pending',
    });
  }, [navigation]);

  const handlePendingOrdersPress = useCallback(() => {
    navigation.navigate('AdminOrderManagement');
  }, [navigation]);

  const handleBottomNav = useCallback(
    (tab: AdminBottomNavTab) => {
      switch (tab) {
        case 'dashboard':
          return;
        case 'orders':
          navigation.navigate('AdminOrderManagement');
          return;
        case 'products':
          navigation.navigate('AdminProductManagement');
          return;
        case 'settings':
          navigation.navigate('AdminSettingsHub');
          return;
        default:
          return;
      }
    },
    [navigation],
  );

  const {
    totalSales,
    userCounts,
    stockStatus,
    pendingProducts,
    pendingPayouts,
    totalOrders,
    pendingOrders,
    latestSellers,
    latestProducts,
    searchTerms,
    errors,
    isRefreshing,
    refresh,
  } = useAdminDashboard(isAuthorized || authLoading ? fullAccess : false);

  const alertCount = useMemo(
    () =>
      sumOptionalCounts(
        stockStatus?.outOfStockCount,
        stockStatus?.lowStockCount,
        pendingProducts?.pendingProductCount,
        pendingPayouts?.pendingPayoutsCount,
        pendingOrders?.pendingOrdersCount,
      ),
    [
      pendingOrders?.pendingOrdersCount,
      pendingPayouts?.pendingPayoutsCount,
      pendingProducts?.pendingProductCount,
      stockStatus?.lowStockCount,
      stockStatus?.outOfStockCount,
    ],
  );

  const bottomInset = adminDashboardTheme.bottomNavHeight + insets.bottom + spacing.xl;

  if (!authLoading && !isAuthorized) {
    return <View style={[styles.screen, { paddingTop: insets.top }]} />;
  }

  return (
    <View style={styles.screen}>
      <AdminDashboardHeader
        alertCount={alertCount}
        onBackPress={handleBack}
        onNotificationsPress={handlePendingOrdersPress}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: bottomInset }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={() => void refresh()} tintColor={colors.primary} />
        }
      >
        <AdminDashboardKpiRow
          totalSales={totalSales}
          fullAccess={fullAccess}
          error={errors.totalSales}
          onRetry={() => void refresh()}
        />

        <AdminOperationalAlertsSection
          stockStatus={stockStatus}
          pendingProducts={pendingProducts}
          pendingPayouts={pendingPayouts}
          totalOrders={totalOrders}
          pendingOrders={pendingOrders}
          errors={{
            stockStatus: errors.stockStatus,
            pendingProducts: errors.pendingProducts,
            pendingPayouts: errors.pendingPayouts,
            totalOrders: errors.totalOrders,
            pendingOrders: errors.pendingOrders,
          }}
          onRetry={() => void refresh()}
          onRestockPress={handleOpenProducts}
          onLowStockPress={handleOpenProducts}
          onPendingProductsPress={handlePendingProductsPress}
          onPendingPayoutsPress={fullAccess ? handlePendingPayoutsPress : undefined}
          onPendingOrdersPress={handlePendingOrdersPress}
        />

        <AdminUserEngagementSection
          userCounts={userCounts}
          latestSellers={latestSellers}
          searchTerms={searchTerms}
          error={errors.userCounts}
          onRetry={() => void refresh()}
        />

        <AdminDashboardLatestTabs
          latestProducts={latestProducts}
          latestSellers={latestSellers}
          searchTerms={searchTerms}
          errors={{
            latestProducts: errors.latestProducts,
            latestSellers: errors.latestSellers,
            searchTerms: errors.searchTerms,
          }}
          onRetry={() => void refresh()}
        />
      </ScrollView>

      <View style={styles.bottomNavWrap}>
        <AdminBottomNav activeTab="dashboard" onSelect={handleBottomNav} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: adminDashboardTheme.screenBackground,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    gap: adminDashboardTheme.sectionGap,
    paddingTop: spacing.md,
  },
  bottomNavWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
});
