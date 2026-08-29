import { StyleSheet, View } from 'react-native';

import { ErrorState } from '../../../../components/ecommerce/ErrorState';
import { AppCard } from '../../../../components/ui/AppCard';
import { AppText } from '../../../../components/ui/AppText';
import { spacing } from '../../../../design-system';
import type { AdminTotalSalesSummary } from '../types/adminDashboard';
import { formatAdminCount, formatAdminCurrency } from '../utils/adminDashboardDisplay';
import { AdminDashboardKpiCard } from './AdminDashboardKpiCard';
import { AdminSectionTitle } from './AdminSectionTitle';

export interface AdminDashboardKpiRowProps {
  totalSales: AdminTotalSalesSummary | null;
  fullAccess: boolean;
  error?: string;
  onRetry?: () => void;
}

export function AdminDashboardKpiRow({
  totalSales,
  fullAccess,
  error,
  onRetry,
}: AdminDashboardKpiRowProps) {
  const salesValue = fullAccess
    ? formatAdminCurrency(totalSales?.totalOrderPrice, 'CAD 0.00')
    : '—';
  const ordersValue = fullAccess ? formatAdminCount(totalSales?.totalOrders) : '—';
  const avgValue = fullAccess
    ? formatAdminCurrency(totalSales?.averageOrderPrice, 'CAD 0.00')
    : '—';

  return (
    <View style={styles.section}>
      <AdminSectionTitle title="Business Overview" showIcon={false} />

      <View style={styles.stack}>
        <AdminDashboardKpiCard
          label="Total Sales"
          value={salesValue}
          icon="cash-outline"
          restricted={!fullAccess}
        />
        <AdminDashboardKpiCard
          label="Total Orders"
          value={ordersValue}
          icon="bag-handle-outline"
          restricted={!fullAccess}
        />
        <AdminDashboardKpiCard
          label="Avg. Order Value"
          value={avgValue}
          icon="receipt-outline"
          restricted={!fullAccess}
        />
      </View>

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
    gap: spacing.md,
  },
  stack: {
    gap: spacing.sm,
  },
  error: {
    marginHorizontal: 0,
    alignSelf: 'stretch',
  },
});
