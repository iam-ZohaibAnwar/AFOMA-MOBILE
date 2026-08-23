import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ErrorState } from '../../../../components/ecommerce/ErrorState';
import { AppCard } from '../../../../components/ui/AppCard';
import { AppText } from '../../../../components/ui/AppText';
import { colors, spacing } from '../../../../design-system';
import type { AdminUserCounts } from '../types/adminDashboard';
import { formatAdminCount } from '../utils/adminDashboardDisplay';

export interface AdminUserEngagementSectionProps {
  userCounts: AdminUserCounts | null;
  isLoading: boolean;
  error?: string;
  onRetry?: () => void;
}

function EngagementRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <AppText variant="bodyMedium" color="textSecondary">
        {label}
      </AppText>
      <AppText variant="bodyMedium" style={styles.value}>
        {value}
      </AppText>
    </View>
  );
}

export function AdminUserEngagementSection({
  userCounts,
  isLoading,
  error,
  onRetry,
}: AdminUserEngagementSectionProps) {
  return (
    <View style={styles.section}>
      <AppText variant="bodyMedium" style={styles.title}>
        User Engagement
      </AppText>

      <AppCard variant="muted">
        {isLoading && !userCounts ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <View style={styles.list}>
            <EngagementRow label="Users" value={formatAdminCount(userCounts?.userCount)} />
            <EngagementRow label="Sellers" value={formatAdminCount(userCounts?.approvedSellersCount)} />
            <EngagementRow label="Affiliates" value={formatAdminCount(userCounts?.affiliateCount)} />
          </View>
        )}

        {error ? <ErrorState message={error} onAction={onRetry} style={styles.error} /> : null}
      </AppCard>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
  },
  title: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  list: {
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  value: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  error: {
    marginHorizontal: 0,
    marginTop: spacing.sm,
    alignSelf: 'stretch',
  },
});
