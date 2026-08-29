import { Pressable, StyleSheet, View } from 'react-native';

import { ErrorState } from '../../../../components/ecommerce/ErrorState';
import { AdminDashboardKpiCard } from '../../../admin/dashboard/components/AdminDashboardKpiCard';
import { AdminSectionTitle } from '../../../admin/dashboard/components/AdminSectionTitle';
import { spacing } from '../../../../design-system';
import type { SellerDashboardOrderCounts } from '../types';
import { formatDashboardCount } from '../../utils/sellerDashboardDisplay';

export interface SellerDashboardOrderOverviewSectionProps {
  orderCounts: SellerDashboardOrderCounts | null;
  error?: string;
  onRetry?: () => void;
  onPendingPress?: () => void;
  onDispatchedPress?: () => void;
  onCompletedPress?: () => void;
}

function TappableKpiCard({
  label,
  value,
  icon,
  onPress,
}: {
  label: string;
  value: string;
  icon: 'time-outline' | 'airplane-outline' | 'checkmark-circle-outline';
  onPress?: () => void;
}) {
  if (!onPress) {
    return <AdminDashboardKpiCard label={label} value={value} icon={icon} />;
  }

  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
      <AdminDashboardKpiCard label={label} value={value} icon={icon} />
    </Pressable>
  );
}

export function SellerDashboardOrderOverviewSection({
  orderCounts,
  error,
  onRetry,
  onPendingPress,
  onDispatchedPress,
  onCompletedPress,
}: SellerDashboardOrderOverviewSectionProps) {
  return (
    <View style={styles.section}>
      <AdminSectionTitle title="Order overview" icon="bag-handle-outline" />

      <View style={styles.stack}>
        <TappableKpiCard
          label="Pending orders"
          value={formatDashboardCount(orderCounts?.pendingOrdersCount)}
          icon="time-outline"
          onPress={onPendingPress}
        />
        <TappableKpiCard
          label="Dispatch orders"
          value={formatDashboardCount(orderCounts?.dispatchedOrdersCount ?? 0)}
          icon="airplane-outline"
          onPress={onDispatchedPress}
        />
        <TappableKpiCard
          label="Completed orders"
          value={formatDashboardCount(orderCounts?.completedOrdersCount)}
          icon="checkmark-circle-outline"
          onPress={onCompletedPress}
        />
      </View>

      {error ? <ErrorState message={error} onAction={onRetry} style={styles.error} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md,
  },
  stack: {
    gap: spacing.sm,
  },
  error: {
    marginHorizontal: 0,
    alignSelf: 'stretch',
  },
  pressed: {
    opacity: 0.94,
  },
});
