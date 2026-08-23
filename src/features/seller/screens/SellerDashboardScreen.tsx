import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '../../../components/ecommerce/EmptyState';
import { ErrorState } from '../../../components/ecommerce/ErrorState';
import { AppCard } from '../../../components/ui/AppCard';
import { AppText } from '../../../components/ui/AppText';
import { colors, spacing } from '../../../design-system';
import type { SellerStackParamList } from '../../../app/navigation/sellerTypes';
import { authReturnTo } from '../../auth/utils/authNavigation';
import { SellerSetupProgress } from '../components/SellerSetupProgress';
import { SellerDashboardOrderRow } from '../dashboard/components/SellerDashboardOrderRow';
import { SellerDashboardStatCard } from '../dashboard/components/SellerDashboardStatCard';
import { useSellerDashboard } from '../dashboard/hooks/useSellerDashboard';
import { useRequireSeller } from '../hooks/useRequireSeller';
import { useSellerProfile } from '../hooks/useSellerProfile';
import {
  formatDashboardCount,
  formatDashboardOrderId,
  formatDashboardPayoutAmount,
} from '../utils/sellerDashboardDisplay';
import {
  getContinueSetupSection,
  getSellerDisplayName,
  isSellerProductCreationAllowed,
} from '../utils/sellerSetupSections';

type Props = NativeStackScreenProps<SellerStackParamList, 'SellerDashboard'>;

const DASHBOARD_RETURN_TO = authReturnTo.sellerDashboard();

export function SellerDashboardScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { isAuthorized, sellerId } = useRequireSeller(DASHBOARD_RETURN_TO);
  const { profile } = useSellerProfile(isAuthorized ? sellerId : undefined);
  const {
    orderCounts,
    payoutSummary,
    latestOrders,
    errors,
    isLoading,
    isRefreshing,
    hasBlockingError,
    refresh,
  } = useSellerDashboard(isAuthorized ? sellerId : undefined);

  const setupComplete = isSellerProductCreationAllowed(profile?.profileSetup);

  const handleContinueSetup = () => {
    const nextSection = getContinueSetupSection(profile);
    if (nextSection) {
      navigation.navigate('SellerSetupSection', { section: nextSection });
      return;
    }
    navigation.navigate('SellerSetup');
  };

  if (!isAuthorized) {
    return (
      <View style={styles.centeredState}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isLoading && !orderCounts && !payoutSummary && latestOrders.length === 0) {
    return (
      <View style={styles.centeredState}>
        <ActivityIndicator size="large" color={colors.primary} />
        <AppText variant="bodySmall" color="textSecondary">
          Loading dashboard...
        </AppText>
      </View>
    );
  }

  if (hasBlockingError) {
    return (
      <View style={[styles.centeredState, { paddingBottom: insets.bottom }]}>
        <ErrorState
          message={errors.counts ?? errors.payouts ?? errors.orders ?? 'Failed to load dashboard'}
          onAction={() => void refresh()}
        />
      </View>
    );
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
      <AppText variant="h3" style={styles.greeting}>
        {getSellerDisplayName(profile)}
      </AppText>
      <AppText variant="bodySmall" color="textSecondary" style={styles.greetingSub}>
        Seller dashboard
      </AppText>

      {!setupComplete ? (
        <AppCard variant="flat">
          <SellerSetupProgress profileSetup={profile?.profileSetup} onContinue={handleContinueSetup} />
        </AppCard>
      ) : null}

      <View style={styles.statsGrid}>
        <SellerDashboardStatCard
          label="Number of Orders"
          value={formatDashboardCount(orderCounts?.pendingOrdersCount)}
        />
        <SellerDashboardStatCard
          label="Dispatch Orders"
          value={formatDashboardCount(orderCounts?.dispatchedOrdersCount ?? 0)}
        />
        <SellerDashboardStatCard
          label="Completed Orders"
          value={formatDashboardCount(orderCounts?.completedOrdersCount)}
        />
        <SellerDashboardStatCard
          label="Pending Payouts"
          value={formatDashboardPayoutAmount(payoutSummary?.totalPendingPayoutAmount)}
          suffix="CAD"
          onPress={() => navigation.navigate('SellerEarnings', { payoutStatus: 'Pending' })}
        />
        <SellerDashboardStatCard
          label="Completed Payouts"
          value={formatDashboardPayoutAmount(payoutSummary?.totalPaidPayoutAmount)}
          suffix="CAD"
          onPress={() => navigation.navigate('SellerEarnings', { payoutStatus: 'Paid' })}
        />
      </View>

      {errors.counts ? <ErrorState message={errors.counts} onAction={() => void refresh()} style={styles.inlineError} /> : null}
      {errors.payouts ? (
        <ErrorState message={errors.payouts} onAction={() => void refresh()} style={styles.inlineError} />
      ) : null}

      <AppCard variant="muted">
        <AppText variant="bodyMedium" style={styles.sectionTitle}>
          Recent Orders
        </AppText>

        {errors.orders ? (
          <ErrorState message={errors.orders} onAction={() => void refresh()} style={styles.inlineError} />
        ) : latestOrders.length > 0 ? (
          <View style={styles.ordersList}>
            {latestOrders.map((order) => (
              <SellerDashboardOrderRow key={order._id ?? formatDashboardOrderId(order)} order={order} />
            ))}
          </View>
        ) : (
          <EmptyState title="No orders received" style={styles.emptyState} />
        )}
      </AppCard>
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
    gap: spacing.lg,
  },
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  greeting: {
    color: colors.textPrimary,
  },
  greetingSub: {
    marginTop: -spacing.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  ordersList: {
    gap: spacing.xs,
  },
  emptyState: {
    marginHorizontal: 0,
    alignSelf: 'stretch',
  },
  inlineError: {
    alignSelf: 'stretch',
    marginHorizontal: 0,
  },
});
