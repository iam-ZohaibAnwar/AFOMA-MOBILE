import { StyleSheet, View } from 'react-native';

import { AppText } from '../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../design-system';

export interface AccountQuickStatsProps {
  orderCount: number;
  wishlistCount: number;
  addressCount: number;
}

function StatCard({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.card}>
      <AppText variant="h2" style={styles.value}>
        {value}
      </AppText>
      <AppText variant="bodySmall" color="textMuted">
        {label}
      </AppText>
    </View>
  );
}

export function AccountQuickStats({
  orderCount,
  wishlistCount,
  addressCount,
}: AccountQuickStatsProps) {
  return (
    <View style={styles.row}>
      <StatCard value={orderCount} label="Orders" />
      <StatCard value={wishlistCount} label="Wishlist" />
      <StatCard value={addressCount} label="Addresses" />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.large,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    gap: spacing.xs,
  },
  value: {
    fontSize: 28,
    lineHeight: 32,
    color: colors.textPrimary,
  },
});
