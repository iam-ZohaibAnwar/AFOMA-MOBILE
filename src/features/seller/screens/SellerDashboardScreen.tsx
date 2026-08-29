import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing } from '../../../design-system';
import type { SellerStackParamList } from '../../../app/navigation/sellerTypes';
import { authReturnTo } from '../../auth/utils/authNavigation';
import { SellerDashboardEarningsSection } from '../dashboard/components/SellerDashboardEarningsSection';
import { SellerDashboardHeader } from '../dashboard/components/SellerDashboardHeader';
import { SellerDashboardOrderOverviewSection } from '../dashboard/components/SellerDashboardOrderOverviewSection';
import { SellerDashboardRecentOrdersSection } from '../dashboard/components/SellerDashboardRecentOrdersSection';
import { SellerDashboardSetupAlert } from '../dashboard/components/SellerDashboardSetupAlert';
import { SellerOperationalAlertsSection } from '../dashboard/components/SellerOperationalAlertsSection';
import { useSellerDashboard } from '../dashboard/hooks/useSellerDashboard';
import type { SellerDashboardOrder } from '../dashboard/types';
import { sellerDashboardTheme } from '../dashboard/utils/sellerDashboardTheme';
import { useRequireSeller } from '../hooks/useRequireSeller';
import { useSellerProfile } from '../hooks/useSellerProfile';
import { hasPendingPayoutAmount } from '../utils/sellerDashboardDisplay';
import {
  getContinueSetupSection,
  getSellerDisplayName,
  isSellerProductCreationAllowed,
} from '../utils/sellerSetupSections';
import type { SellerOrderSummary } from '../orders/types/sellerOrder';

type Props = NativeStackScreenProps<SellerStackParamList, 'SellerDashboard'>;

const DASHBOARD_RETURN_TO = authReturnTo.sellerDashboard();

function sumOptionalCounts(...values: Array<number | null | undefined>): number {
  return values.reduce<number>((total, value) => total + Math.max(0, Number(value ?? 0)), 0);
}

export function SellerDashboardScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { isAuthorized, sellerId } = useRequireSeller(DASHBOARD_RETURN_TO);
  const { profile } = useSellerProfile(isAuthorized ? sellerId : undefined);
  const {
    orderCounts,
    payoutSummary,
    latestOrders,
    errors,
    isRefreshing,
    refresh,
  } = useSellerDashboard(isAuthorized ? sellerId : undefined);

  const setupComplete = isSellerProductCreationAllowed(profile?.profileSetup);
  const shopName = getSellerDisplayName(profile);

  const alertCount = useMemo(() => {
    const pendingOrders = Number(orderCounts?.pendingOrdersCount ?? 0);
    const pendingPayoutFlag = hasPendingPayoutAmount(payoutSummary?.totalPendingPayoutAmount) ? 1 : 0;
    return sumOptionalCounts(pendingOrders, pendingPayoutFlag);
  }, [orderCounts?.pendingOrdersCount, payoutSummary?.totalPendingPayoutAmount]);

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

  const handleOpenOrders = useCallback(() => {
    navigation.navigate('SellerOrders');
  }, [navigation]);

  const handleOpenPendingEarnings = useCallback(() => {
    navigation.navigate('SellerEarnings', { payoutStatus: 'Pending' });
  }, [navigation]);

  const handleOpenCompletedEarnings = useCallback(() => {
    navigation.navigate('SellerEarnings', { payoutStatus: 'Paid' });
  }, [navigation]);

  const handleContinueSetup = useCallback(() => {
    const nextSection = getContinueSetupSection(profile);
    if (nextSection) {
      navigation.navigate('SellerSetupSection', { section: nextSection });
      return;
    }
    navigation.navigate('SellerSetup');
  }, [navigation, profile]);

  const handleOrderPress = useCallback(
    (order: SellerDashboardOrder) => {
      if (!order._id) {
        return;
      }

      navigation.navigate('SellerOrderDetail', {
        orderId: order._id,
        initialOrder: order as SellerOrderSummary,
      });
    },
    [navigation],
  );

  if (!isAuthorized) {
    return <View style={[styles.screen, { paddingTop: insets.top }]} />;
  }

  return (
    <View style={styles.screen}>
      <SellerDashboardHeader
        shopName={shopName}
        alertCount={alertCount}
        onBackPress={handleBack}
        onAlertsPress={handleOpenOrders}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={() => void refresh()} tintColor={colors.primary} />
        }
      >
        {!setupComplete ? <SellerDashboardSetupAlert profileSetup={profile?.profileSetup} onContinue={handleContinueSetup} /> : null}

        <SellerDashboardOrderOverviewSection
          orderCounts={orderCounts}
          error={errors.counts}
          onRetry={() => void refresh()}
          onPendingPress={handleOpenOrders}
          onDispatchedPress={handleOpenOrders}
          onCompletedPress={handleOpenOrders}
        />

        <SellerDashboardEarningsSection
          payoutSummary={payoutSummary}
          error={errors.payouts}
          onRetry={() => void refresh()}
          onPendingPress={handleOpenPendingEarnings}
          onCompletedPress={handleOpenCompletedEarnings}
        />

        <SellerOperationalAlertsSection
          orderCounts={orderCounts}
          payoutSummary={payoutSummary}
          onPendingOrdersPress={handleOpenOrders}
          onDispatchedOrdersPress={handleOpenOrders}
          onPendingPayoutsPress={handleOpenPendingEarnings}
        />

        <SellerDashboardRecentOrdersSection
          orders={latestOrders}
          error={errors.orders}
          onRetry={() => void refresh()}
          onViewAllPress={handleOpenOrders}
          onOrderPress={handleOrderPress}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: sellerDashboardTheme.screenBackground,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    gap: sellerDashboardTheme.sectionGap,
    paddingTop: spacing.md,
  },
});
