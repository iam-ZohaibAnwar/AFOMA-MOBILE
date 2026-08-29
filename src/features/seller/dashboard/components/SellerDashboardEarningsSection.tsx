import { Pressable, StyleSheet, View } from 'react-native';

import { ErrorState } from '../../../../components/ecommerce/ErrorState';
import { AdminDashboardKpiCard } from '../../../admin/dashboard/components/AdminDashboardKpiCard';
import { AdminSectionTitle } from '../../../admin/dashboard/components/AdminSectionTitle';
import { spacing } from '../../../../design-system';
import type { SellerDashboardPayoutSummary } from '../types';
import { formatDashboardPayoutAmount } from '../../utils/sellerDashboardDisplay';

export interface SellerDashboardEarningsSectionProps {
  payoutSummary: SellerDashboardPayoutSummary | null;
  error?: string;
  onRetry?: () => void;
  onPendingPress?: () => void;
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
  icon: 'wallet-outline' | 'cash-outline';
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

export function SellerDashboardEarningsSection({
  payoutSummary,
  error,
  onRetry,
  onPendingPress,
  onCompletedPress,
}: SellerDashboardEarningsSectionProps) {
  const pendingValue = `CA$${formatDashboardPayoutAmount(payoutSummary?.totalPendingPayoutAmount)}`;
  const completedValue = `CA$${formatDashboardPayoutAmount(payoutSummary?.totalPaidPayoutAmount)}`;

  return (
    <View style={styles.section}>
      <AdminSectionTitle title="Seller earnings" icon="cash-outline" />

      <View style={styles.stack}>
        <TappableKpiCard
          label="Pending payouts"
          value={pendingValue}
          icon="wallet-outline"
          onPress={onPendingPress}
        />
        <TappableKpiCard
          label="Completed payouts"
          value={completedValue}
          icon="cash-outline"
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
