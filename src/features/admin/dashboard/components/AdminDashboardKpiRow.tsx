import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ErrorState } from '../../../../components/ecommerce/ErrorState';
import { AppCard } from '../../../../components/ui/AppCard';
import { AppText } from '../../../../components/ui/AppText';
import { colors, spacing } from '../../../../design-system';
import type { AdminTotalSalesSummary } from '../types/adminDashboard';
import { formatAdminCount, formatAdminCurrency } from '../utils/adminDashboardDisplay';
import { AdminDashboardKpiCard } from './AdminDashboardKpiCard';

export interface AdminDashboardKpiRowProps {
  totalSales: AdminTotalSalesSummary | null;
  fullAccess: boolean;
  isLoading: boolean;
  error?: string;
  onRetry?: () => void;
}

export function AdminDashboardKpiRow({
  totalSales,
  fullAccess,
  isLoading,
  error,
  onRetry,
}: AdminDashboardKpiRowProps) {
  const salesValue = fullAccess
    ? formatAdminCurrency(totalSales?.totalOrderPrice, 'CA$ 0.00')
    : '—';
  const ordersValue = fullAccess ? formatAdminCount(totalSales?.totalOrders) : '—';
  const avgValue = fullAccess
    ? formatAdminCurrency(totalSales?.averageOrderPrice, 'CA$ 0.00')
    : '—';

  return (
    <View style={styles.section}>
      {isLoading && !totalSales && fullAccess ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      ) : (
        <View style={styles.row}>
          <AdminDashboardKpiCard
            label="Total Sales"
            value={salesValue}
            restricted={!fullAccess}
          />
          <AdminDashboardKpiCard
            label="Orders"
            value={ordersValue}
            restricted={!fullAccess}
          />
          <AdminDashboardKpiCard
            label="Avg Order"
            value={avgValue}
            restricted={!fullAccess}
          />
        </View>
      )}

      {error ? <ErrorState message={error} onAction={onRetry} style={styles.error} /> : null}

      {!fullAccess ? (
        <AppCard variant="flat">
          <AppText variant="bodySmall" color="textSecondary">
            Sales KPIs require full admin access.
          </AppText>
        </AppCard>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  loadingRow: {
    minHeight: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    marginHorizontal: 0,
    alignSelf: 'stretch',
  },
});
