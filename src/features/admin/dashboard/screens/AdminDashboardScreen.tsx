import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '../../../../components/ui/AppText';
import { colors, spacing } from '../../../../design-system';
import type { AdminStackParamList } from '../../navigation/adminTypes';
import { useRequireAdmin } from '../../hooks/useRequireAdmin';
import { useAuth } from '../../../auth/hooks/useAuth';
import { authReturnTo } from '../../../auth/utils/authNavigation';
import { AdminDashboardKpiRow } from '../components/AdminDashboardKpiRow';
import { AdminDashboardLatestTabs } from '../components/AdminDashboardLatestTabs';
import { AdminOperationsSection } from '../components/AdminOperationsSection';
import { AdminUserEngagementSection } from '../components/AdminUserEngagementSection';
import { useAdminDashboard } from '../hooks/useAdminDashboard';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminDashboard'>;

const DASHBOARD_RETURN_TO = authReturnTo.adminDashboard();

export function AdminDashboardScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { isAuthorized } = useRequireAdmin(DASHBOARD_RETURN_TO);
  const { fullAccess } = useAuth();

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
  const {
    totalSales,
    userCounts,
    stockStatus,
    sellerCount,
    pendingProducts,
    pendingPayouts,
    totalOrders,
    pendingOrders,
    latestSellers,
    latestProducts,
    searchTerms,
    errors,
    isLoading,
    isRefreshing,
    refresh,
  } = useAdminDashboard(isAuthorized ? fullAccess : false);

  if (!isAuthorized) {
    return <View style={[styles.screen, { paddingTop: insets.top }]} />;
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={() => void refresh()} tintColor={colors.primary} />
      }
    >
      <AppText variant="h3" style={styles.title}>
        Admin Dashboard
      </AppText>

      <AdminDashboardKpiRow
        totalSales={totalSales}
        fullAccess={fullAccess}
        isLoading={isLoading}
        error={errors.totalSales}
        onRetry={() => void refresh()}
      />

      <AdminUserEngagementSection
        userCounts={userCounts}
        isLoading={isLoading}
        error={errors.userCounts}
        onRetry={() => void refresh()}
      />

      <AdminOperationsSection
        stockStatus={stockStatus}
        sellerCount={sellerCount}
        pendingProducts={pendingProducts}
        pendingPayouts={pendingPayouts}
        totalOrders={totalOrders}
        pendingOrders={pendingOrders}
        isLoading={isLoading}
        errors={{
          stockStatus: errors.stockStatus,
          sellerCount: errors.sellerCount,
          pendingProducts: errors.pendingProducts,
          pendingPayouts: errors.pendingPayouts,
          totalOrders: errors.totalOrders,
          pendingOrders: errors.pendingOrders,
        }}
        onRetry={() => void refresh()}
        onPendingProductsPress={handlePendingProductsPress}
        onPendingPayoutsPress={fullAccess ? handlePendingPayoutsPress : undefined}
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
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.xl,
  },
  title: {
    color: colors.textPrimary,
  },
});
